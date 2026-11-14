import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  formatCurrency,
  validateJournalBalance,
  slugify,
  generateSku,
  generateOrderNumber,
  generateSubOrderNumber,
  isWithinReturnWindow,
} from './index';
import { ILedgerEntry } from '@marketplace/types';

describe('Financial & Currency Utilities', () => {
  it('formats BDT currency correctly with symbol and commas', () => {
    assert.strictEqual(formatCurrency(4500), '৳4,500.00');
    assert.strictEqual(formatCurrency(14850000.5), '৳14,850,000.50');
    assert.strictEqual(formatCurrency(0), '৳0.00');
  });

  it('validates balanced double-entry ledger journals', () => {
    const balancedEntries: ILedgerEntry[] = [
      {
        id: '1',
        journalId: 'j1',
        accountCode: '1010',
        entityType: 'GATEWAY',
        entryType: 'DEBIT',
        amount: 5000,
        referenceType: 'ORDER',
        referenceId: 'ORD-1',
        description: 'Payment collected',
        postedAt: new Date(),
      },
      {
        id: '2',
        journalId: 'j1',
        accountCode: '2010',
        entityType: 'SELLER',
        entryType: 'CREDIT',
        amount: 4500,
        referenceType: 'ORDER',
        referenceId: 'ORD-1',
        description: 'Vendor escrow credit',
        postedAt: new Date(),
      },
      {
        id: '3',
        journalId: 'j1',
        accountCode: '4010',
        entityType: 'PLATFORM',
        entryType: 'CREDIT',
        amount: 500,
        referenceType: 'ORDER',
        referenceId: 'ORD-1',
        description: 'Platform commission',
        postedAt: new Date(),
      },
    ];

    assert.strictEqual(validateJournalBalance(balancedEntries), true);
  });

  it('detects unbalanced double-entry ledger journals', () => {
    const unbalancedEntries: ILedgerEntry[] = [
      {
        id: '1',
        journalId: 'j2',
        accountCode: '1010',
        entityType: 'GATEWAY',
        entryType: 'DEBIT',
        amount: 5000,
        referenceType: 'ORDER',
        referenceId: 'ORD-2',
        description: 'Payment collected',
        postedAt: new Date(),
      },
      {
        id: '2',
        journalId: 'j2',
        accountCode: '2010',
        entityType: 'SELLER',
        entryType: 'CREDIT',
        amount: 4000,
        referenceType: 'ORDER',
        referenceId: 'ORD-2',
        description: 'Vendor escrow credit',
        postedAt: new Date(),
      },
    ];

    assert.strictEqual(validateJournalBalance(unbalancedEntries), false);
  });
});

describe('Slug & Identifier Generators', () => {
  it('converts product titles to URL safe slugs', () => {
    assert.strictEqual(slugify('Apex Premium Leather Shoes 2026!'), 'apex-premium-leather-shoes-2026');
    assert.strictEqual(slugify('Aarong  Silk   Panjabi -- Traditional'), 'aarong-silk-panjabi-traditional');
  });

  it('generates structured SKUs', () => {
    const sku = generateSku('APEX', 'FOOTWEAR', 'BLK42');
    assert.strictEqual(sku.startsWith('APE-FOO-BLK42-'), true);
  });

  it('generates parent and partitioned sub-order numbers', () => {
    const parent = generateOrderNumber();
    assert.strictEqual(parent.startsWith('ORD-'), true);

    const sub1 = generateSubOrderNumber(parent, 0);
    const sub2 = generateSubOrderNumber(parent, 1);
    assert.strictEqual(sub1, `${parent}-S1`);
    assert.strictEqual(sub2, `${parent}-S2`);
  });
});

describe('Return & Escrow Window', () => {
  it('correctly assesses return window validity', () => {
    const justDelivered = new Date();
    assert.strictEqual(isWithinReturnWindow(justDelivered, 7), true);

    const oldDelivery = new Date();
    oldDelivery.setDate(oldDelivery.getDate() - 10);
    assert.strictEqual(isWithinReturnWindow(oldDelivery, 7), false);
  });
});
