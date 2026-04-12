# 🔗 Transaction Relationships - Complete Tracking

## ✅ **Fixed! Ab transaction_history mein complete relationships track ho rahi hain!**

---

## 📊 **Schema:**

```sql
CREATE TABLE transaction_history (
    tx_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tx_hash VARCHAR(66) NOT NULL,
    block_number BIGINT UNSIGNED NOT NULL,
    event_type ENUM(...) NOT NULL,
    
    -- Main participant
    user_id BIGINT UNSIGNED DEFAULT NULL,
    
    -- Related participant (FROM whom or TO whom)
    related_user_id BIGINT UNSIGNED DEFAULT NULL,  ✅ NOW TRACKED!
    
    -- Asset involved
    nft_id BIGINT UNSIGNED DEFAULT NULL,
    
    -- Amount transferred
    amount DECIMAL(30, 6) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🎯 **Event Type → related_user_id Mapping:**

### **1. UserRegistered**
```javascript
user_id         = New user who registered
related_user_id = Referrer (who invited this user)  ✅
nft_id          = NULL
amount          = NULL
```

**Example:**
```
User 5 registered, referred by User 2
→ user_id: 5
→ related_user_id: 2  (User 2 referred User 5)
```

---

### **2. PackagePurchased**
```javascript
user_id         = User who bought package
related_user_id = NULL (self-purchase)
nft_id          = NULL
amount          = Package price
```

**Example:**
```
User 3 bought Package Level 2
→ user_id: 3
→ related_user_id: NULL
→ amount: 500 USDT
```

---

### **3. NFTSold**
```javascript
user_id         = Buyer (new owner)
related_user_id = Seller (previous owner)  ✅
nft_id          = NFT ID
amount          = Sale price
```

**Example:**
```
User 2 sold NFT #15 to User 4 for $25
→ user_id: 4 (buyer)
→ related_user_id: 2 (seller)
→ nft_id: 15
→ amount: 25 USDT
```

---

### **4. NFTBurned**
```javascript
user_id         = Owner who burned
related_user_id = NULL (burn action)
nft_id          = NFT ID
amount          = Final price at burn
```

**Example:**
```
User 3 burned NFT #8
→ user_id: 3
→ related_user_id: NULL
→ nft_id: 8
→ amount: 30 USDT
```

---

### **5. IncomeDistributed** ⭐
```javascript
user_id         = Receiver (TO whom income went)
related_user_id = Sender/Source (FROM whom income came)  ✅
nft_id          = NULL
amount          = Income amount
```

**Example:**
```
User 2 earned $10 level income from User 5's package
→ user_id: 2 (receiver)
→ related_user_id: 5 (source - who triggered the income)
→ amount: 10 USDT
```

**Income Types:**
- `DIRECT_SPONSOR`: related_user_id = direct referral
- `LEVEL_INCOME`: related_user_id = downline member
- `TRADING_LEVEL`: related_user_id = NFT trader in downline
- `NFT_SELLER`: related_user_id = NFT buyer (who paid the seller)

---

### **6. RankAchieved**
```javascript
user_id         = User who achieved rank
related_user_id = NULL
nft_id          = NULL
amount          = NULL
```

---

### **7. WeeklyPoolPaid**
```javascript
user_id         = User who received payment
related_user_id = NULL (pool distribution)
nft_id          = NULL
amount          = Pool share amount
```

---

### **8. LuckyDrawWinner**
```javascript
user_id         = Winner
related_user_id = NULL (lucky draw)
nft_id          = NULL
amount          = Prize amount
```

---

### **9. SharesAwarded**
```javascript
user_id         = User who received shares
related_user_id = NULL (weekly shares)
nft_id          = NULL
amount          = NULL
```

---

## 📋 **Usage Examples:**

### **Query: Who referred User 5?**
```sql
SELECT related_user_id as referrer_id
FROM transaction_history
WHERE event_type = 'UserRegistered' AND user_id = 5;
```

### **Query: Who bought NFTs from User 2?**
```sql
SELECT user_id as buyer_id, nft_id, amount
FROM transaction_history
WHERE event_type = 'NFTSold' AND related_user_id = 2;
```

### **Query: Who gave income to User 3?**
```sql
SELECT related_user_id as income_source, amount, created_at
FROM transaction_history
WHERE event_type = 'IncomeDistributed' AND user_id = 3
ORDER BY created_at DESC;
```

### **Query: User 2's complete income sources**
```sql
SELECT 
    related_user_id as from_user,
    SUM(amount) as total_income
FROM transaction_history
WHERE event_type = 'IncomeDistributed' 
  AND user_id = 2
GROUP BY related_user_id
ORDER BY total_income DESC;
```

### **Query: NFT Trade History**
```sql
SELECT 
    nft_id,
    related_user_id as seller,
    user_id as buyer,
    amount as price,
    created_at
FROM transaction_history
WHERE event_type = 'NFTSold' AND nft_id = 15
ORDER BY created_at;
```

---

## 🔗 **Relationship Chains:**

### **Income Chain Example:**
```
User 1 (First User)
  └─> User 2 (Direct referral)
       └─> User 3 (L2)
            └─> User 4 (L3)
                 └─> User 5 (L4) buys package

Income Distribution:
- User 4 earns: IncomeDistributed(user_id=4, related_user_id=5, amount=15%)
- User 3 earns: IncomeDistributed(user_id=3, related_user_id=5, amount=10%)
- User 2 earns: IncomeDistributed(user_id=2, related_user_id=5, amount=5%)
```

### **NFT Trade Chain:**
```
NFT #15 History:
1. Created by User 1
2. Sold to User 2: NFTSold(user_id=2, related_user_id=1, nft_id=15, amount=10)
3. Sold to User 4: NFTSold(user_id=4, related_user_id=2, nft_id=15, amount=15)
4. Sold to User 3: NFTSold(user_id=3, related_user_id=4, nft_id=15, amount=20)
```

---

## ✅ **Summary:**

| Event Type | user_id | related_user_id | Purpose |
|------------|---------|-----------------|---------|
| UserRegistered | New user | Referrer | Track who invited |
| PackagePurchased | Buyer | NULL | Self-action |
| NFTSold | Buyer | Seller | Track trade |
| NFTBurned | Owner | NULL | Self-action |
| IncomeDistributed | Receiver | Source | Track income flow |
| RankAchieved | Achiever | NULL | Self-milestone |
| WeeklyPoolPaid | Receiver | NULL | Pool distribution |
| LuckyDrawWinner | Winner | NULL | Prize |
| SharesAwarded | Receiver | NULL | Shares |

---

## 🎯 **Benefits:**

✅ **Complete audit trail**: Every transaction shows relationships  
✅ **Income tracking**: Easy to see who earned from whom  
✅ **Referral chain**: Full genealogy tracking  
✅ **NFT provenance**: Complete ownership history  
✅ **Analytics ready**: Complex queries possible  

**Ab sab relationships track ho rahi hain!** 💪🔗
