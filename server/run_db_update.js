const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const pool = require('./db');

async function updateDB() {
    try {
        console.log("Adding updated_at column...");
        await pool.execute('ALTER TABLE orders ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    } catch (e) { console.log(e.message); }

    try {
        console.log("Adding return_reason column...");
        await pool.execute('ALTER TABLE orders ADD COLUMN return_reason TEXT');
    } catch (e) { console.log(e.message); }

    try {
        console.log("Updating status ENUM...");
        await pool.execute("ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'return_requested', 'returned') DEFAULT 'pending'");
    } catch (e) { console.log(e.message); }

    console.log("Done!");
    process.exit(0);
}

updateDB();
