# UI/UX Design System & Screen Inventory
## Enterprise Multi-Vendor E-Commerce Marketplace
**Document Version:** 1.0.0  
**Design Paradigm:** Premium Minimal Luxury / Conversion-Optimized Commerce  
**Component Engine:** Tailwind CSS + shadcn/ui + Radix UI Primitives + Framer Motion  
**Typography Core:** Plus Jakarta Sans & Inter  

---

## 1. Design Philosophy & Brand Direction

The user experience is engineered to evoke the confidence, clarity, and precision of tier-1 digital product leaders (Apple, Stripe, Linear, Vercel) while accommodating the operational density of modern multi-vendor marketplaces.

### Core Principles
1. **Content-First Hierarchy**: High-fidelity product imagery and clean typography take precedence over decorative UI elements.
2. **Predictable Interaction Models**: Standardized placement for navigation, filters, search, and action triggers across all three portals.
3. **Micro-Feedback & Purposeful Motion**: Every asynchronous operation provides immediate tactile feedback (skeletons, spinners, disabled states, optimistic UI updates).
4. **Universal Accessibility (WCAG 2.1 AA)**: Minimum $4.5:1$ contrast ratio for standard body copy, full keyboard focus rings, screen reader ARIA compliance, and strict `prefers-reduced-motion` fallbacks.

---

## 2. Design Tokens & Color Palette

### 2.1 Core Palette Tokens

```
+───────────────────────────────────────────────────────────────────────────+
|                           PRIMARY PALETTE SWATCHES                        |
+───────────────────────────────────────────────────────────────────────────+
|  Primary Background : #F8FAFC  (Slate 50)                                 |
|  Primary Surface    : #FFFFFF  (Pure White)                               |
|  Deep Navy          : #101828  (Midnight Navy - Headers & High-Contrast)  |
|  Primary Blue       : #3563E9  (Royal Blue - Brand, CTAs & Focus)         |
|  Cyan Accent        : #06B6D4  (Vibrant Cyan - Badges & Promotions)       |
|  Primary Text       : #101828  (High-legibility Dark Slate)               |
|  Secondary Text     : #667085  (Subdued Slate - Metadata & Captions)      |
|  Border Color       : #E4E7EC  (Crisp Neutral Divider)                    |
+───────────────────────────────────────────────────────────────────────────+
```

### 2.2 Semantic & Status Tokens

| Semantic Role | Light Mode Hex | Dark Mode Hex | Usage Application |
| :--- | :--- | :--- | :--- |
| **Success** | `#059669` (Emerald 600) | `#10B981` (Emerald 500) | Completed orders, cleared escrow, in-stock badges. |
| **Warning** | `#D97706` (Amber 600) | `#F59E0B` (Amber 500) | Pending KYC, low inventory warning, dispute in review. |
| **Destructive** | `#DC2626` (Red 600) | `#EF4444` (Red 500) | Out of stock, cancelled orders, rejected KYC, delete modal. |
| **Information** | `#3563E9` (Blue 600) | `#60A5FA` (Blue 400) | Tracking updates, order confirmation notes, active filters. |
| **Accent / Highlight**| `#06B6D4` (Cyan 500) | `#22D3EE` (Cyan 400) | Flash sales, discount badges, verified seller checkmarks. |

### 2.3 Surface & Elevation Matrix
- **Level 0 (Base Canvas)**: `#F8FAFC` (Dark: `#090D16`)
- **Level 1 (Card & Content Surface)**: `#FFFFFF` (Dark: `#111726`)
- **Level 2 (Modals, Popovers, Dropdowns)**: `#FFFFFF` with `box-shadow: 0 10px 15px -3px rgba(16, 24, 40, 0.08)`
- **Level 3 (Toasts & Global Drawers)**: `#FFFFFF` with `box-shadow: 0 20px 25px -5px rgba(16, 24, 40, 0.12)`

---

## 3. Typography System & Type Scale

The platform pairs **Plus Jakarta Sans** (headings, metric displays, navigation) with **Inter** (dense data tables, form controls, product descriptions).

| Style Level | Font Family | Size (Desktop / Mobile) | Weight | Line Height | Tracking |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display 1** | Plus Jakarta Sans | 48px / 36px | Bold (700) | 1.15 | -0.02em |
| **Heading 1** | Plus Jakarta Sans | 36px / 28px | SemiBold (600) | 1.25 | -0.015em |
| **Heading 2** | Plus Jakarta Sans | 28px / 24px | SemiBold (600) | 1.30 | -0.01em |
| **Heading 3** | Plus Jakarta Sans | 22px / 20px | Medium (500) | 1.35 | -0.005em |
| **Heading 4** | Plus Jakarta Sans | 18px / 18px | Medium (500) | 1.40 | 0.0em |
| **Body Large** | Inter | 16px / 16px | Regular / Medium | 1.50 | 0.0em |
| **Body Base** | Inter | 14px / 14px | Regular (400) | 1.50 | 0.0em |
| **Body Small** | Inter | 12px / 12px | Regular / Medium | 1.45 | +0.01em |
| **Caption** | Inter | 11px / 11px | Medium (500) | 1.40 | +0.02em |
| **Code / Price**| JetBrains Mono / Inter | 14px–24px | SemiBold (600) | 1.20 | -0.01em |

---

## 4. Spacing, Radii & Grid Foundation

- **Base Unit**: `4px` grid system ($4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80\text{px}$).
- **Corner Radii Tokens**:
  - `radius-sm`: `6px` (tooltips, small badges).
  - `radius-md`: `10px` (inputs, buttons, select menus).
  - `radius-lg`: `14px` (standard cards, popovers, product cards).
  - `radius-xl`: `20px` (modal dialogues, banner containers).
  - `radius-full`: `9999px` (pills, avatar circles, filter chips).
- **Responsive Layout Breakpoints**:
  - `sm`: $640\text{px}$ (Mobile Landscape)
  - `md`: $768\text{px}$ (Tablets)
  - `lg`: $1024\text{px}$ (Small Desktop / Laptops)
  - `xl`: $1280\text{px}$ (Standard Desktop)
  - `2xl`: $1536\text{px}$ (Wide Workstations)

---

## 5. Reusable Component Inventory (`packages/ui`)

All shared primitives are packaged in `packages/ui`, exported with full TypeScript type safety, Radix UI accessibility primitives, and Tailwind theme tokens.

```
packages/ui/src/
├── primitives/
│   ├── Button.tsx               # Primary, Secondary, Outline, Ghost, Destructive, Link
│   ├── IconButton.tsx           # Accessible 44x44px touch-target icon buttons
│   ├── Input.tsx                # Text, Email, Password (with toggle), Number, Search
│   ├── Textarea.tsx             # Auto-resizing textarea with character count
│   ├── Select.tsx               # Single & Multi-select with searchable dropdown
│   ├── Checkbox.tsx             # Accessible checkbox with indeterminate state
│   ├── Radio.tsx                # Radio group primitive
│   ├── Switch.tsx               # Animated toggle switch
│   ├── Badge.tsx                # Status badges (Success, Warning, Neutral, Cyan, Red)
│   ├── Avatar.tsx               # Image with initials fallback & online status indicator
│   ├── Tooltip.tsx              # Hover/focus tooltip with delay duration
│   └── Popover.tsx              # Rich floating content container
│
├── feedback/
│   ├── Modal.tsx / Dialog.tsx   # Accessible focus-trapped dialogs with backdrop blur
│   ├── Drawer.tsx               # Slide-over sheets for mobile filters & cart preview
│   ├── Alert.tsx                # Contextual warning/error/info banner
│   ├── Toast.tsx                # Sonner-based stacked notification toasts
│   ├── Skeleton.tsx             # Shimmer skeleton loader matching exact element geometry
│   ├── LoadingSpinner.tsx       # Smooth SVG spinner with size variants
│   ├── EmptyState.tsx           # Standardized illustrations with title & CTA button
│   └── ErrorState.tsx           # Boundary fallback with retry trigger
│
├── navigation/
│   ├── Tabs.tsx                 # Segmented & underline tab navigators
│   ├── Accordion.tsx            # Animated collapsible FAQ & filter accordions
│   ├── Breadcrumb.tsx           # Accessible breadcrumb trail with schema microdata
│   └── Pagination.tsx           # Numbered pagination with previous/next & page jumper
│
├── data-display/
│   ├── DataTable.tsx            # TanStack Table integration: sorting, filters, pagination, row selection
│   ├── Card.tsx                 # Base card container with header, content, and footer
│   ├── StatCard.tsx             # KPI card: metric number, trend indicator (+12%), sparkline
│   ├── ChartCard.tsx            # Container for Recharts (Area, Bar, Pie, Funnel)
│   ├── PriceDisplay.tsx         # BDT (৳) formatted currency with strikethrough compare-at price
│   ├── Rating.tsx               # Interactive & read-only 5-star rating display with half-stars
│   └── ReviewCard.tsx           # Customer review card with verified badge and helpful voting
│
└── commerce/
    ├── SearchBar.tsx            # Search input with live debounced autocomplete dropdown
    ├── ProductCard.tsx          # Storefront product card: image carousel, hover quick-add, badge
    ├── ProductGrid.tsx          # Responsive auto-fill grid (2 cols mobile, 4-5 cols desktop)
    ├── ImageGallery.tsx         # Product gallery: thumbnails, high-res main view, zoom lens
    └── FileUploader.tsx         # Drag-and-drop Cloudinary uploader with image preview & crop
```

---

## 6. Comprehensive Screen Inventory (108 Distinct Interfaces)

---

### 6.1 Customer Storefront (`apps/storefront` — 48 Screens)

#### Public Pages (22 Screens)
1. **Homepage (`/`)**: Hero carousel, flash sales, category grid, recommended feeds, trending vendors, trust banners.
2. **Shop / Catalog Listing (`/shop`)**: Faceted multi-filter grid, sorting dropdown, active chips, view switcher.
3. **Category Explorer (`/categories`)**: Full hierarchical taxonomy directory with visual icons.
4. **Category Detail Page (`/category/[slug]`)**: Category banner, subcategories pills, filtered product catalog.
5. **Subcategory Detail Page (`/category/[slug]/[subSlug]`)**: Leaf category listing with specialized attribute filters.
6. **Search Results Page (`/search?q=...`)**: Dynamic query results, spelling suggestions, vector similarity fallbacks.
7. **Product Details Page (`/product/[slug]`)**: Image gallery, variant picker (size/color), stock counter, seller info card, reviews, related products.
8. **Brand Directory (`/brands`)**: A-Z listing of all verified marketplace brands.
9. **Brand Details Page (`/brand/[slug]`)**: Brand header, story, and brand-filtered catalog.
10. **Seller Storefront (`/store/[slug]`)**: Vendor cover banner, logo, bio, verified rating, store-specific search, store catalog.
11. **Seller Profile & Policies (`/store/[slug]/about`)**: Vendor credentials, warehouse dispatch origin, return/shipping policy.
12. **Flash Sales Landing (`/flash-deals`)**: Countdown timers, limited-stock progress bars, exclusive discounts.
13. **Promotional Campaigns (`/campaigns/[slug]`)**: Seasonal promotional hubs (e.g. "Eid Super Sale", "Winter Fest").
14. **Blog Index (`/blog`)**: Editorial e-commerce articles, buying guides, style guides.
15. **Blog Article Details (`/blog/[slug]`)**: Article content, author bio, shoppable embedded product cards.
16. **About Us (`/about`)**: Marketplace mission, leadership, merchant success stories.
17. **Contact Us (`/contact`)**: Inquiries form, office locations, customer support hotline.
18. **Help Center (`/help`)**: Searchable knowledge base, topic categories.
19. **Frequently Asked Questions (`/faq`)**: Searchable accordion FAQs for buyers and sellers.
20. **Terms & Conditions (`/terms`)**: Platform legal usage contracts.
21. **Privacy Policy (`/privacy`)**: Data governance, cookies, user rights disclosure.
22. **Return & Refund Policy (`/return-policy`)**: Detailed 7-day return guidelines and dispute rules.

#### Customer Account & Management (17 Screens)
23. **Login (`/auth/login`)**: Email/password, "Remember Me", Google OAuth button, link to registration.
24. **Customer Registration (`/auth/register`)**: Name, email, mobile phone, password strength meter, TOS acceptance.
25. **Email Verification (`/auth/verify-email`)**: Verification link confirmation with resend countdown.
26. **Forgot Password (`/auth/forgot-password`)**: Email submission form with rate-limit cooldown.
27. **Reset Password (`/auth/reset-password`)**: New password creation with complexity validation.
28. **Customer Dashboard Overview (`/account`)**: Order snapshot, recent activities, default address card, loyalty credits.
29. **Profile Settings (`/account/profile`)**: Avatar uploader, contact updates, email preferences.
30. **Address Book (`/account/addresses`)**: Address cards grid, "Add Address" modal, default shipping/billing markers.
31. **My Orders (`/account/orders`)**: Filterable order list (All, Unpaid, In Transit, Delivered, Cancelled) with parent order cards.
32. **Order Details (`/account/orders/[orderNumber]`)**: Consolidated parent receipt, split vendor sub-order status cards, itemized invoices.
33. **Live Order Tracking (`/account/orders/[orderNumber]/track`)**: Stepper timeline, carrier consignment code, live courier milestone notes.
34. **Wishlist (`/account/wishlist`)**: Saved products grid with instant "Move to Cart" and stock status.
35. **Product Comparison (`/compare`)**: Side-by-side technical attribute comparison matrix for up to 4 items.
36. **My Reviews (`/account/reviews`)**: Unreviewed items queue + history of submitted reviews with edit options.
37. **Notification Center (`/account/notifications`)**: Real-time alerts for price drops, order dispatches, return decisions.
38. **Customer Support Tickets (`/account/tickets`)**: Active inquiry tickets with threaded seller/staff chat.
39. **Account Security (`/account/security`)**: Password change, active device sessions list, account deletion request.

#### Shopping & Checkout Experience (9 Screens)
40. **Shopping Cart (`/cart`)**: Vendor-grouped item list, quantity adjusters, variant switchers, coupon box, dynamic delivery charges, order summary.
41. **Multi-Vendor Checkout (`/checkout`)**: 3-step checkout: Address selection, vendor shipping review, payment method selector.
42. **Payment Processing Screen (`/checkout/payment`)**: Gateway redirect bridge with security assurance badges.
43. **Order Confirmation (`/checkout/confirmation`)**: Pre-order review modal for Cash on Delivery orders.
44. **Order Success (`/checkout/success?orderNumber=...`)**: Celebration screen, order summary, tracking quick link, invoice PDF download.
45. **Order Failure (`/checkout/failure`)**: Failure reason explanation with "Retry Payment" CTA without clearing cart.
46. **Payment Pending (`/checkout/pending`)**: Verification bridge for asynchronous MFS callbacks (e.g. waiting for bKash webhook).
47. **Return Request Wizard (`/account/orders/[orderNumber]/return`)**: Item selector, defect reason dropdown, image uploader.
48. **Refund Status (`/account/refunds/[id]`)**: Step-by-step financial tracking of refunded funds back to source.

---

### 6.2 Seller Dashboard (`apps/seller-dashboard` — 24 Screens)

#### Onboarding & Verification (4 Screens)
49. **Seller Sign-Up (`/onboarding/register`)**: Business identity and owner credentials form.
50. **KYC Verification Wizard (`/onboarding/kyc`)**: Multi-step Trade License, NID/Passport, bank routing details upload.
51. **KYC Pending Review (`/onboarding/pending`)**: Waiting screen with document status tracker and support contact.
52. **KYC Rejection & Resubmission (`/onboarding/rejected`)**: Clear feedback from admin moderator with file re-upload form.

#### Operations & Management (20 Screens)
53. **Seller Dashboard Overview (`/dashboard`)**: Metric stat cards (Sales, Orders, Low Stock, Pending Payouts), sales area chart, recent sub-orders table.
54. **Product Catalog Listing (`/products`)**: Data table of all seller products with status badges, stock levels, quick price edits, filters.
55. **Create Product Wizard (`/products/new`)**: 4-step wizard: Basic info, Category & Attributes, Multi-variant matrix generator, SEO & Pricing.
56. **Edit Product (`/products/[id]/edit`)**: Tabbed product editor with live preview link and image gallery sorter.
57. **Bulk Product Upload (`/products/bulk`)**: CSV/Excel template download, spreadsheet uploader, validation error preview.
58. **Inventory Control Center (`/inventory`)**: Variant SKU table with available/reserved counts, inline restock input, low-stock filter.
59. **Inventory Movement History (`/inventory/movements`)**: Audit trail of every stock change with reference order IDs.
60. **Sub-Order Management Queue (`/orders`)**: Filterable sub-order table (`NEW`, `CONFIRMED`, `PACKED`, `SHIPPED`, `DELIVERED`).
61. **Sub-Order Detail Card (`/orders/[subOrderNumber]`)**: Customer delivery address, items checklist, packaging dimensions, packing action.
62. **Consignment & Shipping Label Generator (`/orders/[subOrderNumber]/ship`)**: Courier selection (Pathao/Steadfast), consignment booking, printable barcode label.
63. **Return Requests Queue (`/returns`)**: Inbound return claims, customer photos, accept/contest action buttons.
64. **Return Inspection & Restock (`/returns/[id]`)**: Returned parcel verification, condition checklist, release refund trigger.
65. **Seller Wallet & Financial Statements (`/finance/wallet`)**: Pending escrow balance, available balance, transaction history table.
66. **Settlement / Payout Request (`/finance/settlements/new`)**: Withdrawal form with available balance validator, bank selector.
67. **Settlement History (`/finance/settlements`)**: Historical payout batch log with bank reference numbers.
68. **Store Profile Customizer (`/settings/store`)**: Logo, banner uploader, store description, social links, opening hours.
69. **Store Shipping Settings (`/settings/shipping`)**: Warehouse pickup address, self-delivery zones, flat-rate options.
70. **Store Voucher Management (`/marketing/coupons`)**: Create store-specific coupons with minimum spend and expiration dates.
71. **Seller Analytics & Trends (`/analytics`)**: GMV over time, conversion funnels, top 10 products, repeat customer rate.
72. **Customer Reviews Management (`/reviews`)**: Buyer feedback list with public seller reply composer.

---

### 6.3 Admin Command Center (`apps/admin-dashboard` — 36 Screens)

#### Overview & Governance (4 Screens)
73. **Executive Marketplace Dashboard (`/admin`)**: Real-time GMV counter, platform commission revenue, active user counts, platform order flow charts.
74. **Administrative Audit Logs (`/admin/system/audit-logs`)**: Filterable immutable event stream of all administrative actions.
75. **Platform System Settings (`/admin/system/settings`)**: Default commission %, escrow hold duration (days), global policies.
76. **Staff Accounts & RBAC (`/admin/system/staff`)**: Staff listing, role assignment modal (`Product Manager`, `Finance Manager`, etc.).

#### User & Vendor Moderation (8 Screens)
77. **Customer Directory (`/admin/users/customers`)**: All registered buyers, order histories, account suspension toggles.
78. **Customer Detail View (`/admin/users/customers/[id]`)**: Full buyer dossier, addresses, lifetime spend, dispute history.
79. **Seller Directory (`/admin/sellers`)**: All registered vendors with store names, status, and aggregate ratings.
80. **Seller KYC Approval Queue (`/admin/sellers/kyc`)**: Side-by-side document inspection interface, Approve/Reject modal with reason selector.
81. **Seller Dossier & Performance (`/admin/sellers/[id]`)**: Historical sales, store status override, custom commission % contract override.
82. **Suspended Accounts Queue (`/admin/users/suspended`)**: Reactivation appeals management.
83. **Role & Permission Editor (`/admin/system/roles`)**: Granular toggle matrix for custom staff roles.
84. **Activity Logs by User (`/admin/users/[id]/activity`)**: Session login history and security events.

#### Catalog Governance & Taxonomy (6 Screens)
85. **Product Moderation Queue (`/admin/catalog/moderation`)**: Review submitted seller products, image moderation, Approve/Reject tools.
86. **Master Catalog Index (`/admin/catalog/products`)**: Global search across all vendor products with administrative edit/archive privileges.
87. **Category Hierarchy Manager (`/admin/catalog/categories`)**: Interactive drag-and-drop category tree with commission rate editors.
88. **Category Attribute Templates (`/admin/catalog/attributes`)**: Global attribute sets (e.g. Electronics specs, Apparel sizing).
89. **Verified Brands Directory (`/admin/catalog/brands`)**: Brand creation, logo management, official flagship store tags.
90. **Reported Products Queue (`/admin/catalog/reported`)**: Customer reports on counterfeit/prohibited items.

#### Order & Financial Oversight (10 Screens)
91. **Global Order Directory (`/admin/orders`)**: Complete view of all Parent Orders with multi-vendor breakdowns.
92. **Parent Order Detail View (`/admin/orders/[orderNumber]`)**: Customer info, full payment receipt, list of all associated sub-orders.
93. **Global Sub-Orders Queue (`/admin/orders/sub-orders`)**: Monitor vendor fulfillment SLA adherence, overdue dispatches.
94. **Dispute Arbitration Center (`/admin/orders/disputes`)**: 3-party dispute mediation panel (Customer claim, Seller defense, Admin judgment).
95. **Platform Financial Ledger (`/admin/finance/ledger`)**: Searchable double-entry journal viewer with account filter and date range.
96. **Seller Payout Approvals (`/admin/finance/settlements`)**: Review and batch-approve pending seller withdrawal requests.
97. **Settlement Detail & Wire Log (`/admin/finance/settlements/[id]`)**: Record bank wire transfer transaction reference and disburse.
98. **Platform Commission Revenue (`/admin/finance/commissions`)**: Breakdown of platform earnings by category, vendor, and month.
99. **Payment Gateway Reconciliation (`/admin/finance/gateways`)**: Compare gateway collected amounts against parent order records.
100. **Tax & Financial Reports Export (`/admin/finance/reports`)**: CSV/Excel/PDF export generator for accountants and tax auditors.

#### Marketing, Content & Support (8 Screens)
101. **Platform Coupons & Campaigns (`/admin/marketing/coupons`)**: Platform-wide voucher creator with budget allocation caps.
102. **Flash Sale Manager (`/admin/marketing/flash-sales`)**: Schedule promotional flash sales, approve featured products.
103. **Homepage Layout & Banner CMS (`/admin/content/homepage`)**: Drag-and-drop homepage section builder, banner carousel uploader.
104. **Blog & Editorial CMS (`/admin/content/blog`)**: Rich-text article editor with shoppable product embeds.
105. **Static Pages & Policies CMS (`/admin/content/pages`)**: Edit TOS, Privacy, and FAQ contents.
106. **Global Review Moderation (`/admin/support/reviews`)**: AI-flagged suspicious reviews, spam removal tool.
107. **Customer Support Ticket Queue (`/admin/support/tickets`)**: Support inbox, ticket assignment to agents, resolution metrics.
108. **Support Conversation View (`/admin/support/tickets/[id]`)**: Real-time customer chat, internal staff notes, order lookup panel.

---

## 7. Motion, Micro-Interactions & Transitions

All animations are implemented via **Framer Motion** and adhere to natural easing curves:
- **Standard Transition**: `duration: 0.2s, ease: [0.16, 1, 0.3, 1]` (subtle, snappy).
- **Modal Entry**: `initial: { opacity: 0, scale: 0.96 }, animate: { opacity: 1, scale: 1 }`.
- **Drawer Slide-Over**: `initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" }`.
- **Toast Stacking**: Smooth vertical spring physics.
- **Accessibility Safeguard**: If `useReducedMotion()` is active, all layout and scale animations are replaced with instant opacity fades.

---
**Document Sign-Off:** Lead UI/UX Systems Designer, Principal Frontend Architect.
