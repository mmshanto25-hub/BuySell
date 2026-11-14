import { describe, it, expect } from 'vitest';
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
    expect(formatCurrency(4500)).toBe('৳4,500.00');
    expect(formatCurrency(14850000.5)).toBe('৳14,850,000.50');
    expect(formatCurrency(0)).toBe('৳0.00');
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

    expect(validateJournalBalance(balancedEntries)).toBe(true);
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
        amount: 4000, // Deficit of 1000
        referenceType: 'ORDER',
        referenceId: 'ORD-2',
        description: 'Vendor escrow credit',
        postedAt: new Date(),
      },
    ];

    expect(validateJournalBalance(unbalancedEntries)).toBe(false);
  });
});

describe('Slug & Identifier Generators', () => {
  it('converts product titles to URL safe slugs', () => {
    expect(slugify('Apex Premium Leather Shoes 2026!')).toBe('apex-premium-leather-shoes-2026');
    expect(slugify('Aarong  Silk   Panjabi -- Traditional')).toBe('aarong-silk-panjabi-traditional');
  });

  it('generates structured SKUs', () => {
    const sku = generateSku('APEX', 'FOOTWEAR', 'BLK42');
    expect(sku.startsWith('APE-FOO-BLK42-')).toBe(true);
  });

  it('generates parent and partitioned sub-order numbers', () => {
    const parent = generateOrderNumber();
    expect(parent.startsWith('ORD-')).toBe(true);

    const sub1 = generateSubOrderNumber(parent, 0);
    const sub2 = generateSubOrderNumber(parent, 1);
    expect(sub1).toBe(`${parent}-S1`);
    expect(sub2).toBe(`${parent}-S2`);
  });
});

describe('Return & Escrow Window', () => {
  it('correctly assesses return window validity', () => {
    const justDelivered = new Date();
    expect(isWithinReturnWindow(justDelivered, 7)).toBe(true);

    const oldDelivery = new Date();
    oldDelivery.setDate(oldDelivery.getDate() - 10);
    expect(isWithinReturnWindow(oldDelivery, 7)).toBe(false);
  });
});
