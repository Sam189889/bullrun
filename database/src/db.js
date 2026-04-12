import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from database directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bull_run',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
};

// Create connection pool
let pool;

export async function getPool() {
    if (!pool) {
        pool = mysql.createPool(dbConfig);
        console.log('✅ MySQL connection pool created');
    }
    return pool;
}

export async function query(sql, params = []) {
    const connection = await (await getPool()).getConnection();
    try {
        const [results] = await connection.execute(sql, params);
        return results;
    } finally {
        connection.release();
    }
}

export async function testConnection() {
    try {
        const connection = await (await getPool()).getConnection();
        console.log('✅ Database connection successful!');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

export async function closePool() {
    if (pool) {
        await pool.end();
        console.log('✅ MySQL connection pool closed');
    }
}
