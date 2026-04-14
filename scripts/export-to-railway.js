import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function exportLocalToRailway() {
  let localConnection, railwayConnection;
  
  try {
    console.log('🔍 Starting Bull Run database export to Railway...');
    
    // Connect to local MySQL
    console.log('🔍 Connecting to local MySQL...');
    localConnection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'bull_run_admin'
    });
    console.log('✅ Local MySQL connected!');
    
    // Connect to Railway MySQL
    console.log('🔍 Connecting to Railway MySQL...');
    railwayConnection = await mysql.createConnection({
      host: 'metro.proxy.rlwy.net',
      port: 46906,
      user: 'root',
      password: 'lCftTiDmBPxEcaVmUcBQhSGTanfiKnyt',
      database: 'railway',
      ssl: false
    });
    console.log('✅ Railway MySQL connected!');

    // Get all table names from local database
    console.log('🔍 Getting local database structure...');
    const [localTables] = await localConnection.execute('SHOW TABLES');
    console.log(`📊 Found ${localTables.length} tables in local database`);

    // Drop all tables in Railway database
    console.log('🗑️ Dropping all tables in Railway database...');
    const [railwayTables] = await railwayConnection.execute('SHOW TABLES');
    
    // Disable foreign key checks
    await railwayConnection.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    for (const table of railwayTables) {
      const tableName = Object.values(table)[0];
      console.log(`🗑️ Dropping table: ${tableName}`);
      await railwayConnection.execute(`DROP TABLE IF EXISTS \`${tableName}\``);
    }
    
    console.log('✅ All Railway tables dropped!');

    // Copy table structures and data
    for (const table of localTables) {
      const tableName = Object.values(table)[0];
      console.log(`📋 Processing table: ${tableName}`);
      
      // Get CREATE TABLE statement
      const [createResult] = await localConnection.execute(`SHOW CREATE TABLE \`${tableName}\``);
      let createStatement = createResult[0]['Create Table'];
      
      // Fix MySQL version compatibility issues
      createStatement = createStatement
        .replace(/DEFAULT curdate\(\)/g, 'DEFAULT (CURRENT_DATE)')
        .replace(/DEFAULT current_timestamp\(\)/g, 'DEFAULT CURRENT_TIMESTAMP')
        .replace(/ON UPDATE current_timestamp\(\)/g, 'ON UPDATE CURRENT_TIMESTAMP');
      
      // Create table in Railway
      console.log(`🔨 Creating table structure: ${tableName}`);
      await railwayConnection.execute(createStatement);
      
      // Get table data
      const [rows] = await localConnection.execute(`SELECT * FROM \`${tableName}\``);
      
      if (rows.length > 0) {
        console.log(`📦 Copying ${rows.length} rows to ${tableName}`);
        
        // Get column names
        const [columns] = await localConnection.execute(`DESCRIBE \`${tableName}\``);
        const columnNames = columns.map(col => `\`${col.Field}\``).join(', ');
        const placeholders = columns.map(() => '?').join(', ');
        
        // Insert data in batches
        const batchSize = 100;
        for (let i = 0; i < rows.length; i += batchSize) {
          const batch = rows.slice(i, i + batchSize);
          const insertQuery = `INSERT INTO \`${tableName}\` (${columnNames}) VALUES ${batch.map(() => `(${placeholders})`).join(', ')}`;
          const values = batch.flatMap(row => Object.values(row));
          
          await railwayConnection.execute(insertQuery, values);
        }
      } else {
        console.log(`⚠️ Table ${tableName} is empty`);
      }
    }

    // Re-enable foreign key checks
    await railwayConnection.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('🎉 Bull Run database export to Railway completed successfully!');
    
    // Verify the export
    console.log('\n🔍 Verifying export...');
    const [newRailwayTables] = await railwayConnection.execute('SHOW TABLES');
    console.log(`✅ Railway database now has ${newRailwayTables.length} tables\n`);
    
    console.log('📊 Table Summary:');
    console.log('==================');
    for (const table of newRailwayTables) {
      const tableName = Object.values(table)[0];
      const [count] = await railwayConnection.execute(`SELECT COUNT(*) as count FROM \`${tableName}\``);
      console.log(`📊 ${tableName}: ${count[0].count} rows`);
    }

  } catch (error) {
    console.error('❌ Database export failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    if (localConnection) {
      await localConnection.end();
      console.log('\n🔌 Local connection closed');
    }
    if (railwayConnection) {
      await railwayConnection.end();
      console.log('🔌 Railway connection closed');
    }
  }
}

// Run the export
exportLocalToRailway();
