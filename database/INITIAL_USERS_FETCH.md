# 👥 Initial Users Fetch - Documentation

## 🎯 **Purpose:**

Fetch all **existing users** from contract and populate the database with:
- Wallet addresses
- Package levels
- Direct referrals counts (calculated)

After this initial fetch, **events will keep data updated** automatically.

---

## 🚀 **Usage:**

```bash
# Run once after database setup
npm run fetch-users
```

---

## 📋 **What It Fetches:**

### **From Contract:**

#### **1. User Wallet Addresses**
```solidity
address[] public allUsers;  // Index = userId - 1
```

**Example:**
```javascript
userId 1 → allUsers[0] → 0x1234...
userId 2 → allUsers[1] → 0x5678...
userId 3 → allUsers[2] → 0x9abc...
```

#### **2. User Struct Data**
```solidity
struct User {
    uint256 referrerId;          // ✅ Used to calculate direct counts
    uint256 packageLevel;        // ✅ Saved to database
    uint256 totalInvested;       // ❌ Not needed (events will track)
    uint256 earningCap;          // ❌ Not needed
    bool isActive;               // ❌ Not needed
    uint256 activationDate;      // ❌ Not needed
    uint256 directReferralsCount;// ❌ Not in struct (we calculate)
    uint256 usernameId;          // ❌ Not needed for queue
}
```

---

## 📊 **Database Updates:**

### **1. Insert User Data**
```sql
INSERT INTO users 
(user_id, wallet_address, package_level, created_at)
VALUES (?, ?, ?, NOW())
ON DUPLICATE KEY UPDATE
    wallet_address = VALUES(wallet_address),
    package_level = VALUES(package_level)
```

### **2. Calculate Direct Referrals**
```javascript
// Step 1: Loop through all users
for (user in allUsers) {
    const referrerId = user.referrerId;
    referralCounts[referrerId]++;
}

// Step 2: Update database
UPDATE users 
SET direct_referrals_count = ?
WHERE user_id = ?
```

---

## 🔄 **Process Flow:**

```
1. Get total user count
   ↓
2. Fetch users in batches (100 at a time)
   ↓
3. For each user:
   - Get wallet from allUsers[userId-1]
   - Get user struct from users(userId)
   - Insert into database
   ↓
4. Calculate direct referrals:
   - Loop all users
   - Count how many point to each referrer
   - Update direct_referrals_count
   ↓
5. Done! ✅
```

---

## 📈 **Example Output:**

```
═══════════════════════════════════════
  📥 Initial Users Fetch from Contract
═══════════════════════════════════════
📡 RPC: https://opbnb-testnet-rpc.bnbchain.org
📝 Contract: 0xEbe002fd383A77f43B69D6d54FaA61aA605ee62c
📦 Batch Size: 100
═══════════════════════════════════════

👥 Total Users to fetch: 4

📥 Fetching users 1 - 4...
  ✅ User 1 → 0x1234...5678 (Package 1)
  ✅ User 2 → 0xabcd...efgh (Package 2)
  ✅ User 3 → 0x9876...5432 (Package 1)
  ✅ User 4 → 0xfedc...ba98 (Package 3)
  📊 Progress: 100.0% | Inserted: 4 | Skipped: 0 | Errors: 0 | Time: 0.8s

📊 Calculating direct referrals counts...
  ✅ Updated direct referrals for 2 users

═══════════════════════════════════════
✅ Initial users fetch complete!
═══════════════════════════════════════
📊 Results:
   ✅ Inserted: 4
   ⏭️  Skipped: 0
   ❌ Errors: 0
   ⏱️  Total Time: 1.2s
═══════════════════════════════════════

📝 Next step: Run "npm run fetch-events" to get historical transactions
```

---

## 🎯 **What Gets Populated:**

### **users Table:**
```sql
user_id | wallet_address | package_level | direct_referrals_count | created_at
--------|----------------|---------------|------------------------|------------
1       | 0x1234...      | 1             | 2                      | 2026-04-10
2       | 0xabcd...      | 2             | 0                      | 2026-04-10
3       | 0x9876...      | 1             | 0                      | 2026-04-10
4       | 0xfedc...      | 3             | 0                      | 2026-04-10
```

**Note:**
- `total_earned` = 0 (will be calculated from events)
- `nft_count` = 0 (will be calculated from NFT fetch)

---

## ⚡ **Performance:**

### **Configuration:**
```javascript
const BATCH_SIZE = 100;  // 100 users per batch
const DELAY_MS = 100;    // 100ms delay between batches
```

### **Estimated Time:**
```
100 users   → ~1-2 seconds
1,000 users → ~10-15 seconds
4,200 users → ~45-60 seconds
```

---

## 🔄 **After Initial Fetch:**

### **Events Keep Data Updated:**

1. **New user registers:**
   ```
   Event: UserRegistered
   → Insert new user
   → Increment referrer's direct_referrals_count ✅
   ```

2. **User upgrades package:**
   ```
   Event: PackagePurchased
   → Update package_level ✅
   → Re-evaluate queue rules
   ```

3. **User earns income:**
   ```
   Event: IncomeDistributed
   → Update total_earned ✅
   → Re-evaluate queue rules
   ```

**No need to re-run fetch-users!** Events will handle everything.

---

## 🛡️ **Safety Features:**

### **1. Duplicate Handling**
```sql
ON DUPLICATE KEY UPDATE  -- Safely re-run if needed
```

### **2. Skip Invalid Users**
```javascript
if (wallet === ethers.ZeroAddress) {
    return { status: 'skip' };  // Skip placeholder users
}
```

### **3. Error Tolerance**
```javascript
try {
    // Fetch user
} catch (error) {
    // Log and continue - don't crash
    errors++;
}
```

---

## 📋 **Setup Order:**

```bash
# Correct order:
1. npm run setup           # Create database
2. npm run fetch-users     # ← Fetch existing users
3. npm run fetch-nfts      # Fetch NFTs
4. npm run fetch-events    # Fetch transactions (updates total_earned)
5. npm start               # Start sync service
```

**Why this order?**
- Users first → NFTs reference users (owner_id)
- Events last → Updates existing user/NFT data
- Sync service → Keeps everything updated

---

## ✅ **Summary:**

| Feature | Status |
|---------|--------|
| Fetch wallet addresses | ✅ YES |
| Fetch package levels | ✅ YES |
| Calculate direct referrals | ✅ YES |
| Batch processing | ✅ YES (100/batch) |
| Error handling | ✅ YES |
| Skip invalid users | ✅ YES |
| Safe re-run | ✅ YES |
| Events keep updated | ✅ YES |

---

## 🚀 **Result:**

**Existing users ab database mein aa jayenge!**

- ✅ Wallet addresses
- ✅ Package levels
- ✅ Direct referrals count
- ✅ Ready for queue rules evaluation

**Ab events se automatically update hota rahega!** 💪🎯
