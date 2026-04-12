import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getPool, closePool } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setup() {
    console.log('🚀 Starting fresh database setup...\n');
    
    try {
        const dbName = process.env.DB_NAME || 'bull_run';
        
        // Connect without database first
        const mysql = await import('mysql2/promise');
        const rootConnection = await mysql.default.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
        });
        
        console.log('✅ Connected to MySQL server\n');
        
        // Drop and recreate database
        console.log(`🗑️  Dropping database '${dbName}' if exists...`);
        await rootConnection.query(`DROP DATABASE IF EXISTS ${dbName}`);
        
        console.log(`✅ Creating database '${dbName}'...`);
        await rootConnection.query(`
            CREATE DATABASE ${dbName}
            CHARACTER SET utf8mb4 
            COLLATE utf8mb4_unicode_ci
        `);
        
        await rootConnection.end();
        console.log('✅ Database created\n');
        
        // Read optimized schema file
        const schemaPath = join(__dirname, '..', 'schema_optimized.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        const pool = await getPool();
        const connection = await pool.getConnection();
        
        console.log('📄 Executing schema file...\n');
        
        // Execute entire schema at once (MySQL supports multiple statements)
        try {
            // Remove comments and split by semicolon followed by newline
            const cleanSchema = schema
                .split('\n')
                .filter(line => !line.trim().startsWith('--'))
                .join('\n');
            
            // Split into statements more carefully
            const statements = cleanSchema
                .split(/;\s*\n/)
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0);
            
            console.log(`📄 Executing ${statements.length} statements...\n`);
            
            // Execute each statement
            for (const stmt of statements) {
                try {
                    await connection.query(stmt);
                    
                    // Log table creation
                    if (stmt.toUpperCase().includes('CREATE TABLE')) {
                        const match = stmt.match(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?`?(\w+)`?/i);
                        if (match) {
                            console.log(`✅ Table: ${match[1]}`);
                        }
                    } else if (stmt.toUpperCase().includes('INSERT INTO')) {
                        const match = stmt.match(/INSERT INTO\s+`?(\w+)`?/i);
                        if (match) {
                            console.log(`✅ Data: ${match[1]}`);
                        }
                    } else if (stmt.toUpperCase().includes('CREATE INDEX')) {
                        console.log(`✅ Index created`);
                    }
                } catch (error) {
                    console.error(`❌ Error:`, error.message);
                }
            }
        } catch (error) {
            console.error(`❌ Schema execution failed:`, error.message);
            throw error;
        }
        
        connection.release();
        
        console.log('\n✅ Database setup complete!');
        console.log('📊 Schema version: 2 (Optimized)');
        console.log('\n📝 Next step: Run "npm start" to start sync service');
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        throw error;
    } finally {
        await closePool();
    }
}

setup().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
