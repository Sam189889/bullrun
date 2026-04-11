# 🔧 Maintenance Mode Guide

## Overview

The BullRun platform now has a built-in maintenance mode that can be easily enabled/disabled for upgrades, migrations, and system maintenance.

---

## 🚀 How to Enable Maintenance Mode

### Step 1: Update Configuration

Open `src/config/constants.ts` and change:

```typescript
export const MAINTENANCE_MODE = false  // ❌ Disabled
```

to:

```typescript
export const MAINTENANCE_MODE = true   // ✅ Enabled
```

### Step 2: Customize Message (Optional)

You can customize the maintenance message:

```typescript
export const MAINTENANCE_CONFIG = {
    title: 'System Upgrade in Progress',  // Main title
    message: 'We are currently upgrading...', // Description
    estimatedTime: '2-4 hours',  // Estimated downtime
    showCountdown: false,  // Future feature
    allowAdmins: true,  // Allow admin wallets to bypass
} as const
```

### Step 3: Deploy Changes

```bash
cd frontend
npm run build
# Deploy to your hosting service
```

---

## 📋 Use Cases

### For BullRunHub Migration

```typescript
export const MAINTENANCE_CONFIG = {
    title: 'BullRunHub Migration in Progress',
    message: 'We are migrating to the new BullRunHub wrapper contract for enhanced security and functionality.',
    estimatedTime: '2-4 hours',
    allowAdmins: true,
}
```

### For Smart Contract Upgrade

```typescript
export const MAINTENANCE_CONFIG = {
    title: 'Smart Contract Upgrade',
    message: 'We are upgrading the BullRun smart contracts to the latest version with new features and improvements.',
    estimatedTime: '1-2 hours',
    allowAdmins: true,
}
```

### For Testing/QA

```typescript
export const MAINTENANCE_CONFIG = {
    title: 'System Testing',
    message: 'We are performing final testing before the new features go live.',
    estimatedTime: '30 minutes',
    allowAdmins: true,  // Admins can still access for testing
}
```

---

## 🎯 Features

### ✅ What Maintenance Mode Does:

1. **Blocks all users** from accessing the platform
2. **Shows professional maintenance page** with custom message
3. **Displays estimated time** for completion
4. **Animated UI** with branded styling
5. **Optional admin bypass** (configured via `allowAdmins`)

### 🔐 Admin Bypass (Future Feature)

When `allowAdmins: true`, admin wallets can still access the platform:

```typescript
// Admin wallets defined in constants.ts
const TESTNET_CONFIG = {
    adminWallets: [
        '0xcc51a2dCCa13d63462d9E356d979952217c3508a', // First User
        '0x3ec7B0Ffd2607D2BA47d11145208E16e6491C90F', // Deployer
    ],
}
```

**Note:** Admin bypass requires client-side wallet connection check (to be implemented).

---

## 📝 Maintenance Checklist

### Before Enabling:

- [ ] Announce maintenance window to users (Discord, Twitter, etc.)
- [ ] Set accurate `estimatedTime`
- [ ] Update maintenance message with specific details
- [ ] Backup database (if applicable)
- [ ] Test maintenance page locally

### During Maintenance:

- [ ] Enable `MAINTENANCE_MODE = true`
- [ ] Deploy frontend changes
- [ ] Perform contract upgrades/migrations
- [ ] Test all functionality
- [ ] Verify blockchain transactions

### After Maintenance:

- [ ] Disable `MAINTENANCE_MODE = false`
- [ ] Deploy frontend changes
- [ ] Announce platform is live
- [ ] Monitor for issues

---

## 🎨 Customization

### Changing Colors

Edit `src/components/MaintenancePage.tsx`:

```typescript
// Current: Pink/Purple gradient
className="bg-gradient-to-br from-pink-500 to-purple-600"

// Change to: Blue/Cyan
className="bg-gradient-to-br from-blue-500 to-cyan-600"
```

### Adding Countdown Timer

Set in config:

```typescript
showCountdown: true,
```

(Implementation pending - will show live countdown to estimated completion)

### Custom Logo

Replace emoji in `MaintenancePage.tsx`:

```typescript
<div className="text-6xl animate-bounce">
    🐂  {/* Replace with your logo */}
</div>
```

---

## 🚨 Important Notes

1. **Production Safety:** Always test maintenance mode on testnet first
2. **User Communication:** Announce maintenance at least 24 hours in advance
3. **Quick Disable:** Keep ability to quickly disable if needed
4. **Admin Access:** Consider implementing admin bypass for emergency access
5. **Status Page:** Consider external status page for updates during maintenance

---

## 📞 Emergency Disable

If you need to quickly disable maintenance mode:

```bash
# Quick fix
cd frontend/src/config
# Edit constants.ts: MAINTENANCE_MODE = false
npm run build
# Redeploy immediately
```

---

## 🔄 For BullRunHub Migration

**Recommended Steps:**

1. **Day Before:**
   - Announce 24-hour notice
   - Set `MAINTENANCE_MODE = false` (still normal operation)

2. **During Migration:**
   - Set `MAINTENANCE_MODE = true`
   - Deploy frontend
   - Deploy BullRunHub contract
   - Update contract addresses
   - Test all functions

3. **After Migration:**
   - Verify all transactions work
   - Set `MAINTENANCE_MODE = false`
   - Deploy frontend
   - Announce completion

---

## 📊 Monitoring

During maintenance, monitor:

- Contract deployment transactions
- Gas fees and costs
- Testing results
- User notifications/questions

---

## ✅ Quick Reference

| Action | File | Change |
|--------|------|--------|
| Enable Maintenance | `src/config/constants.ts` | `MAINTENANCE_MODE = true` |
| Disable Maintenance | `src/config/constants.ts` | `MAINTENANCE_MODE = false` |
| Change Message | `src/config/constants.ts` | Edit `MAINTENANCE_CONFIG` |
| Customize UI | `src/components/MaintenancePage.tsx` | Edit component |

---

**Created:** 2026-04-10  
**Status:** ✅ Ready for Use
