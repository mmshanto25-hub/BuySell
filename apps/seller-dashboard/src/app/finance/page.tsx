import { Card, CardHeader, CardTitle, CardContent, StatCard, Badge, Button } from '@marketplace/ui';
import { DollarSign, Wallet, ShieldCheck, ArrowDownRight, History } from 'lucide-react';
import { formatCurrency } from '@marketplace/utils';

const LEDGER_TRANSACTIONS = [
  {
    id: 'tx_1',
    date: '2026-11-14',
    type: 'ORDER_ESCROW_CREDIT',
    reference: 'ORD-20261114-K89X-S1',
    description: 'Sub-Order fulfillment earnings credited to pending escrow',
    amount: 4020,
    isCredit: true,
  },
  {
    id: 'tx_2',
    date: '2026-11-12',
    type: 'ESCROW_RELEASED',
    reference: 'ORD-20261105-B12M-S1',
    description: '7-day return window expired; funds transferred to Available Balance',
    amount: 8450,
    isCredit: true,
  },
  {
    id: 'tx_3',
    date: '2026-11-10',
    type: 'SETTLEMENT_PAYOUT',
    reference: 'SETTLE-202611-0021',
    description: 'Disbursed to BRAC Bank Account (Ref: TXN-WIRE-9921)',
    amount: 25000,
    isCredit: false,
  },
];

export default function SellerFinancePage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#101828]">Seller Wallet & Financial Statements</h1>
          <p className="text-xs text-[#667085]">
            Immutable financial ledger, escrow hold balances, and withdrawal settlements
          </p>
        </div>

        <Button variant="primary" size="sm" className="gap-1.5">
          <ArrowDownRight className="w-3.5 h-3.5" /> Request Bank Settlement
        </Button>
      </div>

      {/* 1. Wallet Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Available Cleared Balance"
          value={formatCurrency(124800)}
          timeframe="Eligible for immediate withdrawal"
          icon={<Wallet className="w-5 h-5 text-[#059669]" />}
        />
        <StatCard
          title="Pending Escrow Holding"
          value={formatCurrency(48200)}
          timeframe="Locked in 7-day post-delivery return buffer"
          icon={<ShieldCheck className="w-5 h-5 text-[#3563E9]" />}
        />
        <StatCard
          title="Lifetime Disbursed Earnings"
          value={formatCurrency(312000)}
          timeframe="Total payouts settled to bank"
          icon={<DollarSign className="w-5 h-5 text-[#101828]" />}
        />
      </div>

      {/* 2. Transaction Ledger Table */}
      <Card className="border-[#E4E7EC]">
        <CardHeader className="border-b border-[#E4E7EC] pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold text-[#101828] flex items-center gap-2">
            <History className="w-4 h-4 text-[#3563E9]" /> Double-Entry Wallet Transaction Journal
          </CardTitle>
          <span className="text-xs text-[#667085]">Showing recent ledger movements</span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E4E7EC] text-[#667085] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Date</th>
                  <th className="p-4">Event Type</th>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Description</th>
                  <th className="p-4 text-right">Amount (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC]">
                {LEDGER_TRANSACTIONS.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#F8FAFC]/50 transition-colors">
                    <td className="p-4 font-mono text-[#667085]">{tx.date}</td>
                    <td className="p-4">
                      <Badge variant={tx.isCredit ? 'success' : 'destructive'}>
                        {tx.type}
                      </Badge>
                    </td>
                    <td className="p-4 font-mono font-bold text-[#101828]">{tx.reference}</td>
                    <td className="p-4 text-[#667085]">{tx.description}</td>
                    <td className="p-4 text-right">
                      <span className={tx.isCredit ? 'font-bold text-[#059669]' : 'font-bold text-[#DC2626]'}>
                        {tx.isCredit ? `+${formatCurrency(tx.amount)}` : `-${formatCurrency(tx.amount)}`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
