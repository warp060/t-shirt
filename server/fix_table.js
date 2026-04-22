const pool = require('./db');

async function fixTable() {
    try {
        console.log("Dropping existing custom_designs table (if any)...");
        await pool.execute('DROP TABLE IF EXISTS custom_designs');
        
        console.log("Creating custom_designs table with correct schema...");
        await pool.execute(`
            CREATE TABLE custom_designs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                image_url LONGTEXT NOT NULL,
                description TEXT,
                status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        
        console.log("Table recreated successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error fixing table:", error);
        process.exit(1);
    }
}

fixTable();
