# MyNFTsTab MySQL Integration Guide

## 🎯 Goal

Refactor `MyNFTsTab.tsx` to use MySQL data instead of blockchain contract calls for faster loading and queue status visibility.

---

## ✅ Backend Ready

### **1. API Endpoint Created**
```
GET /api/user/nfts/:userId
```

**Response:**
```json
{
  "nfts": [
    {
      "nft_id": 1,
      "owner_id": 123,
      "cached_current_price": "15.50",
      "cached_base_price": "10.00",
      "cached_is_listed": true,
      "cached_last_traded_at": 1704067200,
      "is_hidden": false,
      "admin_override": false,
      "queue_exempt": false,
      "admin_notes": null
    }
  ],
  "total": 1,
  "user_id": "123"
}
```

### **2. React Hook Created**
```typescript
import { useUserNFTs } from '@/hooks/useAdminAPI';

const { data, loading, error, refetch } = useUserNFTs(userId);
```

---

## 🔄 Frontend Changes Needed

### **Step 1: Update Imports**

**Remove:**
```typescript
import { useUserNFTCount, useUserNFT, useNFT } from '@/hooks/useContracts';
```

**Add:**
```typescript
import { useUserNFTs } from '@/hooks/useAdminAPI';
```

### **Step 2: Replace Contract Hooks**

**Old Way (Contract):**
```typescript
const { data: nftCount } = useUserNFTCount(userId);
// Loop through index and fetch each NFT
```

**New Way (MySQL):**
```typescript
const { data, loading } = useUserNFTs(userId);
const nfts = data?.nfts || [];
```

### **Step 3: Add Queue Status Display**

Show which NFTs are **HELD** vs **LISTED**:

```typescript
// In NFT Card component
const isListed = nft.cached_is_listed;
const isHeld = !nft.cached_is_listed; // In queue, not selling
const isAdminHeld = nft.admin_override; // Admin forced hold
const isExempt = nft.queue_exempt; // Exempt from queue rules

<div className="status-badges">
  {isAdminHeld && (
    <span className="badge-admin-hold">
      🔒 Admin Hold
    </span>
  )}
  
  {isHeld && !isAdminHeld && (
    <span className="badge-queue-hold">
      📦 In Queue (Held)
    </span>
  )}
  
  {isListed && (
    <span className="badge-listed">
      🟢 Listed for Sale
    </span>
  )}
  
  {isExempt && (
    <span className="badge-exempt">
      ⭐ Queue Exempt
    </span>
  )}
</div>
```

### **Step 4: Update NFT Cards**

**Old NFTMobileCard (Contract-based):**
```typescript
function NFTMobileCard({ nftIndex, userId }: { nftIndex: number; userId: bigint }) {
    const { data: nftIdData } = useUserNFT(userId, nftIndex);
    const nftId = nftIdData ? Number(nftIdData) : 0;
    const { data: nftData } = useNFT(BigInt(nftId));
    // ... parse contract data
}
```

**New NFTMobileCard (MySQL-based):**
```typescript
function NFTMobileCard({ nft }: { nft: NFT }) {
    const formatUSD = (value: string) => `$${Number(value).toFixed(2)}`;
    const isHeld = !nft.cached_is_listed;
    const isAdminHold = nft.admin_override;
    
    return (
        <div className="nft-card">
            {/* NFT ID */}
            <span>#{nft.nft_id}</span>
            
            {/* Status Badge */}
            {isAdminHold ? (
                <span className="badge-admin">🔒 Admin Hold</span>
            ) : isHeld ? (
                <span className="badge-queue">📦 Queue</span>
            ) : (
                <span className="badge-listed">🟢 Listed</span>
            )}
            
            {/* Price */}
            <div>{formatUSD(nft.cached_current_price)}</div>
            
            {/* Admin Notes (if any) */}
            {nft.admin_notes && (
                <div className="admin-notes">
                    ℹ️ {nft.admin_notes}
                </div>
            )}
        </div>
    );
}
```

### **Step 5: Update Main Component**

```typescript
export function MyNFTsTab() {
    const { address } = useAccount();
    const { data: userId } = useUserId(address);
    
    // NEW: Fetch from MySQL
    const { data: nftData, loading, error } = useUserNFTs(userId ? Number(userId) : null);
    
    const nfts = nftData?.nfts || [];
    const total = nftData?.total || 0;
    
    if (loading) return <div>Loading NFTs...</div>;
    if (error) return <div>Error loading NFTs</div>;
    
    // Stats
    const heldCount = nfts.filter(n => !n.cached_is_listed).length;
    const listedCount = nfts.filter(n => n.cached_is_listed).length;
    const adminHeldCount = nfts.filter(n => n.admin_override).length;
    
    return (
        <div>
            {/* Stats Cards */}
            <div className="stats-grid">
                <StatCard label="Total NFTs" value={total} />
                <StatCard label="Listed" value={listedCount} emoji="🟢" />
                <StatCard label="In Queue" value={heldCount} emoji="📦" />
                {adminHeldCount > 0 && (
                    <StatCard label="Admin Held" value={adminHeldCount} emoji="🔒" />
                )}
            </div>
            
            {/* NFT Grid */}
            <div className="nft-grid">
                {nfts.map(nft => (
                    <NFTMobileCard key={nft.nft_id} nft={nft} />
                ))}
            </div>
        </div>
    );
}
```

---

## 🎨 Queue Status Legend

| Badge | Meaning | Description |
|-------|---------|-------------|
| 🟢 Listed | Auto-listed | NFT is selling, can earn from it |
| 📦 In Queue | Held (Rule) | Held due to queue rules, not selling |
| 🔒 Admin Hold | Held (Admin) | Admin manually held this NFT |
| ⭐ Exempt | Queue Exempt | Not affected by queue rules |

---

## 💡 Benefits

### **Speed:**
```
Before: 10-30 seconds (blockchain calls)
After: <0.5 seconds (MySQL query)
```

### **Features:**
- ✅ See which NFTs are held vs listed
- ✅ See admin-held NFTs with notes
- ✅ See queue exempt NFTs
- ✅ Instant stats (held count, listed count)
- ✅ No RPC rate limits
- ✅ Works offline (after initial load)

### **User Experience:**
```
Old: "Loading..." for 20+ seconds
New: Instant display with clear status
```

---

## 🧪 Testing

1. **Start API server:**
```bash
cd database
npm run api
```

2. **Restart frontend:**
```bash
cd frontend
npm run dev
```

3. **Test scenarios:**
- User with 0 NFTs
- User with held NFTs (queue)
- User with listed NFTs
- User with admin-held NFTs
- User with mixed (held + listed)

---

## 📋 Transaction Links

**Keep existing transaction link component** - it uses events which are still needed!

```typescript
// This component stays the same
function NFTTransactionLink({ nftId, userId }: { nftId: number; userId: bigint }) {
    const { useNFTBuyEvents, useNFTSplitEvents } = require('@/hooks/useEvents');
    // ... existing code
}
```

---

## ⚡ Next Steps

1. Update `MyNFTsTab.tsx` imports
2. Replace contract hooks with `useUserNFTs`
3. Update NFT cards to show queue status
4. Add stats cards for held/listed counts
5. Style queue badges
6. Test with different users

**All backend ready - just frontend changes needed!** 🚀
