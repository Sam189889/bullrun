-- ================================================
-- Bull Run - Optimized MySQL Database Schema
-- Based on actual UI requirements (2026-04-10)
-- ================================================

-- Drop existing tables (for clean setup)
DROP TABLE IF EXISTS admin_controls;
DROP TABLE IF EXISTS queue_rules;
DROP TABLE IF EXISTS lucky_draw_history;
DROP TABLE IF EXISTS earnings_history;
DROP TABLE IF EXISTS transaction_history;
DROP TABLE IF EXISTS nfts;
DROP TABLE IF EXISTS users;

-- ================================================
-- USERS TABLE (MINIMAL - Only for Queue Rules)
-- ================================================
-- Other user data (username, package, rank, referrer, etc.) 
-- is read directly from contract in real-time
CREATE TABLE users (
    user_id BIGINT UNSIGNED PRIMARY KEY,
    wallet_address VARCHAR(42) NOT NULL UNIQUE,
    
    -- Stats for Queue Rule Evaluation
    total_earned DECIMAL(30, 6) DEFAULT 0,
    direct_referrals_count INT UNSIGNED DEFAULT 0,
    nft_count INT UNSIGNED DEFAULT 0,
    package_level INT UNSIGNED DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_wallet (wallet_address),
    INDEX idx_earned (total_earned),
    INDEX idx_directs (direct_referrals_count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- NFTs TABLE (OPTIMIZED FOR ADMIN CONTROLS)
-- ================================================
-- Contract Fields (fetched in real-time from blockchain):
-- - nftId, currentPrice, basePrice, lastPurchasePrice
-- - ownerId, buyCount, createdAt, lastTradedAt
-- - isListed, isBurned
--
-- MySQL stores: All active NFTs (not burned) + Admin controls
CREATE TABLE nfts (
    nft_id BIGINT UNSIGNED PRIMARY KEY,
    owner_id BIGINT UNSIGNED NOT NULL,
    
    -- ❌ REMOVED: creator_id (doesn't exist in contract)
    -- ❌ REMOVED: current_price, base_price (fetched from contract)
    -- ❌ REMOVED: token_uri, parent_nft_id, split_count (unused)
    
    -- ✅ ADMIN DISPLAY CONTROLS
    is_hidden BOOLEAN DEFAULT FALSE,       -- Hide from marketplace (admin control)
    is_pinned BOOLEAN DEFAULT FALSE,       -- Pin to top of marketplace
    pin_order INT UNSIGNED DEFAULT 0,      -- Order of pinned NFTs (lower = higher priority)
    
    -- ✅ ADMIN QUEUE CONTROLS
    admin_override BOOLEAN DEFAULT FALSE,  -- Bypass global queue rules for this NFT
    queue_exempt BOOLEAN DEFAULT FALSE,    -- Always show regardless of user's queue status
    
    -- ✅ ADMIN METADATA
    admin_notes TEXT DEFAULT NULL,         -- Private admin notes
    hide_reason TEXT DEFAULT NULL,         -- Reason for hiding (if hidden)
    hidden_by VARCHAR(42) DEFAULT NULL,    -- Admin wallet who hid it
    hidden_at TIMESTAMP NULL DEFAULT NULL, -- When it was hidden
    
    -- ✅ CACHED CONTRACT DATA (for sorting without RPC calls)
    -- Matches NFT struct from BullRunMainLogic.sol
    -- struct NFT: nftId, currentPrice, basePrice, lastPurchasePrice, ownerId, 
    --             buyCount, createdAt, lastTradedAt, isListed, isBurned
    cached_current_price DECIMAL(20, 6) DEFAULT 0,  -- currentPrice from event
    cached_base_price DECIMAL(20, 6) DEFAULT 0,     -- basePrice from contract
    cached_buy_count INT UNSIGNED DEFAULT 0,        -- buyCount from contract
    cached_created_at BIGINT UNSIGNED DEFAULT 0,    -- createdAt timestamp
    cached_last_traded_at BIGINT UNSIGNED DEFAULT 0, -- lastTradedAt timestamp
    cached_is_listed BOOLEAN DEFAULT TRUE,          -- isListed from contract
    -- Note: isBurned NFTs are DELETED from DB, not cached
    
    -- ✅ SYNC TRACKING
    last_synced_block BIGINT UNSIGNED DEFAULT 0,
    last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- ✅ TIMESTAMPS
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- ✅ INDEXES FOR ADMIN QUERIES
    INDEX idx_owner (owner_id),
    INDEX idx_hidden (is_hidden),
    INDEX idx_listed (cached_is_listed),
    INDEX idx_pinned (is_pinned, pin_order),
    INDEX idx_price (cached_current_price),
    INDEX idx_created (cached_created_at),
    INDEX idx_traded (cached_last_traded_at),
    
    -- Composite index for marketplace query (burned NFTs are deleted)
    INDEX idx_marketplace (is_hidden, is_pinned, pin_order, cached_created_at),
    
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TRANSACTION HISTORY
-- ================================================
CREATE TABLE transaction_history (
    tx_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tx_hash VARCHAR(66) NOT NULL,
    block_number BIGINT UNSIGNED NOT NULL,
    
    -- Event Details
    event_type ENUM(
        'UserRegistered',
        'PackagePurchased',
        'NFTCreated',
        'NFTSold',
        'NFTBurned',
        'IncomeDistributed',
        'RankAchieved',
        'WeeklyPoolPaid',
        'LuckyDrawWinner',
        'SharesAwarded'
    ) NOT NULL,
    
    -- Participants
    user_id BIGINT UNSIGNED DEFAULT NULL,
    related_user_id BIGINT UNSIGNED DEFAULT NULL,
    nft_id BIGINT UNSIGNED DEFAULT NULL,
    
    -- Amounts (increased precision for large wei values)
    amount DECIMAL(30, 6) DEFAULT 0,
    
    -- Additional Data (JSON for flexibility)
    event_data JSON DEFAULT NULL,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_tx_hash (tx_hash),
    INDEX idx_block (block_number),
    INDEX idx_event_type (event_type),
    INDEX idx_user (user_id),
    INDEX idx_nft (nft_id),
    INDEX idx_created (created_at)
    
    -- No foreign keys - historical data should remain even if user/NFT deleted
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- EARNINGS HISTORY
-- ================================================
CREATE TABLE earnings_history (
    earning_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    
    -- Earning Type
    earning_type ENUM(
        'nft_profit',
        'level_income',
        'trading_level_bonus',
        'rank_emi',
        'fast_bonus',
        'weekly_pool',
        'lucky_draw',
        'trip_reward'
    ) NOT NULL,
    
    -- Amount (increased precision for large wei values)
    amount DECIMAL(30, 6) NOT NULL,
    
    -- Source Reference
    from_user_id BIGINT UNSIGNED DEFAULT NULL,
    nft_id BIGINT UNSIGNED DEFAULT NULL,
    week_number BIGINT UNSIGNED DEFAULT NULL,
    
    -- Transaction Reference
    tx_hash VARCHAR(66) DEFAULT NULL,
    block_number BIGINT UNSIGNED DEFAULT NULL,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user (user_id),
    INDEX idx_type (earning_type),
    INDEX idx_from_user (from_user_id),
    INDEX idx_week (week_number),
    INDEX idx_created (created_at),
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- LUCKY DRAW HISTORY
-- ================================================
CREATE TABLE lucky_draw_history (
    draw_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    week_number BIGINT UNSIGNED NOT NULL,
    winner_user_id BIGINT UNSIGNED NOT NULL,
    winning_number BIGINT UNSIGNED NOT NULL,
    prize_amount DECIMAL(20, 6) NOT NULL,
    
    tx_hash VARCHAR(66) DEFAULT NULL,
    drawn_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_week (week_number),
    INDEX idx_winner (winner_user_id),
    
    FOREIGN KEY (winner_user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- USER QUEUE STATUS (Replaces contract queue logic)
-- ================================================
-- Tracks user's queue eligibility based on earnings and sponsors
CREATE TABLE user_queue_status (
    user_id BIGINT UNSIGNED PRIMARY KEY,
    total_earnings DECIMAL(20, 6) DEFAULT 0,
    sponsor_count INT UNSIGNED DEFAULT 0,
    queue_slots INT UNSIGNED DEFAULT 0,  -- Calculated: (earnings / threshold) * slots_per_threshold
    queue_active BOOLEAN DEFAULT TRUE,   -- FALSE when sponsors >= sponsor_exit threshold
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_queue_active (queue_active),
    INDEX idx_queue_slots (queue_slots),
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- MARKETPLACE SETTINGS (Admin Configuration)
-- ================================================
-- Controls marketplace display, sorting, pagination
CREATE TABLE marketplace_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    description TEXT DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default marketplace settings
INSERT INTO marketplace_settings (setting_key, setting_value, description) VALUES
-- Sorting Options
('default_sort', 'newest', 'Default sort: newest, oldest, price_asc, price_desc, most_traded, recently_traded'),
('allow_user_sort', 'true', 'Allow users to change sort order'),
-- Display Count Control
('items_per_page', '20', 'Number of NFTs per page (admin control)'),
('max_items_per_page', '100', 'Maximum items user can request per page'),
-- Shuffle Control
('enable_shuffle', 'false', 'Enable random shuffle of NFTs (overrides sort)'),
('shuffle_seed_interval', '3600', 'Change shuffle order every N seconds'),
-- Pin/Featured Control
('enable_pinning', 'true', 'Enable NFT pinning feature'),
('max_pinned_nfts', '10', 'Maximum number of pinned NFTs'),
('show_pin_badge', 'true', 'Show "Featured" badge on pinned NFTs'),
-- Visibility Control
('show_unlisted_nfts', 'false', 'Show unlisted NFTs in marketplace (grayed out)'),
('show_burned_nfts', 'false', 'Show burned NFTs in marketplace (for history)'),
-- Global Queue Override
('apply_queue_rules', 'true', 'Apply global queue rules to marketplace display'),
-- Performance
('cache_duration', '30', 'Cache marketplace query results for N seconds'),
('enable_lazy_load', 'true', 'Load NFTs as user scrolls');

-- ================================================
-- QUEUE RULES (Admin Configuration)
-- ================================================
CREATE TABLE queue_rules (
    rule_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    rule_name VARCHAR(100) NOT NULL,
    rule_type ENUM('package_based', 'direct_based', 'earnings_based', 'custom', 'disabled') NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    priority INT UNSIGNED DEFAULT 0,
    
    -- Rule Configuration (JSON)
    config JSON DEFAULT NULL,
    -- Example configs:
    -- package_based: {"package_id": 1, "queue_slots": 2}
    -- direct_based: {"min_directs": 2, "auto_list": true}
    -- earnings_based: {"threshold": 500, "slots_per_threshold": 2}
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_enabled (enabled),
    INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- ADMIN CONTROLS (Feature Toggles)
-- ================================================
CREATE TABLE admin_controls (
    control_key VARCHAR(100) PRIMARY KEY,
    control_value TEXT NOT NULL,
    description TEXT DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin controls
INSERT INTO admin_controls (control_key, control_value, description) VALUES
-- Claim Controls
('claim_rank_emi_enabled', 'true', 'Enable/disable rank EMI claim button'),
('claim_withdraw_enabled', 'true', 'Enable/disable earnings withdrawal button'),
('claim_fast_bonus_enabled', 'true', 'Enable/disable fast bonus claim button'),
('weekly_pool_enabled', 'true', 'Enable/disable weekly pool distribution'),
('lucky_draw_enabled', 'true', 'Enable/disable lucky draw'),
-- NFT Display Controls
('nft_hide_system_enabled', 'true', 'Enable/disable NFT hide feature'),
('nft_pin_system_enabled', 'true', 'Enable/disable NFT pin feature'),
-- Queue System Controls (as per plan)
('queue_mode', 'disabled', 'Queue mode: auto, manual, disabled (contract queue disabled via setQueueCount(0))'),
('queue_earning_threshold', '500', '$500 USD per queue slot threshold'),
('queue_sponsor_exit', '2', 'Exit queue when user has this many direct sponsors'),
('queue_slots_per_threshold', '2', 'Number of NFT slots awarded per earning threshold reached');

-- Insert default queue rule (disabled)
INSERT INTO queue_rules (rule_name, rule_type, enabled, priority, config) VALUES
('Default - All Listed', 'disabled', true, 0, '{"description": "Contract queue disabled, all NFTs listed by default"}');

-- ================================================
-- SCHEMA VERSION
-- ================================================
CREATE TABLE schema_version (
    version INT PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT DEFAULT NULL
);

INSERT INTO schema_version (version, notes) VALUES 
(2, 'Optimized schema - removed unused fields (creator_id, token_uri, split fields), added marketplace_settings table');

-- ================================================
-- SUMMARY OF CHANGES FROM ORIGINAL SCHEMA
-- ================================================
-- ✅ REMOVED from nfts table:
--    - creator_id (doesn't exist in contract)
--    - current_price, base_price (fetched from contract)
--    - is_listed, is_burned (fetched from contract)
--    - token_uri (unused)
--    - parent_nft_id, split_count (unused split tracking)
--    - burned_at (not needed, isBurned from contract)
--
-- ✅ KEPT in nfts table:
--    - nft_id (primary key)
--    - owner_id (for foreign key relationship)
--    - is_hidden (admin can hide from marketplace)
--    - is_pinned (admin can pin to top)
--    - pin_order (order of pinned NFTs)
--    - admin_override (skip auto rules)
--
-- ✅ ADDED:
--    - marketplace_settings table (for admin control of marketplace display)
--    - admin_notes field in nfts (for admin reference)
--
-- ================================================
-- DATA FLOW:
-- ================================================
-- 1. ADMIN PANEL (NFTsTab.tsx):
--    - Fetches NFT data from CONTRACT (prices, status, owner)
--    - Fetches admin controls from DATABASE (is_hidden, is_pinned, pin_order)
--    - Admin can toggle hide/pin/order → saves to DATABASE
--
-- 2. MARKETPLACE (MarketplaceTab.tsx):
--    - Queries DATABASE for visible NFTs (WHERE is_hidden = false)
--    - Orders by pin_order (pinned first) then default sort
--    - Fetches live NFT data from CONTRACT for each visible NFT
--    - Applies marketplace_settings (pagination, shuffle)
--
-- 3. MY NFTS (MyNFTsTab.tsx):
--    - Fetches user's NFT IDs from CONTRACT
--    - Checks DATABASE if NFT is_hidden
--    - Shows only visible NFTs with CONTRACT data
--
-- ================================================
