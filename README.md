# VOLTERRA

VOLTERRA is a premium athletic e-commerce storefront focused exclusively on compression shirts. The project is a polished, production-minded storefront built with Next.js App Router, TypeScript, Prisma, Stripe-compatible checkout flows, and premium content tailored to a performance apparel brand.

## Project Overview

This storefront sells compression shirts only: no accessories, no separate categories, and no unrelated apparel. The experience is designed to feel like a premium sportswear brand with bold black-and-white styling, a strong accent color, and conversion-focused product marketing.

## Features

- Premium homepage with announcement bar, hero banner, product blocks, reviews, and newsletter
- Shop catalog with men’s and women’s compression shirts, filters, sorting, and responsive mobile drawer
- Product detail pages with gallery, size and color selectors, quantity controls, and size guide
- Functional cart with quantity updating, removal, and order summary
- Search with debounced input and suggestions
- Wishlist support with persistence and quick add to cart
- Account area for profile and order history
- Admin access area for dashboard metrics
- Prisma-backed schema and migration for users, products, variants, orders, reviews, wishlist, and coupons
- Auth.js credentials and GitHub provider routes with hashed password registration
- Server-side checkout validation, variant inventory reservation, coupon validation, and Stripe webhook reconciliation

## Tech Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- Radix/shadcn-inspired UI components
- PostgreSQL
- Prisma ORM
- Auth.js
- Zod and React Hook Form
- Stripe
- Lucide React

## Architecture

- App Router pages for storefront, product, shop, auth, cart, checkout, account, and admin flows
- Shared typed storefront data and utility layer for styling and commerce logic
- Client-side provider for cart, wishlist, and account state persistence
- Prisma schema and migration for inventory, order, review, and coupon data models

## Installation

1. Install dependencies:

```bash
npm install
```

2. Copy the environment file:

```bash
copy .env.example .env.local
```

3. Update the environment variables in `.env.local`.

4. Create a local PostgreSQL database and set `DATABASE_URL`.

5. Generate Prisma client and run migrations:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

6. Seed demo data:

```bash
npx tsx prisma/seed.ts
```

7. Start the app:

```bash
npm run dev
```

## Environment Variables

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/volterra?schema=public"
AUTH_SECRET="replace-with-strong-secret"
NEXTAUTH_URL="http://localhost:3000"
GITHUB_ID=""
GITHUB_SECRET=""
STRIPE_SECRET_KEY=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""
```

## Database Setup

Create a PostgreSQL database and point the `DATABASE_URL` value at it.

Prisma commands:

```bash
npx prisma generate
npx prisma migrate dev
npx prisma studio
```

The initial migration is stored in `prisma/migrations/`. Set `DATABASE_URL` before running Prisma commands.

## Seed Command

```bash
npx tsx prisma/seed.ts
```

## Stripe Setup

- Add real Stripe keys in `.env.local` for live test-mode checkout.
- Checkout refuses to create orders until Stripe test keys are configured.
- Configure the webhook endpoint at `/api/stripe/webhook` for payment confirmation.

## Current Integration Notes

Product browsing remains backed by curated storefront data while the database seed provides the server-side catalog used by checkout. Account order history, admin CRUD, and purchased-product reviews remain the next database-backed UI surfaces to connect.

## Deployment Instructions

Deploy to Vercel or a production hosting provider with a managed PostgreSQL instance and configured environment variables.

## Notes

This storefront intentionally focuses only on compression shirts and related performance categories, keeping the catalog limited to the premium sportswear brand experience described in the brief.
