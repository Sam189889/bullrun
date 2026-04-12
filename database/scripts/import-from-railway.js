import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Import Railway database to local MySQL
 * Use for backup/restore or syncing Railway changes to local
 */
async function importRailwayToLocal() {
  let localConnection, railwayConnection;
  
  try {
    console.log('🔍 Starting Bull Run database import from Railway...');
    
    // Connect to Railway MySQL
    console.log('🔍 Connecting to Railway MySQL...');
    railwayConnection = await mysql.createConnection({
      host: process.env.RAILWAY_MYSQL_HOST || 'metro.proxy.rlwy.net',
      port: parseInt(process.env.RAILWAY_MYSQL_PORT || '3306'),
      user: process.env.RAILWAY_MYSQL_USER || 'root',
      password: process.env.RAILWAY_MYSQL_PASSWORD || 'lCftTiDmBPxEcaVmUcBQhSGTanfiKnyt',
      database: process.env.RAILWAY_MYSQL_DATABASE || 'railway',
      ssl: false
    });
    console.log('✅ Railway MySQL connected!');
    
    // Connect to local MySQL
    console.log('🔍 Connecting to local MySQL...');
    localConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'bull_run'
    });
    console.log('✅ Local MySQL connected!');

    // Get all table names from Railway database
    console.log('🔍 Getting Railway database structure...');
    const [railwayTables] = await railwayConnection.execute('SHOW TABLES');
    console.log(`📊 Found ${railwayTables.length} tables in Railway database`);

    // Drop all tables in local database
    console.log('🗑️ Dropping all tables in local database...');
    const [localTables] = await localConnection.execute('SHOW TABLES');
    
    // Disable foreign key checks
    await localConnection.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    for (const table of localTables) {
      const tableName = Object.values(table)[0];
      console.log(`🗑️ Dropping table: ${tableName}`);
      await localConnection.execute(`DROP TABLE IF EXISTS \`${tableName}\``);
    }
    
    console.log('✅ All local tables dropped!');

    // Copy table structures and data
    for (const table of railwayTables) {
      const tableName = Object.values(table)[0];
      console.log(`\n📋 Processing table: ${tableName}`);
      
      // Get CREATE TABLE statement
      const [createResult] = await railwayConnection.execute(`SHOW CREATE TABLE \`${tableName}\``);
      let createStatement = createResult[0]['Create Table'];
      
      // Fix MySQL version compatibility issues
      createStatement = createStatement
        .replace(/DEFAULT curdate\(\)/g, 'DEFAULT (CURRENT_DATE)')
        .replace(/DEFAULT current_timestamp\(\)/g, 'DEFAULT CURRENT_TIMESTAMP')
        .replace(/ON UPDATE current_timestamp\(\)/g, 'ON UPDATE CURRENT_TIMESTAMP');
      
      // Create table locally
      console.log(`🔨 Creating table structure: ${tableName}`);
      await localConnection.execute(createStatement);
      
      // Get table data
      const [rows] = await railwayConnection.execute(`SELECT * FROM \`${tableName}\``);
      
      if (rows.length > 0) {
        console.log(`📦 Copying ${rows.length} rows to ${tableName}`);
        
        // Get column names
        const [columns] = await railwayConnection.execute(`DESCRIBE \`${tableName}\``);
        const columnNames = columns.map(col => `\`${col.Field}\``).join(', ');
        const placeholders = columns.map(() => '?').join(', ');
        
        // Insert data in batches
        const batchSize = 500;
        for (let i = 0; i < rows.length; i += batchSize) {
          const batch = rows.slice(i, i + batchSize);
          const insertQuery = `INSERT INTO \`${tableName}\` (${columnNames}) VALUES ${batch.map(() => `(${placeholders})`).join(', ')}`;
          const values = batch.flatMap(row => Object.values(row));
          
          await localConnection.execute(insertQuery, values);
          
          if (rows.length > batchSize) {
            console.log(`   ✓ Inserted ${Math.min(i + batchSize, rows.length)}/${rows.length} rows`);
          }
        }
        console.log(`✅ ${tableName}: ${rows.length} rows copied`);
      } else {
        console.log(`⚠️ Table ${tableName} is empty`);
      }
    }

    // Re-enable foreign key checks
    await localConnection.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('\n🎉 Database import from Railway completed successfully!');
    
    // Verify the import
    console.log('\n🔍 Verifying import...');
    const [newLocalTables] = await localConnection.execute('SHOW TABLES');
    console.log(`✅ Local database now has ${newLocalTables.length} tables\n`);
    
    console.log('📊 Table Summary:');
    console.log('==================');
    for (const table of newLocalTables) {
      const tableName = Object.values(table)[0];
      const [count] = await localConnection.execute(`SELECT COUNT(*) as count FROM \`${tableName}\``);
      console.log(`📊 ${tableName}: ${count[0].count} rows`);
    }

  } catch (error) {
    console.error('\n❌ Database import failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    if (railwayConnection) {
      await railwayConnection.end();
      console.log('\n🔌 Railway connection closed');
    }
    if (localConnection) {
      await localConnection.end();
      console.log('🔌 Local connection closed');
    }
  }
}

// Run the import
importRailwayToLocal();
