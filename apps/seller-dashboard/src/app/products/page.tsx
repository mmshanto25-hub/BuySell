import { Card, CardHeader, CardTitle, CardContent, Badge, Button, PriceDisplay } from '@marketplace/ui';
import { Plus, Edit2, Archive, Eye } from 'lucide-react';
import Link from 'next/link';

const SELLER_PRODUCTS = [
  {
    id: 'prod_1',
    sku: 'APX-SH-001',
    title: 'Apex Premium Leather Formal Shoes',
    category: 'Footwear & Shoes',
    price: 4500,
    compareAtPrice: 5200,
    variantsCount: 4,
    availableStock: 48,
    status: 'PUBLISHED',
    moderation: 'APPROVED',
  },
  {
    id: 'prod_2',
    sku: 'APX-SH-002',
    title: 'Apex Casual Slip-on Loafers',
    category: 'Footwear & Shoes',
    price: 3100,
    compareAtPrice: 3500,
    variantsCount: 3,
    availableStock: 12,
    status: 'PUBLISHED',
    moderation: 'APPROVED',
  },
  {
    id: 'prod_3',
    sku: 'APX-SH-003',
    title: 'Apex Oxford Brogues Classic Edition',
    category: 'Footwear & Shoes',
    price: 5100,
    compareAtPrice: 5900,
    variantsCount: 5,
    availableStock: 2, // Low stock
    status: 'PUBLISHED',
    moderation: 'APPROVED',
  },
];

export default function SellerProductsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#101828]">Product Catalog</h1>
          <p className="text-xs text-[#667085]">Manage product listings, multi-variants, pricing, and moderation status</p>
        </div>

        <Button variant="primary" size="sm" className="gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Create Product
        </Button>
      </div>

      <Card className="border-[#E4E7EC]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E4E7EC] text-[#667085] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">SKU / Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Variants</th>
                  <th className="p-4">Available Stock</th>
                  <th className="p-4">Moderation</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC]">
                {SELLER_PRODUCTS.map((prod) => (
                  <tr key={prod.id} className="hover:bg-[#F8FAFC]/50 transition-colors">
                    <td className="p-4">
                      <span className="font-mono text-[11px] text-[#667085]">{prod.sku}</span>
                      <p className="font-bold text-[#101828] text-sm">{prod.title}</p>
                    </td>
                    <td className="p-4 text-[#667085] font-medium">{prod.category}</td>
                    <td className="p-4">
                      <PriceDisplay price={prod.price} compareAtPrice={prod.compareAtPrice} size="sm" />
                    </td>
                    <td className="p-4 font-semibold text-[#101828]">{prod.variantsCount} SKUs</td>
                    <td className="p-4">
                      <span className={prod.availableStock <= 5 ? 'font-bold text-[#DC2626]' : 'font-semibold text-[#059669]'}>
                        {prod.availableStock} Units {prod.availableStock <= 5 && '(Low)'}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge variant="success">{prod.moderation}</Badge>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button className="p-1.5 rounded hover:bg-[#EFF4FF] text-[#3563E9] transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-[#FEF2F2] text-[#DC2626] transition-colors" title="Archive">
                        <Archive className="w-4 h-4" />
                      </button>
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
