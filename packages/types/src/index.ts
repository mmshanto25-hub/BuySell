/**
 * Enterprise Multi-Vendor E-Commerce Marketplace
 * Core Domain Type Definitions
 */

// ==========================================
// 1. IDENTITY & RBAC TYPES
// ==========================================

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'PRODUCT_MANAGER'
  | 'ORDER_MANAGER'
  | 'FINANCE_MANAGER'
  | 'SUPPORT_AGENT'
  | 'SELLER'
  | 'CUSTOMER';

export type UserStatus = 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED' | 'BANNED';

export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRole {
  id: string;
  name: UserRole;
  description: string;
  isSystem: boolean;
  permissions: string[];
}

export interface IAddress {
  id: string;
  userId: string;
  type: 'SHIPPING' | 'BILLING' | 'BOTH';
  recipientName: string;
  phone: string;
  streetAddress: string;
  city: string;
  division: string;
  postalCode: string;
  isDefault: boolean;
  deliveryNotes?: string;
}

// ==========================================
// 2. SELLER & STORE TYPES
// ==========================================

export type KYCStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTION_REQUIRED';
export type StoreStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'VACATION_MODE';

export interface ISeller {
  id: string;
  userId: string;
  businessName: string;
  tradeLicenseNumber: string;
  tinNumber?: string;
  nidPassportNumber: string;
  bankAccount: {
    bankName: string;
    branchName: string;
    routingNumber: string;
    accountHolderName: string;
    accountNumber: string;
  };
  mobileFinancialService?: {
    provider: 'bKash' | 'Nagad' | 'Rocket';
    accountNumber: string;
  };
  kycStatus: KYCStatus;
  rejectionReason?: string;
  commissionRateOverride?: number;
  approvedAt?: Date;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStore {
  id: string;
  sellerId: string;
  storeName: string;
  slug: string;
  logoUrl?: string;
  bannerUrl?: string;
  description?: string;
  warehouseAddress: {
    streetAddress: string;
    city: string;
    division: string;
    postalCode: string;
    contactPhone: string;
  };
  rating: number;
  totalReviews: number;
  status: StoreStatus;
  supportEmail?: string;
  supportPhone?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// 3. CATALOG & TAXONOMY TYPES
// ==========================================

export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type ModerationStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

export interface ICategory {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  ancestors: string[];
  level: number;
  iconUrl?: string;
  bannerUrl?: string;
  commissionRate: number; // e.g. 10 for 10%
  isActive: boolean;
}

export interface IBrand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  isVerified: boolean;
}

export interface IProductVariant {
  id: string;
  productId: string;
  storeId: string;
  sku: string;
  barcode?: string;
  title: string; // e.g. "Black / XL"
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  attributes: { name: string; value: string }[];
  imageUrl?: string;
  weightInGrams: number;
  dimensions?: { length: number; width: number; height: number };
  status: 'ACTIVE' | 'INACTIVE';
}

export interface IProduct {
  id: string;
  storeId: string;
  sellerId: string;
  title: string;
  slug: string;
  shortDescription?: string;
  description: string;
  categoryId: string;
  brandId?: string;
  images: { url: string; alt: string; isPrimary: boolean; sortOrder: number }[];
  videoUrl?: string;
  attributes: { name: string; value: string }[];
  hasVariants: boolean;
  basePrice: number;
  compareAtPrice?: number;
  status: ProductStatus;
  moderationStatus: ModerationStatus;
  rating: number;
  totalReviews: number;
  totalSold: number;
  tags: string[];
  variants?: IProductVariant[];
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// 4. INVENTORY TYPES
// ==========================================

export type MovementType =
  | 'INITIAL'
  | 'RESTOCK'
  | 'RESERVATION_LOCKED'
  | 'RESERVATION_EXPIRED'
  | 'ORDER_FULFILLED'
  | 'RETURN_RESTOCKED'
  | 'MANUAL_ADJUSTMENT';

export interface IInventory {
  id: string;
  variantId: string;
  productId: string;
  storeId: string;
  sku: string;
  availableStock: number;
  reservedStock: number;
  soldStock: number;
  lowStockThreshold: number;
  updatedAt: Date;
}

export interface IInventoryMovement {
  id: string;
  inventoryId: string;
  sku: string;
  type: MovementType;
  quantityChanged: number;
  previousAvailable: number;
  newAvailable: number;
  referenceId: string;
  performedBy?: string;
  reason?: string;
  createdAt: Date;
}

// ==========================================
// 5. CART & MULTI-VENDOR CHECKOUT TYPES
// ==========================================

export interface ICartItem {
  productId: string;
  variantId: string;
  storeId: string;
  storeName: string;
  productTitle: string;
  variantTitle: string;
  sku: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  availableStock: number;
}

export interface ICartStoreGroup {
  storeId: string;
  storeName: string;
  items: ICartItem[];
  subtotal: number;
  estimatedShipping: number;
}

export interface ICart {
  items: ICartItem[];
  sellerGroups: ICartStoreGroup[];
  itemsSubtotal: number;
  totalShippingFee: number;
  discountAmount: number;
  grandTotal: number;
  couponCode?: string;
}

// ==========================================
// 6. ORDERS & FULFILLMENT TYPES
// ==========================================

export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'PARTIALLY_FULFILLED'
  | 'COMPLETED'
  | 'CANCELLED';

export type SubOrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RETURNED';

export type PaymentStatus =
  | 'UNPAID'
  | 'AUTHORIZED'
  | 'PAID'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED'
  | 'FAILED';

export interface IOrderItem {
  id: string;
  productId: string;
  variantId: string;
  title: string;
  sku: string;
  variantTitle: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  commissionRate: number;
  commissionAmount: number;
  returnStatus?: 'NONE' | 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'REFUNDED';
}

export interface ISubOrder {
  id: string;
  subOrderNumber: string;
  parentOrderId: string;
  parentOrderNumber: string;
  storeId: string;
  storeName: string;
  sellerId: string;
  status: SubOrderStatus;
  items: IOrderItem[];
  subtotal: number;
  shippingFee: number;
  commissionAmount: number;
  sellerNetEarning: number;
  carrier?: string;
  trackingCode?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  escrowReleasedAt?: Date;
  createdAt: Date;
}

export interface IParentOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerSnapshot: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: IAddress;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentMethod: PaymentMethod;
  currency: 'BDT';
  itemsSubtotal: number;
  totalShippingFee: number;
  totalDiscount: number;
  grandTotal: number;
  subOrders: ISubOrder[];
  placedAt: Date;
  paidAt?: Date;
}

// ==========================================
// 7. PAYMENTS & FINANCIAL LEDGER TYPES
// ==========================================

export type PaymentMethod = 'COD' | 'BKASH' | 'NAGAD' | 'SSLCOMMERZ' | 'STRIPE';

export type AccountCode =
  | '1010' // Gateway Clearing
  | '1020' // Platform Operational Bank
  | '2010' // Seller Escrow Holding
  | '2020' // Seller Available Balance
  | '4010' // Marketplace Commission Revenue
  | '5010'; // Gateway Processing Fees

export type EntryType = 'DEBIT' | 'CREDIT';

export interface ILedgerEntry {
  id: string;
  journalId: string;
  accountCode: AccountCode;
  entityType: 'PLATFORM' | 'SELLER' | 'CUSTOMER' | 'GATEWAY';
  entityId?: string;
  entryType: EntryType;
  amount: number;
  referenceType: 'ORDER' | 'SUB_ORDER' | 'ESCROW_RELEASE' | 'SETTLEMENT' | 'REFUND';
  referenceId: string;
  description: string;
  postedAt: Date;
}

export interface ISellerWallet {
  sellerId: string;
  storeId: string;
  pendingEscrowBalance: number;
  availableBalance: number;
  processingBalance: number;
  lifetimeEarnings: number;
  lastReconciledAt: Date;
}

export type SettlementStatus = 'REQUESTED' | 'UNDER_REVIEW' | 'APPROVED' | 'DISBURSED' | 'REJECTED';

export interface ISettlement {
  id: string;
  settlementNumber: string;
  sellerId: string;
  storeId: string;
  amountRequested: number;
  payoutMethod: 'BANK_TRANSFER' | 'BKASH' | 'NAGAD';
  destinationDetails: Record<string, any>;
  status: SettlementStatus;
  bankTransactionRef?: string;
  requestedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  disbursedAt?: Date;
}

// ==========================================
// 8. API ENVELOPES & PAGINATION
// ==========================================

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: PaginationMeta;
  error?: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
  timestamp?: string;
}
