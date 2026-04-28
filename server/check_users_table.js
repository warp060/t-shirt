const pool = require('./db');

async function checkSchema() {
    try {
        const [rows] = await pool.execute('DESCRIBE users');
        console.log('Columns in users table:');
        console.table(rows);
        process.exit(0);
    } catch (error) {
        console.error('Error checking schema:', error);
        process.exit(1);
    }
}

checkSchema();
