# REST API Specification & Contract
## Enterprise Multi-Vendor E-Commerce Marketplace
**Document Version:** 1.0.0  
**Base URL:** `https://api.marketplace.com/api/v1` (Production) / `http://localhost:5000/api/v1` (Local)  
**Protocol:** HTTPS / REST / JSON  
**Authentication Scheme:** Bearer Token (JWT) in `Authorization` Header  

---

## 1. Global API Standards & Conventions

### 1.1 HTTP Headers
- `Content-Type: application/json`: Required for all `POST`, `PUT`, and `PATCH` requests.
- `Authorization: Bearer <accessToken>`: Required for all protected endpoints.
- `X-Idempotency-Key: <UUIDv4>`: Recommended for payment initializations, checkout placement, and state-altering financial mutations to prevent duplicate execution.
- `X-Store-Id: <storeId>`: Optional header for multi-store sellers; validated against user identity.

### 1.2 Unified Success Response Format
All successful API responses adhere strictly to the following standard JSON envelope:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Resource retrieved successfully",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 184,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```
*(The `meta` object is included automatically on all paginated listing endpoints).*

### 1.3 Unified Error Response Format
All error responses adhere to the standard structured error envelope:

```json
{
  "success": false,
  "statusCode": 400,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload",
    "details": [
      {
        "field": "price",
        "message": "Price must be a positive number greater than zero"
      }
    ]
  },
  "timestamp": "2026-11-14T14:45:00.000Z"
}
```

### 1.4 Standard HTTP Status Codes

| Code | Status | Meaning in Marketplace API |
| :--- | :--- | :--- |
| `200` | OK | Standard successful response for `GET`, `PATCH`, `PUT`. |
| `201` | Created | Resource successfully created (`POST`). Returns created entity. |
| `204` | No Content | Successful operation with no return payload (e.g. `DELETE`). |
| `400` | Bad Request | Schema validation failure, malformed payload, or invalid arguments. |
| `401` | Unauthorized | Missing, invalid, or expired JWT access token. |
| `403` | Forbidden | Authenticated user lacks permission scope or attempts cross-vendor access. |
| `404` | Not Found | Requested entity does not exist or has been soft-deleted. |
| `409` | Conflict | State conflict: stock unavailable, duplicate SKU, or existing email. |
| `422` | Unprocessable | Semantically invalid: expired coupon, minimum purchase threshold not met. |
| `429` | Too Many Requests | Rate limit threshold exceeded. |
| `500` | Internal Server Error | Unhandled runtime exception logged to Sentry. |

---

## 2. Comprehensive Endpoint Directory

---

### 2.1 Authentication & Identity (`/auth`)

| Method | Endpoint | Access / Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Register customer account. |
| `POST` | `/auth/register-seller`| Public | Register preliminary seller user account. |
| `POST` | `/auth/login` | Public | Authenticate user, set refresh cookie, return access token. |
| `POST` | `/auth/refresh` | Public (Cookie) | Rotate refresh token and issue fresh 15-minute access token. |
| `POST` | `/auth/logout` | Authenticated | Revoke refresh token and invalidate active session. |
| `POST` | `/auth/forgot-password`| Public | Dispatch password reset email link with secure token. |
| `POST` | `/auth/reset-password` | Public | Reset password using verified email token. |
| `POST` | `/auth/verify-email` | Public | Verify registration email using token. |
| `POST` | `/auth/2fa/generate` | Authenticated | Generate TOTP QR code and secret for staff/seller accounts. |
| `POST` | `/auth/2fa/verify` | Authenticated | Confirm 2FA setup with 6-digit TOTP code. |
| `POST` | `/auth/oauth/google` | Public | Social authentication with Google OAuth token. |

---

### 2.2 Users & Address Book (`/users`, `/addresses`)

| Method | Endpoint | Access / Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/users/me` | Authenticated | Retrieve authenticated user profile and roles. |
| `PATCH`| `/users/me` | Authenticated | Update user name, phone, or profile avatar. |
| `PATCH`| `/users/me/password` | Authenticated | Update user password (requires current password). |
| `GET` | `/addresses` | Customer | List all saved delivery addresses. |
| `POST` | `/addresses` | Customer | Create a new delivery address. |
| `PATCH`| `/addresses/:id` | Customer (Owner) | Update an existing delivery address. |
| `DELETE`|`/addresses/:id` | Customer (Owner) | Delete a delivery address. |
| `PATCH`| `/addresses/:id/default`| Customer (Owner) | Set address as primary default. |

---

### 2.3 Sellers & Stores (`/sellers`, `/stores`)

| Method | Endpoint | Access / Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/sellers/me` | Seller | Get seller profile, KYC verification state, and store links. |
| `POST` | `/sellers/kyc` | Seller | Submit Trade License, NID, and bank details for verification. |
| `GET` | `/stores/me` | Seller | Get seller's store profile, branding, and warehouse settings. |
| `PATCH`| `/stores/me` | Seller | Update store name, logo, banner, bio, and warehouse address. |
| `GET` | `/stores/:slug` | Public | Public storefront profile with seller catalog listing. |
| `GET` | `/stores/:slug/reviews`| Public | Paginated customer reviews for a specific store. |
| `GET` | `/admin/sellers` | Admin / Super Admin | List all sellers with KYC status filter. |
| `PATCH`| `/admin/sellers/:id/kyc`| Admin / Super Admin | Approve or reject seller KYC submission. |
| `PATCH`| `/admin/sellers/:id/commission`| Super Admin | Override seller custom commission rate. |

---

### 2.4 Catalog Taxonomy: Categories, Brands & Attributes

| Method | Endpoint | Access / Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/categories` | Public | Retrieve full hierarchical category tree (cached). |
| `GET` | `/categories/:slug` | Public | Get category details, child subcategories, and attribute templates. |
| `POST` | `/categories` | Product Manager+ | Create a new category with commission rate and attributes. |
| `PATCH`| `/categories/:id` | Product Manager+ | Update category name, commission %, or sort order. |
| `DELETE`|`/categories/:id` | Product Manager+ | Soft-delete category (if no active products attached). |
| `GET` | `/brands` | Public | List all verified brand entities. |
| `POST` | `/brands` | Product Manager+ | Create a verified brand with logo. |
| `GET` | `/attributes` | Public | List dynamic product attributes by category ID. |
| `POST` | `/attributes` | Product Manager+ | Define new attribute set (e.g. Size, Fabric, Storage). |

---

### 2.5 Products & Multi-Dimensional Variants (`/products`)

| Method | Endpoint | Access / Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/products` | Public | Paginated catalog search with faceted filters (category, price, rating, brand). |
| `GET` | `/products/:slug` | Public | Comprehensive product detail page with all active variants. |
| `POST` | `/products` | Seller | Create a new product with base details and variant matrix. |
| `PATCH`| `/products/:id` | Seller (Owner) | Update product title, descriptions, images, or base price. |
| `DELETE`|`/products/:id` | Seller (Owner) | Soft-delete product (archives listing). |
| `POST` | `/products/:id/variants` | Seller (Owner) | Append new variant combination (SKU, price, dimensions). |
| `PATCH`| `/products/:id/variants/:variantId` | Seller (Owner) | Update variant price, barcode, or image. |
| `DELETE`|`/products/:id/variants/:variantId` | Seller (Owner) | Remove variant option. |
| `GET` | `/admin/products/moderation` | Product Manager+ | List products pending moderation review. |
| `PATCH`| `/admin/products/:id/moderation` | Product Manager+ | Approve or reject product listing with feedback notes. |

---

### 2.6 Inventory & Stock Movements (`/inventory`)

| Method | Endpoint | Access / Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/inventory` | Seller | List inventory status for all seller variants (`available`, `reserved`, `sold`). |
| `PATCH`| `/inventory/:sku/restock`| Seller (Owner) | Increment/restock available units for a variant SKU. |
| `PATCH`| `/inventory/:sku/adjust` | Seller (Owner) | Audit adjustment (e.g., damaged goods write-off). |
| `GET` | `/inventory/:sku/movements`| Seller (Owner) | View historical ledger of stock changes for a specific SKU. |

---

### 2.7 Cart, Wishlist & Product Comparison

| Method | Endpoint | Access / Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/cart` | Customer / Guest | Retrieve cart contents with vendor grouping and live subtotals. |
| `POST` | `/cart/items` | Customer / Guest | Add product variant to cart (validates available stock). |
| `PATCH`| `/cart/items/:variantId`| Customer / Guest | Update item quantity in cart. |
| `DELETE`|`/cart/items/:variantId`| Customer / Guest | Remove item from cart. |
| `POST` | `/cart/apply-coupon` | Customer / Guest | Validate and apply platform or vendor coupon code. |
| `DELETE`|`/cart/remove-coupon`| Customer / Guest | Remove active coupon from cart. |
| `GET` | `/wishlist` | Customer | Retrieve customer wishlist. |
| `POST` | `/wishlist/:productId`| Customer | Toggle product in customer wishlist. |
| `GET` | `/comparison` | Customer / Guest | Compare technical attributes of up to 4 selected products. |

---

### 2.8 Search & AI Discovery (`/search`, `/ai`)

| Method | Endpoint | Access / Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/search` | Public | Faceted keyword search with typo-tolerance and autocomplete suggestions. |
| `GET` | `/search/vector` | Public | Natural language semantic search using vector embeddings. |
| `POST` | `/ai/catalog-assist` | Seller | Auto-generate tags, categories, and SEO descriptions from product title/image. |
| `POST` | `/ai/chat-assistant` | Public / Customer | RAG conversational shopping assistant for product queries & policies. |

---

### 2.9 Checkout & Multi-Vendor Orders (`/checkout`, `/orders`)

| Method | Endpoint | Access / Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/checkout/pre-validate`| Customer | Server-side validation of cart items, stock, delivery fees, and taxes. |
| `POST` | `/checkout/place-order` | Customer | Atomically reserve stock, generate Parent Order + Sub-Orders, initialize payment. |
| `GET` | `/orders` | Customer | List customer order history (Parent Orders). |
| `GET` | `/orders/:orderNumber` | Customer (Owner) | Get unified parent order details with sub-orders and tracking links. |
| `PATCH`| `/orders/:orderNumber/cancel`| Customer (Owner) | Cancel unfulfilled order (releases reserved stock). |
| `GET` | `/seller/orders` | Seller | List seller-specific sub-orders with status filter. |
| `GET` | `/seller/orders/:subOrderNumber`| Seller (Owner) | Get detailed sub-order fulfillment card. |
| `PATCH`| `/seller/orders/:subOrderNumber/status`| Seller (Owner) | Advance sub-order state (`CONFIRMED` $\rightarrow$ `PACKED`). |
| `GET` | `/admin/orders` | Order Manager+ | Global administrative overview of all parent and sub-orders. |

---

### 2.10 Payments & Webhook Ingestion (`/payments`, `/webhooks`)

| Method | Endpoint | Access / Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/payments/initiate` | Customer | Create gateway payment session (bKash/SSLCommerz/Stripe). |
| `POST` | `/webhooks/bkash` | Public (Signed) | Process bKash payment verification webhook (Idempotent). |
| `POST` | `/webhooks/sslcommerz` | Public (Signed) | Process SSLCommerz IPN callback (Idempotent). |
| `POST` | `/webhooks/stripe` | Public (Signed) | Process Stripe `checkout.session.completed` event. |
| `GET` | `/payments/:parentOrderId/status`| Customer (Owner) | Inquire payment verification status. |

---

### 2.11 Logistics & Multi-Carrier Tracking (`/logistics`)

| Method | Endpoint | Access / Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/logistics/consignments`| Seller (Owner) | Create carrier consignment (Pathao/Steadfast) when sub-order is `PACKED`. |
| `GET` | `/logistics/track/:trackingCode`| Public | Real-time package tracking milestones. |
| `POST` | `/webhooks/logistics/pathao` | Public (Signed) | Courier webhook for package status transitions (`DELIVERED`, `FAILED`). |
| `POST` | `/webhooks/logistics/steadfast` | Public (Signed) | Steadfast courier webhook callback. |

---

### 2.12 Returns, Refunds & Dispute Arbitration (`/returns`, `/disputes`)

| Method | Endpoint | Access / Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/returns` | Customer | Submit return request within 7-day post-delivery window. |
| `GET` | `/returns` | Customer / Seller | View return requests filtered by ownership. |
| `PATCH`| `/returns/:id/seller-respond`| Seller (Owner) | Accept return or contest claim with explanation. |
| `POST` | `/disputes/:returnId/arbitrate`| Support Agent+ | Intervene, review evidence, and issue binding resolution. |
| `PATCH`| `/returns/:id/receive` | Seller (Owner) | Confirm inspection of returned goods, triggering automated refund. |

---

### 2.13 Finance, Seller Wallets & Settlements (`/finance`, `/settlements`)

| Method | Endpoint | Access / Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/seller/wallet` | Seller | Get seller wallet balances (`pendingEscrow`, `available`, `processing`). |
| `POST` | `/seller/settlements` | Seller | Submit withdrawal payout request from available balance. |
| `GET` | `/seller/settlements` | Seller | View payout request history and disbursement statuses. |
| `GET` | `/admin/finance/settlements`| Finance Manager+ | View all pending seller settlement requests. |
| `PATCH`| `/admin/finance/settlements/:id/approve`| Finance Manager+ | Approve payout, record bank transfer reference, debit ledger. |
| `GET` | `/admin/finance/ledger` | Finance Manager+ | Audit query tool for double-entry `ledgerEntries`. |

---

### 2.14 Customer Reviews & Ratings (`/reviews`)

| Method | Endpoint | Access / Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/reviews` | Customer | Submit verified review for purchased product variant. |
| `GET` | `/products/:id/reviews`| Public | List verified reviews with ratings breakdown. |
| `POST` | `/reviews/:id/seller-reply`| Seller (Owner) | Public vendor response to a buyer review. |
| `PATCH`| `/admin/reviews/:id/moderate`| Support Agent+ | Flag or hide reviews violating platform policy. |

---

### 2.15 Marketing & Coupons (`/coupons`)

| Method | Endpoint | Access / Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/seller/coupons` | Seller | Create store-specific discount voucher. |
| `GET` | `/seller/coupons` | Seller | List seller's active and expired vouchers. |
| `POST` | `/admin/coupons` | Admin+ | Create platform-wide promotional campaign voucher. |

---

### 2.16 Notifications & Support (`/notifications`, `/support`)

| Method | Endpoint | Access / Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/notifications` | Authenticated | List in-app notifications with unread count. |
| `PATCH`| `/notifications/:id/read`| Authenticated | Mark notification as read. |
| `POST` | `/support/tickets` | Customer / Seller | Open customer support inquiry ticket. |
| `GET` | `/support/tickets/:id` | Ticket Owner / Staff | View ticket message thread. |
| `POST` | `/support/tickets/:id/messages`| Ticket Owner / Staff | Append message to support ticket. |

---

### 2.17 Administrative Governance & Audits (`/admin`)

| Method | Endpoint | Access / Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin/analytics/overview`| Admin+ | Real-time platform KPI dashboard (GMV, active users, orders). |
| `GET` | `/admin/audit-logs` | Super Admin | Query immutable administrative and security audit logs. |
| `GET` | `/admin/system-settings` | Super Admin | View global platform policies (commission fallbacks, escrow duration). |
| `PATCH`| `/admin/system-settings` | Super Admin | Update platform configuration parameters. |
| `GET` | `/health/liveness` | Public | Kubernetes/Docker liveness probe (`{"status":"ok"}`). |
| `GET` | `/health/readiness` | Public | Readiness probe (verifies MongoDB replica set & Redis ping). |

---

## 3. Detailed Request & Response Payloads (Critical Flows)

### 3.1 Multi-Vendor Checkout: `POST /api/v1/checkout/place-order`

#### Request Payload:
```json
{
  "shippingAddressId": "65b4c10a8e1b9a2c3d4e5f60",
  "billingAddressId": "65b4c10a8e1b9a2c3d4e5f60",
  "paymentMethod": "BKASH",
  "couponCode": "PLATFORM10",
  "customerNotes": "Please call before delivery"
}
```

#### Response Payload (`201 Created`):
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Order created successfully. Stock reserved for 15 minutes.",
  "data": {
    "parentOrder": {
      "orderNumber": "ORD-20261114-K98X",
      "currency": "BDT",
      "itemsSubtotal": 5000.00,
      "totalShippingFee": 120.00,
      "totalDiscount": 500.00,
      "grandTotal": 4620.00,
      "paymentStatus": "UNPAID",
      "orderStatus": "PENDING",
      "stockReservationExpiresAt": "2026-11-14T15:00:00.000Z",
      "subOrders": [
        {
          "subOrderNumber": "ORD-20261114-K98X-S1",
          "storeName": "Apex Footwear Official",
          "subtotal": 3000.00,
          "shippingFee": 60.00,
          "status": "PENDING",
          "itemCount": 1
        },
        {
          "subOrderNumber": "ORD-20261114-K98X-S2",
          "storeName": "Aarong Artisan Crafts",
          "subtotal": 2000.00,
          "shippingFee": 60.00,
          "status": "PENDING",
          "itemCount": 2
        }
      ]
    },
    "payment": {
      "gateway": "BKASH",
      "paymentUrl": "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout?paymentID=TR00119X"
    }
  }
}
```

---

### 3.2 Payment Gateway Callback: `POST /api/v1/webhooks/bkash`

#### Inbound Webhook Headers:
- `X-Signature: <HMAC-SHA256 signature calculated from payload & merchant secret>`

#### Inbound Webhook Payload:
```json
{
  "paymentID": "TR00119X",
  "trxID": "BKA20261114881",
  "transactionStatus": "Completed",
  "amount": "4620.00",
  "currency": "BDT",
  "merchantInvoiceNumber": "ORD-20261114-K98X"
}
```

#### Webhook Response (`200 OK`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Payment verified and order confirmed successfully",
  "data": {
    "orderNumber": "ORD-20261114-K98X",
    "paymentStatus": "PAID",
    "subOrdersConfirmed": 2
  }
}
```

---

### 3.3 Seller Payout Request: `POST /api/v1/seller/settlements`

#### Request Payload:
```json
{
  "amount": 25000.00,
  "payoutMethod": "BANK_TRANSFER"
}
```

#### Response Payload (`201 Created`):
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Settlement request submitted for finance review",
  "data": {
    "settlementNumber": "SETTLE-202611-0019",
    "amountRequested": 25000.00,
    "destinationAccount": "BRAC Bank (Acct: ****4910)",
    "status": "REQUESTED",
    "requestedAt": "2026-11-14T14:45:00.000Z"
  }
}
```

---
**Document Sign-Off:** Lead API Systems Architect, Principal Backend Engineer.
