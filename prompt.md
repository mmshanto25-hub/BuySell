# MASTER DEVELOPMENT PROMPT
# Premium Enterprise-Grade Multi-Vendor E-Commerce Marketplace
### Full-Stack Development | Customer Storefront | Seller Dashboard | Admin Panel | AI | SEO | Payments | Logistics

---

# 1. YOUR ROLE AND RESPONSIBILITY

Act as a complete senior software engineering team consisting of:

- Principal Software Architect
- Senior Full-Stack Developer
- Senior Frontend Engineer
- Senior Backend Engineer
- Database Architect
- UI/UX Designer
- Product Designer
- DevOps Engineer
- Cybersecurity Engineer
- AI/ML Engineer
- SEO Specialist
- QA Automation Engineer
- Technical Project Manager

Your responsibility is to architect, design, develop, test, document, optimize, and prepare a production-ready premium multi-vendor e-commerce marketplace.

Build a professional marketplace comparable in functionality and engineering quality to platforms such as:

- Amazon
- Daraz
- Shopify Marketplace
- eBay

These platforms are references for functionality and user experience, not interfaces to copy.

The system must support multiple independent sellers, customers, administrators, products, inventory, multi-vendor shopping carts, split orders, payments, commissions, deliveries, refunds, settlements, AI-powered features, and advanced administration.

**Core objective:** Build a scalable, secure, maintainable, responsive, SEO-friendly, AI-enabled marketplace with reliable financial and operational workflows.

Do not build a simple demo, static template, or collection of disconnected pages.

Every major module must be designed to work together through a consistent architecture.

---

# 2. PROJECT VISION AND BUSINESS MODEL

Build a multi-vendor marketplace where:

1. Multiple sellers can register.
2. Sellers can create and manage their own stores.
3. Sellers can upload and manage products.
4. Customers can browse products from different sellers.
5. Customers can add products from multiple sellers to one cart.
6. Customers can complete a single checkout.
7. The platform creates one parent order and multiple seller-specific sub-orders.
8. The platform calculates commissions automatically.
9. Sellers can manage their own orders and inventory.
10. Customers can track orders and request returns or refunds.
11. Administrators can manage the entire marketplace.
12. The platform can support multiple payment and delivery providers.
13. AI features improve product discovery, customer support, and marketplace operations.

## Multi-Vendor Order Example

A customer purchases:

- Seller A: ৳2,000
- Seller B: ৳1,500
- Seller C: ৳1,500

Total parent order: ৳5,000.

The system must create:

- One parent order associated with the customer checkout.
- Three independent seller sub-orders.
- Individual order items.
- Seller-specific fulfillment and delivery information.
- Platform commission records.
- Seller earnings records.
- Payment and financial ledger entries.

Each seller must only access their own sub-orders and related information.

The parent order must provide a unified customer-facing order experience.

## Marketplace Revenue Model

Support:

- Percentage-based commission.
- Fixed commission.
- Category-specific commission.
- Seller-specific commission.
- Promotional commission.
- Delivery charges.
- Payment gateway fees.
- Refund adjustments.
- Settlement adjustments.

Example:

Product selling price: ৳1,000  
Platform commission: 10%  
Seller gross earning before other adjustments: ৳900.

Do not confuse GMV, platform revenue, seller earnings, gateway fees, refunds, and settlement balances.

All financial calculations must be performed and verified on the backend.

---

# 3. USER ROLES AND ACCESS CONTROL

Implement comprehensive Role-Based Access Control (RBAC).

## Required Roles

### Platform Administration

1. Super Admin
2. Admin
3. Product Manager
4. Order Manager
5. Finance Manager
6. Customer Support Agent

### Marketplace Users

7. Seller
8. Customer

## Permission Requirements

Super Admin:
- Complete platform access.
- Manage administrators and permissions.
- Manage platform configuration.
- Access financial and audit records.
- Configure marketplace-wide policies.

Admin:
- Manage operational marketplace activities.
- Manage users, sellers, products, and orders.
- Moderate marketplace content.

Product Manager:
- Manage categories, brands, attributes, and product moderation.

Order Manager:
- Manage orders, shipments, returns, and fulfillment workflows.

Finance Manager:
- Manage commissions, refunds, financial records, and settlements.

Support Agent:
- Manage customer support tickets and conversations.
- Access only the customer information necessary for support.

Seller:
- Manage their own store.
- Manage their own products.
- Manage their own inventory.
- Manage their own orders.
- View their own analytics and financial statements.
- Request settlements.
- Manage store information.

Customer:
- Browse products.
- Purchase products.
- Manage profile and addresses.
- Manage cart and wishlist.
- Track orders.
- Submit reviews.
- Request support and returns.

## Security Requirements

- Implement server-side authorization.
- Never trust frontend role checks alone.
- Enforce seller ownership on every protected resource.
- Prevent cross-seller data access.
- Use granular permissions.
- Implement audit logging for sensitive actions.
- Validate every request.
- Protect administrative routes.
- Implement session and token security.
- Prevent privilege escalation.

Create a centralized permission system instead of hardcoding role checks throughout the application.

---

# 4. COMPLETE UI/UX DESIGN SYSTEM

## Design Direction

Create a premium, modern, elegant, minimal, and conversion-focused marketplace.

Design inspiration:

- Apple
- Shopify
- Stripe
- Linear
- Vercel
- Premium e-commerce marketplaces

Do not directly copy any existing website.

## Color Palette

Primary Background: #F8FAFC  
Primary Surface: #FFFFFF  
Deep Navy: #101828  
Primary Blue: #3563E9  
Cyan Accent: #06B6D4  
Primary Text: #101828  
Secondary Text: #667085  
Border: #E4E7EC  

Use colors consistently through centralized design tokens.

## Typography

Preferred:
- Inter
- Manrope

Use a consistent type scale, readable line height, appropriate font weights, and clear visual hierarchy.

## UI Requirements

- Responsive layouts.
- Mobile-first implementation.
- Premium spacing system.
- 12–16px standard corner radius.
- Subtle shadows.
- Consistent borders.
- Elegant hover effects.
- Smooth transitions.
- Accessible contrast.
- Lucide icons.
- Framer Motion animations.
- Skeleton loading states.
- Empty states.
- Error states.
- Success states.
- Confirmation dialogs.
- Toast notifications.
- Form validation feedback.

Animations must be purposeful and performant. Avoid unnecessary motion and excessive visual effects.

Support reduced-motion preferences.

## Shared Design System Components

Create reusable components:

- Button
- IconButton
- Input
- Textarea
- Select
- Checkbox
- Radio
- Switch
- Dialog
- Drawer
- Dropdown
- Tooltip
- Popover
- Tabs
- Accordion
- Breadcrumb
- Pagination
- DataTable
- Badge
- Avatar
- Card
- Modal
- Alert
- Toast
- Skeleton
- LoadingSpinner
- EmptyState
- ErrorState
- SearchBar
- ProductCard
- ProductGrid
- PriceDisplay
- Rating
- ReviewCard
- ImageGallery
- FileUploader
- DatePicker
- StatCard
- ChartCard

All components must be reusable, accessible, typed, and consistent.

---

# 5. CUSTOMER-FACING STOREFRONT

Build a complete customer experience.

## Required Pages

### Public Pages

1. Homepage
2. Shop
3. All Categories
4. Category Details
5. Subcategory Details
6. Search Results
7. Product Details
8. Brand Details
9. Seller Store
10. Seller Profile
11. Flash Sale
12. Promotional Campaigns
13. Blog
14. Blog Details
15. About Us
16. Contact Us
17. Help Center
18. FAQ
19. Terms and Conditions
20. Privacy Policy
21. Return and Refund Policy
22. Shipping Policy

### Customer Account

23. Login
24. Registration
25. Email Verification
26. Forgot Password
27. Reset Password
28. Customer Dashboard
29. Profile Settings
30. Address Management
31. My Orders
32. Order Details
33. Order Tracking
34. Wishlist
35. Product Comparison
36. Reviews
37. Notifications
38. Support Tickets
39. Security Settings

### Shopping Experience

40. Shopping Cart
41. Checkout
42. Payment Selection
43. Order Confirmation
44. Order Success
45. Order Failure
46. Payment Pending
47. Return Request
48. Refund Status

## Homepage Sections

Create a premium homepage with:

- Announcement bar.
- Responsive navigation.
- Marketplace logo.
- Search bar with autocomplete.
- Category navigation.
- Account menu.
- Wishlist.
- Shopping cart.
- Hero banner.
- Featured categories.
- Trending products.
- Best-selling products.
- Flash sales.
- Featured brands.
- Recommended products.
- Popular sellers.
- Recently viewed products.
- Promotional campaigns.
- Customer reviews.
- Newsletter subscription.
- Blog highlights.
- Trust indicators.
- Footer.

All dynamic homepage sections must be manageable through the Admin Panel.

## Product Listing Features

- Grid and list views.
- Category filtering.
- Brand filtering.
- Price range filtering.
- Rating filtering.
- Availability filtering.
- Seller filtering.
- Attribute filtering.
- Sorting.
- Pagination.
- Search.
- Active filter chips.
- Clear filters.
- Responsive filter drawer.

## Product Details Features

- Product title.
- Product images.
- Image gallery.
- Image zoom.
- Product video support.
- Product description.
- Product specifications.
- Product variants.
- Size/color selection.
- Stock availability.
- Product pricing.
- Discount information.
- Seller information.
- Delivery estimate.
- Shipping charges.
- Quantity selector.
- Add to cart.
- Buy now.
- Wishlist.
- Product comparison.
- Reviews and ratings.
- Related products.
- Frequently bought together.
- Recently viewed products.

Product stock and price must always come from authoritative backend data.

---

# 6. SELLER DASHBOARD

Create a separate, professional Seller Dashboard.

## Seller Onboarding

- Seller registration.
- Email verification.
- Business information.
- Personal information.
- Store name.
- Store logo.
- Store banner.
- Business address.
- Required business documents.
- Bank or settlement information.
- Verification status.
- Admin approval.
- Rejection reason.
- Resubmission workflow.

Never expose sensitive seller documents publicly.

## Seller Dashboard Overview

Display:

- Total sales.
- Total orders.
- Pending orders.
- Completed orders.
- Cancelled orders.
- Total products.
- Low-stock products.
- Out-of-stock products.
- Estimated earnings.
- Available balance.
- Pending settlements.
- Sales charts.
- Recent orders.
- Best-selling products.

## Product Management

- Create product.
- Edit product.
- Delete or archive product.
- Product image upload.
- Product video upload.
- Product variants.
- SKU management.
- Product attributes.
- Category selection.
- Brand selection.
- Product pricing.
- Discount pricing.
- Stock management.
- SEO metadata.
- Product status.
- Product moderation.
- Bulk upload.
- Bulk editing.
- Product import/export.

## Inventory Management

- Stock updates.
- SKU tracking.
- Low-stock alerts.
- Out-of-stock alerts.
- Stock adjustment history.
- Inventory movement history.
- Reserved stock.
- Available stock.
- Variant-level inventory.

## Order Management

- New orders.
- Pending orders.
- Confirmed orders.
- Processing orders.
- Ready-to-ship orders.
- Shipped orders.
- Delivered orders.
- Cancelled orders.
- Return requests.
- Refund status.
- Order details.
- Invoice generation.
- Shipping label generation where supported.

## Seller Finance

- Total sales.
- Gross earnings.
- Platform commission.
- Refund deductions.
- Other adjustments.
- Available balance.
- Pending balance.
- Settled balance.
- Transaction history.
- Settlement requests.
- Settlement history.
- Financial statements.

## Seller Store Management

- Store profile.
- Store logo.
- Store banner.
- Store description.
- Contact information.
- Store policies.
- Store SEO.
- Store status.
- Store performance.

## Seller Analytics

- Sales trends.
- Revenue trends.
- Order trends.
- Product performance.
- Conversion metrics.
- Top-performing products.
- Customer trends.
- Inventory insights.

Sellers must only see their own data.

---

# 7. ADMIN DASHBOARD

Create a complete enterprise-level Admin Dashboard.

## Admin Overview

Display:

- Total revenue.
- Gross Merchandise Value (GMV).
- Platform commission revenue.
- Total orders.
- Total customers.
- Total sellers.
- Pending seller approvals.
- Total products.
- Pending product approvals.
- Pending payments.
- Pending settlements.
- Refund requests.
- Order cancellation statistics.
- Marketplace growth.
- Sales analytics.
- Recent activity.

Use meaningful charts and date filters.

## Admin Modules

### User Management
- View customers.
- View sellers.
- Create users where permitted.
- Edit user information.
- Suspend accounts.
- Activate accounts.
- Manage roles.
- Manage permissions.
- Review user activity.

### Seller Management
- Seller applications.
- Verification.
- Approval.
- Rejection.
- Suspension.
- Store management.
- Commission configuration.
- Seller performance.
- Seller financial information.

### Product Management
- Product moderation.
- Approve products.
- Reject products.
- Edit products where authorized.
- Manage categories.
- Manage brands.
- Manage attributes.
- Manage product status.
- Manage reported products.

### Order Management
- All parent orders.
- All seller sub-orders.
- Order details.
- Order status.
- Cancellation.
- Refund processing.
- Dispute management.
- Shipment status.

### Finance Management
- Platform commissions.
- Seller earnings.
- Payment records.
- Refund records.
- Wallet transactions.
- Seller settlements.
- Financial adjustments.
- Transaction reconciliation.
- Revenue reports.

### Marketing Management
- Coupons.
- Discount campaigns.
- Flash sales.
- Promotional banners.
- Featured products.
- Featured sellers.
- Email campaigns.
- Referral campaigns.
- Loyalty programs.

### Content Management
- Homepage banners.
- Homepage sections.
- Blog posts.
- Pages.
- FAQ.
- Policies.
- Navigation menus.
- SEO metadata.

### Customer Support
- Support tickets.
- Conversations.
- Messages.
- Ticket assignments.
- Ticket status.
- Customer issue history.

### System Management
- Staff accounts.
- Roles.
- Permissions.
- Audit logs.
- System settings.
- Payment settings.
- Delivery settings.
- Email settings.
- API settings.
- Feature flags.

---

# 8. TECHNOLOGY STACK

Use the following recommended architecture.

## Frontend

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Zustand
- TanStack Query
- React Hook Form
- Zod
- Recharts
- Lucide React

## Backend

- Node.js
- Express.js
- TypeScript
- REST API
- Zod validation
- Centralized error handling
- JWT or secure session-based authentication
- Role-Based Access Control

## Database

- MongoDB
- Mongoose

## Background Processing

- Redis
- BullMQ

## Media Storage

- Cloudinary

## Communication

- Resend or SMTP
- Socket.IO
- Push notifications where supported

## AI

- LLM API provider
- Embeddings
- Vector search
- Retrieval-Augmented Generation (RAG)

## Testing

- Vitest
- Playwright
- Supertest
- API integration testing

## Deployment

- Vercel
- Render or AWS
- MongoDB Atlas
- Managed Redis
- Cloudinary
- GitHub Actions
- Docker
- Sentry
- Google Analytics

Use compatible, maintained versions. Verify package compatibility before installation.

Do not install unnecessary dependencies.

---

# 9. MONOREPO ARCHITECTURE

Use pnpm and Turborepo where appropriate.

Recommended structure:

marketplace/
│
├── apps/
│   ├── storefront/
│   ├── seller-dashboard/
│   ├── admin-dashboard/
│   ├── api/
│   └── worker/
│
├── packages/
│   ├── ui/
│   ├── types/
│   ├── validators/
│   ├── utils/
│   ├── config/
│   └── eslint-config/
│
├── docs/
│   ├── SRS.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── API.md
│   ├── SECURITY.md
│   ├── PAYMENT-FLOW.md
│   ├── ORDER-FLOW.md
│   ├── DEPLOYMENT.md
│   └── DEVELOPMENT-ROADMAP.md
│
├── scripts/
├── .github/
├── .env.example
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md

This is a recommended structure. Adjust it only when there is a clear technical reason.

Keep shared types, validation schemas, design tokens, and reusable components centralized.

Do not create duplicate implementations across applications.

---

# 10. DATABASE ARCHITECTURE

Use MongoDB with Mongoose.

Design a complete database schema with appropriate relationships, indexes, validation, and data ownership rules.

## Required Collections

### Identity and Access

- users
- roles
- permissions
- userAddresses
- sessions or refreshTokens

### Seller Management

- sellers
- stores
- sellerDocuments

### Catalog

- categories
- brands
- attributes
- products
- productVariants
- productImages

### Inventory

- inventory
- inventoryMovements
- stockReservations

### Shopping

- carts
- wishlists
- productComparisons
- recentlyViewedProducts

### Orders

- orders
- subOrders
- orderItems

### Payments and Finance

- payments
- refunds
- commissions
- sellerWallets
- walletTransactions
- settlements
- financialAdjustments

### Logistics

- shipments
- deliveryEvents
- returnRequests

### Marketing

- coupons
- campaigns
- banners
- referrals
- loyaltyTransactions

### Customer Engagement

- reviews
- notifications
- supportTickets
- conversations
- messages

### Content

- blogPosts
- pages
- faqs

### Security and Operations

- auditLogs
- idempotencyKeys
- webhookEvents

## Important Schema Design Rules

Every collection must have:

- Proper identifiers.
- Appropriate timestamps.
- Validation.
- Relevant indexes.
- Clear ownership.
- Proper status fields.
- Appropriate relationships.

Use references where appropriate.

Avoid unnecessarily duplicating data.

For historical financial and order records, preserve immutable snapshots of relevant prices, product details, seller information, commission rates, and calculations.

## Product Schema

Include:

- sellerId
- storeId
- title
- slug
- description
- shortDescription
- categoryId
- brandId
- images
- videos
- variants
- attributes
- SKU
- price
- compareAtPrice
- costPrice where access-controlled
- inventory information
- tags
- status
- moderation status
- SEO title
- SEO description
- timestamps

## User Schema

Include:

- name
- email
- phone
- passwordHash
- role or role reference
- profileImage
- emailVerified
- accountStatus
- timestamps

Never store plaintext passwords.

## Order Architecture

Implement two separate concepts:

1. Parent Order
2. Seller Sub-Order

Parent order:
- Customer ID.
- Order number.
- Cart snapshot.
- Total amount.
- Payment status.
- Overall order status.
- Shipping address snapshot.
- Payment information.

Sub-order:
- Parent order ID.
- Seller ID.
- Store ID.
- Seller-specific order items.
- Seller-specific totals.
- Commission snapshot.
- Seller earnings.
- Fulfillment status.
- Shipment reference.
- Return/refund information.

One parent order can contain many sub-orders.

## Financial Data Integrity

This is a critical requirement.

- Use immutable financial ledger entries.
- Use atomic database transactions where supported.
- Use idempotency keys.
- Maintain payment reconciliation.
- Record every financial adjustment.
- Never rely only on a mutable wallet balance.
- Derive balances from ledger entries or maintain carefully reconciled materialized balances.
- Never silently overwrite financial history.

Design a proper database ER diagram and document the relationships.

---

# 11. BACKEND ARCHITECTURE

Use a Modular Monolith initially.

Do not introduce microservices prematurely.

Separate modules clearly so individual services can be extracted later if necessary.

## Recommended Backend Modules

- auth
- users
- roles
- permissions
- addresses
- sellers
- stores
- categories
- brands
- attributes
- products
- variants
- inventory
- cart
- wishlist
- comparison
- search
- checkout
- orders
- payments
- refunds
- commissions
- wallets
- settlements
- shipments
- coupons
- campaigns
- reviews
- notifications
- support
- conversations
- analytics
- ai
- content
- admin
- audit
- system-settings

## API Convention

Base URL:

/api/v1

Use consistent REST conventions.

Example:

GET /api/v1/products  
GET /api/v1/products/:id  
POST /api/v1/products  
PATCH /api/v1/products/:id  
DELETE /api/v1/products/:id  

Create documented API groups for every major module.

## Backend Requirements

- Centralized error handling.
- Request validation.
- Authentication middleware.
- Permission middleware.
- Rate limiting.
- Secure headers.
- CORS configuration.
- Request logging.
- Structured application logs.
- API pagination.
- Search and filtering.
- Database indexes.
- Input sanitization.
- Secure file upload validation.
- Consistent response format.
- API versioning.
- Health-check endpoints.

Never trust frontend-submitted prices, discounts, commission values, stock levels, seller IDs, or payment status.

All important business calculations must be performed server-side.

---

# 12. AUTHENTICATION AND SECURITY

Implement:

- Customer registration.
- Seller registration.
- Admin authentication.
- Email verification.
- Login.
- Logout.
- Forgot password.
- Password reset.
- Secure session handling.
- Refresh token rotation where applicable.
- Password hashing.
- Account suspension.
- Session invalidation.
- Optional Google authentication.
- Optional two-factor authentication for administrators.

Security requirements:

- Prevent XSS.
- Prevent CSRF where applicable.
- Prevent NoSQL injection.
- Prevent brute-force attacks.
- Apply rate limiting.
- Secure cookies where used.
- Validate all uploads.
- Protect private files.
- Avoid exposing secrets.
- Restrict CORS.
- Implement least-privilege permissions.
- Protect sensitive financial endpoints.
- Maintain audit logs.
- Secure webhooks.

Use secure production environment configuration.

Never expose secrets in frontend code or commit them to Git.

---

# 13. CART AND MULTI-VENDOR CHECKOUT

This is one of the most important modules.

## Cart Requirements

- Add product.
- Remove product.
- Update quantity.
- Select variants.
- Update product availability.
- Calculate subtotal.
- Apply coupons.
- Calculate delivery charges.
- Display seller grouping.
- Display total amount.
- Persist cart where appropriate.
- Synchronize cart across devices for authenticated customers.

## Multi-Vendor Checkout

When the customer checks out:

1. Authenticate the customer.
2. Retrieve authoritative cart data.
3. Validate every product.
4. Validate seller status.
5. Validate product status.
6. Validate variants.
7. Validate inventory.
8. Recalculate prices.
9. Validate coupon rules.
10. Calculate shipping.
11. Calculate taxes if applicable.
12. Calculate the final amount.
13. Reserve stock safely.
14. Create a parent order.
15. Create seller-specific sub-orders.
16. Create payment records.
17. Initialize payment when required.
18. Confirm the order only after verified payment or valid COD acceptance.

Use an explicit order state machine.

Do not treat payment initiation as successful payment.

## Concurrency Protection

Handle:

- Two customers buying the final item simultaneously.
- Stock changes during checkout.
- Payment failure.
- Expired stock reservations.
- Duplicate checkout submissions.
- Network failures.

Use atomic stock operations or transactions and a documented stock reservation strategy.

---

# 14. PAYMENT GATEWAY INTEGRATION

Prioritize Bangladesh-compatible payment methods.

## Payment Methods

- Cash on Delivery (COD)
- bKash
- Nagad
- SSLCommerz

Potential international option:

- Stripe, subject to business eligibility and regional availability.

Do not assume that every provider supports marketplace split payments or automatic seller payouts.

Verify official provider documentation, merchant eligibility, fees, settlement terms, and current API capabilities before implementation.

## Payment Flow

1. Validate checkout.
2. Calculate total server-side.
3. Create pending order.
4. Create payment record.
5. Initialize payment gateway.
6. Redirect or display payment instructions.
7. Receive callback/webhook.
8. Verify provider authenticity.
9. Verify transaction amount and currency.
10. Verify order reference.
11. Process webhook idempotently.
12. Update payment state.
13. Confirm order.
14. Trigger seller fulfillment.
15. Reconcile payment records.

## Payment Security

- Verify webhook signatures.
- Never trust frontend success redirects.
- Prevent duplicate payment processing.
- Use idempotency.
- Store provider transaction IDs.
- Record failed payment attempts.
- Handle delayed callbacks.
- Handle partial refunds where supported.
- Maintain payment audit history.

For marketplace financial operations, design a compliant manual or automated settlement workflow according to provider rules and applicable Bangladesh law.

---

# 15. COMMISSION, WALLET AND SETTLEMENT SYSTEM

Create a robust financial architecture.

## Commission Engine

Support:

- Global commission.
- Category commission.
- Seller-specific commission.
- Fixed commission.
- Percentage commission.
- Commission snapshots at purchase time.

## Seller Wallet

Display:

- Pending balance.
- Available balance.
- Processing balance.
- Settled balance.
- Refund adjustments.

## Settlement Workflow

1. Seller requests settlement.
2. System checks eligible balance.
3. Finance Manager reviews.
4. Settlement is approved or rejected.
5. Payment is processed through the supported mechanism.
6. Transaction reference is recorded.
7. Ledger is updated.
8. Seller receives notification.

Do not allow sellers to directly edit their financial balances.

Every financial event must have an auditable record.

---

# 16. SHIPPING AND DELIVERY SYSTEM

Support both:

1. Platform-managed delivery.
2. Seller-managed delivery.

Potential Bangladesh courier integrations:

- Pathao Courier
- Steadfast
- RedX

Verify current API documentation, availability, merchant requirements, and integration permissions before implementation.

## Delivery Features

- Delivery address.
- Delivery zones.
- Shipping fee calculation.
- Courier selection.
- Shipment creation.
- Tracking number.
- Tracking status.
- Delivery events.
- Shipment cancellation.
- Failed delivery.
- Return shipment.
- Delivery confirmation.
- Delivery proof where supported.

## Delivery Statuses

- Pending
- Ready to Ship
- Picked Up
- In Transit
- Out for Delivery
- Delivered
- Failed
- Returned
- Cancelled

Each seller sub-order may have a separate shipment.

Customers must be able to view delivery progress from the parent order.

---

# 17. RETURN, REFUND AND DISPUTE MANAGEMENT

Implement a complete return and refund system.

Features:

- Return eligibility.
- Return request.
- Return reason.
- Image evidence.
- Seller response.
- Admin review.
- Return approval.
- Return rejection.
- Return shipment.
- Refund initiation.
- Refund status.
- Partial refund.
- Full refund.
- Dispute management.

Define clear state transitions and permissions.

Financial adjustments must be recorded in the ledger.

Never delete the original order or payment history when processing a refund.

---

# 18. AI INTEGRATION

Build useful AI features based on actual marketplace data.

AI must improve customer experience and operational efficiency.

## AI Shopping Assistant

Capabilities:

- Understand customer queries.
- Recommend relevant products.
- Compare products.
- Explain product specifications.
- Help customers discover categories.
- Answer delivery and return policy questions.
- Guide customers through shopping.

The AI assistant must use real backend catalog and policy data.

It must never invent:

- Product prices.
- Stock availability.
- Discounts.
- Seller ratings.
- Delivery estimates.
- Product specifications.

## AI Product Recommendations

Use a combination of:

- User behavior.
- Product category.
- Purchase history.
- Similar products.
- Popularity.
- Product attributes.

Support personalized recommendations with privacy-aware data handling.

## Semantic Search

Implement:

- Natural-language product search.
- Semantic similarity.
- Keyword search.
- Category filtering.
- Attribute filtering.
- Relevance ranking.

Consider MongoDB Atlas Vector Search or another suitable vector database.

## AI Product Description Generator

Allow sellers to generate:

- Product titles.
- Product descriptions.
- Feature summaries.
- SEO titles.
- SEO descriptions.
- Product tags.

Generated content must be editable and reviewed before publication.

## AI Review Analysis

- Sentiment analysis.
- Common complaints.
- Positive feedback summaries.
- Product quality insights.

## AI Sales Forecasting

- Sales trends.
- Demand forecasting.
- Inventory prediction.
- Seasonal insights.

## AI Customer Support

Use Retrieval-Augmented Generation (RAG) with verified:

- Help documents.
- Shipping policies.
- Refund policies.
- Marketplace rules.
- Support documentation.

## Advanced AI Features

- Visual product search.
- Fraud-risk indicators.
- Unusual purchasing behavior detection.
- Inventory optimization.
- Seller performance insights.

AI-based risk scores must support human review rather than automatically making high-impact decisions without appropriate safeguards.

---

# 19. SEO AND DIGITAL MARKETING

Make the customer-facing storefront SEO-friendly.

## Technical SEO

- Server-side rendering.
- Dynamic metadata.
- Canonical URLs.
- XML sitemap.
- robots.txt.
- Structured data.
- Open Graph.
- Twitter metadata.
- Breadcrumb structured data.
- Product structured data.
- Organization structured data.
- Seller store metadata.
- Search-friendly URLs.
- Image optimization.
- Internal linking.
- Proper heading hierarchy.
- Redirect management.
- Duplicate content prevention.

## Performance SEO

Optimize:

- Core Web Vitals.
- Largest Contentful Paint.
- Interaction to Next Paint.
- Cumulative Layout Shift.
- Image delivery.
- Font loading.
- JavaScript bundles.
- Server response time.

## Marketing Features

- Coupons.
- Flash sales.
- Promotional campaigns.
- Referral system.
- Loyalty program.
- Newsletter.
- Abandoned cart emails.
- Product recommendations.
- Affiliate campaigns.
- Push notifications.
- Meta Pixel.
- Google Analytics.
- Conversion tracking.

All tracking must respect applicable privacy and consent requirements.

---

# 20. SEARCH AND DISCOVERY

Implement an efficient search architecture.

Features:

- Product search.
- Autocomplete.
- Search suggestions.
- Recent searches.
- Popular searches.
- Search history.
- Typo tolerance where supported.
- Category-aware search.
- Brand filtering.
- Attribute filtering.
- Price filtering.
- Rating filtering.
- Seller filtering.
- Relevance ranking.
- Semantic search.

Start with reliable database search and indexes.

Introduce a dedicated search engine only when justified by scale and requirements.

---

# 21. NOTIFICATION SYSTEM

Implement centralized notifications.

Channels:

- In-app notifications.
- Email notifications.
- Push notifications where supported.
- SMS or provider-based notifications where appropriate.

Events:

- Account registration.
- Email verification.
- Password reset.
- Seller approval.
- Product approval.
- New order.
- Order status update.
- Payment success.
- Payment failure.
- Shipment update.
- Delivery confirmation.
- Return request.
- Refund update.
- Settlement update.
- Support response.
- Promotional campaign.

Use background jobs for reliable notification delivery.

Include retry logic and failure logging.

---

# 22. REAL-TIME FEATURES

Use Socket.IO when real-time functionality is useful.

Potential features:

- Order status updates.
- Seller order notifications.
- Customer notifications.
- Support conversations.
- Admin operational alerts.

Implement secure room authorization.

Users must never join another user's private room without permission.

Provide fallback polling or refresh behavior where necessary.

---

# 23. ANALYTICS AND REPORTING

## Platform Analytics

- GMV.
- Platform revenue.
- Commission revenue.
- Order count.
- Average order value.
- Customer growth.
- Seller growth.
- Conversion rate.
- Refund rate.
- Cancellation rate.
- Product performance.
- Category performance.

## Seller Analytics

- Sales.
- Earnings.
- Orders.
- Product performance.
- Inventory performance.
- Customer trends.
- Settlement history.

## Reports

Support date-based filters and export where appropriate.

Potential formats:

- CSV
- Excel
- PDF

Use consistent definitions for all financial and business metrics.

---

# 24. PERFORMANCE AND SCALABILITY

Build for maintainability and future growth.

Requirements:

- Database indexing.
- Efficient queries.
- Pagination.
- Server-side filtering.
- Caching where appropriate.
- Image optimization.
- Lazy loading.
- Code splitting.
- Background jobs.
- API response optimization.
- Rate limiting.
- Connection management.
- Monitoring.
- Error tracking.

Use Redis for caching and job queues where appropriate.

Do not cache sensitive or user-specific information without correct isolation and invalidation.

Do not introduce microservices solely for appearance.

---

# 25. TESTING AND QUALITY ASSURANCE

Testing is mandatory.

## Unit Testing

Test:

- Validation.
- Commission calculation.
- Pricing calculations.
- Coupon logic.
- Inventory logic.
- Order state transitions.
- Refund calculations.
- Permission rules.

## Integration Testing

Test:

- Authentication.
- Seller onboarding.
- Product CRUD.
- Cart operations.
- Multi-vendor checkout.
- Payment callbacks.
- Refund workflow.
- Settlement workflow.
- Shipment workflow.

## End-to-End Testing

Use Playwright.

Test:

1. Customer registration.
2. Customer login.
3. Seller registration.
4. Seller approval.
5. Seller product creation.
6. Admin product moderation.
7. Customer product browsing.
8. Multi-seller cart.
9. Checkout.
10. Payment.
11. Seller order fulfillment.
12. Shipment tracking.
13. Delivery confirmation.
14. Return request.
15. Refund processing.
16. Seller settlement.

## Critical Edge Cases

- Two customers attempt to purchase the final stock simultaneously.
- Payment succeeds but the browser closes.
- Payment webhook arrives more than once.
- Payment callback arrives late.
- Seller is suspended after products enter a cart.
- Product becomes unavailable during checkout.
- A customer attempts to access another customer's order.
- A seller attempts to access another seller's data.
- Partial seller return.
- Partial refund.
- Duplicate checkout request.
- Failed shipment.
- Expired stock reservation.

## Security Testing

Test:

- XSS.
- CSRF where applicable.
- NoSQL injection.
- Unauthorized access.
- Privilege escalation.
- Rate limits.
- File upload validation.
- Webhook verification.
- Session security.

Do not claim a feature or integration is complete unless it has actually been implemented and tested.

---

# 26. DEPLOYMENT AND DEVOPS

## Recommended Deployment

Storefront:
- Vercel.

Seller Dashboard:
- Vercel.

Admin Dashboard:
- Vercel.

Backend API:
- Render or AWS.

Background Worker:
- Separate worker process on suitable infrastructure.

Database:
- MongoDB Atlas.

Cache and Queues:
- Managed Redis.

Media:
- Cloudinary.

## CI/CD

Implement:

- GitHub Actions.
- Lint checks.
- Type checking.
- Unit tests.
- Integration tests.
- Production build checks.
- Deployment workflow.

## Monitoring

- Sentry.
- Structured logs.
- Health checks.
- Error monitoring.
- Performance monitoring.
- Database monitoring.
- Background job monitoring.

## Environment Variables

Create separate environment configurations for:

- Local development.
- Testing.
- Staging.
- Production.

Create a complete `.env.example`.

Never expose private API keys in frontend environment variables.

The frontend should communicate with the backend using a configured public API base URL.

Payment secrets, database credentials, JWT secrets, and private service keys must remain server-side.

---

# 27. DOCUMENTATION REQUIREMENTS

Create and maintain:

1. README.md
2. SRS.md
3. ARCHITECTURE.md
4. DATABASE.md
5. ER-DIAGRAM.md
6. API.md
7. API-REFERENCE.md
8. AUTHENTICATION.md
9. RBAC.md
10. PAYMENT-FLOW.md
11. ORDER-FLOW.md
12. COMMISSION-FLOW.md
13. SETTLEMENT-FLOW.md
14. SHIPPING-FLOW.md
15. AI-ARCHITECTURE.md
16. SEO-GUIDE.md
17. SECURITY.md
18. TESTING.md
19. DEPLOYMENT.md
20. ENVIRONMENT-VARIABLES.md
21. DEVELOPMENT-ROADMAP.md
22. CHANGELOG.md

Documentation must match the actual implementation.

Do not document imaginary features as completed.

---

# 28. DEVELOPMENT ROADMAP — 20 WEEKS

Use the following roadmap as an initial project plan.

The timeline is an estimate, not a guarantee. Adjust it according to actual complexity, integrations, testing, and available development time.

## PHASE 1 — Planning and Design
Weeks 1–2

Tasks:
- Requirements analysis.
- SRS.
- User journeys.
- Business logic.
- Architecture planning.
- Database ER diagram.
- API planning.
- Figma design system.
- Storefront wireframes.
- Seller dashboard wireframes.
- Admin dashboard wireframes.

Deliverables:
- SRS.
- Architecture document.
- ER diagram.
- API specification.
- Design system.
- High-fidelity primary screens.

## PHASE 2 — Project Foundation and Authentication
Weeks 3–4

Tasks:
- Monorepo setup.
- Frontend applications.
- Backend setup.
- Database connection.
- Shared packages.
- Authentication.
- RBAC.
- Validation.
- Error handling.
- Logging.
- Environment configuration.

Deliverables:
- Working project structure.
- Authentication.
- Protected routes.
- Role and permission system.

## PHASE 3 — Seller and Catalog
Weeks 5–7

Tasks:
- Seller onboarding.
- Seller approval.
- Store management.
- Categories.
- Brands.
- Attributes.
- Product CRUD.
- Variants.
- Image uploads.
- Inventory.
- Product moderation.
- Product search.

Deliverables:
- Functional seller dashboard.
- Functional catalog.
- Admin product moderation.

## PHASE 4 — Shopping and Orders
Weeks 8–10

Tasks:
- Product listing.
- Product details.
- Search and filters.
- Cart.
- Wishlist.
- Product comparison.
- Checkout.
- Parent orders.
- Seller sub-orders.
- Stock reservations.

Deliverables:
- Functional storefront.
- Multi-vendor shopping cart.
- Multi-vendor checkout.
- Reliable order creation.

## PHASE 5 — Payments and Delivery
Weeks 11–12

Tasks:
- COD.
- Payment gateway integration.
- Webhook verification.
- Payment reconciliation.
- Shipping configuration.
- Courier integration.
- Shipment tracking.
- Returns.
- Refund workflows.

Deliverables:
- Verified payment workflows.
- Seller-specific shipment management.
- Customer order tracking.

## PHASE 6 — Admin, Finance and Analytics
Weeks 13–15

Tasks:
- Admin dashboard.
- Seller management.
- User management.
- Product moderation.
- Order management.
- Commission engine.
- Seller ledger.
- Settlement workflow.
- Reports.
- Analytics.
- Audit logs.

Deliverables:
- Functional Admin Panel.
- Financial architecture.
- Commission and settlement workflows.

## PHASE 7 — AI, SEO and Marketing
Weeks 16–17

Tasks:
- AI shopping assistant.
- AI recommendations.
- Semantic search.
- AI product descriptions.
- AI review analysis.
- SEO metadata.
- Structured data.
- Sitemap.
- Marketing campaigns.
- Email automation.

Deliverables:
- Initial AI features.
- SEO-ready storefront.
- Marketing management.

## PHASE 8 — Testing, Security and Deployment
Weeks 18–20

Tasks:
- Unit testing.
- Integration testing.
- End-to-end testing.
- Security review.
- Performance optimization.
- Bug fixing.
- Deployment.
- Monitoring.
- Documentation review.
- Production readiness checklist.

Deliverables:
- Tested production candidate.
- Deployment documentation.
- Monitoring.
- Launch checklist.

---

# 29. IMPLEMENTATION RULES FOR THE AI CODING AGENT

These rules are mandatory.

## Rule 1 — Inspect Before Building

Before changing any code:

- Inspect the complete repository.
- Identify the existing framework.
- Identify existing dependencies.
- Understand the folder structure.
- Identify implemented features.
- Identify incomplete features.
- Identify broken functionality.
- Inspect environment configuration.
- Identify architectural risks.

Never assume that the repository is empty.

Never overwrite existing work without understanding its purpose.

## Rule 2 — Create a Master Implementation Plan

Before coding, create:

- Project analysis.
- Architecture plan.
- Module breakdown.
- Database plan.
- API plan.
- UI/UX plan.
- Development sequence.
- Testing strategy.
- Risk register.

## Rule 3 — Work Phase by Phase

Implement one phase at a time.

Do not attempt to build the entire marketplace in a single operation.

After completing each phase:

1. Review the code.
2. Run linting.
3. Run type checking.
4. Run relevant tests.
5. Run production build.
6. Fix errors.
7. Update documentation.
8. Produce a progress report.

Do not start the next dependent phase while critical failures remain unresolved.

## Rule 4 — Do Not Use Fake Implementations

Never:

- Use fake API responses as production data.
- Hardcode dashboard statistics.
- Fake payment success.
- Fake seller approval.
- Fake order fulfillment.
- Fake inventory updates.
- Fake analytics.
- Pretend an API is integrated when it is not.

Mock data may be used only for explicitly identified development and testing environments.

Clearly separate mock functionality from production functionality.

## Rule 5 — Preserve Existing Functionality

- Avoid unnecessary rewrites.
- Preserve existing working modules.
- Maintain backward compatibility where possible.
- Reuse existing components.
- Avoid duplicate logic.
- Keep shared types consistent.
- Use migrations or safe data changes where necessary.

## Rule 6 — Maintain Code Quality

- TypeScript strict mode.
- No unnecessary `any`.
- Reusable components.
- Modular backend.
- Consistent naming.
- Clear folder structure.
- Separation of concerns.
- Centralized validation.
- Centralized error handling.
- No duplicated business logic.
- No unnecessary dependencies.

## Rule 7 — Secure by Default

Every backend endpoint must have the appropriate:

- Authentication.
- Authorization.
- Validation.
- Ownership verification.
- Error handling.
- Rate limiting where needed.
- Audit logging where appropriate.

Never rely only on frontend restrictions.

## Rule 8 — Real Integrations Require Verification

Before integrating a third-party provider:

- Read its official documentation.
- Verify API availability.
- Check required credentials.
- Check merchant eligibility.
- Understand callback and webhook behavior.
- Document sandbox and production configuration.
- Test actual provider responses.

If credentials are missing, implement a clearly defined integration interface and sandbox-ready workflow.

Do not pretend that a live integration is complete.

## Rule 9 — Maintain a Progress Tracker

Maintain a `PROJECT-STATUS.md` file.

For every module, use one of these statuses:

- NOT STARTED
- PLANNED
- IN PROGRESS
- IMPLEMENTED
- TESTING
- VERIFIED
- BLOCKED

Only mark a feature VERIFIED when the required implementation and tests have passed.

Include:

- Completed tasks.
- In-progress tasks.
- Pending tasks.
- Blockers.
- Known bugs.
- Security concerns.
- Integration requirements.
- Next steps.

## Rule 10 — Report Honestly

After every phase, provide:

- What was implemented.
- Files created.
- Files modified.
- APIs created.
- Database models created.
- Tests executed.
- Test results.
- Build results.
- Known issues.
- Missing credentials.
- Manual configuration requirements.
- Next phase.

Never claim success without evidence.

---

# 30. REQUIRED FIRST DEVELOPMENT MILESTONE

Do not immediately implement all features.

First complete the foundation and design milestone.

### Customer Storefront

- Homepage.
- Navigation.
- Category section.
- Product listing.
- Product details.
- Search.
- Cart.

### Seller Dashboard

- Dashboard overview.
- Seller navigation.
- Product management interface.
- Inventory interface.
- Order management interface.
- Finance overview.

### Admin Dashboard

- Admin overview.
- User management.
- Seller management.
- Product moderation.
- Order management.
- Finance overview.

### Technical Foundation

- Project architecture.
- Shared UI package.
- Database ER diagram.
- API documentation.
- Authentication plan.
- RBAC plan.
- Environment configuration.

The first milestone must be visually consistent and architecturally ready for backend integration.

Do not fill pages with random placeholder cards just to make them look complete.

---

# 31. FINAL ACCEPTANCE CRITERIA

The project is considered ready for production consideration only when the following are implemented and verified.

## Customer Experience

- Registration and authentication.
- Product discovery.
- Search and filtering.
- Product details.
- Multi-vendor cart.
- Checkout.
- Order history.
- Order tracking.
- Reviews.
- Wishlist.
- Returns and refunds.

## Seller Experience

- Seller onboarding.
- Seller approval.
- Store management.
- Product management.
- Inventory.
- Seller-specific order management.
- Financial statements.
- Settlement workflow.
- Seller analytics.

## Admin Experience

- RBAC.
- User management.
- Seller management.
- Product moderation.
- Order management.
- Commission management.
- Payment management.
- Refund management.
- Settlement management.
- Marketing management.
- Audit logs.
- Reports.

## Financial Reliability

- Parent and sub-orders.
- Accurate server-side calculations.
- Commission snapshots.
- Immutable financial ledger.
- Payment verification.
- Idempotent webhooks.
- Refund adjustments.
- Settlement reconciliation.

## Technical Quality

- Responsive UI.
- Accessibility.
- Secure authentication.
- Server-side authorization.
- Database indexes.
- API validation.
- Error handling.
- Automated tests.
- Performance optimization.
- SEO.
- Monitoring.
- Documentation.
- Deployment readiness.

## Business Reliability

- Seller data isolation.
- Stock concurrency protection.
- Payment reconciliation.
- Delivery tracking.
- Refund consistency.
- Operational audit trail.

---

# 32. FINAL INSTRUCTION

Build this project as a real, professional, scalable multi-vendor e-commerce marketplace.

Think like a principal software architect before acting like a code generator.

Prioritize:

1. Architecture.
2. Data integrity.
3. Security.
4. Financial correctness.
5. Reliable order and inventory workflows.
6. User experience.
7. Maintainability.
8. Performance.
9. SEO.
10. AI innovation.

Do not sacrifice reliability for visual appearance.

Do not sacrifice maintainability for development speed.

Do not introduce advanced AI features before the core marketplace workflows are reliable.

Do not skip testing or documentation.

Do not invent integrations, credentials, business rules, or completed functionality.

When a requirement is ambiguous, document the assumption and ask for clarification only when it materially affects architecture, security, finance, or user experience.

---

# START EXECUTION

Your first task is NOT to write the entire application.

Start by:

**STEP 1:** Inspect the existing repository and development environment.

**STEP 2:** Produce a detailed project analysis.

**STEP 3:** Create the complete Software Requirements Specification (SRS).

**STEP 4:** Design the system architecture.

**STEP 5:** Create the database schema and ER diagram.

**STEP 6:** Define the complete API structure.

**STEP 7:** Create the UI/UX design system and screen inventory.

**STEP 8:** Create a phase-by-phase implementation plan.

**STEP 9:** Create `PROJECT-STATUS.md`.

**STEP 10:** Present the complete planning report and wait for approval before beginning major implementation.

After approval, execute each development phase independently.

At the end of every phase, test, verify, document, and report before continuing.

**The ultimate goal is a production-ready, enterprise-quality, premium multi-vendor marketplace — not merely a visually attractive frontend or an incomplete demonstration.**