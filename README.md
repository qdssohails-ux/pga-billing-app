# PGA Billing, Inventory & Stock Inquiry System

A single-codebase, responsive Next.js App Router PWA for inventory inquiry and POS billing.

## Stack
- Next.js App Router + React 19
- Tailwind CSS
- Prisma ORM + PostgreSQL (Neon/Supabase compatible)
- Vercel deployment
- PWA manifest + service worker
- Responsive desktop/mobile POS

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` from `.env.example` and add your PostgreSQL URL.

3. Create/update tables:
```bash
npx prisma db push
```

4. Seed sample products:
```bash
npm run db:seed
```

5. Start:
```bash
npm run dev
```

Open `http://localhost:3000`.

## Production on Vercel
- Import the project into Vercel.
- Add `DATABASE_URL` in Project Settings → Environment Variables.
- Build command: `npm run build`.
- The app uses serverless Route Handlers for products, stock updates, and invoices.

## Notes
- The UI polls inventory every 5 seconds so stock changes propagate without page reloads. This is intentionally provider-neutral and works with both Neon and Supabase PostgreSQL.
- Cash, Card and UPI / Mobile Wallet are captured as payment methods. Payment gateway processing is not included.
- Browser camera barcode scanning uses `BarcodeDetector` where supported, with a manual SKU/barcode input fallback.
- Thermal receipt CSS targets 58mm (2-inch) and 80mm (3-inch) paper by using a compact receipt layout and CSS print media.

## Database
Prisma schema is in `prisma/schema.prisma`. The schema uses PostgreSQL types only and is compatible with Neon and Supabase-hosted Postgres.
