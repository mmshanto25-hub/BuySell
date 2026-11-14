# Premium Enterprise Multi-Vendor E-Commerce Marketplace

An enterprise-grade, high-performance, multi-vendor e-commerce marketplace built with Next.js App Router, Express.js Modular Monolith, TypeScript, Tailwind CSS, MongoDB, Redis, and Turborepo.

---

## 1. Monorepo Architecture Overview

```
marketplace/
├── apps/
│   ├── storefront/             # Customer Storefront (Next.js App Router, Port 3000)
│   ├── seller-dashboard/       # Seller Operations Portal (Next.js, Port 3001)
│   ├── admin-dashboard/        # Platform Governance Command Center (Next.js, Port 3002)
│   └── api/                    # Backend Modular Monolith REST API (Express, Port 5000)
│
├── packages/
│   ├── ui/                     # Shared UI Components (shadcn/ui + Tailwind primitives)
│   ├── types/                  # Single-source-of-truth TypeScript domain models
│   ├── validators/             # Shared Zod validation schemas
│   ├── utils/                  # Currency formatting, slugifiers, double-entry ledger math
│   └── config/                 # Centralized Tailwind, PostCSS, and TSConfig base files
│
└── docs/                       # Authoritative System Architecture & Specifications
    ├── PROJECT-ANALYSIS.md     # Business economics & split-order paradigm
    ├── SRS.md                  # IEEE 830 Software Requirements Specification
    ├── ARCHITECTURE.md         # Modular monolith architecture & concurrency locks
    ├── DATABASE.md             # Mongoose schemas, compound indexes & Mermaid ERD
    ├── API.md                  # RESTful /api/v1 contracts & payload samples
    ├── DESIGN-SYSTEM.md        # Tokens, typography & 108 screen inventory
    └── DEVELOPMENT-ROADMAP.md  # 20-week phased implementation plan
```

---

## 2. Ports & Application Directory

| Application / Package | Technology | Port / Scope | Description |
| :--- | :--- | :--- | :--- |
| **`apps/storefront`** | Next.js 14, Tailwind CSS | `http://localhost:3000` | Customer portal: Homepage, catalog, multi-vendor cart, split checkout. |
| **`apps/seller-dashboard`** | Next.js 14, Tailwind CSS | `http://localhost:3001` | Seller portal: KYC, catalog CRUD, multi-variant inventory, sub-orders, wallet. |
| **`apps/admin-dashboard`** | Next.js 14, Tailwind CSS | `http://localhost:3002` | Admin portal: Executive KPIs, KYC review, product moderation, global orders, payouts. |
| **`apps/api`** | Express.js, TypeScript | `http://localhost:5000/api/v1` | Core REST API: Auth, catalog, split-orders, double-entry financial ledger. |
| **`packages/ui`** | React, Tailwind, Lucide | `@marketplace/ui` | Shared component design system. |
| **`packages/types`** | TypeScript Strict | `@marketplace/types` | Unified domain models, enums, DTOs, and API envelopes. |
| **`packages/validators`**| Zod | `@marketplace/validators`| Runtime input validation schemas. |
| **`packages/utils`** | TypeScript | `@marketplace/utils` | Currency formatting, slugifiers, and ledger invariant validators. |

---

## 3. Core Architectural Safeguards

1. **Multi-Vendor Split Orders**:
   - Single unified customer checkout atomically splits into 1 Parent Order and $N$ independent Seller Sub-Orders.
   - Vendors fulfill only their assigned sub-orders with dedicated courier consignments (Pathao, Steadfast).
2. **GAAP Double-Entry Financial Ledger**:
   - Balances are derived from immutable debit/credit journal entries (`ledgerEntries`).
   - 7-day post-delivery escrow hold period on vendor earnings before clearance into available balances.
3. **High-Concurrency Stock Reservation**:
   - Prevents overselling using atomic conditional database decrements:
     $$\text{Total Stock} = \text{Available Stock} + \text{Reserved Stock} + \text{Sold Stock}$$
   - 15-minute BullMQ stock expiration automatically releases abandoned checkout reservations.
4. **Zero-Trust Security**:
   - 15-minute JWT access tokens + HTTP-only rotating refresh tokens with token family reuse breach detection.
   - Cryptographic HMAC signature verification and idempotency keys on payment webhooks (bKash, SSLCommerz, Stripe).

---

## 4. Getting Started

### Prerequisites
- Node.js `v20.x` or higher (verified on `v24.18.0`)
- pnpm `v9.x`

### Setup & Run
```bash
# 1. Clone repository
git clone <repo-url>
cd E-Commerce

# 2. Configure environment variables
cp .env.example .env

# 3. Install workspace dependencies
pnpm install

# 4. Start all applications in development mode
pnpm dev
```
