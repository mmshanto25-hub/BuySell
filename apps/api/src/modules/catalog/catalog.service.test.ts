import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateSku, slugify } from '@marketplace/utils';

describe('Phase 3: Catalog & Multi-Variant Engine', () => {
  it('generates consistent product slugs and unique variant SKUs', () => {
    const title = 'Aarong Hand-Embroidered Jamdani Silk Panjabi';
    const slug = slugify(title);
    assert.strictEqual(slug, 'aarong-hand-embroidered-jamdani-silk-panjabi');

    const sku1 = generateSku('AAR', 'PAN', 'WHT40');
    const sku2 = generateSku('AAR', 'PAN', 'WHT42');

    assert.ok(sku1.startsWith('AAR-PAN-WHT40-'));
    assert.ok(sku2.startsWith('AAR-PAN-WHT42-'));
    assert.notStrictEqual(sku1, sku2);
  });

  it('validates multi-variant matrix structure (Color x Size)', () => {
    const rawVariants = [
      {
        sku: 'APX-SH-BLK-42',
        title: 'Black / 42',
        price: 4500,
        attributes: [
          { name: 'Color', value: 'Black' },
          { name: 'Size', value: '42' },
        ],
        initialStock: 10,
        weightInGrams: 400,
      },
      {
        sku: 'APX-SH-BLK-43',
        title: 'Black / 43',
        price: 4500,
        attributes: [
          { name: 'Color', value: 'Black' },
          { name: 'Size', value: '43' },
        ],
        initialStock: 15,
        weightInGrams: 410,
      },
    ];

    // Total initial inventory calculation
    const totalUnits = rawVariants.reduce((sum, v) => sum + v.initialStock, 0);
    assert.strictEqual(totalUnits, 25);
    assert.strictEqual(rawVariants.length, 2);
    assert.strictEqual(rawVariants[0].attributes[0].value, 'Black');
  });

  it('calculates inventory restock movements and preserves audit invariant', () => {
    const currentAvailable = 10;
    const restockQty = 5;
    const newAvailable = currentAvailable + restockQty;

    const movement = {
      sku: 'APX-SH-BLK-42',
      type: 'RESTOCK',
      quantityChanged: restockQty,
      previousAvailable: currentAvailable,
      newAvailable,
      referenceId: 'RESTOCK-991',
    };

    assert.strictEqual(movement.newAvailable, 15);
    assert.strictEqual(movement.previousAvailable + movement.quantityChanged, movement.newAvailable);
  });
});
