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

// ==========================================
// 4. SEO & STRUCTURED DATA HELPERS
// ==========================================

export interface ProductJsonLdParams {
  name: string;
  description: string;
  image: string;
  sku: string;
  brand: string;
  price: number;
  currency?: string;
  ratingValue?: number;
  reviewCount?: number;
  inStock?: boolean;
  sellerName?: string;
}

/**
 * Generates Google-compliant Schema.org JSON-LD for rich product snippets
 */
export function generateProductJsonLd(params: ProductJsonLdParams): Record<string, any> {
  const jsonLd: Record<string, any> = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: params.name,
    image: [params.image],
    description: params.description,
    sku: params.sku,
    brand: {
      '@type': 'Brand',
      name: params.brand || 'Generic',
    },
    offers: {
      '@type': 'Offer',
      url: `https://marketplace.com/product/${params.sku.toLowerCase()}`,
      priceCurrency: params.currency || 'BDT',
      price: params.price,
      availability: params.inStock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: params.sellerName || 'Marketplace Merchant',
      },
    },
  };

  if (params.ratingValue && params.reviewCount && params.reviewCount > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: params.ratingValue.toFixed(1),
      reviewCount: params.reviewCount,
      bestRating: '5',
      worstRating: '1',
    };
  }

  return jsonLd;
}

export interface SitemapUrlEntry {
  loc: string;
  lastmod?: string | Date;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * Builds standard XML sitemap string indexing catalog URLs
 */
export function generateSitemapXml(urls: SitemapUrlEntry[]): string {
  const itemsXml = urls
    .map((item) => {
      const lastmodStr = item.lastmod
        ? `<lastmod>${new Date(item.lastmod).toISOString().split('T')[0]}</lastmod>`
        : '';
      const freqStr = item.changefreq ? `<changefreq>${item.changefreq}</changefreq>` : '';
      const priorityStr = item.priority !== undefined ? `<priority>${item.priority.toFixed(1)}</priority>` : '';
      return `  <url>\n    <loc>${item.loc}</loc>\n    ${lastmodStr}\n    ${freqStr}\n    ${priorityStr}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${itemsXml}\n</urlset>`;
}

