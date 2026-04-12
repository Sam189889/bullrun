# Railway Deployment Guide

## Structure
```
frontend/
├── src/              (Next.js app)
├── database/         (Sync service + API)
│   ├── src/
│   │   ├── api/server.js    (API on port 3001)
│   │   └── index.js         (Event sync service)
│   └── package.json
└── package.json
```

## Environment Variables (Railway Dashboard)

### Database Connection
```
DB_HOST=metro.proxy.rlwy.net
DB_PORT=3306
DB_USER=root
DB_PASSWORD=lCftTiDmBPxEcaVmUcBQhSGTanfiKnyt
DB_NAME=railway
```

### Blockchain Config
```
RPC_URL=https://opbnb-mainnet.nodereal.io/v1/b11b71e1c8a741669a6795b850978ada
CONTRACT_ADDRESS=0x31b8e2e95ee6bce2f2e139d76d25c53ceeeb1f2b
START_BLOCK=126439802
```

### Sync Settings
```
BATCH_SIZE=100
CHUNK_DELAY=500
MAX_BATCH=500
```

## Deployment Steps

### 1. Set Environment Variables
Railway Dashboard → Your Project → Variables → Add all above variables

### 2. Deploy
```bash
git add .
git commit -m "Add database service"
git push origin main
```

Railway will automatically:
1. Install frontend dependencies (`npm install`)
2. Install database dependencies (`npm run db:install`)
3. Build Next.js app (`npm run build`)
4. Start all services (`npm run production`)

## Services Running

After deployment, 3 processes will run:

1. **Frontend (Next.js)** - Port 3000
   - User interface
   - Auto-deployed on Railway

2. **Database API** - Port 3001
   - REST API for frontend queries
   - Endpoints: `/api/users`, `/api/stats`, etc.

3. **Event Sync Service** - Background
   - Continuous blockchain event fetching
   - Updates database in real-time

## Verify Deployment

Check Railway logs for:
```
✅ Next.js started on port 3000
✅ Database API running on port 3001
✅ Event sync service started
```

## Local Testing

```bash
# Install dependencies
npm install
npm run db:install

# Start all services
npm run production

# Or individually:
npm run dev              # Frontend only
npm run db:api          # Database API only
npm run db:sync         # Event sync only
```

## Troubleshooting

### Database connection fails
- Verify Railway MySQL is running
- Check environment variables
- Ensure IP whitelist allows Railway

### Sync service stops
- Check RPC rate limits
- Verify START_BLOCK is valid
- Check logs for errors

### Build fails
- Run `npm run db:install` locally first
- Verify all dependencies in package.json
- Check Railway build logs
