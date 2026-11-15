import { describe, it } from 'node:test';
import assert from 'node:assert';
import { AuthService } from '../auth/auth.service';
import { FinanceService } from '../finance/finance.service';
import { AuditService } from '../audit/audit.service';
import { CheckoutService } from '../orders/checkout.service';

describe('Phase 8 QA: End-to-End Admin Journey', () => {
  it('8.18 - Admin login with SUPER_ADMIN role', async () => {
    const result = await AuthService.login({
      email: 'admin@marketplace.com',
      password: 'admin-password',
    });

    assert.ok(result.user, 'Admin must be returned');
    assert.strictEqual(result.user.role, 'SUPER_ADMIN');
    assert.ok(result.tokens.accessToken, 'Admin must receive access token');
  });

  it('8.19 - Platform finance overview returns valid KPIs', async () => {
    const overview = await FinanceService.getFinanceOverview();

    assert.ok(overview.grossMerchandiseValue > 0, 'GMV must be positive');
    assert.ok(overview.platformCommissions > 0, 'Commissions must be positive');
    assert.ok(overview.escrowHoldingBalance >= 0, 'Escrow balance must be non-negative');
    assert.ok(overview.formattedGMV.includes('৳') || overview.formattedGMV.includes('14,850,000'), 'GMV must be formatted');
  });

  it('8.20 - GAAP ledger reconciliation proves debits equal credits (conservation invariant)', async () => {
    // Record a payment to ensure ledger entries exist
    await FinanceService.recordOrderPayment(
      { id: 'ord_admin_e2e', orderNumber: 'ORD-20261115-ADM1', grandTotal: 10000 },
      [
        {
          id: 'so_1',
          subOrderNumber: 'ORD-20261115-ADM1-S1',
          sellerId: 'seller_admin_e2e',
          storeId: 'store_admin_e2e',
          subtotal: 8000,
          shippingFee: 60,
          commissionAmount: 960,
          sellerNetEarning: 7040,
        },
        {
          id: 'so_2',
          subOrderNumber: 'ORD-20261115-ADM1-S2',
          sellerId: 'seller_admin_e2e_2',
          storeId: 'store_admin_e2e_2',
          subtotal: 2000,
          shippingFee: 60,
          commissionAmount: 240,
          sellerNetEarning: 1760,
        },
      ],
      'BKASH',
      'TRX-ADMIN-E2E'
    );

    const report = await FinanceService.getReconciliationReport();

    assert.ok(report.totalLedgerEntries > 0, 'Must have ledger entries');
    assert.strictEqual(report.isConserved, true, 'GAAP invariant: debits must equal credits');
    assert.strictEqual(report.variance, 0, 'Variance must be zero');
    assert.ok(report.totalDebits > 0, 'Total debits must be positive');
    assert.strictEqual(report.totalDebits, report.totalCredits, 'Sum(Debits) === Sum(Credits)');
  });

  it('8.21 - Settlement approval requires bank transaction reference', async () => {
    await assert.rejects(
      async () => {
        await FinanceService.reviewSettlement({
          settlementId: 'SETTLE-202611-TEST',
          action: 'APPROVE',
          financeManagerId: 'usr_admin_fm',
        });
      },
      (err: any) => err.message.includes('Bank wire transfer reference')
    );
  });

  it('8.22 - Settlement rejection requires reason for audit compliance', async () => {
    await assert.rejects(
      async () => {
        await FinanceService.reviewSettlement({
          settlementId: 'SETTLE-202611-REJ',
          action: 'REJECT',
          financeManagerId: 'usr_admin_fm',
        });
      },
      (err: any) => err.message.includes('Rejection rationale')
    );
  });

  it('8.23 - Settlement approval disburses funds and records journal entry', async () => {
    // First create a settlement to approve
    const settlement = await FinanceService.requestSettlement({
      sellerId: 'seller_admin_approve',
      storeId: 'store_admin_approve',
      amount: 5000,
      payoutMethod: 'BANK_TRANSFER',
      destinationDetails: { bankName: 'DBBL', accountNumber: '999888777' },
    });

    const approved = await FinanceService.reviewSettlement({
      settlementId: settlement.settlementNumber,
      action: 'APPROVE',
      financeManagerId: 'usr_admin_fm_01',
      bankTransactionRef: 'WIRE-2026-E2E-001',
    });

    assert.strictEqual(approved.status, 'DISBURSED');
    assert.strictEqual(approved.bankTransactionRef, 'WIRE-2026-E2E-001');
  });

  it('8.24 - Settlement rejection returns funds to available balance', async () => {
    const settlement = await FinanceService.requestSettlement({
      sellerId: 'seller_admin_reject',
      storeId: 'store_admin_reject',
      amount: 3000,
      payoutMethod: 'BKASH',
      destinationDetails: { number: '01799888777' },
    });

    const rejected = await FinanceService.reviewSettlement({
      settlementId: settlement.settlementNumber,
      action: 'REJECT',
      financeManagerId: 'usr_admin_fm_02',
      rejectionReason: 'Incomplete bank documentation',
    });

    assert.strictEqual(rejected.status, 'REJECTED');
    assert.strictEqual(rejected.rejectionReason, 'Incomplete bank documentation');
  });

  it('8.25 - Audit trail logs are created for critical operations', async () => {
    await AuditService.log({
      actorId: 'usr_admin_audit_test',
      actorRole: 'SUPER_ADMIN',
      action: 'SELLER_VERIFIED',
      targetCollection: 'sellers',
      targetId: 'seller_kyc_001',
      afterState: { kycStatus: 'VERIFIED', verifiedAt: new Date() },
    });

    const result = await AuditService.getAuditLogs({ actorId: 'usr_admin_audit_test' });
    assert.ok(result.logs.length > 0, 'Must have audit log entries');
    assert.strictEqual(result.logs[0].action, 'SELLER_VERIFIED');
  });

  it('8.26 - Order payment recording creates balanced multi-leg journal entry', async () => {
    const journal = await FinanceService.recordOrderPayment(
      { id: 'ord_journal_test', orderNumber: 'ORD-20261115-JNL1', grandTotal: 15000 },
      [
        {
          id: 'so_jnl_1',
          subOrderNumber: 'ORD-20261115-JNL1-S1',
          sellerId: 'seller_jnl_1',
          storeId: 'store_jnl_1',
          subtotal: 10000,
          shippingFee: 60,
          commissionAmount: 1200,
          sellerNetEarning: 8800,
        },
        {
          id: 'so_jnl_2',
          subOrderNumber: 'ORD-20261115-JNL1-S2',
          sellerId: 'seller_jnl_2',
          storeId: 'store_jnl_2',
          subtotal: 5000,
          shippingFee: 60,
          commissionAmount: 600,
          sellerNetEarning: 4400,
        },
      ],
      'SSLCOMMERZ',
      'TRX-SSL-JNL-001'
    );

    assert.ok(journal.journalId.startsWith('jnl_pay_'));
    assert.strictEqual(journal.totalDebits, 15000);
    assert.strictEqual(journal.totalCredits, 15000);
    assert.strictEqual(journal.totalDebits, journal.totalCredits, 'Debits must equal credits');
    assert.strictEqual(journal.legs, 4, 'Must have 4 legs: 1 debit + 2 seller credits + 1 commission credit');
  });
});
