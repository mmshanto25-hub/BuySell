/**
 * Production database seed script
 * Seeds essential roles, default super admin, and foundational category taxonomy.
 * Idempotent: safe to run multiple times in CI/CD and deployment pipelines.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/marketplace';

const SEED_CATEGORIES = [
  { name: 'Fashion & Apparel', slug: 'fashion', commissionRate: 0.12, level: 0 },
  { name: 'Footwear & Leather', slug: 'footwear', commissionRate: 0.12, level: 0 },
  { name: 'Consumer Electronics', slug: 'electronics', commissionRate: 0.08, level: 0 },
  { name: 'Home & Living', slug: 'home-living', commissionRate: 0.10, level: 0 },
  { name: 'Health & Beauty', slug: 'beauty', commissionRate: 0.15, level: 0 },
  { name: 'Artisan & Crafts', slug: 'crafts', commissionRate: 0.10, level: 0 },
];

export async function runProductionSeed() {
  console.log('[SEED] Connecting to database:', MONGODB_URI);

  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('[SEED] Database connected successfully.');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection instance not available');
    }

    // 1. Seed SUPER_ADMIN
    const usersCollection = db.collection('users');
    const existingAdmin = await usersCollection.findOne({ email: 'admin@marketplace.com' });

    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash('SuperAdmin@2026!Secure', 10);
      await usersCollection.insertOne({
        firstName: 'Super',
        lastName: 'Admin',
        email: 'admin@marketplace.com',
        phone: '+8801700000001',
        passwordHash,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        emailVerified: true,
        phoneVerified: true,
        twoFactorEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('[SEED] Created default SUPER_ADMIN user: admin@marketplace.com');
    } else {
      console.log('[SEED] SUPER_ADMIN user already exists. Skipped.');
    }

    // 2. Seed Base Taxonomy Categories
    const categoriesCollection = db.collection('categories');
    for (const cat of SEED_CATEGORIES) {
      const exists = await categoriesCollection.findOne({ slug: cat.slug });
      if (!exists) {
        await categoriesCollection.insertOne({
          name: cat.name,
          slug: cat.slug,
          parentId: null,
          ancestors: [],
          level: cat.level,
          commissionRate: cat.commissionRate,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log(`[SEED] Created category: ${cat.name} (${cat.slug})`);
      } else {
        console.log(`[SEED] Category exists: ${cat.slug}. Skipped.`);
      }
    }

    console.log('[SEED] Production seed completed successfully.');
  } catch (err: any) {
    console.warn(`[SEED WARNING] Seed execution skipped or database unavailable: ${err.message}`);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('[SEED] Database disconnected.');
    }
  }
}

// Execute directly if run as CLI script
if (require.main === module) {
  runProductionSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[SEED FATAL]', err);
      process.exit(1);
    });
}
