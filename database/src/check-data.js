import { query, closePool } from './db.js';

async function checkData() {
    console.log('📊 Checking database data...\n');
    
    try {
        // Count users
        const users = await query('SELECT COUNT(*) as count FROM users');
        console.log(`👥 Users: ${users[0].count}`);
        
        // Count NFTs
        const nfts = await query('SELECT COUNT(*) as count FROM nfts');
        console.log(`🎨 NFTs: ${nfts[0].count}`);
        
        // Count transactions
        const txs = await query('SELECT COUNT(*) as count FROM transaction_history');
        console.log(`📝 Transactions: ${txs[0].count}`);
        
        // Count earnings
        const earnings = await query('SELECT COUNT(*) as count FROM earnings_history');
        console.log(`💰 Earnings: ${earnings[0].count}\n`);
        
        // Event breakdown
        console.log('📊 Event Breakdown:');
        const eventBreakdown = await query(`
            SELECT event_type, COUNT(*) as count 
            FROM transaction_history 
            GROUP BY event_type
            ORDER BY count DESC
        `);
        
        if (eventBreakdown.length > 0) {
            eventBreakdown.forEach(row => {
                console.log(`  ${row.event_type}: ${row.count}`);
            });
        } else {
            console.log('  No events yet');
        }
        
        console.log('\n📋 Recent Users:');
        const recentUsers = await query(`
            SELECT user_id, wallet_address, nft_count, total_earned 
            FROM users 
            LIMIT 5
        `);
        
        if (recentUsers.length > 0) {
            recentUsers.forEach(user => {
                console.log(`  User ${user.user_id}: ${user.wallet_address.substring(0, 10)}... NFTs: ${user.nft_count}, Earned: ${user.total_earned}`);
            });
        } else {
            console.log('  No users yet');
        }
        
        console.log('\n🎨 Recent NFTs:');
        const recentNFTs = await query(`
            SELECT nft_id, owner_id, current_price, is_listed 
            FROM nfts 
            LIMIT 5
        `);
        
        if (recentNFTs.length > 0) {
            recentNFTs.forEach(nft => {
                console.log(`  NFT ${nft.nft_id}: Owner ${nft.owner_id}, Price: ${nft.current_price}, Listed: ${nft.is_listed}`);
            });
        } else {
            console.log('  No NFTs yet');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await closePool();
    }
}

checkData();
