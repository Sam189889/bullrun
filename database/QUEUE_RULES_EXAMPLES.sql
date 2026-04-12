-- ================================================
-- QUEUE RULES - Real Examples
-- ================================================

-- Clear existing rules
TRUNCATE TABLE queue_rules;

-- ================================================
-- RULE 1: New User Bonus (No Queue for 24 hours)
-- ================================================
INSERT INTO queue_rules (
    rule_name,
    rule_type,
    enabled,
    priority,
    config
) VALUES (
    'New User - No Queue',
    'custom',
    TRUE,
    100,  -- Highest priority
    JSON_OBJECT(
        'conditions', JSON_ARRAY(
            JSON_OBJECT('field', 'days_since_registration', 'operator', '<=', 'value', 1),
            JSON_OBJECT('field', 'package_level', 'operator', '>=', 'value', 1)
        ),
        'match', 'all',
        'queue_slots', 0  -- 0 = No queue, all NFTs listed
    )
);

-- ================================================
-- RULE 2: Earned $500 → 5 NFTs out of Queue
-- ================================================
INSERT INTO queue_rules (
    rule_name,
    rule_type,
    enabled,
    priority,
    config
) VALUES (
    'Earnings $500 Tier',
    'earnings_based',
    TRUE,
    80,
    JSON_OBJECT(
        'threshold', 500,          -- $500 USDT
        'slots_removed', -5        -- Remove 5 NFTs from queue (negative = out of queue)
    )
);

-- ================================================
-- RULE 3: 10 Direct Referrals → 10 NFTs out of Queue  
-- ================================================
INSERT INTO queue_rules (
    rule_name,
    rule_type,
    enabled,
    priority,
    config
) VALUES (
    '10 Directs = 10 Queue Removed',
    'direct_based',
    TRUE,
    70,
    JSON_OBJECT(
        'min_directs', 10,
        'max_directs', 19,
        'queue_slots', -10         -- Remove 10 from queue
    )
);

-- ================================================
-- RULE 4: Earned $5000 → 20 NFTs out of Queue
-- ================================================
INSERT INTO queue_rules (
    rule_name,
    rule_type,
    enabled,
    priority,
    config
) VALUES (
    'Earnings $5000+ VIP',
    'earnings_based',
    TRUE,
    90,
    JSON_OBJECT(
        'threshold', 5000,
        'slots_removed', -20       -- Remove 20 from queue
    )
);

-- ================================================
-- RULE 5: Custom Whale Tier
-- Package Level 5 + 50 Directs + $10k Earnings
-- ================================================
INSERT INTO queue_rules (
    rule_name,
    rule_type,
    enabled,
    priority,
    config
) VALUES (
    'Whale Tier - Unlimited Queue',
    'custom',
    TRUE,
    95,
    JSON_OBJECT(
        'conditions', JSON_ARRAY(
            JSON_OBJECT('field', 'package_level', 'operator', '>=', 'value', 5),
            JSON_OBJECT('field', 'direct_referrals_count', 'operator', '>=', 'value', 50),
            JSON_OBJECT('field', 'total_earned_usd', 'operator', '>=', 'value', 10000)
        ),
        'match', 'all',
        'queue_slots', 0           -- 0 = No queue limit
    )
);

-- ================================================
-- RULE 6: Default - 2 NFTs in Queue
-- ================================================
INSERT INTO queue_rules (
    rule_name,
    rule_type,
    enabled,
    priority,
    config
) VALUES (
    'Default Queue',
    'custom',
    TRUE,
    10,  -- Lowest priority (fallback)
    JSON_OBJECT(
        'queue_slots', 2           -- Default: 2 oldest NFTs in queue
    )
);

-- ================================================
-- ADMIN: Add New Custom Rule
-- ================================================
-- Example: 20 Directs + $2000 Earnings = 15 NFTs out
INSERT INTO queue_rules (
    rule_name,
    rule_type,
    enabled,
    priority,
    config
) VALUES (
    'Custom: 20 Directs + $2k',
    'custom',
    TRUE,
    75,
    JSON_OBJECT(
        'conditions', JSON_ARRAY(
            JSON_OBJECT('field', 'direct_referrals_count', 'operator', '>=', 'value', 20),
            JSON_OBJECT('field', 'total_earned_usd', 'operator', '>=', 'value', 2000)
        ),
        'match', 'all',
        'queue_slots', -15
    )
);

-- ================================================
-- ADMIN QUERIES
-- ================================================

-- View all active rules
SELECT 
    rule_id,
    rule_name,
    rule_type,
    priority,
    JSON_PRETTY(config) as config_detail,
    enabled
FROM queue_rules 
ORDER BY priority DESC;

-- Disable a rule
UPDATE queue_rules SET enabled = FALSE WHERE rule_id = 3;

-- Enable a rule
UPDATE queue_rules SET enabled = TRUE WHERE rule_id = 3;

-- Update rule priority
UPDATE queue_rules SET priority = 85 WHERE rule_id = 2;

-- Update rule config (increase threshold)
UPDATE queue_rules 
SET config = JSON_SET(config, '$.threshold', 1000)
WHERE rule_id = 2;

-- Delete a rule
DELETE FROM queue_rules WHERE rule_id = 7;
