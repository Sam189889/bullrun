const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const LOCAL_CONFIG = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bull_run'
};

const BACKUP_DIR = path.join(__dirname, '../backups');

async function createBackup() {
    try {
        console.log('🔄 Starting Local Database Backup...\n');

        // Create backups directory if not exists
        if (!fs.existsSync(BACKUP_DIR)) {
            fs.mkdirSync(BACKUP_DIR, { recursive: true });
            console.log('📁 Created backups directory');
        }

        // Generate backup filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const backupFile = path.join(BACKUP_DIR, `backup_${timestamp}.sql`);

        console.log(`📦 Backup file: ${backupFile}\n`);

        // Get database stats before backup
        const connection = await mysql.createConnection(LOCAL_CONFIG);
        
        const [tables] = await connection.query(`
            SELECT table_name, table_rows 
            FROM information_schema.tables 
            WHERE table_schema = ?
        `, [LOCAL_CONFIG.database]);

        console.log('📊 Database Statistics:');
        console.log('═══════════════════════════════════════');
        tables.forEach(t => {
            console.log(`   ${t.TABLE_NAME.padEnd(30)} ${t.TABLE_ROWS.toLocaleString()} rows`);
        });
        console.log('═══════════════════════════════════════\n');

        await connection.end();

        // Create mysqldump command
        const dumpCommand = `mysqldump -u ${LOCAL_CONFIG.user} ${LOCAL_CONFIG.password ? `-p${LOCAL_CONFIG.password}` : ''} ${LOCAL_CONFIG.database} > "${backupFile}"`;

        console.log('⏳ Creating backup...');
        await execAsync(dumpCommand);

        // Get backup file size
        const stats = fs.statSync(backupFile);
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

        console.log('\n✅ Backup completed successfully!');
        console.log('═══════════════════════════════════════');
        console.log(`📁 Location: ${backupFile}`);
        console.log(`💾 Size: ${fileSizeMB} MB`);
        console.log(`🕐 Timestamp: ${new Date().toLocaleString()}`);
        console.log('═══════════════════════════════════════\n');

        // List all backups
        const backupFiles = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.sql'));
        if (backupFiles.length > 1) {
            console.log('📂 All Backups:');
            backupFiles.forEach(file => {
                const filePath = path.join(BACKUP_DIR, file);
                const fileStats = fs.statSync(filePath);
                const size = (fileStats.size / (1024 * 1024)).toFixed(2);
                const date = new Date(fileStats.mtime).toLocaleString();
                console.log(`   ${file} - ${size} MB - ${date}`);
            });
            console.log();
        }

        return backupFile;

    } catch (error) {
        console.error('❌ Backup failed:', error.message);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    createBackup()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = { createBackup };
