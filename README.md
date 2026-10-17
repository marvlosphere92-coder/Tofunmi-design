# Tofunmi Design

Bespoke fashion ordering site: public lookbook, custom order requests with
dual-source measurements and material pricing, capacity/waitlist control,
and an admin dashboard for orders, designs, and photo uploads.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **Supabase** — Postgres + Auth + RLS (schema in `supabase/schema.sql`)
- **Cloudinary** — image hosting and admin photo uploads
- **Resend** — transactional email
- **Framer Motion** — scroll/hover animations

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in real values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying

Connected to Vercel for automatic deploys on push to `main`. Environment
variables are managed in the Vercel project settings, mirrored from
`.env.example`.
