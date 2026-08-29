# SahakarConnect — Cooperative Gig Services Platform
### Smart India Hackathon (SIH26089) — Ministry of Cooperation, Government of India

> **A decentralized, multi-stakeholder gig economy platform operated through Primary Service Cooperative Societies (PSCS) instead of extractive corporate aggregators.**

---

## 🌟 Key Innovations & Differentiators

1. **Democratic Gig Economy Governance (One-Worker-One-Vote)**: Providers are verified cooperative member-owners who vote on commission splits, welfare fund allocations, and platform rules.
2. **Transparent Revenue-Split Ledger**: Every booking is split in real-time on an immutable ledger:
   - **Provider Direct Take-Home**: 88%–92% (compared to ~70% on commercial apps)
   - **Cooperative Welfare & Health Fund**: 6%–10% (cashless monsoon insurance, accident aid, tool subsidies)
   - **Platform Technology Overhead**: 2.0% flat (servers, SMS, maintenance)
3. **Multi-Stakeholder Architecture**: Native, unified web portals for **Consumers**, **Cooperative Service Providers**, **Society Administrators**, and **Ministry Regulators**.
4. **Real-Time Job Orchestration**: Socket.io bi-directional synchronization for instant booking alerts, status tracking (`REQUESTED` → `ACCEPTED` → `IN_PROGRESS` → `COMPLETED`), and live governance poll results.

---

## 🏗️ Architecture & Technology Stack

```
                                  ┌────────────────────────────────┐
                                  │      SahakarConnect Client     │
                                  │  React 18 + Vite + TypeScript  │
                                  │    Tailwind CSS + Lucide UI    │
                                  └───────────────┬────────────────┘
                                                  │
                                   HTTP REST & Socket.io Events
                                                  │
                                  ┌───────────────▼────────────────┐
                                  │     Express + TypeScript       │
                                  │      Node.js REST API Server   │
                                  │    JWT Auth + Role Middleware  │
                                  └───────────────┬────────────────┘
                                                  │
                                      Prisma ORM Queries
                                                  │
                                  ┌───────────────▼────────────────┐
                                  │      PostgreSQL Database       │
                                  │   Relational Multi-Coop Model  │
                                  └────────────────────────────────┘
```

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS | Single responsive web app with role-based routing and live socket sync |
| **Backend** | Node.js, Express, TypeScript | Modular REST API with strict input validation via Zod |
| **Database & ORM** | PostgreSQL 15, Prisma ORM | Relational data model for users, cooperatives, bookings, ledger, polls |
| **Real-time Sync** | Socket.io | Live booking dispatch, state transitions, and real-time referendum voting |
| **Authentication** | JWT (Access + Refresh), bcrypt password hashing | Role-based authorization (`CONSUMER`, `PROVIDER`, `COOP_ADMIN`, `REGULATOR`) |
| **Payments** | Deterministic Revenue Ledger Stub | Simulates UPI / card checkout and calculates split into `PaymentLedgerEntry` |

---

## 📁 Repository Structure

```
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Complete schema (10 entities + enums)
│   │   └── seed.ts              # Seed script with realistic Indian cooperative dataset
│   ├── src/
│   │   ├── controllers/         # Auth, Consumer, Provider, Coop Admin, Regulator
│   │   ├── lib/                 # Prisma singleton, JWT helpers, Socket.io manager
│   │   ├── middlewares/         # Auth & Role-gated middleware
│   │   ├── routes/              # Express API routers
│   │   ├── services/            # PaymentService and transparent split calculator
│   │   └── server.ts            # Main server entrypoint
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/          # DemoBar, Navbar, Footer
│   │   │   └── ui/              # SplitVisualizer, Modal, Badge, StarRating
│   │   ├── context/             # AuthContext (with 1-click persona switcher), SocketContext
│   │   ├── pages/
│   │   │   ├── consumer/        # ConsumerHome, ConsumerBookings
│   │   │   ├── provider/        # ProviderDashboard
│   │   │   ├── admin/           # AdminDashboard (Verification, Ledger, Welfare, Polls)
│   │   │   ├── regulator/       # RegulatorDashboard (National Benchmark)
│   │   │   ├── governance/      # GovernancePage
│   │   │   └── auth/            # Login, Register
│   │   ├── types/               # Shared TypeScript models
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── docker-compose.yml           # Local PostgreSQL container on port 5433
├── SahakarConnect_Agent_Build_Plan.md
├── DEMO_SCRIPT.md               # 3-minute hackathon judge demonstration script
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- Docker (for PostgreSQL)

### 1. Start the Database
```bash
docker-compose up -d
```
*Starts PostgreSQL on port `5433` with database `sahakarconnect`.*

### 2. Setup and Seed Backend
```bash
cd backend
npm install
npx prisma db push
npm run seed
npm run dev
```
*Backend API boots on `http://localhost:5000`.*

### 3. Start Frontend
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
*Frontend web application boots on `http://localhost:5173`.*

---

## 👥 Seeded Demo Accounts (Password: `password123`)

Use the **Top Demo Bar** on the website for instant 1-click switching, or login with:

| Role | Name | Email | Society |
|---|---|---|---|
| **Consumer** | Rahul Sharma | `rahul.sharma@example.com` | — |
| **Provider** | Ramesh Yadav (Plumber) | `ramesh.yadav@sahakar.coop` | Delhi Shramik Sahakari Samiti |
| **Coop Admin** | Suresh Kumar | `admin.delhi@sahakar.coop` | Delhi Shramik Sahakari Samiti |
| **Regulator** | Dr. Rajeshwari Nair | `regulator@cooperation.gov.in` | Joint Registrar (Ministry) |

---

## 📜 License
Developed for Smart India Hackathon (SIH26089) in alignment with Ministry of Cooperation guidelines.
