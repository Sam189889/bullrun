# 📊 Database Schema Alignment with Contract

## ✅ **NFT Table - Properly Aligned**

### **Contract NFT Struct:**
```solidity
// BullRunMainLogic.sol
struct NFT {
    uint256 nftId;              // ✅ Stored as: nft_id (PRIMARY KEY)
    uint256 currentPrice;       // ✅ Cached as: cached_current_price
    uint256 basePrice;          // ✅ Cached as: cached_base_price
    uint256 lastPurchasePrice;  // ❌ NOT cached (not needed for sorting)
    uint256 ownerId;            // ✅ Stored as: owner_id
    uint256 buyCount;           // ✅ Cached as: cached_buy_count
    uint256 createdAt;          // ✅ Cached as: cached_created_at
    uint256 lastTradedAt;       // ✅ Cached as: cached_last_traded_at
    bool isListed;              // ✅ Cached as: cached_is_listed
    bool isBurned;              // ✅ Burned NFTs = DELETED from DB
}
```

### **NFTSold Event Fields:**
```solidity
event NFTSold(
    uint256 indexed nftId,
    uint256 indexed sellerId,
    uint256 indexed buyerId,
    uint256 sellerUsernameId,
    uint256 buyerUsernameId,
    uint256 price,
    uint256 appreciation
);
```

### **MySQL NFT Table:**
```sql
CREATE TABLE nfts (
    -- ✅ ESSENTIAL FIELDS (From Contract)
    nft_id BIGINT UNSIGNED PRIMARY KEY,        -- NFT ID
    owner_id BIGINT UNSIGNED NOT NULL,         -- Current owner
    
    -- ✅ ADMIN DISPLAY CONTROLS
    is_hidden BOOLEAN DEFAULT FALSE,           -- Admin: Hide from marketplace
    is_pinned BOOLEAN DEFAULT FALSE,           -- Admin: Pin to top
    pin_order INT UNSIGNED DEFAULT 0,          -- Admin: Pin order
    
    -- ✅ ADMIN QUEUE CONTROLS
    admin_override BOOLEAN DEFAULT FALSE,      -- Admin: Bypass queue rules
    queue_exempt BOOLEAN DEFAULT FALSE,        -- Admin: Always show
    
    -- ✅ ADMIN METADATA
    admin_notes TEXT DEFAULT NULL,             -- Admin: Private notes
    hide_reason TEXT DEFAULT NULL,             -- Admin: Hide reason
    hidden_by VARCHAR(42) DEFAULT NULL,        -- Admin: Who hid it
    hidden_at TIMESTAMP NULL DEFAULT NULL,     -- Admin: When hidden
    
    -- ✅ CACHED CONTRACT DATA (For Sorting)
    cached_current_price DECIMAL(20, 6) DEFAULT 0,     -- From event
    cached_base_price DECIMAL(20, 6) DEFAULT 0,        -- From contract (if needed)
    cached_buy_count INT UNSIGNED DEFAULT 0,           -- Incremented on sale
    cached_created_at BIGINT UNSIGNED DEFAULT 0,       -- First sale timestamp
    cached_last_traded_at BIGINT UNSIGNED DEFAULT 0,   -- Last sale timestamp
    cached_is_listed BOOLEAN DEFAULT TRUE,             -- Always true for active NFTs
    
    -- ✅ SYNC TRACKING
    last_synced_block BIGINT UNSIGNED DEFAULT 0,
    last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- ✅ TIMESTAMPS
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- ✅ INDEXES
    INDEX idx_owner (owner_id),
    INDEX idx_hidden (is_hidden),
    INDEX idx_listed (cached_is_listed),
    INDEX idx_pinned (is_pinned, pin_order),
    INDEX idx_price (cached_current_price),
    INDEX idx_created (cached_created_at),
    INDEX idx_traded (cached_last_traded_at),
    INDEX idx_marketplace (is_hidden, is_pinned, pin_order, cached_created_at)
);
```

---

## 📝 **Event Handling:**

### **NFTSold Event:**
```javascript
handleNFTSold(event) {
    const { nftId, sellerId, buyerId, price, appreciation } = event.args;
    
    // Insert or update with EXACT fields
    INSERT INTO nfts (
        nft_id,                 // ← event.args.nftId
        owner_id,               // ← event.args.buyerId (new owner)
        cached_current_price,   // ← event.args.price
        cached_created_at,      // ← timestamp (first sale only)
        cached_last_traded_at,  // ← timestamp (every sale)
        cached_buy_count        // ← 1 (incremented on update)
    ) VALUES (...)
    ON DUPLICATE KEY UPDATE
        owner_id = buyerId,
        cached_current_price = price,
        cached_last_traded_at = timestamp,
        cached_buy_count = cached_buy_count + 1;
}
```

### **NFTBurned Event:**
```javascript
handleNFTBurned(event) {
    const { nftId } = event.args;
    
    // DELETE burned NFT (not mark as burned)
    DELETE FROM nfts WHERE nft_id = ?;
    
    // History preserved in transaction_history table
}
```

---

## ✅ **Benefits:**

1. **Exact Contract Match** - Cached fields match NFT struct
2. **No Guessing** - All fields from events or contract
3. **Burned = Deleted** - Clean database (history in events)
4. **Admin Controls** - Separate from contract data
5. **Fast Queries** - Cached data for sorting

---

## 🎯 **Usage:**

### **Marketplace Query:**
```sql
-- Get active, visible, sorted NFTs
SELECT * FROM nfts
WHERE is_hidden = FALSE
ORDER BY 
  is_pinned DESC,
  pin_order ASC,
  cached_created_at DESC
LIMIT 100;
```

### **User NFTs Query:**
```sql
-- Get user's NFTs (burned ones already deleted)
SELECT * FROM nfts
WHERE owner_id = ?
ORDER BY cached_created_at DESC;
```

---

**Last Updated:** 2026-04-10  
**Schema Version:** 2 (Optimized & Aligned)
