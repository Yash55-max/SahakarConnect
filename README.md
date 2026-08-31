# SahakarConnect — Cooperative Gig Services Platform
**Smart India Hackathon (SIH26089) — Ministry of Cooperation & National Council for Cooperative Training (NCCT)**

A decentralized, multi-stakeholder gig economy platform operated through Primary Service Cooperative Societies (PSCS). The platform replaces extractive intermediary aggregators with a democratic, transparent, and worker-owned service distribution model built in strict accordance with the Government of India UX4G (v3.1.0) Design System.

---

## Executive Summary

SahakarConnect addresses the economic vulnerabilities inherent in conventional gig platforms by institutionalizing gig workers as cooperative member-owners. By integrating local Primary Service Cooperative Societies into household service delivery, the platform guarantees:

1. **Democratic Platform Governance (One-Worker-One-Vote)**: Cooperative members participate directly in policy decisions, including commission rate determination and welfare fund deployment.
2. **Transparent Revenue Splitting**: Every transaction is deterministically split and recorded on an immutable ledger:
   - **Provider Direct Remittance**: 80%–85% of gross booking value.
   - **Cooperative Welfare & Emergency Fund**: 10%–15% allocated for health insurance, accident compensation, and tool subsidies.
   - **Platform Infrastructure Overhead**: 2.0%–5.0% capped for cloud infrastructure and maintenance.
3. **Unified Multi-Stakeholder Portals**: Dedicated, role-gated interfaces for Consumers, Service Providers, Cooperative Society Administrators, and Ministry Regulators.
4. **Real-Time Job Dispatch and Synchronization**: Bi-directional event processing via WebSockets for instantaneous booking requests, live status transitions, and referendum tallying.
5. **AI-Based Demand Forecasting & Workforce Allocation**: Geo-spatial predictive modeling predicting peak booking hours and allocating provider shifts.
6. **24x7 Emergency SOS Dispatch**: Rapid 15-minute SLA dispatch for emergency plumbing, electrical short circuits, and caregiver assistance.
7. **UX4G Indian Government Design System (v3.1.0)**: Fully compliant with GIGW 3.0 and WCAG 2.1 AA accessibility guidelines, featuring text size scaling (A-, A, A+), high contrast mode, dark theme, and English / Hindi bilingual support.

---

## System Architecture

```
                                  +--------------------------------+
                                  |      SahakarConnect Client     |
                                  |  Pure HTML5 + CSS3 + Vanilla JS|
                                  |  UX4G Design System (v3.1.0)   |
                                  +---------------+----------------+
                                                  |
                                   HTTP REST & Socket.io Events
                                                  |
                                  +---------------v----------------+
                                  |     Express + TypeScript       |
                                  |      Node.js REST API Server   |
                                  |    JWT Auth + Role Middleware  |
                                  +---------------+----------------+
                                                  |
                                       Prisma ORM Queries
                                                  |
                                  +---------------v----------------+
                                  |      PostgreSQL Database       |
                                  |   Relational Multi-Coop Model  |
                                  +--------------------------------+
```

### Technology Stack

| Layer | Component | Specification | Description |
|---|---|---|---|
| **Frontend** | Application Framework | Pure HTML5, CSS3, Vanilla JS | Accessible, zero-build client interface adhering directly to UX4G 3.1.0 |
| **Frontend** | Design System & Styling | UX4G 3.1.0 CDN + Custom Tokens | Official Government of India design tokens, high contrast, text scaling |
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
│   ├── index.html               # Citizen / Household Service Booking Portal
│   ├── provider.html            # Cooperative Provider Gig Workstation & Welfare Ledger
│   ├── admin.html               # PSCS Society Admin & Provider Verification
│   ├── governance.html          # Democratic One-Member-One-Vote Governance Hall
│   ├── regulator.html           # Ministry of Cooperation & Registrar Oversight
│   ├── login.html               # MeriPehchan / DigiLocker National SSO Gateway
│   ├── components-reference.html# UX4G Components Spec & Code Snippets Guide
│   ├── package.json             # Static server scripts
│   └── assets/
│       ├── css/ux4g-theme.css   # UX4G Design Tokens, Accessibility (A-/A/A+), Contrast & Dark Modes
│       ├── js/app.js            # Client runtime, localStorage state sync, booking & voting engine
│       └── images/              # Ashoka Lion Emblem, Tricolor Flag & Sahakar Logos
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
- Docker and Docker Compose (Optional for local PostgreSQL container)

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
The API server starts on `http://localhost:5000` and automatically serves both the REST API and the static UX4G frontend.

### 3. Frontend Initialization (Standalone Option)
Alternatively, run the frontend with any static web server:
```bash
cd frontend
npm start
```
The client application will be accessible at `http://localhost:3000`.

---

## API Surface Reference

### Authentication Endpoints
- `POST /api/auth/register` — Register a new Consumer or Provider account.
- `POST /api/auth/login` — Authenticate user and receive access/refresh tokens.
- `POST /api/auth/refresh` — Refresh expired access token.
- `GET /api/auth/me` — Retrieve currently authenticated user profile.

### Consumer & Citizen Endpoints
- `GET /api/services` — List categories and verified service listings.
- `POST /api/bookings` — Create a new service booking request.
- `GET /api/bookings/:id` — Retrieve booking details, status, and ledger receipt.
- `GET /api/bookings/my` — List consumer booking history.
- `POST /api/bookings/:id/rate` — Submit provider rating and feedback.
- `POST /api/bookings/:id/pay` — Settle booking payment through simulated gateway.
- `POST /api/grievances` — Submit a grievance ticket to the cooperative committee.
- `GET /api/ai/forecast` — Retrieve AI-based demand forecasting and workforce capacity data.

### Provider Endpoints
- `GET /api/providers/me` — Retrieve provider profile, statistics, and cooperative affiliation.
- `PATCH /api/providers/availability` — Toggle duty status (Online / Offline).
- `GET /api/providers/jobs` — Retrieve incoming, active, and completed jobs.
- `PATCH /api/providers/jobs/:id/accept` — Accept an incoming booking request.
- `PATCH /api/providers/jobs/:id/start` — Mark job as in progress / on site.
- `PATCH /api/providers/jobs/:id/complete` — Mark job as complete and trigger ledger settlement.
- `GET /api/providers/earnings` — Retrieve comprehensive earnings and welfare contributions.

### Cooperative Admin Endpoints
- `GET /api/coop/:id/providers` — List society providers with verification statuses.
- `PATCH /api/coop/:id/providers/:providerId/verify` — Approve or reject provider KYC application.
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
| **Provider** | Rajesh Kumar Verma | `rajesh.plumber@example.com` | Varanasi Central Service Cooperative |
| **Cooperative Admin** | Suresh Kumar | `admin.varanasi@example.com` | Varanasi Central Service Cooperative |
| **Regulator** | Dr. Rajeshwari Nair | `regulator.up@gov.in` | Joint Registrar, Ministry of Cooperation |

---

## License

Developed in accordance with the problem statement guidelines for Smart India Hackathon (SIH26089), Ministry of Cooperation, Government of India.
