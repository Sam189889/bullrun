# 🚀 Database Setup Guide

## 📋 Two Ways to Initialize NFT Data

### **Method 1: Contract Fetch (Recommended) ⚡**
Get complete, accurate NFT data directly from contract.

```bash
# 1. Setup database
npm run setup

# 2. Fetch NFTs from contract (one-time)
npm run fetch-nfts

# 3. Start event sync service (continuous)
npm start
```

**Testnet:** ~4-5 seconds for 36 NFTs  
**Mainnet:** ~7-10 minutes for 4170 NFTs

---

### **Method 2: Event Sync (Alternative) 📝**
Sync from historical blockchain events.

```bash
# 1. Setup database
npm run setup

# 2. Start service (will sync events automatically)
npm start
```

**Testnet:** ~15-20 minutes for 23M blocks  
**Mainnet:** ~30-45 minutes for 6M blocks

---

## 🎯 Recommended Workflow

### **First Time Setup:**

```bash
# 1. Create fresh database
npm run setup

# 2. Configure network in .env
# For Testnet:
MAX_NFT_ID=36
CONTRACT_ADDRESS=0xEbe002fd383A77f43B69D6d54FaA61aA605ee62c

# For Mainnet:
# MAX_NFT_ID=4200
# CONTRACT_ADDRESS=0x31b8e2e95eE6Bce2F2E139d76D25c53CeeEB1f2b

# 3. Fetch existing users from contract (NEW!)
npm run fetch-users

# 4. Fetch initial NFT data from contract
npm run fetch-nfts

# 5. Fetch historical events (transactions, income)
npm run fetch-events

# 6. Verify data
npm run check

# 7. Start continuous sync service
npm start
```

---

## 📊 What Happens?

### **Step 1: Database Setup**
```sql
✅ Creates database: bull_run
✅ Creates tables: users, nfts, transaction_history, etc.
✅ Inserts default settings
```

### **Step 2: Initial NFT Fetch (Contract)**
```
📦 Fetches NFTs 1-36 (testnet) or 1-4170 (mainnet)
✅ Gets complete struct data:
   - nftId, currentPrice, basePrice
   - ownerId, buyCount, createdAt, lastTradedAt
   - isListed, isBurned
🔥 Skips burned NFTs automatically
⚡ Parallel batch processing (50 at a time)
```

**Example Output:**
```
📥 Fetching NFTs 1 - 50...
  ✅ NFT 1 → Owner: 2, Price: $10.00
  ✅ NFT 2 → Owner: 4, Price: $11.00
  🔥 NFT 5 → Burned, skipping...
  ✅ NFT 10 → Owner: 8, Price: $15.50
  📊 Progress: 50.0% | Inserted: 45 | Burned: 5

✅ Initial fetch complete!
   ✅ Inserted: 4120
   🔥 Burned (skipped): 50
   ⏱️  Total Time: 8.2s
```

### **Step 3: Historical Events Fetch**
```
📜 Fetches ALL events from START_BLOCK to current
✅ Events processed:
   - UserRegistered → User wallet addresses
   - PackageActivated → Package purchases
   - NFTSold → Transaction history
   - NFTBurned → Burn records
   - IncomeDistributed → Earnings history
   - SharesAwarded, LuckyDrawWinner, etc.
📊 Populates tables:
   - transaction_history (all events)
   - earnings_history (income breakdown)
   - users (wallet addresses)
```

**Example Output:**
```
📜 Initial Events Fetch
═══════════════════════════════════════
📍 From Block: 124841441
📍 To Block: 147996500
📊 Total Blocks: 23155059

  ✓ 1% | Block 125000000 | Events: 45 | Processed: 45 | Time: 45.2s
  ✓ 5% | Block 126500000 | Events: 120 | Processed: 250 | Time: 120.5s
  ...
  ✓ 100% | Block 147996500 | Events: 15 | Processed: 856 | Time: 1200.3s

✅ Event fetch complete!
   ✅ Processed: 856
   ⏭️  Skipped: 120
   ❌ Errors: 0
   ⏱️  Total Time: 1200.3s (20 minutes)
```

### **Step 4: Event Sync Service (Continuous)**
```
🔄 Polls every 10 seconds
✅ Detects NFTs already loaded from contract
⏭️  Skips historical event sync
📍 Starts from current block
🔄 Syncs new events in real-time:
   - NFTSold → Update owner, price
   - NFTBurned → Delete NFT
   - IncomeDistributed → Update earnings
```

**Example Output:**
```
🚀 Starting initial sync...
✅ NFTs already in database (loaded from contract fetch)
⏭️  Skipping historical event sync, will sync new events only
📍 Starting from current block: 147996500

🔄 Starting sync loop (every 10000ms)...
✓ Up to date (block 147996500)
✓ Up to date (block 147996503)
📥 Syncing blocks 147996504 to 147996510...
  ✅ NFT 37 sold → Owner: 12, Price: $16.00
✅ Synced to block 147996510
```

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────┐
│ 1️⃣ npm run setup                   │
│ Create database & tables            │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ 2️⃣ npm run fetch-nfts              │
│ Contract.nfts(1...4170)             │
│ → Insert NFTs into MySQL            │
│ (Complete struct data, ~10 min)     │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ 3️⃣ npm run fetch-events            │
│ Fetch historical events             │
│ → transaction_history               │
│ → earnings_history                  │
│ (All events, ~20 min)               │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ 4️⃣ npm start                        │
│ Detect data exists → Skip history   │
│ Start from current block            │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ 🔄 Continuous Loop (Every 10s)      │
│ Listen to new events:               │
│ - NFTSold → Update NFT              │
│ - NFTBurned → Delete NFT            │
│ - IncomeDistributed → Log earnings  │
└─────────────────────────────────────┘
```

---

## 📝 Configuration (.env)

```bash
# Network Configuration
RPC_URL=https://opbnb-testnet-rpc.bnbchain.org
CONTRACT_ADDRESS=0xEbe002fd383A77f43B69D6d54FaA61aA605ee62c
START_BLOCK=124841441

# Initial Fetch Settings
MAX_NFT_ID=36          # Testnet: 36, Mainnet: 4200

# Sync Settings
SYNC_INTERVAL=10000    # Poll every 10 seconds
BATCH_SIZE=500         # Event sync batch size
CHUNK_DELAY=200        # Delay between batches
```

---

## 🎯 Benefits of Hybrid Approach

### **Contract Fetch (Initial):**
✅ **Fast:** 4-10 minutes for 4170 NFTs  
✅ **Complete:** All struct fields  
✅ **Accurate:** Current blockchain state  
✅ **Clean:** Burned NFTs auto-skipped  

### **Event Sync (Ongoing):**
✅ **Real-time:** 10 second updates  
✅ **Free:** No RPC costs  
✅ **Lightweight:** Only new events  
✅ **Reliable:** No missed updates  

---

## 🔍 Verify Setup

```bash
# Check database status
npm run check
```

**Expected Output:**
```
📊 Database Status
==================

📋 Table Counts:
   👥 Users: 15
   🖼️  NFTs: 31 (active, burned excluded)
   📝 Transactions: 200+
   💰 Earnings: 350+

📦 Sample NFTs:
   NFT #1: Owner 2, Price $10.00
   NFT #2: Owner 4, Price $11.00
   NFT #10: Owner 8, Price $15.50

✅ Database healthy!
```

---

## 🚨 Troubleshooting

### **No NFTs fetched?**
- Check `MAX_NFT_ID` in `.env`
- Check `CONTRACT_ADDRESS` is correct
- Check RPC is responding

### **RPC rate limits?**
- Reduce `BATCH_SIZE` (try 25 instead of 50)
- Increase `DELAY_MS` (try 200ms instead of 100ms)
- Use free public RPC: `https://opbnb-testnet-rpc.bnbchain.org`

### **Event sync not working?**
- Check `START_BLOCK` is correct
- Verify contract events exist from that block
- Check RPC supports `eth_getLogs`

---

**Version:** 2.0.0  
**Last Updated:** 2026-04-10  
**Network:** opBNB (Testnet & Mainnet)
