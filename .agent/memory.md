# Trust NFT Trading Platform - Session Memory

**Last Updated:** 2026-01-08T19:48:45+05:30

## Project Overview
A Next.js-based NFT trading platform with premium UI/UX, featuring a landing page, user dashboard, and admin panel.

## Technology Stack
- **Framework:** Next.js 16.1.1 with App Router
- **React:** 19.2.3
- **Styling:** TailwindCSS v4
- **Language:** TypeScript
- **Linter:** Biome

## Design System (globals.css)
- **Primary Color:** Gold (#FFD700)
- **Secondary Color:** Deep Blue (#1E3A5F)
- **Accent:** Orange (#F59E0B)
- **Background:** Dark (#0F172A, #1E293B)
- **Glassmorphism:** `bg-[#0F172A]/80 backdrop-blur-xl border-[rgba(255,255,255,0.08)]`
- **Animations:** float-slow/medium/fast, pulse-glow, shimmer, burn-effect, animate-slide-up, rotate-coin

## Project Structure
```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── dashboard/
│   │   ├── page.tsx          # Dashboard SPA
│   │   └── components/       # Dashboard tab components
│   │       ├── index.ts
│   │       ├── DashboardHeader.tsx
│   │       ├── DashboardNav.tsx
│   │       ├── HomeTab.tsx
│   │       ├── MarketplaceTab.tsx
│   │       ├── EarningsTab.tsx
│   │       ├── TeamTab.tsx
│   │       ├── BurningTab.tsx
│   │       └── LevelsTab.tsx
│   └── admin/
│       ├── page.tsx          # Admin SPA
│       └── components/       # Admin tab components
│           ├── index.ts
│           ├── AdminHeader.tsx
│           ├── AdminNav.tsx
│           ├── OverviewTab.tsx
│           ├── UsersTab.tsx
│           ├── TransactionsTab.tsx
│           ├── PackagesTab.tsx
│           └── SettingsTab.tsx
├── components/
│   ├── home/                 # Landing page components
│   │   └── Header.tsx
│   └── ui/                   # Shared UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       └── ProgressBar.tsx
└── lib/
    ├── mockData.ts           # Mock data for UI
    └── types.ts              # TypeScript interfaces
```

## Key Components & Patterns

### Navigation Style (Consistent across app)
All navigation components use matching glassmorphism:
- `bg-[#0F172A]/80 backdrop-blur-xl`
- `border border-[rgba(255,255,255,0.08)]`
- Height: `h-16 sm:h-20`
- Active states: colored glow, drop-shadow, colored labels

### Dashboard Tabs
| Tab | Color | Icon |
|-----|-------|------|
| Home | #FFD700 | 🏠 |
| NFTs | #F59E0B | 💎 |
| Earnings | #10B981 | 💰 |
| Team | #3B82F6 | 👥 |
| Burning | #EF4444 | 🔥 |
| Levels | #8B5CF6 | 📈 |

### Admin Tabs
| Tab | Color | Icon |
|-----|-------|------|
| Overview | #FFD700 | 📊 |
| Users | #3B82F6 | 👥 |
| Transactions | #10B981 | 💰 |
| Packages | #F59E0B | 📦 |
| Settings | #8B5CF6 | ⚙️ |

## Important Type References
- `ProgressBar` uses `value` and `max` props (not `percentage`)
- `LevelIncome` has `ratePerNFT` (not `incomePerNft`)
- `TeamMember` has `walletAddress` (not `wallet`)
- Transaction status: 'credited' | 'pending' (not 'completed')
- `deductionRules` has: package, threshold, deduction (not 'range')

## Completed Work
1. ✅ Enhanced dashboard visual design with vibrant gradients and animations
2. ✅ Made all dashboard components fully responsive
3. ✅ Added staggered slide-up animations to all tabs
4. ✅ Created admin panel with matching structure (SPA with tabs)
5. ✅ Made admin components responsive with animations
6. ✅ Fixed duplicate dashboard button on homepage header
7. ✅ Unified bottom nav styling across dashboard and admin (glassmorphism)

## Running the Project
```bash
cd /Users/bholaboranwala/.gemini/antigravity/scratch/trust-nft
npm run dev
```

## URLs
- Homepage: http://localhost:3000/
- Dashboard: http://localhost:3000/dashboard
- Admin: http://localhost:3000/admin
