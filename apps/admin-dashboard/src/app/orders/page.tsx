import { Card, CardContent, Badge, Button } from '@marketplace/ui';
import { Eye, ExternalLink } from 'lucide-react';
import { formatCurrency } from '@marketplace/utils';

const GLOBAL_ORDERS = [
  {
    parentOrder: 'ORD-20261114-K89X',
    customer: 'Rahim Chowdhury (Dhaka)',
    grandTotal: 11420,
    paymentMethod: 'BKASH',
    paymentStatus: 'PAID',
    subOrdersCount: 2,
    subOrders: [
      { num: 'ORD-20261114-K89X-S1', store: 'Apex Footwear', amount: 4560, status: 'CONFIRMED' },
      { num: 'ORD-20261114-K89X-S2', store: 'Aarong Crafts', amount: 6860, status: 'PENDING' },
    ],
  },
  {
    parentOrder: 'ORD-20261113-M41Z',
    customer: 'Farhana Akter (Uttara)',
    grandTotal: 6260,
    paymentMethod: 'COD',
    paymentStatus: 'UNPAID',
    subOrdersCount: 1,
    subOrders: [
      { num: 'ORD-20261113-M41Z-S1', store: 'Apex Footwear', amount: 6260, status: 'PACKED' },
    ],
  },
];

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#101828]">Global Multi-Vendor Orders</h1>
          <p className="text-xs text-[#667085]">Monitor top-level customer checkouts and autonomous vendor fulfillment sub-orders</p>
        </div>
      </div>

      <div className="space-y-4">
        {GLOBAL_ORDERS.map((order) => (
          <Card key={order.parentOrder} className="border-[#E4E7EC] overflow-hidden">
            {/* Parent Header */}
            <div className="bg-[#F8FAFC] px-6 py-4 border-b border-[#E4E7EC] flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="font-mono text-sm font-extrabold text-[#101828]">{order.parentOrder}</span>
                <p className="text-xs text-[#667085]">{order.customer}</p>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm font-extrabold text-[#3563E9]">{formatCurrency(order.grandTotal)}</span>
                <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                  {order.paymentMethod}: {order.paymentStatus}
                </Badge>
              </div>
            </div>

            {/* Split Sub-Orders Table */}
            <CardContent className="p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#667085] block mb-2">
                Partitioned Seller Sub-Orders ({order.subOrdersCount} Vendors):
              </span>

              <div className="divide-y divide-[#F8FAFC] border border-[#E4E7EC] rounded-xl overflow-hidden text-xs">
                {order.subOrders.map((so) => (
                  <div key={so.num} className="p-3 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-[#101828]">{so.num}</span>
                      <span className="font-medium text-[#667085]">Store: {so.store}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-bold text-[#101828]">{formatCurrency(so.amount)}</span>
                      <Badge variant="cyan">{so.status}</Badge>
                      <Button size="sm" variant="outline" className="h-6 text-[11px] px-2">
                        Inspect
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
