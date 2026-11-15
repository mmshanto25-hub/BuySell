/**
 * MongoDB compound index definitions for production performance.
 * Ensures zero collection scans on hot query paths.
 */

import mongoose from 'mongoose';
import { isDatabaseConnected } from '../database/connection';

interface IndexDefinition {
  collection: string;
  index: Record<string, 1 | -1 | 'text'>;
  options?: Record<string, any>;
}

const INDEXES: IndexDefinition[] = [
  // Users
  { collection: 'users', index: { email: 1 }, options: { unique: true } },
  { collection: 'users', index: { role: 1, status: 1 } },
  { collection: 'users', index: { phone: 1 }, options: { sparse: true } },

  // Products
  { collection: 'products', index: { slug: 1 }, options: { unique: true } },
  { collection: 'products', index: { storeId: 1, status: 1 } },
  { collection: 'products', index: { categoryId: 1, status: 1 } },
  { collection: 'products', index: { basePrice: 1 } },
  { collection: 'products', index: { title: 'text', description: 'text' } },
  { collection: 'products', index: { createdAt: -1 } },

  // Orders
  { collection: 'orders', index: { userId: 1, createdAt: -1 } },
  { collection: 'orders', index: { orderNumber: 1 }, options: { unique: true } },
  { collection: 'orders', index: { paymentStatus: 1 } },
  { collection: 'orders', index: { orderStatus: 1, createdAt: -1 } },

  // SubOrders
  { collection: 'suborders', index: { storeId: 1, status: 1 } },
  { collection: 'suborders', index: { subOrderNumber: 1 }, options: { unique: true } },
  { collection: 'suborders', index: { parentOrderId: 1 } },
  { collection: 'suborders', index: { sellerId: 1, status: 1 } },
  { collection: 'suborders', index: { status: 1, deliveredAt: 1, escrowReleasedAt: 1 } },

  // LedgerEntries
  { collection: 'ledgerentries', index: { journalId: 1 } },
  { collection: 'ledgerentries', index: { accountCode: 1, entityId: 1 } },
  { collection: 'ledgerentries', index: { postedAt: -1 } },
  { collection: 'ledgerentries', index: { referenceType: 1, referenceId: 1 } },

  // Settlements
  { collection: 'settlements', index: { sellerId: 1, status: 1 } },
  { collection: 'settlements', index: { settlementNumber: 1 }, options: { unique: true } },
  { collection: 'settlements', index: { status: 1, requestedAt: -1 } },

  // Reviews
  { collection: 'reviews', index: { productId: 1, status: 1 } },
  { collection: 'reviews', index: { userId: 1, productId: 1 }, options: { unique: true } },
  { collection: 'reviews', index: { storeId: 1, createdAt: -1 } },

  // RefreshTokens
  { collection: 'refreshtokens', index: { tokenHash: 1 }, options: { unique: true } },
  { collection: 'refreshtokens', index: { family: 1 } },
  { collection: 'refreshtokens', index: { expiresAt: 1 }, options: { expireAfterSeconds: 0 } },

  // Coupons
  { collection: 'coupons', index: { code: 1 }, options: { unique: true } },
  { collection: 'coupons', index: { storeId: 1, isActive: 1 } },

  // AuditLogs
  { collection: 'auditlogs', index: { actorId: 1, createdAt: -1 } },
  { collection: 'auditlogs', index: { targetCollection: 1, targetId: 1 } },

  // ProductEmbeddings
  { collection: 'productembeddings', index: { productId: 1 }, options: { unique: true } },
];

export async function ensureIndexes(): Promise<{ created: number; skipped: number; errors: string[] }> {
  if (!isDatabaseConnected()) {
    return { created: 0, skipped: INDEXES.length, errors: ['Database not connected'] };
  }

  let created = 0;
  const errors: string[] = [];
  const db = mongoose.connection.db;

  for (const def of INDEXES) {
    try {
      const collection = db!.collection(def.collection);
      await collection.createIndex(def.index as any, def.options || {});
      created++;
    } catch (err: any) {
      // Index already exists or collection doesn't exist yet — non-fatal
      errors.push(`${def.collection}: ${err.message}`);
    }
  }

  console.log(`[DB_INDEXES] Created/verified ${created}/${INDEXES.length} indexes (${errors.length} skipped)`);
  return { created, skipped: errors.length, errors };
}

export const INDEX_DEFINITIONS = INDEXES;
