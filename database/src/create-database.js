import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function createDatabase() {
    console.log('🚀 Creating database...\n');
    
    try {
        // Connect without specifying database
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
        });
        
        console.log('✅ Connected to MySQL server');
        
        const dbName = process.env.DB_NAME || 'bull_run';
        
        // Create database
        await connection.query(`
            CREATE DATABASE IF NOT EXISTS ${dbName}
            CHARACTER SET utf8mb4 
            COLLATE utf8mb4_unicode_ci
        `);
        
        console.log(`✅ Database '${dbName}' created successfully!`);
        
        await connection.end();
        
        console.log('\n📝 Next step: Run "npm run setup" to create tables\n');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createDatabase();
