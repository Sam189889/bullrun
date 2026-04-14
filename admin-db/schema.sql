-- Bull Run Admin Database Schema
-- This database stores ONLY admin controls, NOT contract data
-- All user/NFT data is read from blockchain contract

CREATE DATABASE IF NOT EXISTS bull_run_admin;
USE bull_run_admin;

-- Table 1: NFT Controls (hide/pin NFTs)
CREATE TABLE IF NOT EXISTS nft_controls (
    nft_id INT PRIMARY KEY,
    is_hidden BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    pin_order INT DEFAULT 0,
    hidden_by_admin_at TIMESTAMP NULL,
    pinned_by_admin_at TIMESTAMP NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_hidden (is_hidden),
    INDEX idx_pinned (is_pinned),
    INDEX idx_pin_order (pin_order)
);

-- Table 2: User Unlisted Counts (queue exceptions only)
CREATE TABLE IF NOT EXISTS user_unlisted_counts (
    user_id INT PRIMARY KEY,
    unlisted_count INT NOT NULL,
    set_by_admin_at TIMESTAMP NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_unlisted_count (unlisted_count)
);
