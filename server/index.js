const dns = require('dns');
// Fix for Render IPv6 ENETUNREACH issues (Must be at the very top)
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express'); // v1.0.5
const cors = require('cors');
const pool = require('./db');
const jwt = require('jsonwebtoken');
const { register, login, googleLogin } = require('./auth');

const Razorpay = require('razorpay');
const crypto = require('crypto');
const { sendOrderNotification, sendCancellationNotification, sendCustomDesignNotification } = require('./mailer');

const app = express();

// Extremely permissive CORS for debugging
app.use(cors()); 

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Log all requests for debugging online
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Health Check
app.get('/api/ping', (req, res) => {
    res.json({ status: 'ok', message: 'pong', version: '1.0.5' });
});

// Razorpay Instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.get('/api/test-route', (req, res) => {
    res.json({ message: "Server is reachable!" });
});

app.get('/api/health', async (req, res) => {

    let dbStatus = 'checking';
    let dbError = null;
    
    try {
        await pool.query('SELECT 1');
        dbStatus = 'connected';
    } catch (error) {
        dbStatus = 'disconnected';
        dbError = error.message;
        console.error("Health Check DB Error:", error.message);
    }

    res.json({ 
        status: 'ok', 
        server: 'online',
        database: dbStatus,
        dbError: dbError,
        version: '1.0.3',
        timestamp: new Date().toISOString() 
    });
});

// Custom Design Routes (Moved to Top)
app.post('/api/custom-designs', async (req, res) => {
    try {
        const { userId, imageUrl, description, address, phone } = req.body;
        console.log("--- Custom Design Submission ---");
        console.log("User ID:", userId);
        
        if (!userId || !imageUrl) {
            return res.status(400).json({ message: 'User ID and Image are required' });
        }
        
        const [result] = await pool.execute(
            'INSERT INTO custom_designs (user_id, image_url, description, address, phone) VALUES (?, ?, ?, ?, ?)',
            [userId, imageUrl, description || '', address || '', phone || '']
        );
        
        // Admin notification - Backgrounded
        setImmediate(async () => {
            try {
                const [users] = await pool.execute('SELECT name, email FROM users WHERE id = ?', [userId]);
                if (users.length > 0) {
                    await sendCustomDesignNotification({ imageUrl, description, address, phone }, users[0]);
                    console.log(`[MAIL] ✅ Custom design notification sent for user: ${users[0].email}`);
                }
            } catch (err) {
                console.error("[MAIL] ❌ Custom design notification failed:", err);
            }
        });

        res.status(201).json({ message: 'Custom design request submitted successfully!' });
    } catch (error) {
        console.error("Custom design error:", error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
});

app.get('/api/custom-designs/user/:userId', async (req, res) => {
    try {
        const [designs] = await pool.execute(
            'SELECT * FROM custom_designs WHERE user_id = ? ORDER BY created_at DESC',
            [req.params.userId]
        );
        res.json(designs);
    } catch (error) {
        console.error("Fetch custom designs error:", error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
});

// Newsletter Subscription
app.post('/api/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        
        // Use INSERT IGNORE or handle duplicate error gracefully
        try {
            await pool.execute('INSERT INTO subscribers (email) VALUES (?)', [email]);
            res.status(201).json({ message: 'Successfully subscribed to the newsletter!' });
        } catch (dbError) {
            // Check for duplicate entry error code (MySQL: ER_DUP_ENTRY)
            if (dbError.code === 'ER_DUP_ENTRY') {
                return res.status(200).json({ message: 'You are already subscribed!' });
            }
            throw dbError;
        }
    } catch (error) {
        console.error("Subscription error:", error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
});

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
        const userEmail = req.user?.email?.toLowerCase();
        const userId = req.user?.id;

        console.log(`[ADMIN CHECK] Attempt by: ${userEmail} (ID: ${userId})`);

        // Check 1: Master Email from Token
        if (userEmail === 'abbas6618532@gmail.com') {
            return next();
        }

        // Check 2: Database Role
        const [users] = await pool.execute('SELECT role, email FROM users WHERE id = ?', [userId]);
        const user = users[0];

        if (user && (user.role === 'admin' || user.email?.toLowerCase() === 'abbas6618532@gmail.com')) {
            next();
        } else {
            console.log(`[ADMIN DENIED] User ${userEmail} has role: ${user?.role}`);
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

// ==========================================
// ADMIN ROUTES (High Priority)
// ==========================================

// Admin - Review Management
app.get('/api/admin/reviews', authenticateToken, isAdmin, async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT r.*, u.name as user_name, p.name as product_name 
            FROM reviews r 
            JOIN users u ON r.user_id = u.id 
            JOIN products p ON r.product_id = p.id 
            ORDER BY r.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/admin/reviews/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        await pool.execute('DELETE FROM reviews WHERE id = ?', [req.params.id]);
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
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

// Admin - Subscribers Management
app.get('/api/admin/subscribers', authenticateToken, isAdmin, async (req, res) => {
    try {
        const [subscribers] = await pool.execute('SELECT id, email, created_at FROM subscribers ORDER BY created_at DESC');
        res.json(subscribers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/admin/subscribers/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        await pool.execute('DELETE FROM subscribers WHERE id = ?', [req.params.id]);
        res.json({ message: 'Subscriber removed' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin - Order Management
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

app.put('/api/admin/orders/:id/status', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = req.params.id;

        const [orders] = await pool.execute('SELECT * FROM orders WHERE id = ?', [orderId]);
        if (orders.length === 0) return res.status(404).json({ message: 'Order not found' });
        const oldStatus = orders[0].status;

        await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);

        if (status === 'cancelled' && oldStatus !== 'cancelled') {
            const order = orders[0];
            const fullOrder = {
                ...order,
                address: JSON.parse(order.shipping_address)
            };
            // Admin notification
            sendCancellationNotification(fullOrder)
                .catch(err => console.error("Cancellation notification failed:", err));
        }

        res.json({ message: 'Order status updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin - Custom Design Management
app.get('/api/admin/custom-designs', authenticateToken, isAdmin, async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT cd.*, u.name as user_name, u.email as user_email 
            FROM custom_designs cd 
            JOIN users u ON cd.user_id = u.id 
            ORDER BY cd.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/admin/custom-designs/:id/status', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const designId = req.params.id;
        await pool.execute('UPDATE custom_designs SET status = ? WHERE id = ?', [status, designId]);
        
        const [designs] = await pool.execute('SELECT * FROM custom_designs WHERE id = ?', [designId]);
        if (designs.length > 0) {
            // Admin notification
            const [users] = await pool.execute('SELECT name, email FROM users WHERE id = ?', [designs[0].user_id]);
            if (users.length > 0) {
                // You could send a status update notification here if needed, 
                // but usually notifications are for new requests.
            }
        }

        res.json({ message: 'Custom design status updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/admin/custom-designs/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        await pool.execute('DELETE FROM custom_designs WHERE id = ?', [req.params.id]);
        res.json({ message: 'Custom design request deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// PUBLIC & USER ROUTES
// ==========================================

// Product Routes
app.get('/api/products', async (req, res) => {
    try {
        const { search } = req.query;
        let query = 'SELECT * FROM products';
        let params = [];

        if (search) {
            query += ' WHERE name LIKE ? OR description LIKE ? OR category LIKE ?';
            params = [`%${search}%`, `%${search}%`, `%${search}%`];
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

// User Profile & Orders
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
        const [existing] = await pool.execute('SELECT * FROM users WHERE email = ? AND id != ?', [email, req.params.id]);
        if (existing.length > 0) return res.status(400).json({ message: 'Email already in use' });

        await pool.execute('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, req.params.id]);
        res.json({ message: 'Profile updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Razorpay Payment Routes
app.post('/api/payment/create-order', async (req, res) => {
    try {
        const { amount, currency = 'INR' } = req.body;
        
        const options = {
            amount: Math.round(amount * 100), // amount in the smallest currency unit
            currency,
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error("Razorpay order error:", error);
        res.status(500).json({ message: "Failed to create payment order", error: error.message });
    }
});

app.post('/api/payment/verify', async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature 
        } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            return res.status(200).json({ message: "Payment verified successfully" });
        } else {
            return res.status(400).json({ message: "Invalid signature sent!" });
        }
    } catch (error) {
        console.error("Payment verification error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Order Creation
app.post('/api/orders', async (req, res) => {
    try {
        const { userId, totalAmount, address, items, paymentMethod, paymentDetails } = req.body;
        console.log(`[ORDER] Starting order creation for User: ${userId}`);
        
        const connection = await pool.getConnection();
        try {
            console.log(`[ORDER] Got DB connection. Starting transaction...`);
            await connection.beginTransaction();
            
            console.log(`[ORDER] Inserting into orders table...`);
            const [orderResult] = await connection.execute(
                'INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, payment_details) VALUES (?, ?, ?, ?, ?)',
                [userId, totalAmount, JSON.stringify(address), paymentMethod || 'cod', paymentDetails ? JSON.stringify(paymentDetails) : null]
            );
            const orderId = orderResult.insertId;
            console.log(`[ORDER] Created Order ID: ${orderId}. Processing items...`);

            for (const item of items) {
                const productId = item.productId || item.id;
                console.log(`[ORDER] Processing item: ${productId}`);
                const [products] = await connection.execute('SELECT stock, name FROM products WHERE id = ? FOR UPDATE', [productId]);
                const product = products[0];

                if (!product) throw new Error(`Product ${productId} not found`);
                if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);

                await connection.execute('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, productId]);
                await connection.execute('INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)', [orderId, productId, item.quantity, item.price]);
            }

            console.log(`[ORDER] Committing transaction...`);
            await connection.commit();
            console.log(`[ORDER] Transaction committed successfully!`);
            
            // Admin notification - Truly backgrounded using setImmediate
            setImmediate(async () => {
                console.log(`[MAIL] Starting background email process for Order #${orderId}`);
                try {
                    const enrichedItems = await Promise.all(items.map(async (item) => {
                        try {
                            const [products] = await pool.execute('SELECT name FROM products WHERE id = ?', [item.productId || item.id]);
                            return { ...item, name: products.length > 0 ? products[0].name : (item.name || 'Product') };
                        } catch (e) { return { ...item, name: item.name || 'Product' }; }
                    }));
                    await sendOrderNotification({ id: orderId, totalAmount, address, paymentMethod }, enrichedItems);
                    console.log(`[MAIL] ✅ Admin email sent for Order #${orderId}`);
                } catch (mailError) {
                    console.error("[MAIL] ❌ Order notification failed:", mailError);
                }
            });
            
            res.status(201).json({ message: 'Order created', orderId });
        } catch (error) {
            console.error(`[ORDER ERROR] Inside transaction:`, error);
            await connection.rollback();
            res.status(400).json({ message: error.message });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error(`[ORDER ERROR] Outer level:`, error);
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/orders/:id/cancel', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const orderId = req.params.id;
        const [orders] = await connection.execute('SELECT * FROM orders WHERE id = ?', [orderId]);
        const order = orders[0];

        if (order.status === 'cancelled') throw new Error('Already cancelled');
        const [items] = await connection.execute('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

        for (const item of items) {
            await connection.execute('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
        }

        await connection.execute('UPDATE orders SET status = "cancelled" WHERE id = ?', [orderId]);
        await connection.commit();
        
        // Admin notification - Backgrounded
        setImmediate(async () => {
            try {
                const [fullOrders] = await pool.execute('SELECT * FROM orders WHERE id = ?', [orderId]);
                if (fullOrders.length > 0) {
                    const fullOrder = {
                        ...fullOrders[0],
                        address: JSON.parse(fullOrders[0].shipping_address)
                    };
                    await sendCancellationNotification(fullOrder);
                    console.log(`[MAIL] ✅ Cancellation notification sent for Order #${orderId}`);
                }
            } catch (err) {
                console.error("[MAIL] ❌ Cancellation notification failed:", err);
            }
        });

        res.json({ message: 'Order cancelled' });
    } catch (error) {
        await connection.rollback();
        res.status(400).json({ message: error.message });
    } finally {
        connection.release();
    }
});

// Cart Routes
app.get('/api/cart/:userId', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT cart_data FROM carts WHERE user_id = ?', [req.params.userId]);
        res.json({ items: rows.length > 0 ? JSON.parse(rows[0].cart_data) : [] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/cart/:userId', async (req, res) => {
    try {
        const { items } = req.body;
        await pool.execute('INSERT INTO carts (user_id, cart_data) VALUES (?, ?) ON DUPLICATE KEY UPDATE cart_data = VALUES(cart_data)', [req.params.userId, JSON.stringify(items)]);
        res.json({ message: 'Cart updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 404 Handler for Debugging
app.use((req, res) => {
    console.log(`[404] ${req.method} ${req.url}`);
    res.status(404).json({ 
        message: `Route ${req.method} ${req.url} not found`,
        hint: 'Check if you are missing /api prefix'
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("!!! SERVER ERROR !!!", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    try {
        await pool.query('SELECT 1');
        console.log('✅ Database connected successfully');
    } catch (error) {
        console.error('❌ Database connection failed!');
    }
});
