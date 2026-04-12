# Bull Run - MySQL Sync Service

MySQL-first architecture for read operations and admin controls.

## 📁 Structure

```
database/
├── schema.sql              # Database schema
├── .env                    # Configuration
├── package.json           # Dependencies
├── src/
│   ├── db.js              # Database connection pool
│   ├── setup.js           # Schema setup script
│   ├── test-connection.js # Test database connectivity
│   └── index.js           # Main sync service (TODO)
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd database
npm install
```

### 2. Configure Database

Edit `.env` file with your Laragon MySQL settings:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=bull_run
```

### 3. Test Connection

```bash
npm run test
```

Expected output:
```
✅ Database connection successful!
```

### 4. Create Database Schema

```bash
npm run setup
```

This will create all tables, indexes, and default data.

### 5. Start Sync Service (Coming Soon)

```bash
npm start
```

## 📊 Database Schema

### Core Tables:
- **users** - User accounts and stats
- **nfts** - NFT data with MySQL-managed visibility
- **transaction_history** - All blockchain events
- **earnings_history** - User earnings breakdown
- **lucky_draw_history** - Lucky draw winners

### Admin Tables:
- **queue_rules** - NFT queue configuration
- **admin_controls** - Feature toggles (claim buttons, etc.)

## 🔧 Scripts

- `npm run test` - Test database connection
- `npm run setup` - Create/reset database schema
- `npm start` - Start sync service
- `npm run dev` - Start with auto-reload

## 📝 Configuration

All configuration in `.env`:

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL user | `root` |
| `DB_PASSWORD` | MySQL password | `` |
| `DB_NAME` | Database name | `bull_run` |
| `RPC_URL` | Blockchain RPC | Testnet/Mainnet URL |
| `CONTRACT_ADDRESS` | Bull Run proxy address | `0x...` |
| `START_BLOCK` | Starting block for sync | `147747021` |

## 🎯 Features

### ✅ Implemented:
1. **Database Schema** - Complete MySQL structure
2. **Connection Pool** - MySQL connection management
3. **Event Handlers** - All contract events processed
4. **Sync Service** - Chunk-based event syncing
5. **Queue Manager** - Flexible NFT queue rules
6. **Auto-cleanup** - Burned NFTs deleted from database

### 🔥 Burned NFT Handling:
When an NFT is burned on-chain:
- Automatically **DELETED** from database
- Not stored or marked as burned
- Keeps database clean and queries fast

### 📋 Queue Rules System:

Admin can configure multiple queue rules:

**1. Package-Based Rule**
```json
{
  "package_id": 1,
  "queue_slots": 2
}
```
Users with Package 1 keep 2 NFTs in queue (unlisted).

**2. Direct Referrals Rule**
```json
{
  "min_directs": 2,
  "auto_list": true
}
```
Users with 2+ directs → all NFTs auto-listed.

**3. Earnings-Based Rule**
```json
{
  "threshold": 500,
  "slots_per_threshold": 2
}
```
For every $500 earned, remove 2 queue slots (list more NFTs).

**4. Custom Rule**
```json
{
  "conditions": [
    {"field": "total_earned", "operator": ">=", "value": 1000},
    {"field": "direct_referrals_count", "operator": ">=", "value": 5}
  ],
  "match": "all",
  "queue_slots": 0
}
```
Flexible JSON-based logic for complex rules.

## 📚 Schema Version

Current version: **1**

Check version:
```sql
SELECT * FROM schema_version;
```
