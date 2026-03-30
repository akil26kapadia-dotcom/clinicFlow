# Workspace

## Overview

Dental Clinic Management System — a full-stack web app for Indian dental clinics. Features patient management, appointment scheduling, treatment catalog, invoicing with GST calculation in ₹, staff management, reports, and a calendar view.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Auth**: express-session + bcryptjs
- **Charts**: Recharts
- **Forms**: react-hook-form + zod

## Default Login

- **Email**: admin@dentalclinic.com
- **Password**: password123

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (auth, patients, appointments, treatments, invoices, staff, dashboard, reports)
│   └── dental-clinic/      # React + Vite frontend (SPA at /)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/
└── package.json
```

## Database Schema

- **users** — clinic admin accounts
- **patients** — patient records
- **appointments** — appointment bookings
- **treatments** — treatment catalog with cost (₹)
- **invoices** — billing/invoices with GST (18%)
- **invoice_items** — line items per invoice
- **staff** — clinic staff

## API Routes

- `POST /api/auth/register` — Register clinic
- `POST /api/auth/login` — Login
- `POST /api/auth/logout` — Logout
- `GET /api/auth/me` — Current user
- `GET/POST /api/patients` — List/Create patients
- `GET/PUT/DELETE /api/patients/:id` — Get/Update/Delete patient
- `GET/POST /api/appointments` — List/Create appointments
- `PUT/DELETE /api/appointments/:id` — Update/Delete appointment
- `GET/POST /api/treatments` — List/Create treatments
- `PUT/DELETE /api/treatments/:id` — Update/Delete treatment
- `GET/POST /api/invoices` — List/Create invoices
- `GET/PUT/DELETE /api/invoices/:id` — Get/Update/Delete invoice
- `GET/POST /api/staff` — List/Create staff
- `PUT/DELETE /api/staff/:id` — Update/Delete staff
- `GET /api/dashboard/stats` — Dashboard statistics
- `GET /api/dashboard/revenue-chart` — Monthly revenue chart
- `GET /api/dashboard/appointments-chart` — Weekly appointments chart
- `GET /api/reports/daily-revenue` — Daily revenue report
- `GET /api/reports/monthly-revenue` — Monthly revenue report
- `GET /api/reports/pending-payments` — Pending payments
- `GET /api/reports/top-treatments` — Top treatments by count
- `GET/PUT /api/settings` — Clinic settings

## Key Features

- Indian currency ₹ everywhere
- GST 18% auto-calculated on invoices
- Auto invoice numbering (INV-001, INV-002...)
- Session-based authentication
- Calendar view of appointments
- PWA-ready (manifest.json)
- Mobile responsive
- Dashboard with charts

## Development

- Push DB schema: `pnpm --filter @workspace/db run push`
- Run codegen: `pnpm --filter @workspace/api-spec run codegen`
- Build API: `pnpm --filter @workspace/api-server run build`
