import { Card, CardContent, Badge, Button } from '@marketplace/ui';
import { Warehouse, RefreshCw, AlertTriangle, ArrowUpDown } from 'lucide-react';

const INVENTORY_ITEMS = [
  {
    sku: 'APX-SH-001-BLK-42',
    productTitle: 'Apex Premium Leather Formal Shoes',
    variantTitle: 'Black / Size 42',
    available: 18,
    reserved: 2, // In active 15-minute checkout sessions
    sold: 140,
    threshold: 5,
  },
  {
    sku: 'APX-SH-001-BLK-43',
    productTitle: 'Apex Premium Leather Formal Shoes',
    variantTitle: 'Black / Size 43',
    available: 14,
    reserved: 1,
    sold: 98,
    threshold: 5,
  },
  {
    sku: 'APX-SH-002-BRN-41',
    productTitle: 'Apex Casual Slip-on Loafers',
    variantTitle: 'Brown / Size 41',
    available: 3, // Low stock
    reserved: 0,
    sold: 45,
    threshold: 5,
  },
  {
    sku: 'APX-SH-003-OXF-44',
    productTitle: 'Apex Oxford Brogues Classic Edition',
    variantTitle: 'Oxblood / Size 44',
    available: 1, // Critical stock
    reserved: 1,
    sold: 32,
    threshold: 5,
  },
];

export default function SellerInventoryPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#101828]">Inventory Control Center</h1>
          <p className="text-xs text-[#667085]">
            Real-time multi-state stock tracking: Available, Reserved (in 15-min checkouts), and Sold
          </p>
        </div>

        <Button variant="outline" size="sm" className="gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" /> Sync Live Stock
        </Button>
      </div>

      <Card className="border-[#E4E7EC]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E4E7EC] text-[#667085] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Variant SKU / Name</th>
                  <th className="p-4 text-center">Available Stock</th>
                  <th className="p-4 text-center">Reserved (Checkout Lock)</th>
                  <th className="p-4 text-center">Lifetime Sold</th>
                  <th className="p-4">Stock Health</th>
                  <th className="p-4 text-right">Quick Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC]">
                {INVENTORY_ITEMS.map((item) => (
                  <tr key={item.sku} className="hover:bg-[#F8FAFC]/50 transition-colors">
                    <td className="p-4">
                      <span className="font-mono text-[11px] font-bold text-[#3563E9]">{item.sku}</span>
                      <p className="font-semibold text-[#101828] text-sm">{item.productTitle}</p>
                      <p className="text-[11px] text-[#667085]">{item.variantTitle}</p>
                    </td>

                    <td className="p-4 text-center">
                      <span className="text-base font-extrabold text-[#101828]">{item.available}</span>
                    </td>

                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-[#D97706] bg-[#FFFBEB] px-2 py-0.5 rounded border border-[#FDE68A]">
                        {item.reserved} Units Locked
                      </span>
                    </td>

                    <td className="p-4 text-center font-bold text-[#667085]">
                      {item.sold}
                    </td>

                    <td className="p-4">
                      {item.available <= item.threshold ? (
                        <Badge variant="warning">Low Stock (&lt;={item.threshold})</Badge>
                      ) : (
                        <Badge variant="success">Healthy Stock</Badge>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                        <ArrowUpDown className="w-3.5 h-3.5" /> Restock
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
