-- Migration: Add level column to earnings_history table
-- Run this on Railway before deploying new code

USE bull_run;

-- Add level column if it doesn't exist
ALTER TABLE earnings_history 
ADD COLUMN IF NOT EXISTS level INT UNSIGNED DEFAULT 0 AFTER from_user_id;

-- Update existing records with level from transaction_history event_data
UPDATE earnings_history e 
JOIN transaction_history t ON e.tx_hash = t.tx_hash AND e.user_id = t.user_id 
SET e.level = CAST(JSON_UNQUOTE(JSON_EXTRACT(t.event_data, '$.level')) AS UNSIGNED) 
WHERE t.event_type = 'IncomeDistributed' 
AND t.event_data IS NOT NULL
AND e.level = 0;

-- Fix earning_type for NFT_PROFIT records
UPDATE earnings_history e 
JOIN transaction_history t ON e.tx_hash = t.tx_hash AND e.user_id = t.user_id 
SET e.earning_type = 'nft_profit' 
WHERE JSON_EXTRACT(t.event_data, '$.incomeType') LIKE '%PROFIT%' 
AND e.earning_type = 'level_income';

-- Verify changes
SELECT 
    'Migration completed' AS status,
    COUNT(*) AS total_records,
    SUM(CASE WHEN level IS NOT NULL THEN 1 ELSE 0 END) AS records_with_level,
    SUM(CASE WHEN earning_type = 'nft_profit' THEN 1 ELSE 0 END) AS nft_profit_records
FROM earnings_history;
