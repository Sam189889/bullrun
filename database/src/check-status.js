import { query, closePool } from './db.js';

async function checkStatus() {
    console.log('\n📊 Checking database status...\n');
    
    try {
        // Count tables
        const counts = await query(`
            SELECT 'Users' as table_name, COUNT(*) as count FROM users
            UNION ALL
            SELECT 'NFTs', COUNT(*) FROM nfts
            UNION ALL
            SELECT 'Transactions', COUNT(*) FROM transaction_history
            UNION ALL
            SELECT 'Earnings', COUNT(*) FROM earnings_history
            UNION ALL
            SELECT 'User Queue Status', COUNT(*) FROM user_queue_status
        `);
        
        console.log('📈 Table Counts:');
        counts.forEach(row => {
            console.log(`   ${row.table_name}: ${row.count}`);
        });
        
        // Sample NFTs
        console.log('\n🎨 Sample NFTs:');
        const nfts = await query(`
            SELECT nft_id, owner_id, cached_current_price, cached_is_listed, cached_is_burned, is_hidden, is_pinned
            FROM nfts
            ORDER BY nft_id
            LIMIT 5
        `);
        
        if (nfts.length > 0) {
            nfts.forEach(nft => {
                console.log(`   NFT #${nft.nft_id}: Owner=${nft.owner_id}, Price=$${nft.cached_current_price}, Listed=${nft.cached_is_listed}, Burned=${nft.cached_is_burned}, Hidden=${nft.is_hidden}, Pinned=${nft.is_pinned}`);
            });
        } else {
            console.log('   No NFTs yet');
        }
        
        // Sample Users
        console.log('\n👥 Sample Users:');
        const users = await query(`
            SELECT user_id, wallet_address, total_earned, nft_count, direct_referrals_count
            FROM users
            ORDER BY user_id
            LIMIT 5
        `);
        
        if (users.length > 0) {
            users.forEach(user => {
                console.log(`   User #${user.user_id}: ${user.wallet_address.substring(0, 10)}..., Earned=$${user.total_earned}, NFTs=${user.nft_count}, Directs=${user.direct_referrals_count}`);
            });
        } else {
            console.log('   No users yet');
        }
        
        // Admin controls
        console.log('\n⚙️  Admin Controls:');
        const controls = await query(`
            SELECT control_key, control_value
            FROM admin_controls
            WHERE control_key IN ('queue_mode', 'items_per_page', 'enable_shuffle')
        `);
        
        controls.forEach(ctrl => {
            console.log(`   ${ctrl.control_key}: ${ctrl.control_value}`);
        });
        
        console.log('\n✅ Status check complete!\n');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await closePool();
    }
}

checkStatus();
