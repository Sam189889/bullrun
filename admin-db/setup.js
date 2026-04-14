const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function setup() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
    });

    console.log('✅ Connected to MySQL');

    // Create database
    await connection.query('CREATE DATABASE IF NOT EXISTS bull_run_admin');
    console.log('✅ Database created/verified');

    await connection.query('USE bull_run_admin');

    // Create nft_controls table
    await connection.query(`
        CREATE TABLE IF NOT EXISTS nft_controls (
            nft_id INT PRIMARY KEY,
            is_hidden BOOLEAN DEFAULT FALSE,
            is_pinned BOOLEAN DEFAULT FALSE,
            pin_order INT DEFAULT 0,
            hidden_by_admin_at TIMESTAMP NULL,
            pinned_by_admin_at TIMESTAMP NULL,
            notes TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_hidden (is_hidden),
            INDEX idx_pinned (is_pinned),
            INDEX idx_pin_order (pin_order)
        )
    `);
    console.log('✅ Table: nft_controls created');

    // Create user_unlisted_counts table
    await connection.query(`
        CREATE TABLE IF NOT EXISTS user_unlisted_counts (
            user_id INT PRIMARY KEY,
            unlisted_count INT NOT NULL,
            set_by_admin_at TIMESTAMP NULL,
            notes TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_unlisted_count (unlisted_count)
        )
    `);
    console.log('✅ Table: user_unlisted_counts created');

    // Show tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('\n📋 Tables in bull_run_admin:');
    tables.forEach(row => console.log('  -', Object.values(row)[0]));

    await connection.end();
    console.log('\n✅ Setup complete!');
}

setup().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
