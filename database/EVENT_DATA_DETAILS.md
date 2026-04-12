# 📦 Event Data - Complete Details Stored in JSON

## ✅ **All Event Details Ab Store Ho Rahe Hain!**

`transaction_history` table mein `event_data` JSON column hai jo extra event details store karta hai.

---

## 📊 **Event Data by Event Type:**

### **1. UserRegistered**
```json
{
  "usernameId": "123456",     // Display as BULL123456
  "wallet": "0x1234...5678"   // Wallet address
}
```

**Columns:**
```sql
user_id = New user ID
related_user_id = Referrer ID (NULL if no referrer)
event_data = {"usernameId": "...", "wallet": "..."}
```

**Console:**
```
✅ User registered: 5 (BULL123456, 0x1234...5678) → Referred by User 2
```

---

### **2. PackagePurchased**
```json
null  // No extra data needed
```

**Columns:**
```sql
user_id = User who bought
related_user_id = NULL
nft_id = NULL
amount = Package price
event_data = NULL
```

---

### **3. NFTSold** ⭐
```json
{
  "sellerUsernameId": "123456",   // Seller username (BULL123456)
  "buyerUsernameId": "789012",    // Buyer username (BULL789012)
  "appreciation": "50000000000000000000"  // Price appreciation in wei
}
```

**Columns:**
```sql
user_id = Buyer ID
related_user_id = Seller ID
nft_id = NFT ID
amount = Sale price
event_data = {"sellerUsernameId": "...", "buyerUsernameId": "...", "appreciation": "..."}
```

**Console:**
```
✅ NFT sold: #15 from User 2 (BULL123456) → User 4 (BULL789012) - 25.50 USDT
```

---

### **4. NFTBurned**
```json
null  // No extra data needed
```

**Columns:**
```sql
user_id = Owner who burned
related_user_id = NULL
nft_id = NFT ID
amount = Final price
event_data = NULL
```

---

### **5. IncomeDistributed** ⭐⭐⭐ (Most Important!)
```json
{
  "incomeType": "LEVEL_INCOME",       // Type: DIRECT_SPONSOR, LEVEL_INCOME, TRADING_LEVEL, NFT_SELLER
  "level": "3",                       // Level number (0-30, 0 for non-level income)
  "earningType": "level_income",      // Database earning type (for earnings_history)
  "fromUsernameId": "456789"          // Username ID of income source
}
```

**Columns:**
```sql
user_id = Receiver (toUserId)
related_user_id = Source (fromUserId)
nft_id = NULL
amount = Income amount
event_data = {"incomeType": "...", "level": "...", ...}
```

**Console:**
```
💰 LEVEL_INCOME (L3): 10.50 USDT from User 5 → User 2
💰 DIRECT_SPONSOR (L0): 15.00 USDT from User 6 → User 2
💰 TRADING_LEVEL (L2): 5.25 USDT from User 4 → User 2
💰 NFT_SELLER (L0): 45.00 USDT from User 3 → User 2
```

---

### **6. RankAchieved**
```json
null  // No extra data (rank stored in event_type)
```

---

### **7. WeeklyPoolPaid**
```json
null  // Week number could be added if needed
```

---

### **8. LuckyDrawWinner**
```json
null  // Week number could be added if needed
```

---

### **9. SharesAwarded**
```json
null  // Shares data on-chain
```

---

## 🔍 **Income Type Details:**

### **Contract Income Types:**
```solidity
string incomeType:
- "DIRECT_SPONSOR"  → Level 0, direct referral bonus
- "LEVEL_INCOME"    → Levels 1-30, team income
- "TRADING_LEVEL"   → NFT trading bonus from team
- "NFT_SELLER"      → Profit from selling own NFT
```

### **Database Earning Types:**
```sql
earning_type ENUM:
- 'nft_profit'           ← NFT_SELLER
- 'level_income'         ← DIRECT_SPONSOR, LEVEL_INCOME
- 'trading_level_bonus'  ← TRADING_LEVEL
- 'rank_emi'
- 'fast_bonus'
- 'weekly_pool'
- 'lucky_draw'
- 'trip_reward'
```

---

## 📋 **SQL Queries:**

### **Query: Get all level income for User 2**
```sql
SELECT 
    user_id,
    related_user_id as from_user,
    amount,
    JSON_EXTRACT(event_data, '$.incomeType') as income_type,
    JSON_EXTRACT(event_data, '$.level') as level,
    created_at
FROM transaction_history
WHERE event_type = 'IncomeDistributed'
  AND user_id = 2
  AND JSON_EXTRACT(event_data, '$.incomeType') = 'LEVEL_INCOME'
ORDER BY created_at DESC;
```

### **Query: Get direct sponsor income only**
```sql
SELECT 
    user_id,
    related_user_id as from_user,
    amount,
    created_at
FROM transaction_history
WHERE event_type = 'IncomeDistributed'
  AND user_id = 2
  AND JSON_EXTRACT(event_data, '$.incomeType') = 'DIRECT_SPONSOR';
```

### **Query: Income by level breakdown**
```sql
SELECT 
    JSON_EXTRACT(event_data, '$.level') as level,
    COUNT(*) as count,
    SUM(amount) as total_amount
FROM transaction_history
WHERE event_type = 'IncomeDistributed'
  AND user_id = 2
  AND JSON_EXTRACT(event_data, '$.incomeType') = 'LEVEL_INCOME'
GROUP BY JSON_EXTRACT(event_data, '$.level')
ORDER BY level;
```

### **Query: NFT trades with usernames**
```sql
SELECT 
    nft_id,
    related_user_id as seller,
    JSON_EXTRACT(event_data, '$.sellerUsernameId') as seller_username,
    user_id as buyer,
    JSON_EXTRACT(event_data, '$.buyerUsernameId') as buyer_username,
    amount as price,
    JSON_EXTRACT(event_data, '$.appreciation') as appreciation,
    created_at
FROM transaction_history
WHERE event_type = 'NFTSold'
ORDER BY created_at DESC
LIMIT 20;
```

### **Query: User's income breakdown by type**
```sql
SELECT 
    JSON_EXTRACT(event_data, '$.incomeType') as income_type,
    COUNT(*) as transactions,
    SUM(amount) as total_earned
FROM transaction_history
WHERE event_type = 'IncomeDistributed'
  AND user_id = 2
GROUP BY JSON_EXTRACT(event_data, '$.incomeType');
```

**Result:**
```
+-------------------+--------------+--------------+
| income_type       | transactions | total_earned |
+-------------------+--------------+--------------+
| "DIRECT_SPONSOR"  |            5 |       75.00  |
| "LEVEL_INCOME"    |           45 |      320.50  |
| "TRADING_LEVEL"   |           12 |       85.25  |
| "NFT_SELLER"      |            3 |      150.00  |
+-------------------+--------------+--------------+
```

---

## ✅ **Benefits:**

✅ **Complete Income Tracking**: Know exactly what type of income and from which level  
✅ **Username Display**: Show BULL123456 in UI instead of just User ID  
✅ **NFT Trade History**: Complete provenance with usernames  
✅ **Analytics Ready**: Complex income breakdowns possible  
✅ **Audit Trail**: All event details preserved  
✅ **JSON Flexibility**: Easy to add more fields later  

---

## 🎯 **Summary:**

| Event Type | event_data Contains |
|------------|---------------------|
| UserRegistered | usernameId, wallet |
| PackagePurchased | NULL |
| NFTSold | sellerUsernameId, buyerUsernameId, appreciation |
| NFTBurned | NULL |
| IncomeDistributed | incomeType, level, earningType, fromUsernameId |
| Others | NULL (or can be added) |

**Ab sab event details JSON mein store ho rahi hain!** 💪📦
