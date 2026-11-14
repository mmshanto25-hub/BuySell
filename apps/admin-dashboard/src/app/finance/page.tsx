import { Card, CardHeader, CardTitle, CardContent, StatCard, Badge, Button } from '@marketplace/ui';
import { DollarSign, ShieldCheck, Check, History } from 'lucide-react';
import { formatCurrency } from '@marketplace/utils';

const PENDING_SETTLEMENTS = [
  {
    settlementId: 'SETTLE-202611-0041',
    seller: 'Apex Footwear Ltd.',
    amount: 85000,
    method: 'BANK_TRANSFER',
    bankDetails: 'BRAC Bank (Acct: ****4910, Routing: 060261122)',
    requestedAt: 'Yesterday, 04:30 PM',
    status: 'REQUESTED',
  },
  {
    settlementId: 'SETTLE-202611-0042',
    seller: 'Aarong Handloom Artisan Collective',
    amount: 60000,
    method: 'BANK_TRANSFER',
    bankDetails: 'Dutch-Bangla Bank (Acct: ****8812, Routing: 090272144)',
    requestedAt: 'Today, 10:15 AM',
    status: 'REQUESTED',
  },
];

export default function AdminFinancePage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#101828]">Financial Ledger & Settlement Approvals</h1>
          <p className="text-xs text-[#667085]">Platform commission oversight, double-entry ledger verification, and merchant payout authorization</p>
        </div>
      </div>

      {/* 1. Metric Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Gross Merchandise Value"
          value={formatCurrency(14850000)}
          changePercent={18.4}
          icon={<DollarSign className="w-4 h-4 text-[#06B6D4]" />}
        />
        <StatCard
          title="Platform Net Commission"
          value={formatCurrency(1782000)}
          changePercent={19.1}
          icon={<DollarSign className="w-4 h-4 text-[#3563E9]" />}
        />
        <StatCard
          title="Vendor Escrow Holding"
          value={formatCurrency(2450000)}
          timeframe="7-day post-delivery hold"
          icon={<ShieldCheck className="w-4 h-4 text-[#D97706]" />}
        />
        <StatCard
          title="Pending Payout Requests"
          value={formatCurrency(145000)}
          timeframe="2 requests awaiting review"
          icon={<DollarSign className="w-4 h-4 text-[#DC2626]" />}
        />
      </div>

      {/* 2. Pending Settlement Payout Approvals */}
      <Card className="border-[#E4E7EC]">
        <CardHeader className="border-b border-[#E4E7EC] pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold text-[#101828]">Seller Settlement Payout Authorization</CardTitle>
          <span className="text-xs font-semibold text-[#D97706]">Finance Manager Authorization Required</span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E4E7EC] text-[#667085] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Settlement ID / Seller</th>
                  <th className="p-4">Disbursement Destination</th>
                  <th className="p-4">Requested At</th>
                  <th className="p-4">Payout Amount</th>
                  <th className="p-4 text-right">Finance Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC]">
                {PENDING_SETTLEMENTS.map((st) => (
                  <tr key={st.settlementId} className="hover:bg-[#F8FAFC]/50 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-bold text-[#3563E9]">{st.settlementId}</span>
                      <p className="font-bold text-[#101828] text-sm">{st.seller}</p>
                    </td>
                    <td className="p-4 text-[#667085]">
                      <span className="font-semibold text-[#101828]">{st.method}</span>
                      <p>{st.bankDetails}</p>
                    </td>
                    <td className="p-4 text-[#667085]">{st.requestedAt}</td>
                    <td className="p-4">
                      <span className="text-base font-extrabold text-[#101828]">{formatCurrency(st.amount)}</span>
                    </td>
                    <td className="p-4 text-right">
                      <Button size="sm" variant="primary" className="h-8 text-xs gap-1.5">
                        <Check className="w-3.5 h-3.5" /> Authorize Bank Transfer
                      </Button>
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
