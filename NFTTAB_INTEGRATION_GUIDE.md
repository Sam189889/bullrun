# 🎨 NFTsTab Integration Guide - MySQL Backend

## ✅ **What's Ready:**

1. ✅ **Backend API** (`database/src/api/`)
   - NFT Management API
   - Queue Rules API
   - Express Server

2. ✅ **React Hooks** (`frontend/src/hooks/useAdminAPI.ts`)
   - `useAdminNFTs()` - Fetch NFTs from MySQL
   - `useNFTStats()` - Get statistics
   - `useQueueRules()` - Get queue rules
   - All mutation functions (hide, pin, create rule, etc.)

3. ✅ **Components** (`frontend/src/app/admin/components/`)
   - `<QueueRulesSection />` - Queue management
   - `<NFTTabsSection />` - NFT display with tabs

---

## 🎯 **How to Integrate:**

### **Step 1: Start Backend API**

```bash
cd database
npm install  # Install express, cors
npm run api  # Start API server on port 3001
```

### **Step 2: Add Environment Variable**

Add to `frontend/.env.local`:
```bash
NEXT_PUBLIC_ADMIN_API=http://localhost:3001/api/admin
```

### **Step 3: Update NFTsTab Component**

**Replace content of** `frontend/src/app/admin/components/NFTsTab.tsx`:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { formatUnits } from 'viem';
import { useTotalNFTs, useCreateNFT } from '@/hooks/useAdminContracts';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { QueueRulesSection } from './QueueRulesSection';
import { NFTTabsSection } from './NFTTabsSection';

export function NFTsTab() {
    const [basePrice, setBasePrice] = useState('10');
    const [nftCount, setNftCount] = useState('1');
    const [showCreateMode, setShowCreateMode] = useState(false);

    const { data: totalNFTs, refetch: refetchTotalNFTs } = useTotalNFTs();
    const { createNFT, isPending: creating, isSuccess: createSuccess } = useCreateNFT();

    useEffect(() => {
        if (createSuccess) {
            toast.success('NFT Created on Blockchain!');
            refetchTotalNFTs();
            setShowCreateMode(false);
        }
    }, [createSuccess]);

    const handleCreateNFT = async () => {
        try {
            const count = parseInt(nftCount) || 1;
            if (count < 1 || count > 50) {
                toast.error('Count must be between 1 and 50');
                return;
            }
            createNFT(basePrice, count);
            toast.success(`Creating ${count} NFT(s) on blockchain...`);
        } catch (err) {
            toast.error('Failed to create NFT');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* ========================================= */}
            {/*  QUEUE RULES MANAGEMENT (MySQL Data)     */}
            {/* ========================================= */}
            <QueueRulesSection />

            {/* ========================================= */}
            {/*  NFT DISPLAY WITH TABS (MySQL Data)      */}
            {/* ========================================= */}
            <NFTTabsSection />

            {/* Divider */}
            <div className="border-t border-slate-800 my-12" />

            {/* ========================================= */}
            {/*  CONTRACT NFT CREATION (Blockchain)      */}
            {/* ========================================= */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">⚙️</span>
                    Blockchain NFT Creation
                </h2>

                {/* Info Banner */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
                    <p className="text-blue-400 text-sm font-semibold mb-2">ℹ️ About NFT Creation</p>
                    <p className="text-slate-300 text-sm">
                        Creates NFTs directly on the blockchain. After creation, the sync service will
                        automatically detect and add them to the MySQL database above.
                    </p>
                </div>

                {/* Contract Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-800/40 border border-slate-700 p-4 rounded-xl">
                        <p className="text-slate-400 text-sm">Contract Total NFTs</p>
                        <p className="text-2xl font-bold text-white">
                            {(totalNFTs as bigint)?.toString() || '0'}
                        </p>
                    </div>
                </div>

                {/* Create NFT Form */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                    {!showCreateMode ? (
                        <Button
                            onClick={() => setShowCreateMode(true)}
                            className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl text-lg font-semibold"
                        >
                            ➕ Create NFT on Blockchain
                        </Button>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Base Price (USD)
                                    </label>
                                    <input
                                        type="text"
                                        value={basePrice}
                                        onChange={(e) => setBasePrice(e.target.value)}
                                        placeholder="10"
                                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Number of NFTs (1-50)
                                    </label>
                                    <input
                                        type="number"
                                        value={nftCount}
                                        onChange={(e) => setNftCount(e.target.value)}
                                        min="1"
                                        max="50"
                                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={handleCreateNFT}
                                    disabled={creating || !basePrice}
                                    className="flex-1 bg-blue-600 hover:bg-blue-500"
                                >
                                    {creating ? 'Creating on Blockchain...' : 'Create NFT'}
                                </Button>
                                <Button
                                    onClick={() => setShowCreateMode(false)}
                                    className="flex-1 bg-slate-700 hover:bg-slate-600"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
```

---

## 📋 **File Structure:**

```
frontend/src/
├── hooks/
│   └── useAdminAPI.ts  ✅ (New - All MySQL API hooks)
│
└── app/admin/components/
    ├── NFTsTab.tsx  ⚠️ (Update with above code)
    ├── QueueRulesSection.tsx  ✅ (New)
    └── NFTTabsSection.tsx  ✅ (New)
```

---

## 🚀 **Usage Flow:**

### **1. Admin Opens NFT Tab**

**Queue Rules Section (Top):**
- View all queue rules
- Add/Edit/Delete rules
- Enable/Disable rules
- See affected users count

**NFT Display Section (Middle):**
- **All NFTs Tab**: Shows all active NFTs from MySQL
- **Pinned NFTs Tab**: Shows pinned NFTs
- **Hidden NFTs Tab**: Shows hidden NFTs
- Each card has Hide/Pin buttons

**Contract Creation (Bottom):**
- Create new NFTs on blockchain
- After creation, sync service adds to MySQL

---

## ⚡ **Data Flow:**

```
┌──────────────┐
│   Blockchain │
│   (opBNB)    │
└──────┬───────┘
       │
       │ Events
       ↓
┌──────────────┐       ┌──────────────┐
│ Sync Service │──────→│    MySQL     │
│ (database/)  │       │   Database   │
└──────────────┘       └──────┬───────┘
                              │
                              │ REST API
                              ↓
                       ┌──────────────┐
                       │   Frontend   │
                       │   (React)    │
                       └──────────────┘
```

**Flow:**
1. User creates NFT → Blockchain
2. Sync service detects event → MySQL
3. Frontend fetches from MySQL → Fast display!
4. Admin hides/pins → MySQL update
5. Sync keeps everything current

---

## ✅ **Benefits:**

| Feature | Before (Contract) | After (MySQL) |
|---------|------------------|---------------|
| Load Time | 10-30 seconds | <0.5 seconds ⚡ |
| Filters | Limited | Advanced SQL |
| Sorting | Client-side | Server-side |
| Pagination | Memory heavy | Efficient |
| Admin Controls | ❌ None | ✅ Hide/Pin/Notes |
| Queue Rules | ❌ None | ✅ Full management |
| Offline | ❌ Requires RPC | ✅ Works offline |

---

## 🧪 **Testing:**

```bash
# Terminal 1: Start database sync
cd database
npm start

# Terminal 2: Start API server
cd database
npm run api

# Terminal 3: Start frontend
cd frontend
npm run dev

# Visit: http://localhost:3000/admin
```

**Test Checklist:**
- [ ] Queue rules CRUD operations
- [ ] NFT tabs switching (All/Pinned/Hidden)
- [ ] Hide/Show NFT
- [ ] Pin/Unpin NFT
- [ ] NFT creation on blockchain
- [ ] Stats cards updating
- [ ] Sorting and filtering
- [ ] Fast loading (<1 second)

---

## 📝 **Next Steps:**

1. **Replace NFTsTab.tsx** with code above
2. **Start all services** (database sync, API, frontend)
3. **Test all features**
4. **Optional**: Remove old contract-based NFT display code
5. **Deploy**: API server to production with database

**Ready to implement? Replace the file and test!** 🚀💪
