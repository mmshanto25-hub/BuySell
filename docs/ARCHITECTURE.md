# System Architecture Specification
## Enterprise Multi-Vendor E-Commerce Marketplace
**Document Version:** 1.0.0  
**Status:** Approved Architectural Blueprint  
**Architecture Pattern:** Modular Monolith within a Turborepo Monorepo  

---

## 1. Architectural Philosophy & Principles

The system architecture is engineered to balance rapid initial velocity with enterprise operational resilience, financial correctness, and long-term modularity.

```
+---------------------------------------------------------------------------------------+
|                                    C4 LEVEL 1: SYSTEM CONTEXT                         |
+---------------------------------------------------------------------------------------+
|                                                                                       |
|   +---------------+      +---------------+      +------------------+                  |
|   |   Customers   |      |    Sellers    |      | Admins & Staff   |                  |
|   +-------+-------+      +-------+-------+      +--------+---------+                  |
|           │                      │                       │                            |
|           ▼                      ▼                       ▼                            |
|   +---------------+      +---------------+      +------------------+                  |
|   |  Storefront   |      |Seller Dashboard|     | Admin Dashboard  |                  |
|   |  (apps/       |      |  (apps/seller- |     |  (apps/admin-    |                  |
|   |   storefront) |      |   dashboard)   |     |   dashboard)     |                  |
|   +-------+-------+      +-------+-------+      +--------+---------+                  |
|           │                      │                       │                            |
|           └──────────────────────┼───────────────────────┘                            |
|                                  │ HTTPS (REST /api/v1) & WSS                         |
|                                  ▼                                                    |
|                 +-----------------------------------+                                 |
|                 |    BACKEND CORE REST API          |                                 |
|                 |    (apps/api - Modular Monolith)  |                                 |
|                 +-----------------+-----------------+                                 |
|                                   │                                                   |
|             ┌─────────────────────┼─────────────────────┐                             |
|             │ (ACID Transactions) │ (Events & Queues)   │ (SDKs & Webhooks)           |
|             ▼                     ▼                     ▼                             |
|   +-------------------+ +-------------------+ +-------------------+                   |
|   |  MongoDB Cluster  | |  Redis + BullMQ   | | External Services |                   |
|   |  - Primary DB     | |  - Caching & Locks| | - bKash / SSLCom  |                   |
|   |  - Catalog, Orders| |  - apps/worker    | | - Pathao Courier  |                   |
|   |  - Double Ledger  | |  - Pub/Sub Events | | - Cloudinary CDN  |                   |
|   +-------------------+ +-------------------+ +-------------------+                   |
|                                                                                       |
+---------------------------------------------------------------------------------------+
```

### Core Architectural Principles
1. **Modular Monolith First**: All domain logic lives within a single deployable backend codebase (`apps/api`) organized with strict modular boundaries. Modules communicate via direct service interfaces and in-process domain events, preserving the option to extract specific domains into independent microservices (e.g., Payment, Inventory, or AI services) without refactoring domain logic.
2. **Server-Authoritative Business Logic**: The client is considered an untrusted presentation layer. All calculations—including product prices, promotional discounts, tiered commissions, shipping charges, and inventory allocations—are strictly calculated and validated on the backend.
3. **Financial Invariance & Auditability**: Financial transactions are governed by an append-only, double-entry ledger. No balance is ever mutated directly; every wallet balance represents the materialized projection of immutable credit and debit journal entries.
4. **Strong Concurrency Safeguards**: High-demand sales events are protected against overselling through atomic MongoDB conditional operations, short-lived Redis distributed locks, and automated queue-driven stock reservation expiries.
5. **Decoupled Asynchronous Processing**: Time-consuming and I/O-intensive workloads (email delivery, image processing, carrier booking, vector embeddings, and escrow releases) are offloaded to an asynchronous background worker service (`apps/worker`) powered by BullMQ and Redis.

---

## 2. Monorepo Organization & Package Boundaries

The project utilizes **Turborepo** and **pnpm workspaces** to maximize code reuse, ensure single-source-of-truth type safety, and enforce zero duplication.

```
marketplace/
├── apps/
│   ├── storefront/                 # Customer-facing shopping application (Next.js App Router)
│   ├── seller-dashboard/           # Vendor store & order management application (Next.js / Vite SPA)
│   ├── admin-dashboard/            # Platform governance, moderation & finance portal (Next.js / Vite SPA)
│   ├── api/                        # Node.js + Express.js TypeScript REST API
│   └── worker/                     # BullMQ + Redis background worker daemon
│
├── packages/
│   ├── ui/                         # Shared UI Design System (shadcn/ui + Tailwind primitives)
│   ├── types/                      # Shared TypeScript domain models, DTOs, Enums, and API contracts
│   ├── validators/                 # Shared Zod validation schemas for forms and API payloads
│   ├── utils/                      # Common helpers (currency formatting, date math, slug generation)
│   ├── config/                     # Centralized configuration (Tailwind, PostCSS, TSConfig base)
│   └── eslint-config/              # Shared static analysis rules
│
├── docs/                           # Authoritative system documentation
├── scripts/                        # Database seeding, migrations, and developer utilities
├── package.json                    # Workspace root scripts & tooling
├── pnpm-workspace.yaml             # Workspace definitions
└── turbo.json                      # Turborepo task pipeline & cache declarations
```

### Dependency Flow Rules
- `apps/*` may depend on any `packages/*`.
- `packages/*` must **never** depend on any `apps/*`.
- `packages/validators` depends on `packages/types`.
- `packages/ui` depends on `packages/utils` and `packages/config`.
- Circular dependencies between packages or apps are strictly rejected by CI linting.

---

## 3. Backend Architecture & Modular Monolith Design

`apps/api` follows a layered, domain-centric architecture. Each domain module encapsulates its own routes, validation schemas, controllers, business services, and database models.

```
apps/api/src/
├── app.ts                          # Express server bootstrap & middleware pipeline
├── server.ts                       # HTTP listener & graceful shutdown handlers
│
├── common/                         # Cross-cutting foundational modules
│   ├── middleware/                 # Auth, RBAC, RateLimit, ErrorHandler, RequestLogger
│   ├── errors/                     # AppError, BadRequestError, UnauthorizedError, NotFoundError
│   ├── events/                     # In-memory EventEmitter / Redis Event Bus
│   ├── database/                   # Mongoose connection & transaction wrappers
│   └── redis/                      # Redis client & distributed lock utilities
│
└── modules/                        # Bounded Context Domain Modules
    ├── auth/                       # Registration, Login, Token Refresh, 2FA, OAuth
    ├── users/                      # User profiles, address book, permission assignments
    ├── sellers/                    # Seller profiles, KYC verification, store customization
    ├── catalog/                    # Categories, brands, attributes, products, variants
    ├── inventory/                  # Stock movements, atomic reservations, threshold alerts
    ├── cart/                       # Guest & customer multi-vendor carts
    ├── checkout/                   # Pre-checkout validation, shipping & tax calculation
    ├── orders/                     # Parent orders, sub-orders, state machine transitions
    ├── payments/                   # Gateway integrations, webhook handlers, verification
    ├── finance/                    # Ledger entries, seller wallets, settlement batches
    ├── logistics/                  # Courier integrations (Pathao, Steadfast, RedX), consignments
    ├── returns/                    # Return requests, dispute arbitration, inspection, refunds
    ├── reviews/                    # Verified buyer ratings, review moderation
    ├── notifications/              # Real-time WebSocket alerts, transactional emails
    ├── ai/                         # Vector embeddings, semantic search, catalog auto-tagger
    └── audit/                      # Immutable administrative activity logging
```

### Standard Module Internal Layering
Every module adheres to the four-tier architectural pattern:
1. **Route Layer (`*.routes.ts`)**: Defines REST endpoints, applies rate-limiters, mounts authentication/RBAC middleware, and binds Zod schema validators.
2. **Controller Layer (`*.controller.ts`)**: Extracts parameters (`req.params`, `req.query`, `req.body`), invokes the corresponding domain service, and formats standard HTTP responses. Contains **zero business logic**.
3. **Service Layer (`*.service.ts`)**: Implements pure business logic, coordinates multi-document ACID transactions, enforces business invariants, and dispatches domain events.
4. **Repository / Model Layer (`*.model.ts`)**: Defines Mongoose schemas, compound indexes, virtuals, and custom query helpers.

---

## 4. Multi-Vendor Order Processing & Concurrency Flow

The diagram below illustrates the exact end-to-end execution flow during a multi-vendor checkout.

```
Customer                apps/api                 MongoDB               Redis/BullMQ          Payment Gateway
   │                       │                        │                        │                      │
   │ 1. POST /checkout     │                        │                        │                      │
   ├──────────────────────►│                        │                        │                      │
   │                       │ 2. Validate Items,     │                        │                      │
   │                       │    Sellers, Discounts  │                        │                      │
   │                       │ 3. Start Session & Txn │                        │                      │
   │                       │───────────────────────►│                        │                      │
   │                       │ 4. Atomic Stock Res.   │                        │                      │
   │                       │    (available -> res.) │                        │                      │
   │                       │───────────────────────►│                        │                      │
   │                       │ 5. Create Parent Order │                        │                      │
   │                       │    & N Sub-Orders      │                        │                      │
   │                       │    (Status: PENDING)   │                        │                      │
   │                       │───────────────────────►│                        │                      │
   │                       │ 6. Commit Transaction  │                        │                      │
   │                       │───────────────────────►│                        │                      │
   │                       │ 7. Schedule Expiry Job │                        │                      │
   │                       │    (15 min delay)      │                        │                      │
   │                       │────────────────────────────────────────────────►│                      │
   │                       │ 8. Init Gateway Txn    │                        │                      │
   │                       │───────────────────────────────────────────────────────────────────────►│
   │ 9. Return RedirectURL │                        │                        │                      │
   │◄──────────────────────│                        │                        │                      │
   │                       │                        │                        │                      │
   │                       │                        │   10. Webhook Received (HMAC Verified)        │
   │                       │◄───────────────────────────────────────────────────────────────────────│
   │                       │ 11. Idempotency Check  │                        │                      │
   │                       │───────────────────────►│                        │                      │
   │                       │ 12. Cancel Expiry Job  │                        │                      │
   │                       │────────────────────────────────────────────────►│                      │
   │                       │ 13. Transition Orders: │                        │                      │
   │                       │     Parent -> PAID     │                        │                      │
   │                       │     SubOrders->CONFIRMED                        │                      │
   │                       │     Res. -> Sold Stock │                        │                      │
   │                       │     Credit Escrow      │                        │                      │
   │                       │───────────────────────►│                        │                      │
   │                       │ 14. Dispatch Events:   │                        │                      │
   │                       │     - Notify Sellers   │                        │                      │
   │                       │     - Send Email Receipt                        │                      │
   │                       │────────────────────────────────────────────────►│                      │
   │                       │ 15. Return 200 OK      │                        │                      │
   │                       │───────────────────────────────────────────────────────────────────────►│
```

---

## 5. Double-Entry Financial Ledger Architecture

To eliminate rounding errors, untraceable balance mutations, or platform discrepancies, all financial transactions are executed through an **immutable double-entry ledger** modeled after GAAP (Generally Accepted Accounting Principles).

### Chart of Accounts

| Account Code | Account Name | Type | Normal Balance | Description |
| :--- | :--- | :--- | :--- | :--- |
| `1010` | **Gateway Clearing (bKash/SSLCom)** | Asset | Debit | Funds received by payment gateway, pending bank settlement. |
| `1020` | **Platform Operational Bank** | Asset | Debit | Liquid platform funds in primary bank account. |
| `2010` | **Seller Escrow Holding** | Liability | Credit | Vendor funds held in escrow during fulfillment and return window. |
| `2020` | **Seller Available Balance** | Liability | Credit | Cleared vendor earnings eligible for withdrawal. |
| `4010` | **Marketplace Commission Revenue** | Revenue | Credit | Realized platform transaction fees and commissions. |
| `5010` | **Gateway Processing Fees** | Expense | Debit | Fees charged by payment processors (e.g., 1.5% - 2.5%). |

### Transaction Journaling Examples

#### Event A: Customer Completes ৳5,000 Multi-Vendor Order (Platform Commission: ৳500, Gateway Fee: ৳75)
```
Debit:  1010 - Gateway Clearing             ৳4,925.00
Debit:  5010 - Gateway Processing Fees         ৳75.00
Credit: 2010 - Seller Escrow Holding (Vendor A)        ৳1,800.00
Credit: 2010 - Seller Escrow Holding (Vendor B)        ৳1,350.00
Credit: 2010 - Seller Escrow Holding (Vendor C)        ৳1,350.00
Credit: 4010 - Marketplace Commission Revenue            ৳500.00
                                            ─────────  ─────────
Totals:                                     ৳5,000.00  ৳5,000.00 (Balanced)
```

#### Event B: Sub-Order A Delivered & 7-Day Return Window Expires (Escrow Released)
```
Debit:  2010 - Seller Escrow Holding (Vendor A)        ৳1,800.00
Credit: 2020 - Seller Available Balance (Vendor A)      ৳1,800.00
                                            ─────────  ─────────
Totals:                                     ৳1,800.00  ৳1,800.00 (Balanced)
```

#### Event C: Vendor A Payout of ৳1,800 Approved and Disbursed via Bank Transfer
```
Debit:  2020 - Seller Available Balance (Vendor A)      ৳1,800.00
Credit: 1020 - Platform Operational Bank                ৳1,800.00
                                            ─────────  ─────────
Totals:                                     ৳1,800.00  ৳1,800.00 (Balanced)
```

**Invariant:** $\sum \text{Debits} \equiv \sum \text{Credits}$ across all journal entries at all times.

---

## 6. Authentication, Security & RBAC Guard Architecture

```
                  [Incoming HTTP Request]
                             │
                             ▼
               [Helmet & CORS Middleware]
                             │
                             ▼
              [Rate Limiting (Redis Bucket)]
                             │
                             ▼
             [Authentication Middleware (AuthGuard)]
             - Read JWT from Authorization Bearer header
             - Verify signature via RS256/HS256
             - Check Redis Revocation List (Blacklist)
                             │
                      ┌──────┴──────┐
                  [Valid]        [Invalid / Expired]
                      │                     │
                      ▼                     ▼
             [Attach req.user]     [Return 401 Unauthorized]
                      │
                      ▼
             [RBAC Authorization Middleware (RequirePermission)]
             - Evaluate user.role & granular permissions
             - Verify Tenant Isolation (storeId guard)
                      │
                      ├─────────────────────────────────────────┐
                  [Permitted]                               [Denied]
                      │                                         │
                      ▼                                         ▼
            [Zod Schema Validator]                   [Return 403 Forbidden]
                      │
                      ▼
             [Domain Controller]
```

### Token Lifecycle Strategy
- **Access Token**: Stateless JWT, 15-minute lifespan. Contains `{ userId, role, storeId, permissions }`.
- **Refresh Token**: Opaque cryptographically random 64-byte token stored in a `refreshTokens` MongoDB collection and an HTTP-only, `SameSite=Strict` cookie.
- **Refresh Token Rotation (RTR)**: Each use of a refresh token invalidates the token and issues a new pair. If a previously consumed refresh token is presented, the system detects a token reuse breach, immediately revoking the entire token family and invalidating all active sessions for that user.

---

## 7. Data Storage, Caching & Indexing Strategy

### 7.1 MongoDB Replica Set & Indexing Guidelines
- **Transactions**: Multi-document transactions require a minimum 3-node replica set (`primary-secondary-arbiter` or 3 data nodes).
- **Indexing Standards**:
  - `products`: Compound index `{ categoryId: 1, status: 1, price: 1 }` for faceted listing.
  - `products`: Compound index `{ storeId: 1, status: 1, createdAt: -1 }` for seller management.
  - `products`: Text index `{ title: "text", description: "text", tags: "text" }` for full-text search.
  - `orders`: Unique index on `orderNumber`.
  - `subOrders`: Compound index `{ storeId: 1, status: 1, createdAt: -1 }` for vendor fulfillment queues.
  - `inventory`: Unique compound index `{ productId: 1, sku: 1 }`.
  - `ledgerEntries`: Compound index `{ accountCode: 1, createdAt: -1 }`.

### 7.2 Redis Tiering
1. **Session & Security Cache**: Revoked token blacklists, sliding-window rate limit counters, 2FA challenge nonces.
2. **Distributed Locks (Redlock)**: High-concurrency operations (e.g., flash-sale stock reservation, settlement batch processing).
3. **Application Cache**:
   - Category tree hierarchy: TTL 24 hours (invalidated on category update).
   - Homepage featured banners & active campaigns: TTL 1 hour.
   - Public store metadata: TTL 6 hours.
4. **Message Broker**: BullMQ queues for asynchronous jobs.

---

## 8. Asynchronous Worker & Queue Topology (`apps/worker`)

```
   [apps/api] --(Job Dispatch)--> [Redis Broker]
                                         │
         ┌───────────────────────────────┼───────────────────────────────┐
         ▼                               ▼                               ▼
 [stock-reservation-queue]      [notification-queue]            [logistics-queue]
 - Check 15-min order status    - Send email receipts           - Book carrier consignment
 - Revert reserved stock        - Send seller order alerts      - Track package webhook
         │                               │                               │
         └───────────────────────────────┼───────────────────────────────┘
                                         ▼
                             [apps/worker Process]
```

### Registered BullMQ Queues

| Queue Name | Concurrency | Retry Strategy | Description |
| :--- | :--- | :--- | :--- |
| `stock-reservation` | 10 workers | 3 attempts, exponential backoff | Expires uncompleted orders and restores inventory. |
| `email-notifications` | 5 workers | 5 attempts with backoff | Dispatches transactional emails via Resend/SMTP. |
| `logistics-dispatch` | 5 workers | 4 attempts, fixed 30s delay | Books carrier consignments (Pathao/Steadfast) upon `PACKED`. |
| `escrow-release` | 2 workers | 3 attempts | Cron-driven hourly job releasing completed 7-day escrows. |
| `ai-embeddings` | 2 workers | 2 attempts | Computes 1536-dim OpenAI/Gemini embeddings for new/edited products. |

---

## 9. AI & Vector Retrieval Architecture

```
[Product Created / Updated]
            │
            ▼
   [Dispatch ai-embeddings Job]
            │
            ▼
  [apps/worker Pipeline]
  - Concat title + brand + category + description
  - Call Text Embedding API (e.g., text-embedding-3-small)
  - Receive 1536-dimensional floating point vector
            │
            ▼
[Persist Vector in MongoDB productEmbeddings Collection]
            │
            ▼
[Customer Vector Search Query: "Breathable linen shirt for hot weather"]
            │
            ▼
  [Generate Query Vector] -> [MongoDB Atlas Vector Search ($vectorSearch) / Cosine Similarity]
            │
            ▼
[Return Top-K Ranked Semantic Catalog Results]
```

---

## 10. Deployment Topology & Production DevOps Architecture

```
                              [Cloudflare CDN & WAF]
                                        │
                         ┌──────────────┴──────────────┐
                         ▼                             ▼
                 [Vercel Edge]                 [Container Host / AWS ECS]
                 - apps/storefront             - apps/api (Docker)
                 - apps/seller-dashboard       - apps/worker (Docker)
                 - apps/admin-dashboard
                         │                             │
                         └──────────────┬──────────────┘
                                        │
                                        ▼
                 [Managed Data & Third-Party Infrastructure]
                 - MongoDB Atlas (Replica Set M10+)
                 - Upstash / Redis Cloud (Persistence enabled)
                 - Cloudinary CDN (Media assets)
                 - Resend / Twilio (Transactional Messaging)
                 - Sentry (Error Tracking & APM)
```

### Containerization Strategy (`Dockerfile`)
- Multi-stage Docker builds utilizing Alpine Linux base images.
- Pruned workspace dependencies via `turbo prune --scope=api --docker`.
- Non-root execution user (`node`) for security compliance.
- Health-check probes:
  - Liveness probe: `GET /health/liveness` (checks process responsiveness).
  - Readiness probe: `GET /health/readiness` (verifies MongoDB and Redis connections).

---
**Document Sign-Off:** Principal Software Architect, Lead Infrastructure & Database Engineer.
