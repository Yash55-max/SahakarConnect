# UX4G Design System Web UI — SahakarConnect (Ministry of Cooperation)
> Built in pure **HTML5, CSS3, and TypeScript/Vanilla JavaScript** strictly adhering to the official Indian Government **UX4G (v3.1.0)** Design System specifications (`https://doc.ux4g.gov.in/web`). Zero React or external framework lock-in.

---

## 🏛️ Application Architecture & Pages

| Page File | Target User / Persona | Key UX4G Components & Features |
|---|---|---|
| [`index.html`](./index.html) | **Citizen / Consumer** | Service Discovery, Geolocation Category Chips, Real-time Provider Booking Modal, Transparent Revenue Split Visualizer (80/15/5), 4-Stage Journey Stepper Tracker |
| [`provider.html`](./provider.html) | **Cooperative Provider / Gig Worker** | Identity Card with Aadhaar e-KYC Verification, Live Duty Availability Toggle (`ux4g-toggle`), Active Job Pipeline (Accept -> Start -> Complete), Financial & Welfare Passbook |
| [`admin.html`](./admin.html) | **Primary Service Cooperative (PSCS) Admin** | Society Overview KPIs, Provider Onboarding & e-KYC Verification Table, Cryptographic Revenue Split Ledger, Dynamic Commission Split Policy |
| [`governance.html`](./governance.html) | **Democratic Governance & Member Voting** | Democratic Motion Voting Booth (FOR/AGAINST/ABSTAIN), Real-time Quorum & Vote Turnout Bar, AGM Minutes Archive, Motion Submission Form |
| [`regulator.html`](./regulator.html) | **Central/State Registrar & Ministry Auditor** | National & State-level Performance Aggregates, District-wise Fair Gig Compliance Heatmap, Statutory SIH26089 Dossier Export |
| [`login.html`](./login.html) | **Government Single Sign-On (SSO)** | MeriPehchan / DigiLocker e-KYC & Aadhaar OTP Authentication for Citizens, Providers, and Society Admins |
| [`components-reference.html`](./components-reference.html) | **Agents & Developers Guide** | Complete visual and code reference for all UX4G components (Topbar, Emblems, Buttons, Cards, Inputs, Badges, Steppers, Tables, Modals, Toasts) |

---

## 🎨 UX4G Design System Compliance

1. **Accessibility Topbar (`.ux4g-topbar`)**:
   - National Flag of India & Official Link to `india.gov.in`
   - Skip to Main Content focus skip link
   - Dynamic Text Size scaling (A-, Normal, A+)
   - High Contrast Mode toggle (`data-contrast="high"`)
   - Dark Mode toggle (`data-theme="dark"`)
   - Bilingual Switcher (English / हिन्दी)

2. **National Header & Branding (`.ux4g-navbar`)**:
   - Lion Capital of Ashoka (State Emblem of India)
   - Ministry of Cooperation / "सहकार से समृद्धि" official branding
   - Responsive Navigation Links & MeriPehchan SSO actions

3. **Color Tokens & Hierarchy**:
   - Primary Gov Blue: `#003366`
   - India Saffron / Amber: `#E65100`
   - Forest Green (Prosperity & Success): `#1B5E20`
   - Clean High-Legibility Typography (`Plus Jakarta Sans` & `Nunito Sans`)

4. **Zero React Dependency**:
   - Fully interactive local state engine (`assets/js/app.js` and `assets/js/app.ts`)
   - Persistent `localStorage` state management
   - Accessible ARIA attributes and toast feedback system

---

## 🚀 How to Run / Preview

Open any `.html` file directly in a modern web browser, or serve locally:

```bash
# Using Python:
python3 -m http.server 8080 -d ux4g-portal

# Or using Node.js npx serve:
npx serve ux4g-portal
```
