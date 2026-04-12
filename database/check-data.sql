-- Check synced data
USE bull_run;

-- Count tables
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'NFTs', COUNT(*) FROM nfts
UNION ALL
SELECT 'Transactions', COUNT(*) FROM transaction_history
UNION ALL
SELECT 'Earnings', COUNT(*) FROM earnings_history;

-- Show recent transactions
SELECT event_type, COUNT(*) as count 
FROM transaction_history 
GROUP BY event_type;

-- Show recent users
SELECT user_id, wallet_address, nft_count, total_earned 
FROM users 
LIMIT 10;

-- Show recent NFTs
SELECT nft_id, owner_id, creator_id, current_price, is_listed 
FROM nfts 
LIMIT 10;
