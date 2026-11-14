# Enterprise Multi-Vendor E-Commerce Marketplace
## Comprehensive Project & Domain Analysis (Step 2)

---

## 1. Executive Summary & Project Purpose

The objective of this project is to build an enterprise-grade, high-performance, multi-vendor e-commerce marketplace comparable in operational reliability, functional depth, and architectural robustness to leading global and regional platforms (e.g., Amazon, Daraz, Shopify Marketplace).

The platform serves three distinct user classes:
1. **Customers (Buyers)**: Discover products across multiple vendors, manage a single consolidated cart, execute split multi-vendor checkouts, track independent sub-orders, initiate returns, and communicate with sellers and platform support.
2. **Sellers (Vendors)**: Complete verified business onboarding (KYC), configure custom storefronts, manage deep hierarchical product catalogs with multi-dimensional variants, monitor live inventory movements, fulfill assigned sub-orders, and reconcile transparent financial ledgers and settlement payouts.
3. **Platform Administrators & Staff**: Moderate products and stores, manage global catalog taxonomy, arbitrate disputes, audit operational and financial transactions, configure dynamic commission policies, oversee automated and manual payouts, and analyze cross-marketplace KPIs.

The system is architected as a **Modular Monolith** organized in a **pnpm + Turborepo Monorepo**, sharing contracts, types, validators, and UI components across three distinct frontend applications and a decoupled Node.js/Express REST API backend supported by an asynchronous Redis/BullMQ worker service.

---

## 2. Business Model & Financial Engineering Analysis

### 2.1 Multi-Vendor Order Economics & The Split Order Paradigm
In a traditional single-vendor e-commerce store, a checkout creates a single order document. In this multi-vendor marketplace, a single customer cart frequently contains products from $N$ independent sellers.

```
+-----------------------------------------------------------------------------------+
|                           CUSTOMER CART (Consolidated)                            |
|  - Item 1: Seller A (৳2,000)                                                      |
|  - Item 2: Seller B (৳1,500)                                                      |
|  - Item 3: Seller C (৳1,500)                                                      |
+-----------------------------------------------------------------------------------+
                                          │
                                          ▼ Checkout & Payment Authorization
+-----------------------------------------------------------------------------------+
|                        PARENT ORDER (Unified Order Entity)                         |
|  Total: ৳5,000 + Shipping (৳60 + ৳60 + ৳60 = ৳180) = ৳5,180                       |
|  Status: PAID / PROCESSING                                                        |
+-----------------------------------------┬-----------------------------------------+
                                          │
               ┌──────────────────────────┼──────────────────────────┐
               ▼                          ▼                          ▼
+──────────────────────────+ +──────────────────────────+ +──────────────────────────+
|  SUB-ORDER 1 (Seller A)  | |  SUB-ORDER 2 (Seller B)  | |  SUB-ORDER 3 (Seller C)  |
|  - Items: Item 1         | |  - Items: Item 2         | |  - Items: Item 3         |
|  - Subtotal: ৳2,000      | |  - Subtotal: ৳1,500      | |  - Subtotal: ৳1,500      |
|  - Shipping: ৳60         | |  - Shipping: ৳60         | |  - Shipping: ৳60         |
|  - Commission (10%): ৳200| |  - Commission (8%): ৳120 | |  - Commission (12%): ৳180|
|  - Vendor Gross: ৳1,860  | |  - Vendor Gross: ৳1,440  | |  - Vendor Gross: ৳1,380  |
|  - State: PENDING_PICKUP | |  - State: PROCESSING     | |  - State: SHIPPED        |
|  - Carrier: Pathao       | |  - Carrier: Steadfast    | |  - Carrier: Self-Delivery|
+──────────────────────────+ +──────────────────────────+ +──────────────────────────+
```

#### Core Business Rules:
1. **Isolated Lifecycle**: Each sub-order maintains an independent fulfillment state machine (`PENDING`, `CONFIRMED`, `PACKED`, `SHIPPED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`, `RETURNED`). One seller delay does not block another seller's fulfillment.
2. **Shipping Segregation**: Shipping fees are calculated per vendor based on origin warehouse location, destination delivery zone, and package weight/volume.
3. **Coupon Allocation**: Marketplace-wide platform vouchers are proportionally distributed across sub-orders or absorbed by the platform marketing budget, while seller-specific store vouchers apply strictly to the issuing vendor's items.

---

### 2.2 Marketplace Revenue & Commission Architecture
Revenue calculation must be deterministic, auditable, and snapshot-based.

```
Gross Merchandise Value (GMV) = Σ (Item Price × Quantity) + Shipping Fees + Taxes
Platform Gross Revenue       = Σ (Marketplace Commissions) + Platform Service Fees
Seller Net Payable           = Sub-Order Subtotal - Commission - Gateway Deduction + Seller Shipping (if self-fulfilled)
```

#### Commission Hierarchy Resolution:
When an order item is processed, the commission rate is resolved using the following priority order:
1. **Seller Contract Override**: Negotiated promotional or enterprise rate for a specific vendor.
2. **Category-Specific Commission**: Rule defined on the lowest child category (e.g., Electronics: 8%, Fashion: 15%, Groceries: 4%).
3. **Global Platform Default Commission**: Fallback percentage (e.g., 10%) defined in system settings.

#### Financial Snapshot Guarantee:
*The exact commission percentage, fixed fee, and calculated monetary amount are permanently snapshotted into the `orderItems` and `subOrders` records at the instant of order placement. Subsequent updates to global commission rules never mutate historical financial records.*

---

### 2.3 Double-Entry Financial Ledger & Escrow Settlement Model
To guarantee zero financial drift, balances are governed by an immutable double-entry ledger rather than simple increment/decrement operations on a single record.

#### Seller Balance States:
- **Pending Escrow Balance**: Funds held while the sub-order is in transit or within the active customer return window (e.g., 7 days post-delivery).
- **Available / Settled Balance**: Funds cleared post-return window, eligible for withdrawal or payout request.
- **Processing Payout Balance**: Funds currently locked in an active payout batch.
- **Disputed / Reserve Balance**: Funds temporarily frozen pending dispute resolution.

```
[Customer Payment Verified] 
        │
        ▼
Credit: Platform Escrow Clearing Account (Asset)
Credit: Seller Wallet - Pending Escrow (Liability to Vendor)
Credit: Platform Unrealized Revenue (Platform Commission)
        │
        ▼ (Sub-Order Marked DELIVERED + Return Window Expired: e.g. 7 Days)
Debit:  Seller Wallet - Pending Escrow
Credit: Seller Wallet - Available Balance
Credit: Platform Realized Revenue
        │
        ▼ (Seller Requests Settlement Payout -> Finance Manager Approves)
Debit:  Seller Wallet - Available Balance
Debit:  Platform Bank/MFS Account (Cash Outflow)
Credit: Settlement Transaction Logged (Reference ID, Bank Txn ID)
```

---

## 3. User Roles, Personas & Access Control (RBAC)

The platform enforces strict Role-Based Access Control at both the API gateway and client routing layers.

| Role | Target Portal | Core Permissions & Scopes | Data Boundary |
| :--- | :--- | :--- | :--- |
| **Super Admin** | Admin Dashboard | Full system configuration, RBAC management, audit log inspection, direct ledger corrections, payment gateway secrets. | Global / Entire Platform |
| **Admin** | Admin Dashboard | User/seller account suspension, vendor verification (KYC), dispute arbitration, banner & CMS publishing. | Global Operations |
| **Product Manager**| Admin Dashboard | Category taxonomy, brand verification, attribute sets, product listing approval & moderation. | Catalog Domain |
| **Order Manager**  | Admin Dashboard | Global parent order tracking, carrier assignment oversight, emergency shipment rerouting. | Orders & Logistics |
| **Finance Manager**| Admin Dashboard | Settlement batch approval, bank transfer reconciliation, commission policy adjustments, tax exports. | Financial Ledger |
| **Support Agent**  | Admin Dashboard | Customer ticket management, review moderation, return authorization support, read-only order lookups. | Customer Support |
| **Seller (Vendor)**| Seller Dashboard| Storefront branding, product CRUD, inventory adjustments, sub-order fulfillment, payout withdrawal requests. | Isolated to own `storeId` & `sellerId` |
| **Customer**       | Storefront / Mobile | Browse catalog, cart management, checkout, personal order history, address book, review submissions, return claims. | Isolated to own `userId` |

---

## 4. System Architecture & Technical Stack Evaluation

### 4.1 Frontend Architecture (Next.js & React 19 Ecosystem)
- **Customer Storefront (`apps/storefront`)**:
  - Implemented using **Next.js App Router** with Server Components (RSC) for lightning-fast initial page loads and high search engine discoverability (dynamic SEO metadata, OpenGraph, JSON-LD schemas).
  - Client components utilized for high-interactivity zones: faceted product filters, dynamic variant selection, flyout carts, and real-time checkout validations.
  - State management: **Zustand** for transient client-side state (cart, active filters, UI modals), **TanStack Query** for cached server-state synchronization (addresses, order tracking, real-time stock).
  - Styling: **Tailwind CSS** + **shadcn/ui** with Radix UI primitives ensuring WCAG 2.1 AA accessibility.
- **Seller & Admin Dashboards (`apps/seller-dashboard`, `apps/admin-dashboard`)**:
  - Single-page application paradigm with rich data tables, bulk action toolbars, faceted server-side pagination, sorting, and inline editing.
  - Interactive charting using **Recharts** for GMV, revenue breakdowns, sales funnels, and inventory velocity.
  - Forms powered by **React Hook Form** + **Zod** schema validation for instantaneous client-side feedback and shared schema parity with backend endpoints.

---

### 4.2 Backend Architecture & Micro-Modular Design
- **API Server (`apps/api`)**:
  - **Node.js + Express.js** configured in a strictly layered Modular Monolith pattern:
    - `routes/`: Route declarations and rate-limiting middleware.
    - `controllers/`: HTTP request/response handling, status codes, parameter parsing.
    - `services/`: Pure business logic, transaction boundaries, calculations, event dispatch.
    - `repositories/` / `models/`: Mongoose schemas, database queries, and indexing.
    - `validators/`: Zod request parsing for `params`, `query`, and `body`.
  - Built to allow clean decoupling into standalone microservices (e.g., Auth Service, Catalog Service, Order/Payment Service) as throughput scales.
- **Worker Service (`apps/worker`)**:
  - Dedicated background process powered by **BullMQ** and **Redis**.
  - Offloads long-running and non-blocking tasks from the HTTP event loop:
    - Stock reservation timeout expiration (15-minute cleanup).
    - Email notifications via Resend/SMTP (order confirmations, password resets).
    - Image compression and WebP transformation pipelines.
    - Search index vectorization and semantic embeddings generation.
    - Daily financial reconciliation and settlement payout batching.

---

### 4.3 Database Architecture (MongoDB + Redis)
- **Primary Data Store**: **MongoDB with Mongoose ODM**.
  - Document model naturally mirrors nested e-commerce concepts: product variant matrices, address snapshots, and localized descriptions.
  - Native multi-document ACID transactions utilized across critical operations: checkout stock deduction, parent-to-sub-order creation, and wallet ledger updates.
  - Compound indexes optimized for query patterns:
    - `{ storeId: 1, status: 1, createdAt: -1 }` on orders.
    - `{ categoryId: 1, status: 1, price: 1 }` on products.
    - `{ "variants.sku": 1 }` unique sparse index for inventory lookups.
- **Caching & Ephemeral Store**: **Redis**.
  - Session storage and JWT blacklist/refresh token rotation tracking.
  - Rate limiting buckets (sliding window log).
  - Read-through caching for high-frequency catalog queries (categories tree, homepage banners, top sellers).
  - BullMQ job queues and delayed retry queues.

---

## 5. Critical Technical Workflows & Concurrency Protection

### 5.1 High-Concurrency Stock Reservation & Checkout
A fundamental failure mode in e-commerce platforms is **overselling** caused by race conditions when multiple customers purchase the last available stock unit concurrently.

```
[Customer Clicks "Place Order"]
               │
               ▼
   [Validate Cart Items & Sellers]
               │
               ▼
[Begin MongoDB Transaction / Atomic Check]
For each item in cart:
  UPDATE Inventory
  SET availableStock = availableStock - qty,
      reservedStock  = reservedStock + qty
  WHERE sku = :sku AND availableStock >= qty
               │
        ┌──────┴──────┐
     [Success]     [Insufficient Stock]
        │                     │
        ▼                     ▼
[Create PENDING Order]   [Abort Transaction & Return 409 Conflict]
[Schedule BullMQ Job:    (Inform customer: "Item X is no longer available")
 Timeout in 15 mins]
        │
   ┌────┴──────────────────────────┐
   ▼                               ▼
[Payment Confirmed]      [Payment Fails / Timeout]
- Convert reservedStock  - Release reservedStock back to availableStock
  to soldStock           - Mark sub-orders CANCELLED_EXPIRED
- Set Order CONFIRMED
```

---

### 5.2 Regional & International Payment Gateway Integration
The payment infrastructure is designed to support modular payment adapters:
- **Bangladesh Domestic Gateways**:
  - **bKash & Nagad**: Direct Merchant API for seamless mobile wallet checkouts.
  - **SSLCommerz**: Multi-channel gateway supporting local debit/credit cards, internet banking, and mobile financial services.
  - **Cash on Delivery (COD)**: Supports OTP verification on delivery confirmation, automated delivery fee deposit requirements, and courier remittance tracking.
- **International Gateways**:
  - **Stripe**: Card payments and Apple Pay/Google Pay for international purchases.
- **Security & Idempotency**:
  - All webhook endpoints require cryptographic HMAC signature verification.
  - Webhooks enforce a unique `idempotencyKey` record in MongoDB to prevent double-crediting if a provider retries delivery.
  - Frontend success redirects are treated as strictly visual; orders are confirmed **exclusively** upon backend webhook confirmation or server-to-server transaction verification query.

---

### 5.3 Logistics & Multi-Carrier Fulfillment
- **Seller-Managed Delivery**: Small local vendors handling neighborhood delivery directly.
- **Platform Integrated Couriers (Bangladesh Ecosystem)**:
  - Integration with **Pathao Courier**, **Steadfast**, and **RedX** APIs.
  - Automated consignment creation upon sub-order status transition to `PACKED`.
  - Webhook listener for automatic tracking state updates: `PICKED_UP` -> `IN_TRANSIT` -> `DELIVERED` -> `RETURNED`.
  - Automatic reconciliation of Cash-on-Delivery collected amounts against platform ledger accounts.

---

### 5.4 AI-Powered Marketplace Enhancements
The architecture incorporates strategic AI interfaces without adding unnecessary runtime fragility:
1. **Semantic Vector Search**: Generates vector embeddings for product titles and descriptions to allow natural language search queries (e.g., "breathable summer clothes for beach vacation") alongside standard keyword filters.
2. **Catalog Auto-Tagging & Attribute Extraction**: AI assistance in the seller dashboard to automatically suggest categories, SEO keywords, and technical attributes from uploaded product images and raw descriptions.
3. **Review Sentiment & Fraud Detection**: Automated sentiment scoring and anomaly detection on customer reviews to flag fake positive reviews or abusive seller behavior.
4. **AI Customer Support Assistant**: RAG-enabled chatbot referencing marketplace policies, FAQ documentation, and real-time user order states to answer buyer queries 24/7.

---

## 6. Monorepo Structure & Package Boundaries

```
marketplace/
├── apps/
│   ├── storefront/             # Next.js App Router (Customer Storefront)
│   ├── seller-dashboard/       # Next.js / Vite SPA (Seller Management Portal)
│   ├── admin-dashboard/        # Next.js / Vite SPA (Platform Administration)
│   ├── api/                    # Node.js + Express.js REST API Server
│   └── worker/                 # BullMQ Background Job Processor
│
├── packages/
│   ├── ui/                     # Shared Design System (shadcn/ui + Tailwind components)
│   ├── types/                  # TypeScript interfaces, DTOs, and Domain Models
│   ├── validators/             # Shared Zod validation schemas
│   ├── utils/                  # Currency formatting, date math, text slugifiers
│   ├── config/                 # Shared Tailwind, PostCSS, and TypeScript base configs
│   └── eslint-config/          # Shared linting rules
│
├── docs/
│   ├── PROJECT-ANALYSIS.md     # (Current Document) Step 2 Comprehensive Analysis
│   ├── SRS.md                  # Step 3 Software Requirements Specification
│   ├── ARCHITECTURE.md         # Step 4 Detailed System Architecture
│   ├── DATABASE.md             # Step 5 Schemas, Indexes & ER Diagram
│   ├── API.md                  # Step 6 REST API Specifications
│   ├── SECURITY.md             # Security policies, threat model, & compliance
│   ├── PAYMENT-FLOW.md         # Gateway integrations & webhook lifecycle
│   ├── ORDER-FLOW.md           # Concurrency, state machines & logistics
│   ├── DEPLOYMENT.md           # Docker, CI/CD, and infrastructure setup
│   └── DEVELOPMENT-ROADMAP.md  # 20-week execution phases & milestone gates
│
├── scripts/                    # Database seeds, migrations, and developer tooling
├── .github/workflows/          # CI/CD pipelines (Lint, Test, Typecheck, Build)
├── .env.example                # Centralized environment variable documentation
├── package.json                # Root workspace configuration
├── pnpm-workspace.yaml         # Turborepo workspace topology
└── turbo.json                  # Turborepo task pipeline caching configuration
```

---

## 7. Risk Assessment & Architectural Mitigation Matrix

| Domain | Identified Risk | Impact | Architectural Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Inventory** | Concurrent checkouts on zero-stock items | High (Overselling, Customer dissatisfaction) | Atomic MongoDB `$inc` operations with condition `{ availableStock: { $gte: qty } }`, coupled with short-lived Redis lock keys. |
| **Finance** | Duplicate webhook callbacks crediting wallets twice | Critical (Financial loss) | Unique index on `webhookEvents.transactionId`, mandatory idempotency middleware, and dual-entry ledger reconciliation. |
| **Vendor Isolation**| A seller inspecting or modifying another seller's sub-orders | Critical (Data breach, regulatory penalty) | Enforced tenancy filtering in backend service layer. Every seller query automatically binds `storeId: req.user.storeId`. |
| **Payment Failures**| Customer pays via gateway, but browser crashes before return | High (Paid order stuck in PENDING) | Webhook-first confirmation architecture. Orders transition to PAID via server-to-server webhook, not client browser redirects. |
| **Performance** | High-traffic sales crashing catalog queries | High (Downtime) | Next.js Incremental Static Regeneration (ISR) on storefront, Redis caching for category trees and hot product listings. |
| **Returns/Refunds** | Seller withdraws funds before a return claim is filed | High (Platform uncollectable debt) | Mandatory escrow hold period on all completed sub-orders matching the return policy duration (e.g., 7 days). |

---

## 8. Conclusion & Milestone Progression

This project analysis establishes the definitive domain boundaries, financial mathematics, and architectural safeguards required to construct a true enterprise-grade multi-vendor e-commerce marketplace. 

With **Step 1 (Environment Inspection)** and **Step 2 (Project Analysis)** complete, the system is primed to proceed directly into:
- **Step 3:** Software Requirements Specification (`docs/SRS.md`)
- **Step 4:** System Architecture Design (`docs/ARCHITECTURE.md`)
- **Step 5:** Database Schema & ER Diagram (`docs/DATABASE.md`)
