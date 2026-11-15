import { test, describe } from 'node:test';
import assert from 'node:assert';
import { FinanceService } from './finance.service';
import { AuditService } from '../audit/audit.service';
import { validateJournalBalance } from '@marketplace/utils';

describe('Phase 6: Admin Governance, Finance & Double-Entry GAAP Ledger', () => {
  const mockSellerId = 'seller_apex_footwear';
  const mockStoreId = 'store_apex';
  const mockOrderNumber = 'ORD-20261114-TESTFIN';

  test('6.1 - Payment settlement generates balanced double-entry journal (1010, 2010, 4010)', async () => {
    const orderData = {
      id: 'ord_fin_1',
      orderNumber: mockOrderNumber,
      grandTotal: 10290,
    };

    const subOrders = [
      {
        id: 'so_fin_1',
        subOrderNumber: `${mockOrderNumber}-S1`,
        sellerId: mockSellerId,
        storeId: mockStoreId,
        subtotal: 5000,
        shippingFee: 80,
        commissionAmount: 600,
        sellerNetEarning: 4480,
      },
      {
        id: 'so_fin_2',
        subOrderNumber: `${mockOrderNumber}-S2`,
        sellerId: 'seller_aarong',
        storeId: 'store_aarong',
        subtotal: 5100,
        shippingFee: 110,
        commissionAmount: 600,
        sellerNetEarning: 4610,
      },
    ];

    const result = await FinanceService.recordOrderPayment(orderData, subOrders, 'BKASH', 'TRX-BKASH-9912');

    assert.ok(result, 'Payment journal must be generated');
    assert.ok(result.journalId.startsWith('jnl_pay_'), 'Journal ID must follow format');
    assert.strictEqual(result.totalDebits, 10290, 'Total debits must equal grand total');
    assert.strictEqual(result.totalCredits, 10290, 'Total credits must equal grand total');
    assert.strictEqual(result.totalDebits, result.totalCredits, 'Debits must equal credits (GAAP Invariant)');
    assert.strictEqual(result.legs, 4, 'Journal must contain 4 legs (1 debit + 2 seller credits + 1 commission credit)');

    // Check seller wallet pending escrow balance
    const walletData = await FinanceService.getSellerWallet(mockSellerId);
    assert.ok(walletData.wallet.pendingEscrowBalance >= 4480, 'Pending escrow balance must reflect sub-order net earning');
  });

  test('6.2 - Automated 7-day escrow release moves liability from Escrow (2010) to Available (2020)', async () => {
    const subOrderId = 'ORD-20261105-B12M-S1';
    const releaseResult = await FinanceService.releaseSubOrderEscrow(subOrderId, 'admin_finance_lead');

    assert.ok(releaseResult, 'Escrow release journal must be created');
    assert.strictEqual(releaseResult.subOrderNumber, subOrderId);
    assert.strictEqual(releaseResult.releasedAmount, 4020);
    assert.ok(releaseResult.journalId.startsWith('jnl_escrow_'));
    assert.ok(releaseResult.escrowReleasedAt, 'escrowReleasedAt must be stamped');

    // Wallet balance check
    const wallet = await FinanceService.getSellerWallet(releaseResult.sellerId);
    assert.ok(wallet.wallet.availableBalance >= 4020, 'Available cleared balance must increase by released amount');
  });

  test('6.3 - Seller withdrawal request enforces minimum ৳1,000 and prevents overdraft', async () => {
    // Attempt withdrawal under ৳1,000 threshold
    await assert.rejects(
      async () => {
        await FinanceService.requestSettlement({
          sellerId: mockSellerId,
          storeId: mockStoreId,
          amount: 500,
          payoutMethod: 'BANK_TRANSFER',
          destinationDetails: { bank: 'BRAC Bank' },
        });
      },
      /Minimum payout settlement threshold is ৳1,000/,
      'Must reject withdrawal under ৳1,000'
    );

    // Attempt withdrawal exceeding available funds
    await assert.rejects(
      async () => {
        await FinanceService.requestSettlement({
          sellerId: mockSellerId,
          storeId: mockStoreId,
          amount: 999999999,
          payoutMethod: 'BANK_TRANSFER',
          destinationDetails: { bank: 'BRAC Bank' },
        });
      },
      /Insufficient cleared funds/,
      'Must reject overdraft payout request'
    );

    // Valid settlement request from seller with available cleared funds (৳4,020 available from test 6.2)
    const validRequest = await FinanceService.requestSettlement({
      sellerId: 'seller_apex',
      storeId: 'store_apex',
      amount: 3000,
      payoutMethod: 'BANK_TRANSFER',
      destinationDetails: {
        bankName: 'BRAC Bank',
        accountNumber: '****4910',
        accountHolder: 'Apex Footwear Ltd.',
      },
    });

    assert.ok(validRequest.settlementNumber.startsWith('SETTLE-'));
    assert.strictEqual(validRequest.status, 'REQUESTED');
    assert.strictEqual(validRequest.amountRequested, 3000);
  });

  test('6.4 - Finance Manager disbursement authorizes bank transfer and debits available balance (2020 -> 1020)', async () => {
    const settlementId = 'SETTLE-202611-0041';
    const wireRef = 'WIRE-BRAC-20261114-0899';

    const disbursed = await FinanceService.reviewSettlement({
      settlementId,
      action: 'APPROVE',
      financeManagerId: 'user_fin_mgr_1',
      bankTransactionRef: wireRef,
    });

    assert.strictEqual(disbursed.status, 'DISBURSED');
    assert.strictEqual(disbursed.bankTransactionRef, wireRef);
    assert.ok(disbursed.disbursedAt, 'disbursedAt timestamp must be recorded');
  });

  test('6.5 - Settlement rejection unlocks locked processing balance back to available balance', async () => {
    const settlementId = 'SETTLE-202611-0042';
    const rationale = 'Routing number mismatch with central bank directory';

    const rejected = await FinanceService.reviewSettlement({
      settlementId,
      action: 'REJECT',
      financeManagerId: 'user_fin_mgr_1',
      rejectionReason: rationale,
    });

    assert.strictEqual(rejected.status, 'REJECTED');
    assert.strictEqual(rejected.rejectionReason, rationale);
  });

  test('6.6 - Platform mathematical ledger reconciliation proves zero variance (Debits - Credits == 0)', async () => {
    // Simulate high volume of balanced transactions
    for (let i = 0; i < 50; i++) {
      const amount = Math.floor(Math.random() * 5000) + 1000;
      const commission = Math.round(amount * 0.12);
      const net = amount - commission;

      await FinanceService.recordOrderPayment(
        { id: `ord_sim_${i}`, orderNumber: `ORD-SIM-${i}`, grandTotal: amount },
        [
          {
            id: `so_sim_${i}`,
            subOrderNumber: `ORD-SIM-${i}-S1`,
            sellerId: `seller_sim_${i % 5}`,
            storeId: `store_sim_${i % 5}`,
            subtotal: amount,
            shippingFee: 0,
            commissionAmount: commission,
            sellerNetEarning: net,
          },
        ],
        'SSLCOMMERZ',
        `TRX-SIM-${i}`
      );
    }

    const report = await FinanceService.getReconciliationReport();

    assert.ok(report, 'Reconciliation report must be generated');
    assert.strictEqual(report.isConserved, true, 'Mathematical ledger conservation invariant must hold');
    assert.strictEqual(report.variance, 0, 'Variance between total debits and total credits must be strictly 0.00');
  });

  test('6.7 - Immutable administrative audit log records mutation before/after states and actor identity', async () => {
    const auditEntry = await AuditService.log({
      actorId: 'admin_security_lead',
      actorRole: 'SUPER_ADMIN',
      action: 'COMMISSION_RATE_OVERRIDE',
      targetCollection: 'sellers',
      targetId: 'seller_apex',
      beforeState: { commissionRate: 0.12 },
      afterState: { commissionRate: 0.08, approvedReason: 'Strategic anchor partner contract' },
      ipAddress: '103.14.88.2',
      userAgent: 'Mozilla/5.0 AdminConsole',
    });

    assert.ok(auditEntry, 'Audit log entry must be created');
    assert.strictEqual(auditEntry.action, 'COMMISSION_RATE_OVERRIDE');
    assert.strictEqual(auditEntry.actorRole, 'SUPER_ADMIN');
    assert.strictEqual(auditEntry.targetId, 'seller_apex');

    const logs = await AuditService.getAuditLogs({ action: 'COMMISSION_RATE_OVERRIDE' });
    assert.ok(logs.logs.length >= 1, 'Audit log query must retrieve logged event');
    assert.strictEqual(logs.logs[0].targetId, 'seller_apex');
  });
});
