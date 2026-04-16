import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importRailwayToLocal() {
  let localConnection, railwayConnection;
  
  try {
    console.log('🔍 Starting Bull Run database import from Railway to Local...');
    
    // Connect to local MySQL (Destination)
    console.log('🔍 Connecting to local MySQL...');
    localConnection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '', // Replace if your local DB has a password
      database: 'bull_run_admin'
    });
    console.log('✅ Local MySQL connected!');
    
    // Connect to Railway MySQL (Source)
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

    // Get all table names from Railway database (Source)
    console.log('🔍 Getting Railway database structure...');
    const [railwayTables] = await railwayConnection.execute('SHOW TABLES');
    console.log(`📊 Found ${railwayTables.length} tables in Railway database`);

    // Drop all tables in Local database (Destination)
    console.log('🗑️ Dropping all tables in local database...');
    const [localTables] = await localConnection.execute('SHOW TABLES');
    
    // Disable foreign key checks on local
    await localConnection.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    for (const table of localTables) {
      const tableName = Object.values(table)[0];
      console.log(`🗑️ Dropping local table: ${tableName}`);
      await localConnection.execute(`DROP TABLE IF EXISTS \`${tableName}\``);
    }
    
    console.log('✅ All Local tables dropped!');

    // Copy table structures and data from Railway to Local
    for (const table of railwayTables) {
      const tableName = Object.values(table)[0];
      console.log(`📋 Processing table: ${tableName}`);
      
      // Get CREATE TABLE statement from Railway
      const [createResult] = await railwayConnection.execute(`SHOW CREATE TABLE \`${tableName}\``);
      let createStatement = createResult[0]['Create Table'];
      
      // Fix MySQL version compatibility issues (keeping this just in case local is a different version)
      createStatement = createStatement
        .replace(/DEFAULT curdate\(\)/g, 'DEFAULT (CURRENT_DATE)')
        .replace(/DEFAULT current_timestamp\(\)/g, 'DEFAULT CURRENT_TIMESTAMP')
        .replace(/ON UPDATE current_timestamp\(\)/g, 'ON UPDATE CURRENT_TIMESTAMP');
      
      // Create table in Local
      console.log(`🔨 Creating table structure locally: ${tableName}`);
      await localConnection.execute(createStatement);
      
      // Get table data from Railway
      const [rows] = await railwayConnection.execute(`SELECT * FROM \`${tableName}\``);
      
      if (rows.length > 0) {
        console.log(`📦 Copying ${rows.length} rows to local ${tableName}`);
        
        // Get column names from Railway
        const [columns] = await railwayConnection.execute(`DESCRIBE \`${tableName}\``);
        const columnNames = columns.map(col => `\`${col.Field}\``).join(', ');
        const placeholders = columns.map(() => '?').join(', ');
        
        // Insert data in batches into Local
        const batchSize = 100;
        for (let i = 0; i < rows.length; i += batchSize) {
          const batch = rows.slice(i, i + batchSize);
          const insertQuery = `INSERT INTO \`${tableName}\` (${columnNames}) VALUES ${batch.map(() => `(${placeholders})`).join(', ')}`;
          const values = batch.flatMap(row => Object.values(row));
          
          await localConnection.execute(insertQuery, values);
        }
      } else {
        console.log(`⚠️ Railway Table ${tableName} is empty`);
      }
    }

    // Re-enable foreign key checks on local
    await localConnection.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('🎉 Bull Run database import from Railway completed successfully!');
    
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
    console.error('❌ Database import failed:', error.message);
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

// Run the import
importRailwayToLocal();