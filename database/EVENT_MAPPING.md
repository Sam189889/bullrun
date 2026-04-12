# 📡 Event Mapping - Contract Events vs Handlers

## ✅ **Complete Event Reference**

### **1. UserRegistered** ✅
**Contract Event:**
```solidity
event UserRegistered(
    uint256 indexed userId,
    address indexed wallet,
    uint256 indexed referrerId,
    uint256 usernameId
);
```

**Handler:**
```javascript
handleUserRegistered(event) {
    const { userId, wallet, referrerId, usernameId } = event.args;
    // ✅ All fields extracted
}
```

---

### **2. PackagePurchased** ✅
**Contract Event:**
```solidity
event PackagePurchased(
    uint256 indexed userId,
    uint256 indexed packageLevel,
    uint256 price
);
```

**Handler:**
```javascript
handlePackagePurchased(event) {
    const { userId, packageLevel, price } = event.args;
    // ✅ All fields extracted
}
```

---

### **3. NFTCreated** ✅
**Contract Event:**
```solidity
event NFTCreated(
    uint256 indexed nftId,
    uint256 basePrice,
    uint256 listPrice
);
```

**Handler:**
```javascript
handleNFTCreated(event) {
    const { nftId, basePrice, listPrice } = event.args;
    // ✅ All fields extracted (but skipped - virtual NFT)
}
```

---

### **4. NFTSold** ✅
**Contract Event:**
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

**Handler:**
```javascript
handleNFTSold(event) {
    const { nftId, sellerId, buyerId, price, appreciation } = event.args;
    // ⚠️ Missing: sellerUsernameId, buyerUsernameId (not needed for DB)
    // ✅ All required fields extracted
}
```

---

### **5. NFTBurned** ✅
**Contract Event:**
```solidity
event NFTBurned(
    uint256 indexed nftId,
    uint256 indexed buyerId,
    uint256 finalPrice
);
```

**Handler:**
```javascript
handleNFTBurned(event) {
    const { nftId, buyerId, finalPrice } = event.args;
    // ✅ All fields extracted
}
```

---

### **6. IncomeDistributed** ✅
**Contract Event:**
```solidity
event IncomeDistributed(
    uint256 indexed toUserId,
    uint256 indexed fromUserId,
    uint256 fromUsernameId,
    uint256 amount,
    string incomeType,
    uint256 level
);
```

**Handler:**
```javascript
handleIncomeDistributed(event) {
    const { toUserId, fromUserId, fromUsernameId, amount, incomeType, level } = event.args;
    // ✅ All fields extracted
}
```

---

### **7. RankAchieved** ✅
**Contract Event:**
```solidity
event RankAchieved(
    uint256 indexed userId,
    uint8 rank,
    uint256 timestamp
);
```

**Handler:**
```javascript
handleRankAchieved(event) {
    const { userId } = event.args;
    // ⚠️ Missing: rank, timestamp (can add if needed)
    // ✅ Required field extracted
}
```

---

### **8. WeeklyPoolPaid** ✅
**Contract Event:**
```solidity
event WeeklyPoolPaid(
    uint256 indexed userId,
    uint256 week,
    uint256 amount,
    uint256 shares
);
```

**Handler:**
```javascript
handleWeeklyPoolPaid(event) {
    const { userId, week, amount, shares } = event.args;
    // ✅ All fields extracted
}
```

---

### **9. LuckyDrawWinner** ✅
**Contract Event:**
```solidity
event LuckyDrawWinner(
    uint256 indexed userId,
    uint256 week,
    uint256 prize
);
```

**Handler:**
```javascript
handleLuckyDrawWinner(event) {
    const { userId, week, prize } = event.args;
    // ✅ All fields extracted (fixed - removed wrong winningNumber)
}
```

---

### **10. SharesAwarded** ✅
**Contract Event:**
```solidity
event SharesAwarded(
    uint256 indexed userId,
    uint256 shares,
    string reason
);
```

**Handler:**
```javascript
handleSharesAwarded(event) {
    const { userId } = event.args;
    // ⚠️ Missing: shares, reason (tracked on-chain, just logging)
    // ✅ Required field extracted
}
```

---

## 📋 **Event Handler Mapping:**

```javascript
export const EVENT_HANDLERS = {
    'UserRegistered': handleUserRegistered,      // ✅
    'PackagePurchased': handlePackagePurchased,  // ✅ Fixed (was PackageActivated)
    'NFTCreated': handleNFTCreated,              // ✅
    'NFTSold': handleNFTSold,                    // ✅
    'NFTBurned': handleNFTBurned,                // ✅
    'IncomeDistributed': handleIncomeDistributed,// ✅
    'RankAchieved': handleRankAchieved,          // ✅
    'WeeklyPoolPaid': handleWeeklyPoolPaid,      // ✅
    'LuckyDrawWinner': handleLuckyDrawWinner,    // ✅
    'SharesAwarded': handleSharesAwarded,        // ✅
};
```

---

## 🎯 **Summary:**

### **✅ Fixed Issues:**
1. **Event Name:** `PackageActivated` → `PackagePurchased` ✅
2. **UserRegistered:** Added `referrerId`, `usernameId` ✅
3. **IncomeDistributed:** Added `fromUsernameId` ✅
4. **LuckyDrawWinner:** Removed wrong `winningNumber` field ✅

### **⚠️ Optional Fields (Not Critical):**
- `NFTSold`: `sellerUsernameId`, `buyerUsernameId` (display only, not needed for DB)
- `RankAchieved`: `rank`, `timestamp` (can add if needed)
- `SharesAwarded`: `shares`, `reason` (tracked on-chain)

### **✅ All Critical Fields Match:**
- Primary keys: ✅
- Indexed fields: ✅
- Amount fields: ✅
- User IDs: ✅

---

**Last Updated:** 2026-04-10  
**All events properly mapped!** 🎯
