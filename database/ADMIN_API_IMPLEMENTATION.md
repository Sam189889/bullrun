# 🚀 Admin API Implementation - Complete Guide

## ✅ **What's Built:**

### **Backend (MySQL + Express API):**
1. ✅ NFT Management API (`admin-nfts.js`)
2. ✅ Queue Rules API (`queue-rules.js`)
3. ✅ Express Server (`server.js`)
4. ✅ Package.json scripts updated

---

## 📦 **Installation:**

```bash
cd database

# Install new dependencies
npm install

# Start API server
npm run api

# Or dev mode with auto-reload
npm run api:dev
```

**Server will run on:** `http://localhost:3001`

---

## 🔌 **API Endpoints:**

### **NFT Management:**

#### **GET** `/api/admin/nfts`
Get all NFTs with filters
```bash
# All NFTs (excluding burned)
GET http://localhost:3001/api/admin/nfts

# Include burned NFTs
GET http://localhost:3001/api/admin/nfts?include_burned=true

# Only pinned NFTs
GET http://localhost:3001/api/admin/nfts?only_pinned=true

# Only hidden NFTs
GET http://localhost:3001/api/admin/nfts?only_hidden=true

# With sorting
GET http://localhost:3001/api/admin/nfts?sort_by=cached_current_price&sort_order=ASC

# With pagination
GET http://localhost:3001/api/admin/nfts?limit=20&offset=0
```

**Response:**
```json
{
  "nfts": [
    {
      "nft_id": 123,
      "owner_id": 456,
      "cached_current_price": "10.50",
      "cached_is_listed": true,
      "cached_is_burned": false,
      "is_hidden": false,
      "is_pinned": true,
      "pin_order": 1,
      "admin_notes": "Featured NFT"
    }
  ],
  "total": 4523,
  "limit": 50,
  "offset": 0
}
```

#### **GET** `/api/admin/nfts/stats`
Get NFT statistics
```bash
GET http://localhost:3001/api/admin/nfts/stats
```

**Response:**
```json
{
  "total": 4523,
  "active": 4500,
  "burned": 23,
  "hidden": 5,
  "pinned": 3,
  "listed": 4350,
  "avg_price": "15.75",
  "total_trades": 12500
}
```

#### **GET** `/api/admin/nfts/:nftId`
Get single NFT details
```bash
GET http://localhost:3001/api/admin/nfts/123
```

**Response:**
```json
{
  "nft_id": 123,
  "owner_id": 456,
  "owner_wallet": "0x1234...5678",
  "cached_current_price": "10.50",
  "is_hidden": false,
  "is_pinned": true,
  "trade_history": [
    {
      "buyer_id": 456,
      "seller_id": 789,
      "price": "10.50",
      "created_at": "2026-04-10T12:00:00Z",
      "tx_hash": "0xabc..."
    }
  ]
}
```

#### **PUT** `/api/admin/nfts/:nftId/hide`
Hide/unhide NFT
```bash
PUT http://localhost:3001/api/admin/nfts/123/hide
Content-Type: application/json

{
  "is_hidden": true,
  "hide_reason": "Suspicious activity",
  "admin_wallet": "0xAdmin..."
}
```

#### **PUT** `/api/admin/nfts/:nftId/pin`
Pin/unpin NFT
```bash
PUT http://localhost:3001/api/admin/nfts/123/pin
Content-Type: application/json

{
  "is_pinned": true,
  "pin_order": 1
}
```

#### **POST** `/api/admin/nfts/bulk-pin`
Reorder pinned NFTs
```bash
POST http://localhost:3001/api/admin/nfts/bulk-pin
Content-Type: application/json

{
  "pinned_nfts": [
    { "nft_id": 123, "pin_order": 1 },
    { "nft_id": 456, "pin_order": 2 },
    { "nft_id": 789, "pin_order": 3 }
  ]
}
```

---

### **Queue Rules Management:**

#### **GET** `/api/admin/queue/rules`
Get all queue rules
```bash
GET http://localhost:3001/api/admin/queue/rules
```

**Response:**
```json
[
  {
    "rule_id": 1,
    "rule_name": "Default Queue",
    "description": "Everyone gets 2 NFTs in queue",
    "enabled": true,
    "priority": 1,
    "rule_type": "default",
    "conditions": {},
    "nft_slots": 2
  },
  {
    "rule_id": 2,
    "rule_name": "High Earners",
    "description": "+2 slots for $500+ earners",
    "enabled": true,
    "priority": 10,
    "rule_type": "earning_based",
    "conditions": {
      "min_total_earned": "500"
    },
    "nft_slots": 2
  }
]
```

#### **POST** `/api/admin/queue/rules`
Create new queue rule
```bash
POST http://localhost:3001/api/admin/queue/rules
Content-Type: application/json

{
  "rule_name": "VIP Members",
  "description": "+3 slots for package level 5+",
  "enabled": true,
  "priority": 20,
  "rule_type": "package_based",
  "conditions": {
    "min_package_level": 5
  },
  "nft_slots": 3
}
```

#### **PUT** `/api/admin/queue/rules/:ruleId`
Update queue rule
```bash
PUT http://localhost:3001/api/admin/queue/rules/2
Content-Type: application/json

{
  "rule_name": "Updated Rule",
  "enabled": true,
  "priority": 15,
  "nft_slots": 4
}
```

#### **DELETE** `/api/admin/queue/rules/:ruleId`
Delete queue rule
```bash
DELETE http://localhost:3001/api/admin/queue/rules/2
```

#### **PUT** `/api/admin/queue/rules/:ruleId/toggle`
Enable/disable rule
```bash
PUT http://localhost:3001/api/admin/queue/rules/2/toggle
Content-Type: application/json

{
  "enabled": false
}
```

#### **GET** `/api/admin/queue/affected-users/:ruleId`
Get users affected by rule
```bash
GET http://localhost:3001/api/admin/queue/affected-users/2
```

**Response:**
```json
{
  "rule_id": 2,
  "affected_count": 45,
  "users": [
    {
      "user_id": 123,
      "wallet_address": "0x1234...5678",
      "direct_referrals_count": 5,
      "total_earned": "750.50",
      "package_level": 3,
      "nft_count": 12
    }
  ]
}
```

#### **GET** `/api/admin/queue/stats`
Get queue statistics
```bash
GET http://localhost:3001/api/admin/queue/stats
```

---

## 🎨 **Frontend Integration - Next Steps:**

### **Step 1: Create React Hooks**

Create `frontend/src/hooks/useAdminAPI.ts`:

```typescript
import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:3001/api/admin';

// Fetch all NFTs
export function useAdminNFTs(filters = {}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNFTs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(filters);
            const res = await fetch(`${API_BASE}/nfts?${params}`);
            const json = await res.json();
            setData(json);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNFTs();
    }, [JSON.stringify(filters)]);

    return { data, loading, error, refetch: fetchNFTs };
}

// Get NFT stats
export function useNFTStats() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetch(`${API_BASE}/nfts/stats`)
            .then(res => res.json())
            .then(setStats);
    }, []);

    return stats;
}

// Hide/show NFT
export async function hideNFT(nftId: number, hide: boolean, reason?: string) {
    const res = await fetch(`${API_BASE}/nfts/${nftId}/hide`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            is_hidden: hide,
            hide_reason: reason,
            admin_wallet: '0xAdmin...' // Get from wallet
        })
    });
    return res.json();
}

// Pin/unpin NFT
export async function pinNFT(nftId: number, pin: boolean, order?: number) {
    const res = await fetch(`${API_BASE}/nfts/${nftId}/pin`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            is_pinned: pin,
            pin_order: order
        })
    });
    return res.json();
}

// Queue rules
export function useQueueRules() {
    const [rules, setRules] = useState([]);

    const fetchRules = async () => {
        const res = await fetch(`${API_BASE}/queue/rules`);
        const json = await res.json();
        setRules(json);
    };

    useEffect(() => {
        fetchRules();
    }, []);

    return { rules, refetch: fetchRules };
}

// Create queue rule
export async function createQueueRule(ruleData) {
    const res = await fetch(`${API_BASE}/queue/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ruleData)
    });
    return res.json();
}

// Update queue rule
export async function updateQueueRule(ruleId, ruleData) {
    const res = await fetch(`${API_BASE}/queue/rules/${ruleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ruleData)
    });
    return res.json();
}

// Delete queue rule
export async function deleteQueueRule(ruleId) {
    const res = await fetch(`${API_BASE}/queue/rules/${ruleId}`, {
        method: 'DELETE'
    });
    return res.json();
}
```

---

### **Step 2: Update NFTsTab Component**

**Structure:**
```
NFTsTab
├─ QueueRulesSection (top)
│  ├─ RulesList
│  ├─ AddRuleButton
│  └─ EditRuleModal
├─ NFTControlsSection
│  ├─ StatsCards (using MySQL data)
│  └─ FilterBar
└─ NFTTabs
   ├─ AllNFTsTab (from MySQL)
   ├─ PinnedNFTsTab (from MySQL)
   └─ HiddenNFTsTab (from MySQL)
```

---

## 🚀 **Usage:**

### **1. Start Services:**

```bash
# Terminal 1: Database sync service
cd database
npm start

# Terminal 2: Admin API server
cd database
npm run api

# Terminal 3: Frontend
cd frontend
npm run dev
```

### **2. Test API:**

```bash
# Get all NFTs
curl http://localhost:3001/api/admin/nfts

# Get stats
curl http://localhost:3001/api/admin/nfts/stats

# Get queue rules
curl http://localhost:3001/api/admin/queue/rules
```

---

## ✅ **Benefits:**

✅ **Fast Loading:** MySQL queries instead of blockchain calls  
✅ **Offline Access:** Data available even if RPC is down  
✅ **Advanced Filters:** Complex SQL queries  
✅ **Bulk Operations:** Update multiple NFTs at once  
✅ **Analytics:** Historical data and trends  
✅ **Real-time:** Sync service keeps data updated  

---

## 📝 **Next Implementation Steps:**

1. ✅ **Backend API** (Done!)
2. **Frontend Hooks** (Create useAdminAPI.ts)
3. **Queue Rules Component** (Build UI)
4. **NFT Tabs Component** (All/Pinned/Hidden)
5. **Admin Controls** (Hide/Pin/Notes buttons)
6. **Testing** (Verify all endpoints)

**Ready to build frontend components?** 💪🎨
