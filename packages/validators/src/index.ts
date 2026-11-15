import { z } from 'zod';

// ==========================================
// 1. AUTHENTICATION & USER SCHEMAS
// ==========================================

export const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^(\+8801|01)[3-9]\d{8}$/, 'Must be a valid Bangladeshi mobile number (+8801XXXXXXXXX)'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least 1 lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least 1 number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least 1 special character'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const addressSchema = z.object({
  type: z.enum(['SHIPPING', 'BILLING', 'BOTH']),
  recipientName: z.string().min(2, 'Recipient name is required'),
  phone: z.string().regex(/^(\+8801|01)[3-9]\d{8}$/, 'Must be a valid mobile number'),
  streetAddress: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City/District is required'),
  division: z.string().min(2, 'Division is required'),
  postalCode: z.string().min(4, 'Postal code is required'),
  isDefault: z.boolean().default(false),
  deliveryNotes: z.string().max(250).optional(),
});

// ==========================================
// 2. SELLER & STORE SCHEMAS
// ==========================================

export const sellerKycSchema = z.object({
  businessName: z.string().min(3, 'Business name must be at least 3 characters'),
  tradeLicenseNumber: z.string().min(5, 'Trade License is required'),
  tinNumber: z.string().optional(),
  nidPassportNumber: z.string().min(10, 'NID or Passport number is required'),
  bankAccount: z.object({
    bankName: z.string().min(2, 'Bank name is required'),
    branchName: z.string().min(2, 'Branch name is required'),
    routingNumber: z.string().length(9, 'Routing number must be exactly 9 digits'),
    accountHolderName: z.string().min(2, 'Account holder name is required'),
    accountNumber: z.string().min(8, 'Account number is required'),
  }),
});

export const storeUpdateSchema = z.object({
  storeName: z.string().min(2).max(100).optional(),
  logoUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
  description: z.string().max(2000).optional(),
  warehouseAddress: z.object({
    streetAddress: z.string().min(5),
    city: z.string().min(2),
    division: z.string().min(2),
    postalCode: z.string().min(4),
    contactPhone: z.string().min(11),
  }).optional(),
});

// ==========================================
// 3. PRODUCT & INVENTORY SCHEMAS
// ==========================================

export const productVariantSchema = z.object({
  sku: z.string().min(3, 'SKU is required'),
  barcode: z.string().optional(),
  title: z.string().min(1, 'Variant title is required (e.g. Red / M)'),
  price: z.number().positive('Price must be greater than 0'),
  compareAtPrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  attributes: z.array(z.object({ name: z.string(), value: z.string() })).min(1),
  imageUrl: z.string().url().optional(),
  weightInGrams: z.number().min(0, 'Weight must be non-negative'),
  initialStock: z.number().int().min(0, 'Initial stock cannot be negative'),
});

export const createProductSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  shortDescription: z.string().max(500).optional(),
  description: z.string().min(20, 'Detailed description is required'),
  categoryId: z.string().min(1, 'Category is required'),
  brandId: z.string().optional(),
  images: z.array(
    z.object({
      url: z.string().url(),
      alt: z.string().default('Product Image'),
      isPrimary: z.boolean().default(false),
      sortOrder: z.number().default(0),
    })
  ).min(1, 'At least 1 product image is required'),
  basePrice: z.number().positive('Base price must be greater than 0'),
  compareAtPrice: z.number().positive().optional(),
  attributes: z.array(z.object({ name: z.string(), value: z.string() })).default([]),
  tags: z.array(z.string()).default([]),
  variants: z.array(productVariantSchema).min(1, 'At least one variant must be created'),
});

export const restockInventorySchema = z.object({
  quantity: z.number().int().positive('Restock quantity must be a positive integer'),
  reason: z.string().optional(),
});

// ==========================================
// 4. CART & CHECKOUT SCHEMAS
// ==========================================

export const addToCartSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.number().int().positive('Quantity must be at least 1').max(50),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, 'Quantity cannot be negative').max(50),
});

export const applyCouponSchema = z.object({
  couponCode: z.string().min(1, 'Coupon code is required').trim().toUpperCase(),
});

export const updateSubOrderStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'PACKED',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'COMPLETED',
    'CANCELLED',
    'RETURNED',
  ]),
  carrier: z.string().optional(),
  trackingCode: z.string().optional(),
  consignmentId: z.string().optional(),
});

export const preValidateCheckoutSchema = z.object({
  shippingAddressId: z.string().optional(),
  couponCode: z.string().optional(),
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.number().int().positive(),
      })
    )
    .optional(),
});

export const placeOrderSchema = z.object({
  shippingAddressId: z.string().min(1, 'Shipping address is required'),
  billingAddressId: z.string().optional(),
  paymentMethod: z.enum(['COD', 'BKASH', 'NAGAD', 'SSLCOMMERZ', 'STRIPE']),
  couponCode: z.string().optional(),
  customerNotes: z.string().max(500).optional(),
});

// ==========================================
// 5. PAYMENTS & LOGISTICS SCHEMAS
// ==========================================

export const initiatePaymentSchema = z.object({
  orderNumber: z.string().min(1, 'Order number is required'),
  gateway: z.enum(['BKASH', 'NAGAD', 'SSLCOMMERZ', 'STRIPE', 'COD']),
});

export const createConsignmentSchema = z.object({
  subOrderNumber: z.string().min(1, 'Sub-order number is required'),
  carrier: z.enum(['PATHAO', 'STEADFAST', 'REDX', 'INTERNAL']).default('PATHAO'),
  recipientName: z.string().optional(),
  recipientPhone: z.string().optional(),
  deliveryAddress: z.string().optional(),
  weightInGrams: z.number().int().positive().default(500),
  specialNotes: z.string().optional(),
});

export const carrierWebhookSchema = z.object({
  consignmentId: z.string().min(1),
  trackingCode: z.string().min(1),
  status: z.enum([
    'MANIFEST_CREATED',
    'PICKED_UP',
    'IN_TRANSIT',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'FAILED',
    'RETURNED_TO_SELLER',
  ]),
  message: z.string().optional(),
  location: z.string().optional(),
  timestamp: z.string().optional(),
});

// ==========================================
// 6. RETURNS & DISPUTE SCHEMAS
// ==========================================

export const createReturnSchema = z.object({
  subOrderNumber: z.string().min(1, 'Sub-order number is required'),
  items: z
    .array(
      z.object({
        orderItemId: z.string().min(1, 'Order item ID is required'),
        quantity: z.number().int().positive('Quantity must be at least 1'),
        reason: z.enum(['DAMAGED', 'DEFECTIVE', 'WRONG_ITEM', 'NOT_AS_DESCRIBED', 'SIZE_FIT']),
        details: z.string().min(5, 'Detailed description is required'),
        images: z.array(z.string().url()).default([]),
      })
    )
    .min(1, 'At least 1 item must be selected for return'),
});

export const sellerRespondReturnSchema = z.object({
  action: z.enum(['ACCEPT', 'CONTEST']),
  contestReason: z.string().optional(),
});

export const arbitrateDisputeSchema = z.object({
  resolution: z.enum(['REFUND_BUYER', 'REJECT_CLAIM', 'PARTIAL_REFUND']),
  refundAmount: z.number().min(0).optional(),
  adminNotes: z.string().min(10, 'Arbitration notes required for audit compliance'),
});

// ==========================================
// 5. FINANCE & SETTLEMENT SCHEMAS
// ==========================================

export const requestSettlementSchema = z.object({
  amount: z.number().min(1000, 'Minimum settlement payout is ৳1,000'),
  payoutMethod: z.enum(['BANK_TRANSFER', 'BKASH', 'NAGAD']),
});

// ==========================================
// 7. CUSTOMER REVIEWS & RATINGS SCHEMAS
// ==========================================

export const createReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  subOrderId: z.string().min(1, 'Verified purchase sub-order number is required'),
  variantId: z.string().optional(),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  title: z.string().max(100).optional(),
  comment: z.string().min(5, 'Review comment must be at least 5 characters').max(1000),
  images: z.array(z.string().url()).default([]),
});

export const sellerReplyReviewSchema = z.object({
  comment: z.string().min(3, 'Reply comment must be at least 3 characters').max(1000),
});

export const moderateReviewSchema = z.object({
  moderationStatus: z.enum(['APPROVED', 'FLAGGED', 'REJECTED']),
  reason: z.string().optional(),
});

// ==========================================
// 8. MARKETING & COUPON SCHEMAS
// ==========================================

export const createCouponSchema = z.object({
  code: z
    .string()
    .min(3, 'Coupon code must be at least 3 characters')
    .max(20)
    .regex(/^[A-Z0-9_-]+$/, 'Coupon code must be uppercase alphanumeric'),
  description: z.string().optional(),
  scope: z.enum(['PLATFORM', 'STORE']).default('STORE'),
  storeId: z.string().optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.number().positive('Discount value must be greater than 0'),
  maxDiscountAmount: z.number().positive().optional(),
  minOrderSubtotal: z.number().min(0).default(0),
  totalUsageLimit: z.number().int().positive().default(1000),
  perUserUsageLimit: z.number().int().positive().default(1),
  expiresAt: z.string().or(z.date()),
});

export const validateCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required'),
  cartSubtotal: z.number().positive('Cart subtotal must be greater than 0'),
  storeId: z.string().optional(),
});

// ==========================================
// 9. AI CATALOG, SEARCH & RAG CHATBOT SCHEMAS
// ==========================================

export const aiCatalogAssistantSchema = z.object({
  productTitle: z.string().min(2, 'Product title is required'),
  categoryName: z.string().optional(),
  features: z.array(z.string()).default([]),
  targetAudience: z.string().optional(),
});

export const aiShoppingAssistantSchema = z.object({
  query: z.string().min(2, 'Query must be at least 2 characters'),
  budgetLimit: z.number().positive().optional(),
  preferredCategory: z.string().optional(),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .default([]),
});

export const semanticSearchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  limit: z.number().int().min(1).max(50).default(10),
  minScore: z.number().min(0).max(1).default(0.3),
});

