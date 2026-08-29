# SahakarConnect — Agent Build Plan
### Cooperative Gig Services Platform for Household & Community Services (SIH26089, Ministry of Cooperation)

This document is a complete, self-contained brief for a coding agent (e.g. Claude Code) to build a working prototype end to end. Feed this whole file to the agent as the starting instruction.

---

## 0. How to use this document

Give the agent this file plus the instruction: *"Build this application following the plan below, phase by phase. Confirm after each phase before moving to the next."* The agent should treat Section 6 (Build Phases) as its execution order and Sections 3–5 as the spec it must satisfy.

---

## 1. Product Summary

**What it is:** A two-sided marketplace app connecting households with verified local service providers (plumbers, electricians, cleaners, tutors, caregivers, cooks), operated through Primary Service Cooperative Societies (PSCS) instead of a single corporate platform owner. Providers are cooperative members who share in profits and governance.

**Who uses it:**
- **Consumers** — book and pay for services, rate providers.
- **Providers** — accept jobs, track earnings, view cooperative membership/payout status.
- **Cooperative Admins** — onboard/verify providers, set commission splits, manage the welfare fund, run polls.
- **Regulator/Government viewer** — read-only dashboard across cooperatives (state/district aggregates).

**What makes it different from a normal gig app:** a transparent revenue-split ledger (provider / cooperative welfare fund / platform) and a governance layer (voting on commission %, fund usage) visible to members.

---

## 2. Scope for the Hackathon Prototype

Build a **working demo**, not production infrastructure. Prioritize:
1. Consumer can browse services, book a provider, see live job status, pay (mock/sandbox), and rate.
2. Provider can toggle availability, accept/reject a job, complete it, see earnings breakdown.
3. Cooperative Admin can approve provider applications and view the revenue-split ledger.
4. One clear screen showing the cooperative governance angle (payout split, a sample "vote" on commission rate).

**Explicitly out of scope for the prototype** (mention as "future work" in the pitch, do not build):
- Real Aadhaar e-KYC / DigiLocker integration — mock this with a fake verification toggle.
- Real payment gateway settlement — use Razorpay/Stripe **test mode** or a mock payment stub.
- Production-grade security hardening, load testing, multi-region deployment.
- Native mobile builds — a responsive web app (or Expo web preview) is sufficient for demo.

---

## 3. Tech Stack (fixed — do not deviate without reason)

| Layer | Choice | Notes |
|---|---|---|
| Frontend (consumer + provider app) | React + Vite, TypeScript | Single responsive web app with role-based views; avoids native build complexity for a hackathon |
| Frontend (admin/regulator portal) | Same React app, `/admin` route, role-gated | Don't build a separate app |
| UI styling | Tailwind CSS | Fast, consistent |
| Backend | Node.js + Express, TypeScript | REST API |
| Database | PostgreSQL | Relational — users, cooperatives, jobs, ledger all relate cleanly |
| ORM | Prisma | Fast schema iteration, good DX for an agent to generate migrations |
| Auth | JWT (access + refresh token), bcrypt password hashing | Mock OTP/e-KYC step, don't integrate real Aadhaar API |
| Real-time job status | Socket.io | Job status updates (requested → accepted → in-progress → completed) |
| Payments | Stub payment service (interface matching Razorpay's API shape) | Swap-in-ready for real gateway later |
| Maps/location | Static lat/lng fields + simple distance calc (no external Maps API key needed for demo) | Avoids API key setup friction during judging |
| Hosting (if deployed) | Render/Railway (backend + Postgres), Vercel (frontend) | Free tiers sufficient for a demo |

---

## 4. Data Model

Design as a Prisma schema. Core entities:

```
User
  id, name, email, phone, passwordHash, role [CONSUMER|PROVIDER|COOP_ADMIN|REGULATOR], createdAt

Cooperative (PSCS)
  id, name, district, state, commissionRatePercent, welfareFundBalance, createdAt

ProviderProfile
  id, userId -> User, cooperativeId -> Cooperative, skills[], verified (bool),
  verificationStatus [PENDING|VERIFIED|REJECTED], rating (avg), available (bool),
  lat, lng

ServiceCategory
  id, name (e.g. "Plumbing", "Electrical", "Cleaning", "Tutoring", "Elder Care")

ServiceListing
  id, categoryId -> ServiceCategory, providerId -> ProviderProfile, title, basePrice, description

Booking
  id, consumerId -> User, providerId -> ProviderProfile, listingId -> ServiceListing,
  status [REQUESTED|ACCEPTED|IN_PROGRESS|COMPLETED|CANCELLED],
  scheduledAt, totalAmount, createdAt, completedAt

PaymentLedgerEntry
  id, bookingId -> Booking, totalAmount,
  providerShare, cooperativeFundShare, platformShare,
  status [PENDING|SETTLED], createdAt

Rating
  id, bookingId -> Booking, consumerId -> User, providerId -> ProviderProfile,
  stars (1-5), comment, createdAt

GovernancePoll  (the differentiator feature)
  id, cooperativeId -> Cooperative, question, options[jsonb], status [OPEN|CLOSED], createdAt

PollVote
  id, pollId -> GovernancePoll, providerId -> ProviderProfile, choice, createdAt

GrievanceTicket
  id, raisedBy -> User, bookingId -> Booking (nullable), description,
  status [OPEN|IN_REVIEW|RESOLVED], createdAt
```

Ask the agent to generate the actual `schema.prisma` from this and run a migration + seed script with realistic dummy data (at least 2 cooperatives, 10 providers, 15 bookings, a few completed with ratings).

---

## 5. API Surface (REST)

Group by resource; agent should implement with Express routers + Prisma.

```
Auth
  POST   /api/auth/register        { name, email, phone, password, role }
  POST   /api/auth/login           { email, password } -> { accessToken, refreshToken }
  POST   /api/auth/refresh

Consumers
  GET    /api/services                     list categories + listings (filter by category, location)
  POST   /api/bookings                     create a booking request
  GET    /api/bookings/:id                 booking detail + live status
  GET    /api/bookings/my                  consumer's booking history
  POST   /api/bookings/:id/rate            submit rating after completion
  POST   /api/grievances                   file a complaint

Providers
  GET    /api/providers/me                 own profile
  PATCH  /api/providers/me/availability     toggle available
  GET    /api/providers/me/jobs             incoming job requests
  PATCH  /api/providers/jobs/:id/accept
  PATCH  /api/providers/jobs/:id/reject
  PATCH  /api/providers/jobs/:id/complete
  GET    /api/providers/me/earnings         ledger entries for this provider

Cooperative Admin
  GET    /api/coop/:id/providers            list + verification status
  PATCH  /api/coop/providers/:id/verify     approve/reject a provider application
  GET    /api/coop/:id/ledger               full revenue-split ledger for the cooperative
  GET    /api/coop/:id/welfare-fund         fund balance + disbursement history
  POST   /api/coop/:id/polls                create a governance poll
  GET    /api/coop/:id/polls/:pollId/results

Regulator (read-only)
  GET    /api/regulator/overview            aggregate stats across all cooperatives
  GET    /api/regulator/cooperatives/:id    drill-down into one cooperative
```

Real-time (Socket.io events): `booking:statusChanged`, `booking:newRequest` (pushed to the matched provider).

---

## 6. Build Phases (agent execution order)

**Phase 0 — Scaffolding**
- Initialize a monorepo: `/backend` (Express + TS + Prisma), `/frontend` (Vite + React + TS + Tailwind).
- Set up `.env.example` files, `docker-compose.yml` for local Postgres, basic README with run instructions.
- Confirm the project boots (`npm run dev` on both) before continuing.

**Phase 1 — Data layer**
- Write `schema.prisma` per Section 4.
- Run migration, write `seed.ts` with realistic dummy data.
- Confirm seeded data is queryable via Prisma Studio or a quick script.

**Phase 2 — Auth**
- Implement register/login/refresh with JWT + bcrypt.
- Role-based middleware (`requireRole([...])`).
- Confirm with a quick script/Postman-style test hitting each auth endpoint.

**Phase 3 — Consumer flow**
- Service browsing, booking creation, booking status polling/socket updates, rating submission.
- Frontend: consumer screens (browse → book → track → rate).

**Phase 4 — Provider flow**
- Availability toggle, job accept/reject/complete, earnings view.
- Frontend: provider screens (job inbox, active job, earnings dashboard).

**Phase 5 — Cooperative Admin + governance (the differentiator — do not skip or leave for "later")**
- Provider verification queue, ledger view, welfare fund view, poll creation + voting.
- Frontend: admin dashboard with the revenue-split visualization (this is the key pitch visual).

**Phase 6 — Regulator dashboard**
- Aggregate read-only stats view. Keep simple — a few cards + a table are enough.

**Phase 7 — Payments stub**
- Implement a `PaymentService` interface with a mock adapter that simulates a successful charge and immediately writes a `PaymentLedgerEntry` with the split calculated from the cooperative's `commissionRatePercent`.

**Phase 8 — Polish for demo**
- Seed a convincing demo script's worth of data (so the judges see populated dashboards, not empty states).
- Add basic loading/error states.
- Write a 1-page `DEMO_SCRIPT.md`: exact click-path to show each judge-relevant feature in under 3 minutes.

At each phase boundary, the agent should run the app, verify the new functionality manually, and report back before proceeding — don't let it silently chain all phases without checkpoints.

---

## 7. Non-Functional Requirements (light-touch for hackathon, but state them)

- **Security:** hash passwords, never log secrets, use parameterized queries (Prisma handles this), validate all inputs server-side (e.g. with `zod`).
- **Performance:** not a concern at demo scale; no need for caching/load-balancing.
- **Accessibility:** basic semantic HTML, sufficient color contrast — no full WCAG audit needed for a hackathon build.
- **Code quality:** TypeScript strict mode, ESLint + Prettier configured, meaningful commit messages so the repo history itself tells a story to judges who check it.

---

## 8. Deliverables Checklist

- [ ] Working repo (frontend + backend + seed data) that runs with documented setup steps
- [ ] `DEMO_SCRIPT.md` — exact walkthrough for judges
- [ ] `README.md` — architecture summary, tech stack, how to run locally
- [ ] Short architecture diagram (can be generated separately, not by the coding agent)
- [ ] Deployed demo link (optional but strongly recommended — Render/Vercel free tier)

---

## 9. Prompt to Hand to the Coding Agent

> "Build SahakarConnect following the attached plan. Start with Phase 0 (scaffolding) only, show me the result, then wait for my go-ahead before each subsequent phase. Use the exact tech stack and data model specified. Flag any ambiguity in the spec instead of guessing silently."
