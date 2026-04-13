# Quick Deployment Guide

## ⚡ Fast Command List (Copy-Paste Ready)

### Step 1: Backup Railway Database
```bash
cd e:/bull-run/frontend/database
npm run import
```
**Wait for:** ✅ "Database import completed successfully!"

---

### Step 2: Run Migration on Railway
```bash
npm run migrate
```
**Wait for:** 
- ✅ Level column added
- ✅ Records updated
- ✅ NFT_PROFIT records fixed
- 📊 Statistics displayed

---

### Step 3: Push to GitHub
```bash
cd e:/bull-run/frontend
git add .
git commit -m "feat: migrate history to database API with level field"
git push origin main
```
**Wait for:** Railway auto-deployment complete

---

### Step 4: Test Production
```bash
# Test API endpoint
curl https://your-app.railway.app/api/user/303/history/income

# Should see:
# - "level": <number>
# - "from_username_id": <number>
# - "earning_type": "nft_profit"
```

---

### Step 5: Test Frontend UI
1. Open app in browser
2. Go to Dashboard > History
3. Open Earnings > Income modal
4. Verify: Level numbers, usernames, transaction links

---

## 🚨 If Something Goes Wrong

### Rollback Option 1: Revert Git
```bash
git revert HEAD
git push origin main
```

### Rollback Option 2: Re-import Backup
```bash
cd e:/bull-run/frontend/database
# Your backup is in local MySQL database 'bull_run'
npm run export  # Push local backup back to Railway
```

---

## ✅ All Commands in One Block

```bash
# 1. Backup
cd e:/bull-run/frontend/database
npm run import

# 2. Migrate
npm run migrate

# 3. Deploy
cd e:/bull-run/frontend
git add .
git commit -m "feat: migrate history to database API with level field"
git push origin main

# 4. Test
curl https://your-app.railway.app/api/user/303/history/income
```

**Total Time:** ~5-10 minutes
