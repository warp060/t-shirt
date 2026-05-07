const pool = require('./server/db');

async function checkOrders() {
    try {
        const [orders] = await pool.execute('SELECT id, user_id, total_amount, status, created_at FROM orders ORDER BY created_at DESC LIMIT 5');
        console.log('--- RECENT ORDERS ---');
        console.table(orders);
        process.exit(0);
    } catch (error) {
        console.error('Error checking orders:', error);
        process.exit(1);
    }
}

checkOrders();
