import { Card, CardContent, Badge, Button, PriceDisplay } from '@marketplace/ui';
import { Check, X, Eye } from 'lucide-react';

const MODERATION_ITEMS = [
  {
    id: 'prod_mod_1',
    title: 'Bengal Heritage Pure Sundarban Honey (500g)',
    seller: 'Bengal Heritage',
    category: 'Groceries & Foods',
    basePrice: 850,
    imagesCount: 3,
    submittedAt: 'Today, 11:20 AM',
    status: 'PENDING_REVIEW',
  },
  {
    id: 'prod_mod_2',
    title: 'Walton Wireless Noise Cancelling Earbuds',
    seller: 'Walton Plaza Official',
    category: 'Consumer Electronics',
    basePrice: 2400,
    imagesCount: 5,
    submittedAt: 'Today, 09:45 AM',
    status: 'PENDING_REVIEW',
  },
];

export default function AdminModerationPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#101828]">Catalog Moderation Queue</h1>
          <p className="text-xs text-[#667085]">Review seller submitted products for policy compliance, accurate categorization, and image quality</p>
        </div>
      </div>

      <Card className="border-[#E4E7EC]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E4E7EC] text-[#667085] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Product Title / Seller</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Photos</th>
                  <th className="p-4">Submitted</th>
                  <th className="p-4 text-right">Moderator Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC]">
                {MODERATION_ITEMS.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F8FAFC]/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-[#101828] text-sm">{item.title}</p>
                      <span className="text-[#667085] font-medium">Vendor: {item.seller}</span>
                    </td>
                    <td className="p-4 text-[#667085] font-medium">{item.category}</td>
                    <td className="p-4">
                      <PriceDisplay price={item.basePrice} size="sm" />
                    </td>
                    <td className="p-4 font-semibold text-[#101828]">{item.imagesCount} Images</td>
                    <td className="p-4 text-[#667085]">{item.submittedAt}</td>
                    <td className="p-4 text-right space-x-2">
                      <Button size="sm" variant="primary" className="h-7 text-xs gap-1">
                        <Check className="w-3 h-3" /> Approve Listing
                      </Button>
                      <Button size="sm" variant="destructive" className="h-7 text-xs gap-1">
                        <X className="w-3 h-3" /> Reject
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
