-- ================================================
-- TEST: Multiple Rules Stacking System
-- ================================================

-- Clear existing rules
TRUNCATE TABLE queue_rules;

-- ================================================
-- SETUP: Create Stacking Rules
-- ================================================

-- 1. Default Base Rule (Always applies)
INSERT INTO queue_rules (rule_name, rule_type, enabled, priority, config) VALUES
('Default Queue', 'custom', TRUE, 10, 
 JSON_OBJECT('queue_slots', 2));
-- Result: 2 oldest NFTs stay in queue by default

-- ================================================
-- 2. Direct Referrals Bonuses (STACK TOGETHER!)
-- ================================================

-- 10+ Directs: Remove 10 from queue
INSERT INTO queue_rules (rule_name, rule_type, enabled, priority, config) VALUES
('10+ Directs Bonus', 'custom', TRUE, 60,
 JSON_OBJECT(
   'conditions', JSON_ARRAY(
     JSON_OBJECT('field', 'direct_referrals_count', 'operator', '>=', 'value', 10)
   ),
   'match', 'all',
   'queue_slots', -10
 ));

-- 20+ Directs: Remove additional 10
INSERT INTO queue_rules (rule_name, rule_type, enabled, priority, config) VALUES
('20+ Directs Bonus', 'custom', TRUE, 65,
 JSON_OBJECT(
   'conditions', JSON_ARRAY(
     JSON_OBJECT('field', 'direct_referrals_count', 'operator', '>=', 'value', 20)
   ),
   'match', 'all',
   'queue_slots', -10
 ));

-- 30+ Directs: Remove additional 15
INSERT INTO queue_rules (rule_name, rule_type, enabled, priority, config) VALUES
('30+ Directs VIP', 'custom', TRUE, 70,
 JSON_OBJECT(
   'conditions', JSON_ARRAY(
     JSON_OBJECT('field', 'direct_referrals_count', 'operator', '>=', 'value', 30)
   ),
   'match', 'all',
   'queue_slots', -15
 ));

-- ================================================
-- 3. Earnings Bonuses (STACK TOGETHER!)
-- ================================================

-- $500+ Tier
INSERT INTO queue_rules (rule_name, rule_type, enabled, priority, config) VALUES
('Earnings $500+', 'custom', TRUE, 75,
 JSON_OBJECT(
   'conditions', JSON_ARRAY(
     JSON_OBJECT('field', 'total_earned_usd', 'operator', '>=', 'value', 500)
   ),
   'match', 'all',
   'queue_slots', -5
 ));

-- $1000+ Tier (ADDS to $500 bonus)
INSERT INTO queue_rules (rule_name, rule_type, enabled, priority, config) VALUES
('Earnings $1000+', 'custom', TRUE, 80,
 JSON_OBJECT(
   'conditions', JSON_ARRAY(
     JSON_OBJECT('field', 'total_earned_usd', 'operator', '>=', 'value', 1000)
   ),
   'match', 'all',
   'queue_slots', -10
 ));

-- $2500+ Tier (ADDS more)
INSERT INTO queue_rules (rule_name, rule_type, enabled, priority, config) VALUES
('Earnings $2500+', 'custom', TRUE, 85,
 JSON_OBJECT(
   'conditions', JSON_ARRAY(
     JSON_OBJECT('field', 'total_earned_usd', 'operator', '>=', 'value', 2500)
   ),
   'match', 'all',
   'queue_slots', -20
 ));

-- $5000+ VIP Tier
INSERT INTO queue_rules (rule_name, rule_type, enabled, priority, config) VALUES
('Earnings $5000+ VIP', 'custom', TRUE, 90,
 JSON_OBJECT(
   'conditions', JSON_ARRAY(
     JSON_OBJECT('field', 'total_earned_usd', 'operator', '>=', 'value', 5000)
   ),
   'match', 'all',
   'queue_slots', -30
 ));

-- ================================================
-- 4. Combo Bonuses (Multiple conditions)
-- ================================================

-- Package Level 5 + 50 Directs + $10k = No queue
INSERT INTO queue_rules (rule_name, rule_type, enabled, priority, config) VALUES
('Whale Tier', 'custom', TRUE, 95,
 JSON_OBJECT(
   'conditions', JSON_ARRAY(
     JSON_OBJECT('field', 'package_level', 'operator', '>=', 'value', 5),
     JSON_OBJECT('field', 'direct_referrals_count', 'operator', '>=', 'value', 50),
     JSON_OBJECT('field', 'total_earned_usd', 'operator', '>=', 'value', 10000)
   ),
   'match', 'all',
   'queue_slots', -999
 ));

-- ================================================
-- TEST SCENARIOS
-- ================================================

-- View all active rules
SELECT 
    rule_id,
    rule_name,
    rule_type,
    priority,
    JSON_PRETTY(config) as configuration,
    enabled
FROM queue_rules 
WHERE enabled = TRUE
ORDER BY priority DESC;

-- ================================================
-- SCENARIO 1: New User
-- ================================================
-- Stats: 0 directs, $0 earned
-- Expected: Default (+2) = 2 in queue
-- Matching rules: Default Queue (+2)

-- ================================================
-- SCENARIO 2: Active User
-- ================================================
-- Stats: 15 directs, $800 earned
-- Expected calculation:
--   Default: +2
--   10+ Directs: -10
--   $500 Tier: -5
--   Total: 2 - 10 - 5 = -13 → 0 (no queue)
-- All NFTs listed!

-- ================================================
-- SCENARIO 3: Advanced User
-- ================================================
-- Stats: 25 directs, $1500 earned
-- Expected calculation:
--   Default: +2
--   10+ Directs: -10
--   20+ Directs: -10
--   $500 Tier: -5
--   $1000 Tier: -10
--   Total: 2 - 10 - 10 - 5 - 10 = -33 → 0 (no queue)
-- All NFTs listed!

-- ================================================
-- SCENARIO 4: VIP User
-- ================================================
-- Stats: 35 directs, $3000 earned
-- Expected calculation:
--   Default: +2
--   10+ Directs: -10
--   20+ Directs: -10
--   30+ Directs: -15
--   $500 Tier: -5
--   $1000 Tier: -10
--   $2500 Tier: -20
--   Total: 2 - 10 - 10 - 15 - 5 - 10 - 20 = -68 → 0 (no queue)
-- All NFTs listed!

-- ================================================
-- SCENARIO 5: Whale User
-- ================================================
-- Stats: 55 directs, $12000 earned, Package 5
-- Expected calculation:
--   Default: +2
--   10+ Directs: -10
--   20+ Directs: -10
--   30+ Directs: -15
--   $500 Tier: -5
--   $1000 Tier: -10
--   $2500 Tier: -20
--   $5000 Tier: -30
--   Whale Tier: -999
--   Total: 2 - 10 - 10 - 15 - 5 - 10 - 20 - 30 - 999 = -1097 → 0
-- All NFTs listed!

-- ================================================
-- ADMIN OPERATIONS
-- ================================================

-- Temporarily disable a rule
UPDATE queue_rules SET enabled = FALSE WHERE rule_name = '10+ Directs Bonus';

-- Re-enable
UPDATE queue_rules SET enabled = TRUE WHERE rule_name = '10+ Directs Bonus';

-- Adjust bonus amount
UPDATE queue_rules 
SET config = JSON_SET(config, '$.queue_slots', -15)
WHERE rule_name = '10+ Directs Bonus';

-- Change threshold
UPDATE queue_rules 
SET config = JSON_REPLACE(
    config, 
    '$.conditions[0].value', 
    15
)
WHERE rule_name = '10+ Directs Bonus';

-- Check what would apply for specific user stats
-- (This is manual calculation - actual happens in JS)
SELECT 
    r.rule_name,
    r.priority,
    JSON_EXTRACT(r.config, '$.queue_slots') as slots,
    CASE 
        WHEN JSON_LENGTH(r.config, '$.conditions') > 0 THEN
            'Has conditions - check manually'
        ELSE
            'Always applies'
    END as match_status
FROM queue_rules r
WHERE r.enabled = TRUE
ORDER BY r.priority DESC;
