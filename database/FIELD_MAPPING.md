# 📋 Database Field Mapping - Complete Reference

## ✅ **NFT Table Fields - Exact Mapping**

### **Schema Definition:**
```sql
CREATE TABLE nfts (
    -- PRIMARY KEY
    nft_id BIGINT UNSIGNED PRIMARY KEY,
    owner_id BIGINT UNSIGNED NOT NULL,
    
    -- ADMIN CONTROLS
    is_hidden BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    pin_order INT UNSIGNED DEFAULT 0,
    admin_override BOOLEAN DEFAULT FALSE,
    queue_exempt BOOLEAN DEFAULT FALSE,
    admin_notes TEXT DEFAULT NULL,
    hide_reason TEXT DEFAULT NULL,
    hidden_by VARCHAR(42) DEFAULT NULL,
    hidden_at TIMESTAMP NULL DEFAULT NULL,
    
    -- CACHED CONTRACT DATA
    cached_current_price DECIMAL(20, 6) DEFAULT 0,
    cached_base_price DECIMAL(20, 6) DEFAULT 0,
    cached_buy_count INT UNSIGNED DEFAULT 0,
    cached_created_at BIGINT UNSIGNED DEFAULT 0,
    cached_last_traded_at BIGINT UNSIGNED DEFAULT 0,
    cached_is_listed BOOLEAN DEFAULT TRUE,
    
    -- SYNC TRACKING
    last_synced_block BIGINT UNSIGNED DEFAULT 0,
    last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- TIMESTAMPS
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 📥 **Data Sources:**

### **1. Contract Fetch (`npm run fetch-nfts`)**

**Source:** `contract.nfts(nftId)` - Direct struct read

```javascript
// initial-contract-fetch.js
INSERT INTO nfts (
    nft_id,                    // ← nft.nftId
    owner_id,                  // ← nft.ownerId
    cached_current_price,      // ← nft.currentPrice
    cached_base_price,         // ← nft.basePrice        ✅
    cached_buy_count,          // ← nft.buyCount         ✅
    cached_created_at,         // ← nft.createdAt        ✅
    cached_last_traded_at,     // ← nft.lastTradedAt     ✅
    cached_is_listed,          // ← nft.isListed         ✅
    created_at                 // ← NOW()
) VALUES (...)
```

**Fields Set:**
- ✅ `nft_id` - From contract
- ✅ `owner_id` - From contract
- ✅ `cached_current_price` - From contract
- ✅ `cached_base_price` - From contract
- ✅ `cached_buy_count` - From contract
- ✅ `cached_created_at` - From contract
- ✅ `cached_last_traded_at` - From contract
- ✅ `cached_is_listed` - From contract
- ✅ All admin fields - Default FALSE/NULL

---

### **2. Event Handler (`handleNFTSold`)**

**Source:** `NFTSold` event - Real-time updates

```javascript
// event-handlers.js
INSERT INTO nfts (
    nft_id,                    // ← event.args.nftId
    owner_id,                  // ← event.args.buyerId
    cached_current_price,      // ← event.args.price
    cached_base_price,         // ← event.args.price (same as current) ⚠️
    cached_is_listed,          // ← true (hardcoded)
    cached_created_at,         // ← timestamp (now)
    cached_last_traded_at,     // ← timestamp (now)
    cached_buy_count,          // ← 1 (new), +1 (update)
    last_synced_block,         // ← event.blockNumber
    created_at                 // ← NOW()
)
ON DUPLICATE KEY UPDATE
    owner_id = ...,            // ← Update on resale
    cached_current_price = ...,// ← Update on resale
    cached_last_traded_at = ...,// ← Update on resale
    cached_buy_count = +1,     // ← Increment on resale
    ...
```

**Fields Set:**
- ✅ `nft_id` - From event
- ✅ `owner_id` - From event (buyerId)
- ✅ `cached_current_price` - From event (price)
- ⚠️ `cached_base_price` - From event (same as price, not accurate)
- ✅ `cached_is_listed` - true (hardcoded)
- ✅ `cached_created_at` - timestamp (first sale)
- ✅ `cached_last_traded_at` - timestamp (every sale)
- ✅ `cached_buy_count` - 1 or incremented
- ✅ `last_synced_block` - event block number

**Note:** `cached_base_price` in events = current price (approximate). Contract fetch has accurate basePrice.

---

## 📊 **Field Accuracy:**

| Field | Contract Fetch | Event Handler | Notes |
|-------|---------------|---------------|-------|
| `nft_id` | ✅ Accurate | ✅ Accurate | - |
| `owner_id` | ✅ Accurate | ✅ Accurate | Updated on sale |
| `cached_current_price` | ✅ Accurate | ✅ Accurate | Updated on sale |
| `cached_base_price` | ✅ Accurate | ⚠️ Approximate | Event uses current price |
| `cached_buy_count` | ✅ Accurate | ✅ Accurate | Incremented |
| `cached_created_at` | ✅ Accurate | ✅ Accurate | From contract timestamp |
| `cached_last_traded_at` | ✅ Accurate | ✅ Accurate | Updated on sale |
| `cached_is_listed` | ✅ Accurate | ✅ Hardcoded true | Always true for active NFTs |

---

## 🎯 **Recommended Workflow:**

### **Initial Setup:**
1. `npm run fetch-nfts` → Get all NFTs with accurate data ✅
2. `npm run fetch-events` → Get transaction history ✅
3. `npm start` → Real-time updates ✅

### **Runtime Updates:**
- **NFTSold event** → Update owner, price, trade time
- **NFTBurned event** → DELETE nft
- Contract has authoritative data, cache is for sorting

---

## 🔧 **Admin Controls (Manual):**

These fields are NOT synced from contract/events, set manually by admin:

```sql
-- Visibility
is_hidden         -- Hide from marketplace
is_pinned         -- Pin to top
pin_order         -- Pin order (0 = highest)

-- Queue Override
admin_override    -- Bypass queue rules
queue_exempt      -- Always show

-- Metadata
admin_notes       -- Admin notes
hide_reason       -- Why hidden?
hidden_by         -- Admin wallet
hidden_at         -- When hidden?
```

---

## ✅ **All Fields Match:**

**Schema (20 fields):**
1. nft_id ✅
2. owner_id ✅
3. is_hidden ✅
4. is_pinned ✅
5. pin_order ✅
6. admin_override ✅
7. queue_exempt ✅
8. admin_notes ✅
9. hide_reason ✅
10. hidden_by ✅
11. hidden_at ✅
12. cached_current_price ✅
13. cached_base_price ✅
14. cached_buy_count ✅
15. cached_created_at ✅
16. cached_last_traded_at ✅
17. cached_is_listed ✅
18. last_synced_block ✅
19. last_synced_at ✅
20. created_at ✅
21. updated_at ✅

**Contract Fetch:** Uses fields 1, 2, 12-17 ✅  
**Event Handler:** Uses fields 1, 2, 12-17, 18 ✅  
**Admin Panel:** Uses fields 3-11 ✅

---

**Last Updated:** 2026-04-10  
**All fields properly mapped!** 🎯
