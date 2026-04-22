const pool = require('./db');

async function check() {
    try {
        const [rows] = await pool.execute('DESCRIBE custom_designs');
        console.log("TABLE STRUCTURE:");
        console.table(rows);
        process.exit(0);
    } catch (error) {
        console.error("CHECK ERROR:", error.message);
        process.exit(1);
    }
}
check();
