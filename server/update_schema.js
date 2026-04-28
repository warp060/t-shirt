const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const pool = require('./db');

async function updateSchema() {
    try {
        console.log("Checking for 'google_id' column in users table...");
        const [columns] = await pool.execute('DESCRIBE users');
        const hasGoogleId = columns.some(col => col.Field === 'google_id');

        if (!hasGoogleId) {
            console.log("Adding 'google_id' column to users table...");
            await pool.execute('ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE AFTER role');
            console.log("Column 'google_id' added successfully.");
        } else {
            console.log("Column 'google_id' already exists.");
        }

        console.log("Making 'password_hash' nullable for Google users...");
        await pool.execute('ALTER TABLE users MODIFY COLUMN password_hash VARCHAR(255) NULL');
        console.log("Column 'password_hash' is now nullable.");

        console.log("Schema update completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error updating schema:", error);
        process.exit(1);
    }
}

updateSchema();
