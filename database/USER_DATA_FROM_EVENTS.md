# 📊 User Data Tracking - Events vs Contract

## ✅ **YES! Events se update ho jayega!**

Ab sare important user stats **automatically events se track** honge.

---

## 📋 **What Gets Tracked from Events:**

### **1. UserRegistered Event** 🆕
```javascript
Event: UserRegistered(userId, wallet, referrerId, usernameId)

Database Updates:
✅ users.user_id = userId
✅ users.wallet_address = wallet
✅ users.created_at = NOW()

BONUS Update:
✅ Referrer's direct_referrals_count++ (incremented!)
✅ Referrer's queue re-evaluated (might get better rules)
```

**Example:**
```
User 5 registers with referrer = User 2
→ User 5: Created in database
→ User 2: direct_referrals_count = 10 → 11 ✅
→ User 2: Queue re-evaluated (10+ Directs rule might apply!)
```

---

### **2. PackagePurchased Event** 📦
```javascript
Event: PackagePurchased(userId, packageLevel, price)

Database Updates:
✅ users.package_level = packageLevel
✅ users queue re-evaluated (package upgrade might unlock rules)
✅ transaction_history recorded
```

**Example:**
```
User 3 buys Package Level 2 → 3
→ users.package_level = 3 ✅
→ Queue re-evaluated (Whale Tier rule might now apply!)
```

---

### **3. IncomeDistributed Event** 💰
```javascript
Event: IncomeDistributed(toUserId, fromUserId, amount, incomeType, level)

Database Updates:
✅ earnings_history: New record
✅ users.total_earned += amount
✅ users queue re-evaluated (earnings rule might apply)
```

**Example:**
```
User 2 earns $50 from NFT sale
→ users.total_earned = $450 → $500 ✅
→ Queue re-evaluated ($500 Tier rule now applies!)
→ 5 NFTs removed from queue automatically! 🚀
```

---

### **4. NFTSold Event** 🎨
```javascript
Event: NFTSold(nftId, sellerId, buyerId, price, appreciation)

Database Updates:
✅ nfts.owner_id = buyerId
✅ nfts.cached_current_price = price
✅ nfts.cached_last_traded_at = NOW()
✅ nfts.cached_buy_count++
✅ users.nft_count updated for both seller and buyer
✅ Queue re-evaluated for both users
```

**Example:**
```
User 2 sells NFT to User 3
→ NFT owner: User 2 → User 3 ✅
→ User 2: nft_count = 20 → 19
→ User 3: nft_count = 10 → 11
→ Both users' queues re-evaluated
```

---

## 📊 **Final Users Table Data:**

```sql
CREATE TABLE users (
    user_id BIGINT UNSIGNED PRIMARY KEY,
    wallet_address VARCHAR(42) UNIQUE,
    
    -- ✅ Tracked from Events:
    total_earned DECIMAL(30, 6) DEFAULT 0,        -- From IncomeDistributed
    direct_referrals_count INT UNSIGNED DEFAULT 0,  -- From UserRegistered
    nft_count INT UNSIGNED DEFAULT 0,               -- From NFTSold/NFTBurned
    package_level INT UNSIGNED DEFAULT 0,           -- From PackagePurchased
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 🎯 **Queue Rules - All Data Available!**

### **Queue Evaluation Needs:**
```javascript
const [user] = await query(
    `SELECT 
        user_id,
        total_earned,              // ✅ From events
        direct_referrals_count,    // ✅ From events
        nft_count,                 // ✅ From events
        package_level              // ✅ From events
     FROM users 
     WHERE user_id = ?`
);
```

### **Example Queue Rule:**
```sql
-- Whale Tier: Package 5 + 50 Directs + $10k Earnings
{
  "conditions": [
    {"field": "package_level", "operator": ">=", "value": 5},        // ✅ Available
    {"field": "direct_referrals_count", "operator": ">=", "value": 50}, // ✅ Available
    {"field": "total_earned", "operator": ">=", "value": 10000}     // ✅ Available
  ],
  "match": "all",
  "queue_slots": 0  // Unlimited!
}
```

**Sab data available hai! No contract fetch needed!** ✅

---

## 🔄 **Auto Queue Re-evaluation:**

Queue automatically re-evaluates on:
1. **New referral** → Referrer's direct count increases
2. **Package upgrade** → Package level increases
3. **Income received** → Total earned increases
4. **NFT sold/bought** → NFT count changes

**Example Flow:**
```
1. User 2 has 9 directs, $400 earned
   → Queue: 2 NFTs in queue (default)

2. User 10 registers with User 2 as referrer
   → Event: UserRegistered
   → User 2: direct_referrals_count = 9 → 10 ✅
   → Queue re-evaluated
   → New rule applies: "10+ Directs = -10 queue slots"
   → Queue: 2 + (-10) = 0 (all NFTs listed!) 🚀

3. User 2 earns $150
   → Event: IncomeDistributed
   → User 2: total_earned = $400 → $550 ✅
   → Queue re-evaluated
   → New rule applies: "$500+ Tier = -5 more"
   → Queue: 0 (already unlimited) ✅
```

---

## ❌ **What's NOT Tracked (Not Needed):**

### **Contract User Struct (Not Relevant for Queue):**
```solidity
struct User {
    uint256 totalInvested;     // ❌ Not needed for queue
    uint256 earningCap;        // ❌ Not needed for queue
    bool isActive;             // ❌ Not needed for queue
    uint256 activationDate;    // ❌ Not needed for queue
}
```

**These fields:**
- Only needed for frontend display
- Fetched from contract in real-time
- Not stored in database

---

## 🚀 **Summary:**

| Data Field | Event Source | Used For | Status |
|------------|--------------|----------|--------|
| user_id | UserRegistered | Primary key | ✅ Tracked |
| wallet_address | UserRegistered | Login/auth | ✅ Tracked |
| total_earned | IncomeDistributed | Queue rules | ✅ Tracked |
| direct_referrals_count | UserRegistered | Queue rules | ✅ Tracked |
| nft_count | NFTSold/NFTBurned | Stats | ✅ Tracked |
| package_level | PackagePurchased | Queue rules | ✅ Tracked |
| created_at | UserRegistered | Stats | ✅ Tracked |

---

## ✅ **Result:**

**Haan bhai! Events se sab kuch update ho jayega!**

- ✅ Real-time tracking
- ✅ Auto queue re-evaluation
- ✅ No contract fetch needed
- ✅ All queue rule data available
- ✅ Fully event-driven!

**Ab sirf events sync karo, sab automatically update hoga!** 💪🚀
