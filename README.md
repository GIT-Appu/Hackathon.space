# 🍕 Midnight Pizza Hack — Hackathon Platform

> **Code. Eat. Repeat.**  
> A full-stack hackathon management platform with dark neon aesthetics, built with Next.js 16 App Router.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# 3. Run dev server
npm run dev
# → http://localhost:3000
```

---

## 🔐 Default Credentials

| Role  | Email                        | Password   |
|-------|------------------------------|------------|
| Admin | admin@midnightpizza.com      | admin123   |

---

## 📁 Project Structure

```
midnight-pizza-hack/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── not-found.tsx               # 404 page
│   ├── loading.tsx                 # Global loading
│   ├── (auth)/
│   │   ├── login/page.tsx          # Login
│   │   └── register/page.tsx       # Team registration (2-step)
│   ├── (dashboard)/
│   │   ├── dashboard/              # Participant dashboard
│   │   └── admin/page.tsx          # Admin panel (5 tabs)
│   └── api/
│       ├── auth/                   # login, register, logout, me
│       ├── settings/               # Public hackathon settings
│       ├── payment/                # Payment simulation
│       ├── submissions/            # Project submissions
│       └── admin/                  # teams, settings, scores, email
├── components/
│   ├── ui/
│   │   ├── Navbar.tsx              # Sticky nav with auth state
│   │   └── Countdown.tsx           # Live countdown timer
│   └── admin/
│       └── EmailTab.tsx            # Bulk email composer
├── lib/
│   ├── db.ts                       # In-memory DB (swap → Prisma)
│   ├── auth.ts                     # JWT + bcrypt helpers
│   └── utils.ts                    # Utility functions
├── store/
│   └── auth.ts                     # Zustand auth store
├── middleware.ts                   # Edge route protection
└── vercel.json                     # Vercel deploy config
```

---

## ✨ Features

### 🌐 Landing Page
- Animated hero with live countdown to registration deadline
- Prize pool cards (₹50K / ₹25K / ₹10K)
- Accordion FAQ
- Rules section
- Responsive dark neon UI

### 👤 Participant Flow
1. **Register** → 2-step team form (team details + members, max 4)
2. **Payment** → Simulated Razorpay (test mode, one click)
3. **Dashboard** → See team status, payment, countdown to problem reveal
4. **Problem Reveal** → Unlocks when admin toggles ON
5. **Submit** → Video link + GitHub/ZIP URL + PDF report URL

### ⚙️ Admin Panel (5 Tabs)
| Tab | Features |
|-----|----------|
| Overview | Stats cards, recent registrations table |
| Control | Toggle problem reveal, edit problem statement, set all deadlines |
| Teams | Filter by paid/submitted, full team table |
| Submissions | View video links, ZIP downloads, PDF links |
| Evaluation | Score each team (Innovation/Relevance/Technical/UI-UX), mark 1st/2nd/3rd |
| Email | Bulk email with templates, filter by paid/unpaid/submitted/all |

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Background | `#080810` |
| Card | `rgba(255,255,255,0.03)` + blur |
| Purple accent | `#a855f7` |
| Orange accent | `#f97316` |
| Font display | Syne (800) |
| Font mono | Space Mono |
| Font body | Inter |

---

## 🔧 Production Upgrades

The app uses an in-memory DB for the demo. For production, swap these:

### Database → Prisma + PostgreSQL
```bash
npm install prisma @prisma/client
npx prisma init
# Replace lib/db.ts with Prisma client calls
```

### Payments → Razorpay
```bash
npm install razorpay
# Add RAZORPAY_KEY_SECRET to .env
# Replace /api/payment with Razorpay order creation + webhook verification
```

### File Upload → Uploadthing
```bash
npm install uploadthing @uploadthing/react
# Add UPLOADTHING_SECRET + UPLOADTHING_APP_ID to .env
# Add file upload inputs to submission form
```

### Email → Resend
```bash
npm install resend
# Add RESEND_API_KEY to .env
# Uncomment Resend code in /api/admin/email/route.ts
```

---

## 🚢 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set env vars in Vercel dashboard:
# JWT_SECRET, RAZORPAY_KEY_SECRET, RESEND_API_KEY, etc.
```

---

## 🧪 Test the Full Flow

1. Visit `localhost:3000`
2. Click **Register Now** → fill team form → submit
3. On dashboard → click **Pay Now (Test Mode)**
4. Login as admin → **Control Panel** → toggle **Problem Reveal ON**
5. Back on participant dashboard → problem statement appears + submission unlocks
6. Submit a project
7. Admin → **Submissions** tab → see submission
8. Admin → **Evaluation** tab → score the team

---

Made with 🍕 and way too much caffeine.
# Hackathon.space
