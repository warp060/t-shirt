const express = require('express');
const cors = require('cors');
const pool = require('./db');
const jwt = require('jsonwebtoken');
const { register, login, googleLogin } = require('./auth');
const { sendOrderNotification, sendCancellationNotification } = require('./mailer');
require('dotenv').config();

const app = express();
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Security Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token.' });
        req.user = user;
        next();
    });
};

const isAdmin = async (req, res, next) => {
    try {
        const [users] = await pool.execute('SELECT role FROM users WHERE id = ?', [req.user.id]);
        if (users.length > 0 && users[0].role === 'admin') {
            next();
        } else {
            res.status(403).json({ message: 'Access denied. Admin rights required.' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Auth Routes
app.post('/api/auth/signup', register);
app.post('/api/auth/login', login);
app.post('/api/auth/google', googleLogin);

// Product Routes
app.get('/api/products', async (req, res) => {
    try {
        const { search } = req.query;
        let query = 'SELECT * FROM products';
        let params = [];

        if (search) {
            query += ' WHERE name LIKE ? OR description LIKE ?';
            params = [`%${search}%`, `%${search}%`];
        }

        const [products] = await pool.execute(query, params);
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const [products] = await pool.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (products.length === 0) return res.status(404).json({ message: 'Product not found' });
        
        const product = products[0];

        // Fetch rating stats
        const [stats] = await pool.execute(
            'SELECT AVG(rating) as avgRating, COUNT(*) as reviewsCount FROM reviews WHERE product_id = ?',
            [req.params.id]
        );

        res.json({
            ...product,
            rating: stats[0].avgRating || 0,
            reviewsCount: stats[0].reviewsCount || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Review Routes
app.get('/api/products/:id/reviews', async (req, res) => {
    try {
        const [reviews] = await pool.execute(`
            SELECT r.*, u.name as user_name 
            FROM reviews r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.product_id = ? 
            ORDER BY r.created_at DESC
        `, [req.params.id]);
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/reviews', async (req, res) => {
    try {
        const { userId, productId, rating, comment } = req.body;
        await pool.execute(
            'INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)',
            [userId, productId, rating, comment]
        );
        res.status(201).json({ message: 'Review added' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Post Order Route
app.post('/api/orders', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { userId, totalAmount, address, items, paymentMethod, paymentDetails } = req.body;
        
        // 1. Create Order
        const [orderResult] = await connection.execute(
            'INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, payment_details) VALUES (?, ?, ?, ?, ?)',
            [userId, totalAmount, JSON.stringify(address), paymentMethod || 'cod', paymentDetails ? JSON.stringify(paymentDetails) : null]
        );
        const orderId = orderResult.insertId;

        // 2. Process items and update stock
        for (const item of items) {
            const productId = item.productId || item.id;
            
            // Check stock availability
            const [products] = await connection.execute(
                'SELECT stock, name FROM products WHERE id = ? FOR UPDATE',
                [productId]
            );

            if (products.length === 0) {
                throw new Error(`Product with ID ${productId} not found`);
            }

            const product = products[0];
            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
            }

            // Decrement stock
            await connection.execute(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [item.quantity, productId]
            );

            // Add order item
            await connection.execute(
                'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
                [orderId, productId, item.quantity, item.price]
            );
        }

        await connection.commit();
        
        // Send Email Notification (Async)
        sendOrderNotification({
            id: orderId,
            userId,
            totalAmount,
            address,
            items,
            paymentMethod,
            paymentDetails
        }).catch(err => console.error("Email notification failed:", err));

        res.status(201).json({ message: 'Order created', orderId });
    } catch (error) {
        await connection.rollback();
        console.error("Order error:", error);
        res.status(400).json({ message: error.message });
    } finally {
        connection.release();
    }
});

// Cancel Order Route (User)
app.post('/api/orders/:id/cancel', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const orderId = req.params.id;

        // 1. Get order details and items
        const [orders] = await connection.execute('SELECT * FROM orders WHERE id = ?', [orderId]);
        if (orders.length === 0) throw new Error('Order not found');
        const order = orders[0];

        if (order.status === 'cancelled') throw new Error('Order is already cancelled');
        if (order.status !== 'pending' && order.status !== 'processing') {
            throw new Error(`Cannot cancel order in ${order.status} status`);
        }

        const [items] = await connection.execute('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

        // 2. Return stock
        for (const item of items) {
            await connection.execute(
                'UPDATE products SET stock = stock + ? WHERE id = ?',
                [item.quantity, item.product_id]
            );
        }

        // 3. Update order status
        await connection.execute('UPDATE orders SET status = "cancelled" WHERE id = ?', [orderId]);

        await connection.commit();

        // 4. Notify Admin
        const fullOrder = {
            ...order,
            address: JSON.parse(order.shipping_address)
        };
        sendCancellationNotification(fullOrder).catch(err => console.error("Cancel email failed:", err));

        res.json({ message: 'Order cancelled successfully' });
    } catch (error) {
        await connection.rollback();
        res.status(400).json({ message: error.message });
    } finally {
        connection.release();
    }
});

app.get('/api/orders/:userId', async (req, res) => {
    try {
        const [orders] = await pool.execute(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
            [req.params.userId]
        );

        const fullOrders = await Promise.all(orders.map(async (order) => {
            const [items] = await pool.execute(`
                SELECT oi.*, p.name, p.image_url 
                FROM order_items oi 
                JOIN products p ON oi.product_id = p.id 
                WHERE oi.order_id = ?
            `, [order.id]);

            return {
                ...order,
                total_amount: parseFloat(order.total_amount),
                address: JSON.parse(order.shipping_address),
                items: items.map(item => ({
                    productId: item.product_id,
                    name: item.name,
                    image: item.image_url,
                    quantity: item.quantity,
                    price: parseFloat(item.price_at_purchase)
                }))
            };
        }));

        res.json(fullOrders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/users/:id', async (req, res) => {
    try {
        const { name, email } = req.body;
        // Check if email is already taken by another user
        const [existing] = await pool.execute('SELECT * FROM users WHERE email = ? AND id != ?', [email, req.params.id]);
        if (existing.length > 0) return res.status(400).json({ message: 'Email already in use' });

        await pool.execute('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, req.params.id]);
        res.json({ message: 'Profile updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin - User Management
app.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
    try {
        const [users] = await pool.execute('SELECT id, name, email, role, created_at FROM users');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/admin/users/:id/role', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        await pool.execute('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
        res.json({ message: 'User role updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin - Product Management
app.post('/api/products', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { name, price, description, category, image_url, stock } = req.body;
        const [result] = await pool.execute(
            'INSERT INTO products (name, price, description, category, image_url, stock) VALUES (?, ?, ?, ?, ?, ?)',
            [name, price, description, category, image_url, stock]
        );
        res.status(201).json({ id: result.insertId, message: 'Product created' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/products/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { name, price, description, category, image_url, stock } = req.body;
        await pool.execute(
            'UPDATE products SET name = ?, price = ?, description = ?, category = ?, image_url = ?, stock = ? WHERE id = ?',
            [name, price, description, category, image_url, stock, req.params.id]
        );
        res.json({ message: 'Product updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/products/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        await pool.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin - Order Status
app.put('/api/admin/orders/:id/status', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = req.params.id;

        // Get old status to check if it's a new cancellation
        const [orders] = await pool.execute('SELECT * FROM orders WHERE id = ?', [orderId]);
        if (orders.length === 0) return res.status(404).json({ message: 'Order not found' });
        const oldStatus = orders[0].status;

        await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);

        // If changed to cancelled, trigger notification
        if (status === 'cancelled' && oldStatus !== 'cancelled') {
            const order = orders[0];
            const fullOrder = {
                ...order,
                address: JSON.parse(order.shipping_address)
            };
            sendCancellationNotification(fullOrder).catch(err => console.error("Cancel email failed:", err));
        }

        res.json({ message: 'Order status updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/orders', authenticateToken, isAdmin, async (req, res) => {
    try {
        const [orders] = await pool.execute('SELECT * FROM orders ORDER BY created_at DESC');
        const fullOrders = await Promise.all(orders.map(async (order) => {
            const [items] = await pool.execute(`
                SELECT oi.*, p.name, p.image_url 
                FROM order_items oi 
                JOIN products p ON oi.product_id = p.id 
                WHERE oi.order_id = ?
            `, [order.id]);

            let address = {};
            try { address = JSON.parse(order.shipping_address); } catch(e) { address = { fullName: 'Invalid Address' }; }

            let paymentDetails = null;
            try { paymentDetails = order.payment_details ? JSON.parse(order.payment_details) : null; } catch(e) { paymentDetails = null; }

            return {
                ...order,
                address,
                paymentMethod: order.payment_method,
                paymentDetails,
                items: items.map(item => ({
                    productId: item.product_id,
                    name: item.name,
                    image: item.image_url,
                    quantity: item.quantity,
                    price: item.price_at_purchase
                }))
            };
        }));
        res.json(fullOrders);
    } catch (error) {
        console.error("Admin orders error:", error);
        res.status(500).json({ message: error.message });
    }
});

// Admin - User Management
app.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
    try {
        const [users] = await pool.execute('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/admin/users/:id/role', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        await pool.execute('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
        res.json({ message: 'User role updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Cart Routes
app.get('/api/cart/:userId', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT cart_data FROM carts WHERE user_id = ?', [req.params.userId]);
        if (rows.length === 0) return res.json({ items: [] });
        res.json({ items: JSON.parse(rows[0].cart_data) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/cart/:userId', async (req, res) => {
    try {
        const { items } = req.body;
        await pool.execute(
            'INSERT INTO carts (user_id, cart_data) VALUES (?, ?) ON DUPLICATE KEY UPDATE cart_data = VALUES(cart_data)',
            [req.params.userId, JSON.stringify(items)]
        );
        res.json({ message: 'Cart updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    try {
        await pool.query('SELECT 1');
        console.log('✅ Database connected successfully');
    } catch (error) {
        console.error('❌ Database connection failed!');
        console.error('Please ensure XAMPP MySQL is running and your .env configuration is correct.');
        console.error('Error details:', error.message);
    }
});
