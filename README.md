# SahakarConnect — Cooperative Gig Services Platform
**Smart India Hackathon (SIH26089) — Ministry of Cooperation, Government of India**

A decentralized, multi-stakeholder gig economy platform operated through Primary Service Cooperative Societies (PSCS). The platform replaces extractive intermediary aggregators with a democratic, transparent, and worker-owned service distribution model.

---

## Executive Summary

SahakarConnect addresses the economic vulnerabilities inherent in conventional gig platforms by institutionalizing gig workers as cooperative member-owners. By integrating local Primary Service Cooperative Societies into household service delivery, the platform guarantees:

1. **Democratic Platform Governance (One-Worker-One-Vote)**: Cooperative members participate directly in policy decisions, including commission rate determination and welfare fund deployment.
2. **Transparent Revenue Splitting**: Every transaction is deterministically split and recorded on an immutable ledger:
   - **Provider Direct Remittance**: 88%–92% of gross booking value.
   - **Cooperative Welfare & Emergency Fund**: 6%–10% allocated for health insurance, accident compensation, and tool subsidies.
   - **Platform Infrastructure Overhead**: 2.0% fixed for cloud infrastructure and maintenance.
3. **Unified Multi-Stakeholder Portals**: Dedicated, role-gated interfaces for Consumers, Service Providers, Cooperative Society Administrators, and Ministry Regulators.
4. **Real-Time Job Dispatch and Synchronization**: Bi-directional event processing via WebSockets for instantaneous booking requests, live status transitions, and referendum tallying.

---

## System Architecture

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

### Technology Stack

| Layer | Component | Specification | Description |
|---|---|---|---|
| **Frontend** | Application Framework | React 18, Vite, TypeScript | Single responsive client with role-based view isolation |
| **Frontend** | Styling & UI | Tailwind CSS, Lucide Icons | Production-grade design system following government portal standards |
| **Backend** | Application Server | Node.js, Express, TypeScript | Modular RESTful architecture with Zod schema validation |
| **Database** | Persistence Layer | PostgreSQL 15, Prisma ORM | Relational schema modeling users, cooperatives, bookings, and ledger entries |
| **Real-Time** | Event Engine | Socket.io | Bi-directional event broadcasting for status changes and live polls |
| **Security** | Authentication | JWT (Access & Refresh), bcrypt | Role-gated middleware for Consumers, Providers, Admins, and Regulators |
| **Payments** | Settlement Engine | Deterministic Ledger Service | Mock payment adapter calculating precise multi-party revenue allocations |

---

## Repository Structure

```
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema definitions and relations
│   │   └── seed.ts              # Database seeding script with realistic cooperative dataset
│   ├── src/
│   │   ├── controllers/         # Controllers: Auth, Consumer, Provider, Coop, Regulator
│   │   ├── lib/                 # Prisma singleton, JWT utilities, Socket.io manager
│   │   ├── middlewares/         # JWT authentication and role authorization middleware
│   │   ├── routes/              # Express API route declarations
│   │   ├── services/            # Payment settlement and split computation service
│   │   └── server.ts            # Application bootstrap and server configuration
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/          # DemoBar, Navbar, Footer
│   │   │   └── ui/              # SplitVisualizer, Modal, Badge, StarRating
│   │   ├── context/             # AuthContext, SocketContext
│   │   ├── pages/
│   │   │   ├── consumer/        # ConsumerHome, ConsumerBookings
│   │   │   ├── provider/        # ProviderDashboard
│   │   │   ├── admin/           # AdminDashboard (Verification, Ledger, Welfare, Polls)
│   │   │   ├── regulator/       # RegulatorDashboard (National Benchmark)
│   │   │   ├── governance/      # GovernancePage
│   │   │   └── auth/            # Login, Register
│   │   ├── types/               # TypeScript interfaces and shared type declarations
│   │   ├── App.tsx              # Client application router
│   │   └── main.tsx             # Client entrypoint
│   ├── package.json
│   └── vite.config.ts
│
├── docker-compose.yml           # Local PostgreSQL container service definition
├── SahakarConnect_Agent_Build_Plan.md
├── DEMO_SCRIPT.md               # Presentation and evaluation walkthrough
└── README.md
```

---

## Installation and Setup

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- Docker and Docker Compose

### 1. Database Provisioning
Launch the PostgreSQL database container:
```bash
docker-compose up -d
```
The database will be accessible on `localhost:5433` under the database name `sahakarconnect`.

### 2. Backend Initialization
Install dependencies, apply database migrations, seed initial data, and start the API server:
```bash
cd backend
npm install
npx prisma db push
npm run seed
npm run dev
```
The API server starts on `http://localhost:5000`.

### 3. Frontend Initialization
In a separate terminal, install dependencies and launch the client development server:
```bash
cd frontend
npm install
npm run dev
```
The client application will be accessible at `http://localhost:5173`.

---

## API Surface Reference

### Authentication Endpoints
- `POST /api/auth/register` — Register a new Consumer or Provider account.
- `POST /api/auth/login` — Authenticate user and receive access/refresh tokens.
- `POST /api/auth/refresh` — Refresh expired access token.
- `GET /api/auth/me` — Retrieve currently authenticated user profile.

### Consumer Endpoints
- `GET /api/services` — List categories and verified service listings (with filter/search support).
- `POST /api/bookings` — Create a new service booking request.
- `GET /api/bookings/:id` — Retrieve booking details, status, and ledger receipt.
- `GET /api/bookings/my` — List consumer booking history.
- `POST /api/bookings/:id/rate` — Submit provider rating and feedback.
- `POST /api/bookings/:id/pay` — Settle booking payment through simulated gateway.
- `POST /api/grievances` — Submit a grievance ticket to the cooperative committee.

### Provider Endpoints
- `GET /api/providers/me` — Retrieve provider profile, statistics, and cooperative affiliation.
- `PATCH /api/providers/me/availability` — Toggle duty status (Online / Offline).
- `GET /api/providers/me/jobs` — Retrieve incoming, active, and completed jobs.
- `PATCH /api/providers/jobs/:id/accept` — Accept an incoming booking request.
- `PATCH /api/providers/jobs/:id/reject` — Reject a booking request.
- `PATCH /api/providers/jobs/:id/start` — Mark job as in progress / on site.
- `PATCH /api/providers/jobs/:id/complete` — Mark job as complete and trigger ledger settlement.
- `GET /api/providers/me/earnings` — Retrieve comprehensive earnings and welfare contributions.

### Cooperative Admin Endpoints
- `GET /api/coop/:id/providers` — List society providers with verification statuses.
- `PATCH /api/coop/providers/:id/verify` — Approve or reject provider KYC application.
- `GET /api/coop/:id/ledger` — Retrieve full cooperative revenue-split ledger.
- `GET /api/coop/:id/welfare-fund` — Retrieve welfare balance and disbursement audit logs.
- `POST /api/coop/:id/polls` — Create a new governance referendum.
- `GET /api/coop/:id/polls` — List active and historical governance referendums.
- `POST /api/coop/polls/:pollId/vote` — Cast member vote on referendum.

### Regulator Endpoints
- `GET /api/regulator/overview` — National aggregation across all registered cooperatives.
- `GET /api/regulator/cooperatives/:id` — Audit drill-down for an individual cooperative society.

---

## Seeded Evaluation Accounts

For evaluation purposes, pre-seeded accounts are provided with the default password `password123`. The top navigation bar includes an integrated role switcher for instant authentication without manual credential entry:

| Role | User Name | Email Address | Organization / Society |
|---|---|---|---|
| **Consumer** | Rahul Sharma | `rahul.sharma@example.com` | Individual Household |
| **Provider** | Ramesh Yadav | `ramesh.yadav@sahakar.coop` | Delhi Shramik Sahakari Samiti |
| **Cooperative Admin** | Suresh Kumar | `admin.delhi@sahakar.coop` | Delhi Shramik Sahakari Samiti |
| **Regulator** | Dr. Rajeshwari Nair | `regulator@cooperation.gov.in` | Joint Registrar, Ministry of Cooperation |

---

## License

Developed in accordance with the problem statement guidelines for Smart India Hackathon (SIH26089), Ministry of Cooperation, Government of India.
