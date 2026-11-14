# Software Requirements Specification (SRS)
## Premium Multi-Vendor E-Commerce Marketplace
**Document Version:** 1.0.0  
**Status:** Approved Architecture Draft  
**Standard Compliance:** IEEE 830 / ISO/IEC/IEEE 29148  

---

## 1. Introduction

### 1.1 Purpose
This document provides the complete, authoritative Software Requirements Specification (SRS) for the **Enterprise Multi-Vendor E-Commerce Marketplace**. It specifies all functional and non-functional requirements, business rules, system interfaces, security policies, and architectural constraints governing development across the entire monorepo.

### 1.2 Scope of the System
The platform is an enterprise-scale digital commerce ecosystem facilitating multi-party commercial transactions between independent third-party vendors and retail customers, moderated by centralized platform administrators.

**Included Subsystems:**
1. **Customer Storefront (`apps/storefront`)**: Public discovery catalog, multi-vendor cart, unified checkout, order tracking, returns, reviews, and customer accounts.
2. **Seller Dashboard (`apps/seller-dashboard`)**: KYC onboarding, storefront customization, catalog/variant management, inventory tracking, sub-order fulfillment, and wallet settlements.
3. **Admin Dashboard (`apps/admin-dashboard`)**: Platform governance, seller verification, catalog taxonomy, content moderation, dispute arbitration, commission policies, financial reconciliation, and audit logs.
4. **Backend REST API (`apps/api`)**: High-throughput modular monolith serving all frontend applications via `/api/v1` RESTful contracts.
5. **Background Worker (`apps/worker`)**: BullMQ + Redis async queue processor handling stock expiration, transactional messaging, image transformations, and vector embeddings.
6. **Shared Core Libraries (`packages/*`)**: Reusable UI components, Zod validators, TypeScript data transfer objects (DTOs), and cross-cutting utility functions.

### 1.3 Definitions, Acronyms, and Abbreviations
- **GMV (Gross Merchandise Value)**: Total monetary value of merchandise sold over a given period, inclusive of shipping and taxes before deductions.
- **Parent Order**: The top-level transaction entity representing a customer checkout containing one or more vendor-specific sub-orders.
- **Sub-Order**: A discrete fulfillment and financial partition of a parent order assigned to a single seller.
- **SKU (Stock Keeping Unit)**: Unique alphanumeric identifier for distinct product variants.
- **RBAC**: Role-Based Access Control.
- **KYC (Know Your Customer)**: Identity and business credential verification process for prospective sellers.
- **COD**: Cash on Delivery.
- **Idempotency**: Property of certain operations whereby they can be applied multiple times without changing the result beyond the initial application.
- **Double-Entry Ledger**: Accounting methodology where every financial movement is recorded as both an offsetting debit and credit entry.

---

## 2. Overall Description

### 2.1 Product Perspective & Context Diagram

```
                 +-------------------------------------------------------+
                 |                   CLIENT APPLICATIONS                 |
                 |  apps/storefront | apps/seller-dashboard | apps/admin |
                 +---------------------------+---------------------------+
                                             │ HTTPS / WSS
                                             ▼
                 +-------------------------------------------------------+
                 |             BACKEND MODULAR MONOLITH (apps/api)       |
                 |   - Gateway Middleware (CORS, Helmet, RateLimiter)    |
                 |   - Authentication & RBAC Guard Tier                  |
                 |   - Domain Services (Catalog, Cart, Orders, Ledger)   |
                 +---------------+-----------------------+---------------+
                                 │                       │
               ┌─────────────────┴─────────┐   ┌─────────┴─────────┐
               ▼                           ▼   ▼                   ▼
    +--------------------+       +--------------------+  +--------------------+
    |      MongoDB       |       |       Redis        |  |  External Services  |
    |  - Primary DB      |       |  - Cache & Locks   |  |  - bKash/SSLCommerz|
    |  - ACID Txns       |       |  - BullMQ Queues   |  |  - Pathao/Steadfast|
    +--------------------+       +---------+----------+  |  - Cloudinary CDN  |
                                           │             +--------------------+
                                           ▼
                                 +--------------------+
                                 | Background Worker  |
                                 |   (apps/worker)    |
                                 +--------------------+
```

### 2.2 User Classes and Persona Matrix

| User Class | Category | Authentication | Primary Goals & Capabilities |
| :--- | :--- | :--- | :--- |
| **Customer** | External Retail | Email + Password, OAuth (Google) | Discover products, purchase across multiple vendors in 1 checkout, track sub-orders, initiate returns, write verified reviews. |
| **Seller** | External Commercial | Email + Password + Mandatory 2FA | Register business, upload KYC documents, manage stores, create products with complex variants, fulfill assigned sub-orders, request payouts. |
| **Super Admin** | Platform Internal | Email + Strict 2FA + IP Allowlist | Full platform control, role management, security configuration, ledger corrections, payment gateway key management. |
| **Admin** | Platform Internal | Email + 2FA | Daily operations, vendor verification, product moderation, banner management, dispute arbitration. |
| **Product Manager** | Platform Internal | Email + 2FA | Maintain category taxonomy, attribute groups, brand directories, catalog approval workflows. |
| **Order Manager** | Platform Internal | Email + 2FA | Global sub-order tracking, carrier exception management, manual delivery assignment overrides. |
| **Finance Manager** | Platform Internal | Email + 2FA | Approve seller settlement batches, reconcile gateway payouts, manage commission tier rules, tax reports. |
| **Support Agent** | Platform Internal | Email + 2FA | Resolve customer support tickets, mediate vendor-buyer disputes, view customer order histories. |

---

## 3. Detailed Functional Requirements

### 3.1 Module 1: Identity, Authentication & RBAC
- **FR-AUTH-001**: The system shall support customer registration via email, password, and optional social OAuth (Google).
- **FR-AUTH-002**: Password complexity shall enforce minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character, hashed using `bcrypt` (work factor $\ge 12$).
- **FR-AUTH-003**: The system shall implement short-lived JSON Web Access Tokens (15-minute expiration) paired with cryptographically secure, rotating Refresh Tokens stored in HTTP-only, SameSite=Strict cookies.
- **FR-AUTH-004**: Administrative staff and seller accounts must support Time-based One-Time Password (TOTP) Two-Factor Authentication.
- **FR-AUTH-005**: The system shall enforce server-side RBAC where each incoming request is authorized against granular permission scopes (e.g., `products:create`, `settlements:approve`, `orders:view-all`).
- **FR-AUTH-006**: Suspended accounts shall have active sessions terminated immediately via Redis token revocation lists.

### 3.2 Module 2: Vendor Onboarding, KYC & Storefronts
- **FR-SELLER-001**: Prospective sellers shall complete an onboarding wizard submitting legal business name, Trade License/TIN numbers, national identity cards (NID/Passport), warehouse dispatch address, and disbursement bank details.
- **FR-SELLER-002**: Seller stores shall remain in `PENDING_VERIFICATION` status, preventing public catalog publishing until verified and approved by an Admin.
- **FR-SELLER-003**: Verified sellers shall configure customized store profiles including banner, logo, bio, operating hours, social links, and custom return policies (constrained by platform minimums).
- **FR-SELLER-004**: Each seller's data scope must be strictly isolated. No seller API call shall ever return records belonging to another `storeId`.

### 3.3 Module 3: Catalog, Attributes & Multi-Dimensional Variants
- **FR-CAT-001**: The platform taxonomy shall support infinite-depth hierarchical categories (`Parent` $\rightarrow$ `Subcategory` $\rightarrow$ `Child Category`), with dynamic inheritance of attributes.
- **FR-CAT-002**: Products shall support multi-dimensional variant matrices (e.g., Size $\times$ Color $\times$ Material), where each discrete combination has its own SKU, price, compare-at price, cost price, and stock level.
- **FR-CAT-003**: Sellers shall upload high-resolution images with automatic WebP conversion, thumbnail generation, and image ordering handled via Cloudinary.
- **FR-CAT-004**: Products submitted by sellers shall enter a `PENDING_REVIEW` moderation queue unless the seller has attained "Auto-Approve" trust status granted by an Admin.
- **FR-CAT-005**: All catalog records shall generate URL-safe, unique, SEO-optimized slugs.

### 3.4 Module 4: Inventory Control & High-Concurrency Reservation
- **FR-INV-001**: The system shall maintain three distinct inventory counts per variant SKU:
  $$\text{Total Stock} = \text{Available Stock} + \text{Reserved Stock} + \text{Sold Stock}$$
- **FR-INV-002**: When a customer initiates checkout, the system shall atomically transition stock from `Available` to `Reserved` using atomic conditional writes (`$inc` with `{ availableStock: { $gte: requestedQty } }`).
- **FR-INV-003**: A reserved stock lock shall be valid for precisely 15 minutes. If payment is not verified within 15 minutes, a BullMQ delayed job shall release the reserved units back to `Available Stock`.
- **FR-INV-004**: Upon verified payment or valid COD confirmation, the system shall transition reserved stock to `Sold Stock`.
- **FR-INV-005**: Low-stock automated threshold alerts shall notify sellers when available inventory falls below a user-defined threshold.

### 3.5 Module 5: Customer Cart & Multi-Vendor Split Checkout
- **FR-CART-001**: The customer cart shall allow items from multiple distinct sellers, displaying items visibly partitioned by vendor store with individual vendor sub-totals.
- **FR-CART-002**: For unauthenticated guests, carts shall persist in `localStorage` and automatically merge into the customer's server-side database cart upon login.
- **FR-CART-003**: The checkout engine shall compute separate shipping charges per vendor based on package weight, warehouse origin, and customer delivery address.
- **FR-CART-004**: Checkout completion shall atomically generate:
  - Exactly **1 Parent Order** (recording customer info, total amount paid, payment method, delivery address snapshot).
  - Exactly **$N$ Seller Sub-Orders** (one per unique vendor represented in the cart).
  - Child **Order Items** with snapshotted unit prices, variant details, and commission rates.
- **FR-CART-005**: The checkout calculation must be strictly performed on the server. Frontend-submitted prices or shipping totals must be discarded.

### 3.6 Module 6: Order State Machine & Fulfillment Workflow
- **FR-ORD-001**: Parent orders and sub-orders shall operate under deterministic finite state machines.

```
[SUB-ORDER LIFECYCLE STATE MACHINE]
                  ┌─────────────────┐
                  │     PENDING     │ (Awaiting Payment / COD Verification)
                  └────────┬────────┘
                           │ Payment Verified
                           ▼
                  ┌─────────────────┐
                  │    CONFIRMED    │ (Visible in Seller Dashboard)
                  └────────┬────────┘
                           │ Seller clicks "Pack Items"
                           ▼
                  ┌─────────────────┐
                  │     PACKED      │ (Consignment Created with Courier)
                  └────────┬────────┘
                           │ Carrier Pickup
                           ▼
                  ┌─────────────────┐
                  │     SHIPPED     │ (In Transit with Tracking Number)
                  └────────┬────────┘
                           │ Courier Out For Delivery
                           ▼
                  ┌─────────────────┐
                  │OUT_FOR_DELIVERY │
                  └────────┬────────┘
                           │ Customer Receives Package
                           ▼
                  ┌─────────────────┐
                  │    DELIVERED    │ (Starts 7-Day Return & Escrow Clock)
                  └────────┬────────┘
                           │ Return Window Expired & No Dispute
                           ▼
                  ┌─────────────────┐
                  │    COMPLETED    │ (Funds Transferred to Available Wallet)
                  └─────────────────┘
```
- **FR-ORD-002**: A seller can transition only their own sub-orders through `CONFIRMED` $\rightarrow$ `PACKED` $\rightarrow$ `SHIPPED`.
- **FR-ORD-003**: Cancellation by a customer is permitted only while the sub-order is in `PENDING` or `CONFIRMED` status; once `PACKED`, cancellation requires seller or support approval.

### 3.7 Module 7: Payment Gateways & Idempotent Processing
- **FR-PAY-001**: Supported payment methods shall include:
  - **bKash & Nagad**: Direct merchant API tokenized payment.
  - **SSLCommerz**: Hosted payment gateway session with multi-card/MFS routing.
  - **Cash on Delivery (COD)**: With configurable maximum order amount limit and optional OTP mobile verification.
  - **Stripe**: International card payment processing.
- **FR-PAY-002**: All webhook listener endpoints shall verify cryptographic HMAC signatures before payload consumption.
- **FR-PAY-003**: The payment service shall enforce strict idempotency using unique database transaction records. If a webhook with duplicate `transactionId` is received, the system shall acknowledge receipt (HTTP 200) without executing redundant business logic.
- **FR-PAY-004**: Browser client redirects post-payment shall never confirm an order; order state transition to `CONFIRMED` shall execute solely via verified server-side webhook or verified server-to-server gateway status inquiry.

### 3.8 Module 8: Commission Engine, Wallets & Settlements
- **FR-COM-001**: The platform shall resolve commissions dynamically using the hierarchy: *Seller Contract Rate* $\rightarrow$ *Category Commission* $\rightarrow$ *Platform Default Rate*.
- **FR-COM-002**: The commission rate, fixed fee, and calculated commission currency amount shall be permanently snapshotted in each `orderItem` at checkout.
- **FR-FIN-001**: The platform shall maintain an append-only, immutable double-entry financial ledger. Wallet balances shall equal the sum of cleared ledger credits minus debits.
- **FR-FIN-002**: Sub-order earnings shall enter the seller's `pendingEscrowBalance` upon delivery and remain locked until the 7-day return window elapses.
- **FR-FIN-003**: Upon completion of the return window, funds shall automatically transfer from `pendingEscrowBalance` to `availableBalance`.
- **FR-FIN-004**: Sellers may request a payout from their `availableBalance` subject to a minimum withdrawal threshold (e.g., ৳1,000).
- **FR-FIN-005**: Payout requests shall be reviewed and approved by a Finance Manager, generating a bank/MFS transfer transaction log before clearing the balance.

### 3.9 Module 9: Logistics & Multi-Carrier Delivery
- **FR-LOG-001**: The platform shall integrate with regional Bangladesh parcel delivery APIs: **Pathao Courier**, **Steadfast**, and **RedX**.
- **FR-LOG-002**: When a sub-order transitions to `PACKED`, the logistics service shall call the selected carrier API to generate a consignment, manifest, and printable shipping label with barcode.
- **FR-LOG-003**: Webhook callbacks from delivery carriers shall automatically advance sub-order status (`SHIPPED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `RETURNED`) and record courier milestone timestamps.

### 3.10 Module 10: Returns, Refunds & Dispute Arbitration
- **FR-RET-001**: Customers may submit return requests within 7 calendar days of delivery, attaching reason codes and photographic proof.
- **FR-RET-002**: Sellers have 48 hours to accept or contest a return. Contested returns escalate into a 3-way arbitration dispute managed by a Support Agent.
- **FR-RET-003**: Upon physical receipt and inspection of returned merchandise, the seller marks items as returned, triggering an automated refund calculation.
- **FR-RET-004**: Refunds shall debit the seller's escrow/wallet balance, credit the customer's payment source/wallet, and return restocking quantities to `Available Stock`.

### 3.11 Module 11: AI Integration & Enhanced Capabilities
- **FR-AI-001 (Semantic Vector Search)**: The platform shall generate text embeddings for catalog items, indexing them in a vector collection to enable natural language and conceptual customer search queries.
- **FR-AI-002 (Catalog Auto-Tagging)**: The seller interface shall provide an AI assistant that inspects raw product titles, descriptions, and images to suggest optimized categories, tags, attributes, and SEO meta tags.
- **FR-AI-003 (Review Sentiment Analysis)**: All submitted customer reviews shall be evaluated by a lightweight sentiment scoring model to flag anomalous negative surges or suspicious synthetic reviews.
- **FR-AI-004 (RAG Shopping Assistant)**: An embedded storefront conversational widget powered by Retrieval-Augmented Generation (RAG) shall assist buyers with sizing guidelines, product recommendations, and shipping policy inquiries.

### 3.12 Module 12: SEO, Marketing & Content Systems
- **FR-SEO-001**: The storefront shall dynamically generate OpenGraph metadata, Twitter cards, canonical tags, and Google-compliant schema.org JSON-LD microdata (`Product`, `AggregateRating`, `BreadcrumbList`, `Organization`).
- **FR-SEO-002**: An automated sitemap generator shall produce dynamic `sitemap.xml` feeds for categories, active products, and seller brand pages.
- **FR-MKT-001**: The marketing engine shall support platform-wide promotional codes, seller-specific store vouchers, minimum spend requirements, category exclusions, and usage-limit caps.

---

## 4. External Interface Requirements

### 4.1 User Interfaces
- **Responsive Layout**: Fluid breakpoints supporting Mobile (320px–640px), Tablet (641px–1024px), Desktop (1025px–1440px), and Ultra-wide (1441px+).
- **Design System Standards**: Standardized typography (Plus Jakarta Sans / Inter), luxury color tokens (`#0F172A` Navy, `#1E293B` Slate, `#D97706` Amber Gold, `#059669` Emerald Green), accessible touch targets ($\ge 44 \times 44\text{px}$).
- **Accessibility**: Compliance with WCAG 2.1 Level AA (contrast ratio $\ge 4.5:1$ for normal text, keyboard navigable modals and dropdowns, full ARIA attributes).

### 4.2 Software & Database Interfaces
- **Database**: MongoDB v6.0+ via Mongoose ODM; requires replica set configuration to support multi-document ACID transactions.
- **Cache / Message Broker**: Redis v7.0+ for session locks, caching, and BullMQ task queues.
- **Object Storage**: Cloudinary REST API for image/video upload, transformation, and global CDN delivery.
- **Payment Gateways**: REST APIs for bKash, Nagad, SSLCommerz, and Stripe.
- **Shipping Logistics**: REST APIs for Pathao, Steadfast, and RedX couriers.
- **Transactional Communication**: Resend / SMTP for email delivery; Twilio / local SMS gateways for mobile OTP verification.

---

## 5. Non-Functional Requirements (NFRs)

### 5.1 Performance & Scalability Requirements
- **NFR-PERF-001**: Storefront Server-Side Rendered (SSR) page Time-to-First-Byte (TTFB) shall be under 300ms on a standard broadband connection.
- **NFR-PERF-002**: First Contentful Paint (FCP) $\le 1.2$ seconds; Largest Contentful Paint (LCP) $\le 2.0$ seconds on desktop.
- **NFR-PERF-003**: The backend REST API shall maintain a 95th percentile (p95) response latency of $\le 150\text{ms}$ for read queries and $\le 300\text{ms}$ for transactional writes under nominal load (1,000 active concurrent connections).
- **NFR-PERF-004**: All database queries on primary catalog listings and order lookups must be covered by compound indexes; full table scans are strictly prohibited.

### 5.2 Security & Compliance Requirements
- **NFR-SEC-001**: All data transmission must occur over TLS 1.3 encryption.
- **NFR-SEC-002**: Protection against the OWASP Top 10 vulnerabilities:
  - Input validation on every request via Zod schemas.
  - Protection against NoSQL query injection using structured Mongoose schemas and strict type casting.
  - Cross-Site Scripting (XSS) prevention via React DOM escaping and HTTP `Content-Security-Policy`.
  - Cross-Site Request Forgery (CSRF) mitigation via SameSite=Strict cookies and custom headers.
- **NFR-SEC-003**: Rate limiting enforced per IP and per authenticated user ID:
  - Public browsing: 120 requests/minute.
  - Authentication endpoints (login/register): 5 requests/minute.
  - Checkout & payment initialization: 10 requests/minute.
- **NFR-SEC-004**: Passwords must be hashed using `bcrypt` with salt rounds $\ge 12$. Plaintext passwords must never be logged or persisted.
- **NFR-SEC-005**: All sensitive actions (payout approvals, role modifications, manual balance adjustments) must produce immutable entries in `auditLogs` containing actor ID, IP address, user agent, timestamp, before-state, and after-state.

### 5.3 Reliability, Availability & Fault Tolerance
- **NFR-REL-001**: Platform availability target of 99.9% uptime (excluding scheduled maintenance windows).
- **NFR-REL-002**: Third-party external service outages (e.g., courier API down, SMS provider delay) must degrade gracefully:
  - Sub-orders queue for asynchronous courier booking retries without blocking customer checkout.
  - Failed email/SMS notifications retry up to 5 times with exponential backoff before landing in a dead-letter queue.
- **NFR-REL-003**: Incomplete transactions due to database disconnects must rollback cleanly without orphaned stock reservations or unlinked payment receipts.

### 5.4 Maintainability & Code Quality
- **NFR-MNT-001**: Full end-to-end TypeScript strict mode (`"strict": true`, zero `any` usage in core domain logic).
- **NFR-MNT-002**: Automated test coverage exceeding 80% on core services (checkout, commission calculation, inventory reservation, ledger reconciliation).
- **NFR-MNT-003**: Monorepo packages decoupled with explicit dependency graphs managed by Turborepo.

---

## 6. Business Rules & Financial Invariants

| ID | Rule Description | Enforcement Layer |
| :--- | :--- | :--- |
| **BR-001** | **Conservation of Money**: Total customer paid = $\sum(\text{Sub-Order Totals}) + \text{Platform Fees}$. | Backend Service & Ledger |
| **BR-002** | **Zero Negative Inventory**: Available stock cannot be decremented below zero under any concurrency condition. | Database Atomic Condition |
| **BR-003** | **Immutable Snapshots**: Product prices and commission rates in completed orders must never mutate even if the seller alters product pricing or admin changes commission rules. | Order Creation Service |
| **BR-004** | **Escrow Hold Period**: Seller earnings from sub-orders remain in pending escrow for 7 calendar days post-delivery before becoming available for withdrawal. | BullMQ Escrow Job |
| **BR-005** | **Strict Vendor Isolation**: A seller can view and modify only catalog items, sub-orders, and financial records containing their own `storeId`. | API Middleware & Query Guard |
| **BR-006** | **Server-Authoritative Pricing**: All item prices, sub-totals, discounts, taxes, and shipping rates must be calculated server-side; client payload prices are discarded. | Checkout Controller |
| **BR-007** | **Webhook Idempotency**: Payment and courier webhooks with matching transaction IDs must execute underlying business mutations at most once. | Webhook Service |

---

## 7. Requirement Traceability Matrix (RTM)

| SRS Requirement | Prompt Specification Section | Acceptance Criteria Verification |
| :--- | :--- | :--- |
| **FR-AUTH-001 to 006** | Section 3 & 12 (Roles, Access & Auth) | Section 31: Customer Experience, RBAC |
| **FR-SELLER-001 to 004**| Section 6 (Seller Dashboard) | Section 31: Seller Experience |
| **FR-CAT-001 to 005**   | Section 5, 6 & 10 (Catalog & Database) | Section 31: Product Discovery, Moderation |
| **FR-INV-001 to 005**   | Section 6 & 13 (Inventory & Concurrency) | Section 31: Stock Concurrency Protection |
| **FR-CART-001 to 005**  | Section 5 & 13 (Cart & Split Checkout) | Section 31: Multi-vendor Cart, Checkout |
| **FR-ORD-001 to 003**   | Section 5, 6, 7 & 10 (Order Architecture) | Section 31: Parent & Sub-Orders |
| **FR-PAY-001 to 004**   | Section 14 (Payment Gateways) | Section 31: Payment Verification & Webhooks |
| **FR-COM-001 to 002**   | Section 15 (Commission & Wallet) | Section 31: Commission Snapshots & Ledger |
| **FR-FIN-001 to 005**   | Section 10 & 15 (Financial Reliability) | Section 31: Immutable Financial Ledger |
| **FR-LOG-001 to 003**   | Section 16 (Shipping & Delivery) | Section 31: Delivery Tracking & Logistics |
| **FR-RET-001 to 004**   | Section 17 (Returns & Disputes) | Section 31: Returns, Refunds & Consistency |
| **FR-AI-001 to 004**    | Section 18 (AI Integration) | Section 31: AI Capabilities |
| **NFR-PERF, SEC, REL**  | Section 24, 25 & 26 (DevOps & Security) | Section 31: Technical Quality & Security |

---
**Document Sign-Off:** Prepared by Principal Software Architect & Lead Product Systems Specialist.
