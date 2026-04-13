# Database Migrations

## How to Run Migrations on Railway

### Option 1: Railway MySQL Console (Recommended)

1. Go to Railway dashboard
2. Click on MySQL database
3. Go to "Connect" tab
4. Click "MySQL Command Line"
5. Copy the migration SQL and paste it

### Option 2: Local MySQL Client

```bash
# Get Railway database credentials from Railway dashboard
mysql -h <railway-host> -P <port> -u root -p

# Then paste the migration SQL
```

### Option 3: Using Railway CLI

```bash
railway run mysql -h <host> -u root -p < migrations/add_level_to_earnings.sql
```

## Current Migrations

### `add_level_to_earnings.sql`
**Date:** 2026-04-13  
**Changes:**
- Adds `level` column to `earnings_history` table
- Updates existing records with level data from `transaction_history`
- Fixes `earning_type` for NFT_PROFIT records

**Required before:** Deploying commit with income history API changes

**Run this migration BEFORE pushing code to production!**

## Migration Checklist

- [ ] Backup Railway database (Railway auto-backups daily)
- [ ] Run migration SQL on Railway MySQL
- [ ] Verify migration with SELECT query
- [ ] Test API endpoints: `/api/user/:userId/history/income`
- [ ] Push code changes to GitHub
- [ ] Railway auto-deploys new code
- [ ] Verify frontend displays income history correctly
