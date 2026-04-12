# ✅ API Schema Mapping Fixes

## 🔧 **Issues Fixed:**

### **1. NFT API (`admin-nfts.js`)**

#### **Issue: `cached_is_burned` column doesn't exist**
❌ **Before:**
```sql
SELECT cached_is_burned FROM nfts
WHERE cached_is_burned = FALSE
```

✅ **After:**
```sql
-- Burned NFTs are DELETED from database, not cached
-- So they don't exist in nfts table at all
SELECT * FROM nfts
-- All rows are active NFTs
```

**Why:** Schema design deletes burned NFTs instead of marking them. Check `event-handlers.js`:
```javascript
// NFTBurned event handler
await query('DELETE FROM nfts WHERE nft_id = ?', [nftId]);
```

**Burned count:** Retrieved from `transaction_history` table:
```sql
SELECT COUNT(DISTINCT nft_id) as burned
FROM transaction_history
WHERE event_type = 'NFTBurned'
```

---

#### **Issue: Missing columns in SELECT**
❌ **Before:**
```sql
SELECT nft_id, owner_id, ... FROM nfts
-- Missing: created_at, updated_at
```

✅ **After:**
```sql
SELECT 
    nft_id, owner_id,
    cached_current_price, cached_base_price,
    cached_is_listed, cached_created_at,
    cached_last_traded_at, cached_buy_count,
    is_hidden, is_pinned, pin_order,
    admin_override, queue_exempt,
    admin_notes, hide_reason, hidden_by, hidden_at,
    last_synced_at, created_at, updated_at
FROM nfts
```

---

### **2. Queue Rules API (`queue-rules.js`)**

#### **Issue: Wrong column names**

| ❌ Before | ✅ After | Schema Column |
|----------|---------|---------------|
| `conditions` | `config` | `config JSON` |
| `description` | _(removed)_ | _(doesn't exist)_ |
| `nft_slots` | _(inside config)_ | _(part of config JSON)_ |

**Schema:**
```sql
CREATE TABLE queue_rules (
    rule_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    rule_name VARCHAR(100) NOT NULL,
    rule_type ENUM('package_based', 'direct_based', 'earnings_based', 'custom', 'disabled'),
    enabled BOOLEAN DEFAULT TRUE,
    priority INT UNSIGNED DEFAULT 0,
    config JSON DEFAULT NULL,  -- ✅ This is the correct column
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

#### **Issue: Config structure**

❌ **Before (wrong field names):**
```json
{
  "min_direct_referrals": 2,
  "min_total_earned": "500",
  "min_package_level": 3,
  "nft_slots": 2  // Wrong - this was a separate column
}
```

✅ **After (schema-aligned):**
```json
// package_based
{
  "package_id": 1,
  "queue_slots": 2
}

// direct_based
{
  "min_directs": 2,
  "auto_list": true
}

// earnings_based
{
  "threshold": 500,
  "slots_per_threshold": 2
}
```

**Updated code to support both formats:**
```javascript
if (config.min_direct_referrals || config.min_directs) {
    whereConditions.push('direct_referrals_count >= ?');
    params.push(config.min_direct_referrals || config.min_directs);
}
```

---

## 📋 **Schema Reference:**

### **NFTs Table:**
```sql
CREATE TABLE nfts (
    nft_id BIGINT UNSIGNED PRIMARY KEY,
    owner_id BIGINT UNSIGNED NOT NULL,
    
    -- Admin Controls
    is_hidden BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    pin_order INT UNSIGNED DEFAULT 0,
    admin_override BOOLEAN DEFAULT FALSE,
    queue_exempt BOOLEAN DEFAULT FALSE,
    
    -- Admin Metadata
    admin_notes TEXT,
    hide_reason TEXT,
    hidden_by VARCHAR(42),
    hidden_at TIMESTAMP,
    
    -- Cached Contract Data
    cached_current_price DECIMAL(20, 6),
    cached_base_price DECIMAL(20, 6),
    cached_buy_count INT UNSIGNED,
    cached_created_at BIGINT UNSIGNED,
    cached_last_traded_at BIGINT UNSIGNED,
    cached_is_listed BOOLEAN,
    -- NO cached_is_burned - burned NFTs deleted!
    
    -- Sync Tracking
    last_synced_block BIGINT UNSIGNED,
    last_synced_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### **Queue Rules Table:**
```sql
CREATE TABLE queue_rules (
    rule_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    rule_name VARCHAR(100) NOT NULL,
    rule_type ENUM('package_based', 'direct_based', 'earnings_based', 'custom', 'disabled'),
    enabled BOOLEAN DEFAULT TRUE,
    priority INT UNSIGNED DEFAULT 0,
    config JSON DEFAULT NULL,  -- All rule data here
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

## ✅ **All Fixes Applied:**

### **admin-nfts.js:**
- ✅ Removed `cached_is_burned` from SELECT
- ✅ Removed `cached_is_burned = FALSE` from WHERE
- ✅ Added `created_at, updated_at` to SELECT
- ✅ Get burned count from `transaction_history`
- ✅ Updated `getNFTStats()` to handle burned NFTs correctly

### **queue-rules.js:**
- ✅ Renamed `conditions` → `config`
- ✅ Removed `description` column
- ✅ Removed `nft_slots` column (now inside config)
- ✅ Updated `getAllQueueRules()`
- ✅ Updated `getQueueRuleById()`
- ✅ Updated `createQueueRule()`
- ✅ Updated `updateQueueRule()`
- ✅ Updated `getAffectedUsers()` to read from config
- ✅ Support both old and new config field names

---

## 🚀 **API Now Matches Database Schema Perfectly!**

### **Test Commands:**
```bash
# Start API server
cd database
npm run api

# Test NFT endpoints
curl http://localhost:3001/api/admin/nfts
curl http://localhost:3001/api/admin/nfts/stats

# Test queue rules
curl http://localhost:3001/api/admin/queue/rules
```

**All endpoints ab schema ke saath aligned hain!** ✅
