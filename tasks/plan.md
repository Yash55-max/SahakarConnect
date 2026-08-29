# SahakarConnect — Implementation Plan

## Overview
SahakarConnect is a Cooperative Gig Services Platform for Household & Community Services (SIH26089, Ministry of Cooperation). It connects households with verified local service providers operated through Primary Service Cooperative Societies (PSCS) featuring transparent revenue splitting, democratic governance, and comprehensive role dashboards.

## Architecture Decisions
- **Monorepo Structure**: Separate `/backend` (Express, TypeScript, Prisma, Socket.io) and `/frontend` (React 18, Vite, TypeScript, Tailwind CSS, Lucide icons, Socket.io-client).
- **Database**: PostgreSQL with Prisma ORM.
- **Real-time Engine**: Socket.io for bi-directional live booking updates, status sync, and push notifications to providers and consumers.
- **Transparent Ledger**: Deterministic revenue split calculation (Provider Share e.g. 85-90%, Cooperative Welfare Fund e.g. 8-12%, Platform Fee e.g. 2-3%).
- **Governance System**: Democratic polling and voting for cooperative members to vote on commission splits and welfare fund deployment.
- **Interactive Role Switcher**: Quick-switch demo bar on frontend allowing judges to test as Consumer, Provider, Coop Admin, or Regulator instantly with seeded accounts.

## Phase Breakdown

### Phase 0: Scaffolding
- Set up root `docker-compose.yml`, root package scripts, `/backend` structure, and `/frontend` structure.
- Configure TypeScript, Tailwind CSS, Vite, Express, Prisma.

### Phase 1: Data Layer & Schema
- Define Prisma schema matching Section 4.
- Write extensive seed script with 3 cooperatives, 12 verified/pending providers, 18 service listings, 20 bookings with ledger entries, governance polls, votes, and ratings.

### Phase 2: Authentication & Role Middleware
- JWT Auth (Access + Refresh tokens), bcrypt password hashing.
- Role-based authorization middleware for `CONSUMER`, `PROVIDER`, `COOP_ADMIN`, `REGULATOR`.
- Auth endpoints: `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/me`.

### Phase 3: Consumer Flow
- Category & service listing search/filter by category and location.
- Booking creation and management.
- Real-time booking status tracker (`REQUESTED` -> `ACCEPTED` -> `IN_PROGRESS` -> `COMPLETED`).
- Review and rating submission. Grievance filing.

### Phase 4: Provider Flow
- Provider profile management and online/offline availability toggle.
- Incoming job request inbox with real-time socket alerts.
- One-click Job Accept / Reject / In-Progress / Complete flow.
- Provider Earnings & Ledger breakdown.

### Phase 5: Cooperative Admin & Governance Layer
- Provider verification queue (Approve/Reject with KYC mock).
- Cooperative Transparent Revenue-Split Ledger with visual charts.
- Welfare Fund balance and emergency disbursement ledger.
- Governance Poll creation and democratic member voting with real-time tally.

### Phase 6: Regulator Dashboard
- High-level multi-cooperative aggregate metrics (State/District analytics).
- Compliance, active providers, total transaction volume, welfare fund total.
- Cooperative drill-down view.

### Phase 7: Payments Stub
- Mock Payment Gateway integration calculating exact commission splits and creating immutable `PaymentLedgerEntry` records.

### Phase 8: Polish & Demo Walkthrough
- Polished responsive UI with animations, toast notifications, demo role-switcher.
- `DEMO_SCRIPT.md` and complete `README.md`.
