const pool = require('./db');

async function init() {
    try {
        console.log('Creating custom_designs table...');
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS custom_designs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                image_url LONGTEXT NOT NULL,
                description TEXT,
                status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('Table custom_designs created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error creating table:', error);
        process.exit(1);
    }
}

init();
