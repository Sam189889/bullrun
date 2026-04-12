-- ================================================
-- Bull Run - MySQL Database Schema
-- MySQL-First Architecture for Read Operations
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
    total_earned DECIMAL(20, 6) DEFAULT 0,
    direct_referrals_count INT UNSIGNED DEFAULT 0,
    nft_count INT UNSIGNED DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_wallet (wallet_address),
    INDEX idx_earned (total_earned),
    INDEX idx_directs (direct_referrals_count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- NFTs TABLE
-- ================================================
CREATE TABLE nfts (
    nft_id BIGINT UNSIGNED PRIMARY KEY,
    owner_id BIGINT UNSIGNED NOT NULL,
    creator_id BIGINT UNSIGNED NOT NULL,
    
    -- Pricing
    current_price DECIMAL(20, 6) NOT NULL,
    base_price DECIMAL(20, 6) NOT NULL,
    
    -- Status
    is_listed BOOLEAN DEFAULT TRUE,
    is_burned BOOLEAN DEFAULT FALSE,
    
    -- Admin Controls (MySQL-managed)
    is_hidden BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    pin_order INT UNSIGNED DEFAULT 0,
    admin_override BOOLEAN DEFAULT FALSE,  -- If true, skip auto queue rules
    
    -- Metadata
    token_uri TEXT DEFAULT NULL,
    
    -- Split Tracking
    parent_nft_id BIGINT UNSIGNED DEFAULT NULL,
    split_count INT UNSIGNED DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    burned_at TIMESTAMP NULL DEFAULT NULL,
    
    INDEX idx_owner (owner_id),
    INDEX idx_creator (creator_id),
    INDEX idx_listed (is_listed),
    INDEX idx_hidden (is_hidden),
    INDEX idx_pinned (is_pinned, pin_order),
    INDEX idx_burned (is_burned),
    INDEX idx_price (current_price),
    
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (creator_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TRANSACTION HISTORY
-- ================================================
CREATE TABLE transaction_history (
    tx_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tx_hash VARCHAR(66) NOT NULL UNIQUE,
    block_number BIGINT UNSIGNED NOT NULL,
    
    -- Event Details
    event_type ENUM(
        'UserRegistered',
        'PackageActivated', 
        'NFTCreated',
        'NFTSold',
        'NFTBurned',
        'LevelIncomeEarned',
        'RankAchieved',
        'WeeklyPoolPaid',
        'LuckyDrawWon'
    ) NOT NULL,
    
    -- Participants
    user_id BIGINT UNSIGNED DEFAULT NULL,
    related_user_id BIGINT UNSIGNED DEFAULT NULL,
    nft_id BIGINT UNSIGNED DEFAULT NULL,
    
    -- Amounts
    amount DECIMAL(20, 6) DEFAULT 0,
    
    -- Additional Data (JSON for flexibility)
    event_data JSON DEFAULT NULL,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_tx_hash (tx_hash),
    INDEX idx_block (block_number),
    INDEX idx_event_type (event_type),
    INDEX idx_user (user_id),
    INDEX idx_nft (nft_id),
    INDEX idx_created (created_at),
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (nft_id) REFERENCES nfts(nft_id) ON DELETE SET NULL
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
    
    -- Amount
    amount DECIMAL(20, 6) NOT NULL,
    
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
('claim_rank_emi_enabled', 'true', 'Enable/disable rank EMI claim button'),
('claim_withdraw_enabled', 'true', 'Enable/disable earnings withdrawal button'),
('claim_fast_bonus_enabled', 'true', 'Enable/disable fast bonus claim button'),
('weekly_pool_enabled', 'true', 'Enable/disable weekly pool distribution'),
('lucky_draw_enabled', 'true', 'Enable/disable lucky draw'),
('queue_system_enabled', 'false', 'Enable/disable NFT queue system (false = all listed)'),
('nft_hide_system_enabled', 'true', 'Enable/disable NFT hide feature');

-- Insert default queue rule (disabled)
INSERT INTO queue_rules (rule_name, rule_type, enabled, priority, config) VALUES
('Default - All Listed', 'disabled', true, 0, '{"description": "Contract queue disabled, all NFTs listed by default"}');

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================

-- Composite indexes for common queries
CREATE INDEX idx_nfts_marketplace ON nfts(is_listed, is_burned, is_hidden, current_price);
CREATE INDEX idx_earnings_user_type ON earnings_history(user_id, earning_type, created_at);

-- ================================================
-- SCHEMA VERSION
-- ================================================
CREATE TABLE schema_version (
    version INT PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO schema_version (version) VALUES (1);
