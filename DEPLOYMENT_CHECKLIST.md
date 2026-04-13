# Deployment Checklist - Income History API Migration

## Pre-Deployment Steps (DO THESE FIRST!)

### 1. ✅ Test Locally
- [x] API server running: `npm run api` in `database/` folder
- [x] Test endpoints work: `curl http://localhost:3001/api/user/303/history/income`
- [x] Frontend displays data correctly
- [x] No console errors

### 2. � Backup Railway Database (SAFETY FIRST!)

**ALWAYS backup before migration!**

```bash
cd database
npm run import
```

This will:
- Import Railway database to local MySQL
- Create a safety backup
- Timestamp: Current date/time

### 3. �️ Railway Database Migration (CRITICAL!)

**Run this BEFORE pushing code to GitHub!**

```bash
# Simple one command - uses existing Railway credentials
cd database
npm run migrate
```

**Alternative:** Manual SQL method
```bash
# Copy SQL and run in Railway MySQL Console
cat database/migrations/add_level_to_earnings.sql
# Then paste in Railway Dashboard > MySQL > Connect > MySQL Command Line
```

**Migration adds:**
- `level` column to `earnings_history` table
- Updates existing records with level data
- Fixes earning_type for NFT_PROFIT records

### 4. 📝 Verify Migration

Run this query in Railway MySQL to verify:

```sql
SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN level IS NOT NULL THEN 1 ELSE 0 END) as with_level,
    SUM(CASE WHEN earning_type = 'nft_profit' THEN 1 ELSE 0 END) as nft_profits
FROM earnings_history;
```

### 5. 🚀 Push to GitHub

```bash
cd e:/bull-run/frontend
git add .
git commit -m "feat: migrate history to database API with level field"
git push origin main
```

### 6. ✅ Verify Production

After Railway auto-deploys:

```bash
# Test production API
curl https://your-app.railway.app/api/user/303/history/income

# Check for:
# - "level": <number> field present
# - "from_username_id": <number> field present
# - "earning_type": "nft_profit" for NFT sales
```

### 7. 🧪 Test Frontend

- Open app in browser
- Navigate to Dashboard > History tab
- Check Earnings page income modal
- Verify:
  - Level numbers display correctly
  - Username IDs show (not "BULLundefined")
  - Transaction links work
  - No console errors

## Files Changed

**Backend:**
- `database/src/event-handlers.js` - Fixed earning_type mapping
- `database/src/api/user-history.js` - Added level field, blockchain username fetch
- `database/migrations/add_level_to_earnings.sql` - New migration

**Frontend:**
- `src/hooks/useHistoryAPI.ts` - Database API hooks
- `src/hooks/useEvents.ts` - Kept for non-history features
- `src/config/env.ts` - Added USER_API_BASE_URL
- `src/app/dashboard/components/HistoryTab.tsx` - Uses database hooks
- `src/app/dashboard/components/IncomeHistoryModal.tsx` - Uses database hooks
- `src/app/dashboard/components/MyNFTsTab.tsx` - Uses database hooks

## Rollback Plan

If something goes wrong:

1. Revert git commit: `git revert HEAD`
2. Push revert: `git push origin main`
3. Railway auto-redeploys previous version
4. Database migration is backward compatible (added column with default value)

## Notes

- ✅ Blockchain event hooks still active for Team Rank and Weekly Pool features
- ✅ History now fetches from database (faster, more reliable)
- ✅ Username IDs fetched from blockchain when needed
- ✅ All existing functionality preserved
