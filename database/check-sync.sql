-- Quick check of synced data

SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'NFTs', COUNT(*) FROM nfts
UNION ALL
SELECT 'Transactions', COUNT(*) FROM transaction_history
UNION ALL
SELECT 'Earnings', COUNT(*) FROM earnings_history
UNION ALL
SELECT 'User Queue Status', COUNT(*) FROM user_queue_status;

-- Sample NFTs
SELECT nft_id, owner_id, cached_current_price, cached_is_listed, cached_is_burned
FROM nfts
LIMIT 5;

-- Sample Users
SELECT user_id, wallet_address, total_earned, nft_count
FROM users
LIMIT 5;
