import mysql from 'mysql2/promise';

async function migrateRailway() {
  let railwayConnection;
  
  try {
    console.log('🚀 Starting Railway database migration...\n');
    
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
    console.log('✅ Railway MySQL connected!\n');

    // Check if level column already exists
    console.log('🔍 Checking if level column exists...');
    const [columns] = await railwayConnection.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'railway' AND TABLE_NAME = 'earnings_history' AND COLUMN_NAME = 'level'"
    );
    
    if (columns.length > 0) {
      console.log('⚠️  Level column already exists! Skipping column creation.');
    } else {
      // Add level column
      console.log('📝 Adding level column to earnings_history table...');
      await railwayConnection.execute(`
        ALTER TABLE earnings_history 
        ADD COLUMN level INT UNSIGNED DEFAULT 0 AFTER from_user_id
      `);
      console.log('✅ Level column added successfully!\n');
    }

    // Update existing records with level from transaction_history
    console.log('🔄 Updating existing records with level data...');
    const [updateResult] = await railwayConnection.execute(`
      UPDATE earnings_history e 
      JOIN transaction_history t ON e.tx_hash = t.tx_hash AND e.user_id = t.user_id 
      SET e.level = CAST(JSON_UNQUOTE(JSON_EXTRACT(t.event_data, '$.level')) AS UNSIGNED) 
      WHERE t.event_type = 'IncomeDistributed' 
      AND t.event_data IS NOT NULL
      AND e.level = 0
    `);
    console.log(`✅ Updated ${updateResult.affectedRows} records with level data\n`);

    // Fix earning_type for NFT_PROFIT records
    console.log('🔄 Fixing earning_type for NFT_PROFIT records...');
    const [fixResult] = await railwayConnection.execute(`
      UPDATE earnings_history e 
      JOIN transaction_history t ON e.tx_hash = t.tx_hash AND e.user_id = t.user_id 
      SET e.earning_type = 'nft_profit' 
      WHERE JSON_EXTRACT(t.event_data, '$.incomeType') LIKE '%PROFIT%' 
      AND e.earning_type = 'level_income'
    `);
    console.log(`✅ Fixed ${fixResult.affectedRows} NFT_PROFIT records\n`);

    // Verify migration
    console.log('🔍 Verifying migration...\n');
    const [stats] = await railwayConnection.execute(`
      SELECT 
        COUNT(*) AS total_records,
        SUM(CASE WHEN level IS NOT NULL THEN 1 ELSE 0 END) AS records_with_level,
        SUM(CASE WHEN earning_type = 'nft_profit' THEN 1 ELSE 0 END) AS nft_profit_records,
        SUM(CASE WHEN earning_type = 'level_income' THEN 1 ELSE 0 END) AS level_income_records
      FROM earnings_history
    `);
    
    console.log('📊 Migration Statistics:');
    console.log('========================');
    console.log(`Total records: ${stats[0].total_records}`);
    console.log(`Records with level: ${stats[0].records_with_level}`);
    console.log(`NFT profit records: ${stats[0].nft_profit_records}`);
    console.log(`Level income records: ${stats[0].level_income_records}`);
    
    // Sample data verification
    console.log('\n📋 Sample Records:');
    console.log('==================');
    const [samples] = await railwayConnection.execute(`
      SELECT 
        earning_id,
        user_id,
        earning_type,
        amount,
        from_user_id,
        level,
        nft_id
      FROM earnings_history 
      LIMIT 5
    `);
    console.table(samples);

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n✅ Next steps:');
    console.log('   1. Push code to GitHub');
    console.log('   2. Railway will auto-deploy');
    console.log('   3. Test API: https://your-app.railway.app/api/user/303/history/income');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    if (railwayConnection) {
      await railwayConnection.end();
      console.log('\n🔌 Railway connection closed');
    }
  }
}

// Run the migration
migrateRailway();
