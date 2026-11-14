import { Card, CardContent, Badge, Button } from '@marketplace/ui';
import { Store, Check, X, ShieldCheck, FileText } from 'lucide-react';

const SELLERS_KYC = [
  {
    id: 'sel_1',
    businessName: 'Apex Footwear Ltd.',
    tradeLicense: 'TRAD-DHK-2024-9981',
    bank: 'BRAC Bank (Acct: ****4910, Routing: 060261122)',
    storeName: 'Apex Footwear Official',
    commissionRate: 10,
    status: 'APPROVED',
  },
  {
    id: 'sel_2',
    businessName: 'Aarong Handloom Artisan Collective',
    tradeLicense: 'TRAD-DHK-2023-4122',
    bank: 'Dutch-Bangla Bank (Acct: ****8812, Routing: 090272144)',
    storeName: 'Aarong Crafts',
    commissionRate: 15,
    status: 'APPROVED',
  },
  {
    id: 'sel_3',
    businessName: 'Bengal Heritage Spices & Organic Foods',
    tradeLicense: 'TRAD-CTG-2026-0041',
    bank: 'City Bank (Acct: ****1920, Routing: 070261311)',
    storeName: 'Bengal Heritage',
    commissionRate: 12,
    status: 'PENDING_REVIEW', // Awaiting admin review
  },
];

export default function AdminSellersPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#101828]">Seller KYC & Store Governance</h1>
          <p className="text-xs text-[#667085]">Review business credentials, trade licenses, bank routing, and set custom commission tiers</p>
        </div>
      </div>

      <Card className="border-[#E4E7EC]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E4E7EC] text-[#667085] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Business / Store</th>
                  <th className="p-4">Trade License</th>
                  <th className="p-4">Disbursement Bank</th>
                  <th className="p-4">Commission %</th>
                  <th className="p-4">Verification Status</th>
                  <th className="p-4 text-right">Moderator Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC]">
                {SELLERS_KYC.map((seller) => (
                  <tr key={seller.id} className="hover:bg-[#F8FAFC]/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-[#101828] text-sm">{seller.businessName}</p>
                      <span className="text-[#667085] flex items-center gap-1 font-medium">
                        <Store className="w-3 h-3 text-[#3563E9]" /> {seller.storeName}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[#101828] font-medium">{seller.tradeLicense}</td>
                    <td className="p-4 text-[#667085]">{seller.bank}</td>
                    <td className="p-4">
                      <span className="font-bold text-[#101828] bg-[#F8FAFC] px-2 py-0.5 rounded border border-[#E4E7EC]">
                        {seller.commissionRate}%
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge variant={seller.status === 'APPROVED' ? 'success' : 'warning'}>
                        {seller.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {seller.status === 'PENDING_REVIEW' ? (
                        <>
                          <Button size="sm" variant="primary" className="h-7 text-xs gap-1">
                            <Check className="w-3 h-3" /> Approve
                          </Button>
                          <Button size="sm" variant="destructive" className="h-7 text-xs gap-1">
                            <X className="w-3 h-3" /> Reject
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          Edit Contract
                        </Button>
                      )}
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
