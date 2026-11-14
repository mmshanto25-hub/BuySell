/**
 * Enterprise Multi-Vendor E-Commerce Marketplace
 * Core Domain Utilities
 */

import { ILedgerEntry } from '@marketplace/types';

// ==========================================
// 1. CURRENCY & FINANCIAL HELPERS
// ==========================================

/**
 * Format monetary amount into Bangladesh Taka (৳) format.
 * Example: 15420.5 -> "৳15,420.50"
 */
export function formatCurrency(amount: number, currency = 'BDT'): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '৳0.00';
  }

  const formatted = new Intl.NumberFormat('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return currency === 'BDT' ? `৳${formatted}` : `${currency} ${formatted}`;
}

/**
 * Validates that double-entry journal entries are perfectly balanced (Debits === Credits).
 */
export function validateJournalBalance(entries: ILedgerEntry[]): boolean {
  if (!entries || entries.length === 0) return false;

  let totalDebits = 0;
  let totalCredits = 0;

  for (const entry of entries) {
    if (entry.entryType === 'DEBIT') {
      totalDebits += Math.round(entry.amount * 100);
    } else if (entry.entryType === 'CREDIT') {
      totalCredits += Math.round(entry.amount * 100);
    }
  }

  return totalDebits === totalCredits;
}

// ==========================================
// 2. SLUG & IDENTIFIER GENERATORS
// ==========================================

/**
 * Converts text into a clean, URL-safe SEO slug.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Generates an alphanumeric SKU string.
 */
export function generateSku(brandPrefix: string, categoryPrefix: string, variantCode: string): string {
  const cleanBrand = (brandPrefix || 'GEN').substring(0, 3).toUpperCase();
  const cleanCat = (categoryPrefix || 'CAT').substring(0, 3).toUpperCase();
  const cleanVar = (variantCode || '01').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `${cleanBrand}-${cleanCat}-${cleanVar}-${randomSuffix}`;
}

/**
 * Generates customer-facing order numbers: ORD-YYYYMMDD-XXXX
 */
export function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `ORD-${year}${month}${day}-${randomHex}`;
}

/**
 * Generates vendor sub-order numbers: ORD-YYYYMMDD-XXXX-S1
 */
export function generateSubOrderNumber(parentOrderNumber: string, index: number): string {
  return `${parentOrderNumber}-S${index + 1}`;
}

// ==========================================
// 3. DATE & ESCROW HELPERS
// ==========================================

/**
 * Computes date when vendor escrow hold expires (default: 7 calendar days post-delivery).
 */
export function calculateEscrowReleaseDate(deliveryDate: Date, holdDays = 7): Date {
  const releaseDate = new Date(deliveryDate);
  releaseDate.setDate(releaseDate.getDate() + holdDays);
  return releaseDate;
}

/**
 * Checks whether an order is currently within the active customer return window.
 */
export function isWithinReturnWindow(deliveredAt: Date, returnWindowDays = 7): boolean {
  if (!deliveredAt) return false;
  const now = new Date();
  const expiry = calculateEscrowReleaseDate(deliveredAt, returnWindowDays);
  return now.getTime() <= expiry.getTime();
}
