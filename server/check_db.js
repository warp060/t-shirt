const pool = require('./db');

async function checkProducts() {
    try {
        const [rows] = await pool.execute('SELECT COUNT(*) as count FROM products');
        console.log('Product count:', rows[0].count);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkProducts();
