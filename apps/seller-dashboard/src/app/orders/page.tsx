import { Card, CardContent, Badge, Button } from '@marketplace/ui';
import { PackageCheck, Truck, Printer, Search } from 'lucide-react';
import { formatCurrency } from '@marketplace/utils';

const SELLER_SUB_ORDERS = [
  {
    subOrderNumber: 'ORD-20261114-K89X-S1',
    parentOrder: 'ORD-20261114-K89X',
    customer: 'Rahim Chowdhury',
    phone: '+8801711223344',
    address: 'House 14, Road 5, Dhanmondi, Dhaka',
    items: [{ title: 'Apex Premium Leather Formal Shoes', qty: 1, price: 4500 }],
    shippingFee: 60,
    commissionAmount: 540, // 12% commission
    sellerNet: 4020,
    status: 'CONFIRMED',
    carrier: 'Pathao Courier',
  },
  {
    subOrderNumber: 'ORD-20261113-M41Z-S1',
    parentOrder: 'ORD-20261113-M41Z',
    customer: 'Farhana Akter',
    phone: '+8801819876543',
    address: 'Flat 4B, Sector 3, Uttara, Dhaka',
    items: [{ title: 'Apex Casual Slip-on Loafers', qty: 2, price: 3100 }],
    shippingFee: 60,
    commissionAmount: 744,
    sellerNet: 5516,
    status: 'PACKED',
    carrier: 'Steadfast Courier',
  },
  {
    subOrderNumber: 'ORD-20261112-L90P-S1',
    parentOrder: 'ORD-20261112-L90P',
    customer: 'Tanvir Hossain',
    phone: '+8801912345678',
    address: 'Chawkbazar, Chittagong',
    items: [{ title: 'Apex Oxford Brogues Classic Edition', qty: 1, price: 5100 }],
    shippingFee: 120,
    commissionAmount: 612,
    sellerNet: 4608,
    status: 'SHIPPED',
    carrier: 'Pathao Courier',
  },
];

export default function SellerOrdersPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#101828]">Sub-Order Fulfillment Queue</h1>
          <p className="text-xs text-[#667085]">
            Manage vendor-specific sub-orders, package items, book courier consignments, and print barcode manifests
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {SELLER_SUB_ORDERS.map((order) => (
          <Card key={order.subOrderNumber} className="border-[#E4E7EC] overflow-hidden">
            {/* Order Card Header */}
            <div className="bg-[#F8FAFC] px-6 py-4 border-b border-[#E4E7EC] flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="font-mono text-sm font-extrabold text-[#101828]">{order.subOrderNumber}</span>
                <p className="text-xs text-[#667085]">Parent Checkout: {order.parentOrder}</p>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    order.status === 'CONFIRMED'
                      ? 'warning'
                      : order.status === 'PACKED'
                      ? 'cyan'
                      : 'info'
                  }
                >
                  {order.status}
                </Badge>
                <span className="text-xs font-semibold text-[#101828]">Carrier: {order.carrier}</span>
              </div>
            </div>

            {/* Order Body */}
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Delivery Details */}
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-[#667085] uppercase tracking-wider text-[11px]">Destination</span>
                <p className="font-bold text-[#101828] text-sm">{order.customer}</p>
                <p className="text-[#667085]">{order.phone}</p>
                <p className="text-[#667085]">{order.address}</p>
              </div>

              {/* Items List */}
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-[#667085] uppercase tracking-wider text-[11px]">Package Items</span>
                {order.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between py-1 border-b border-[#F8FAFC] last:border-none">
                    <span className="font-medium text-[#101828]">{it.qty}x {it.title}</span>
                    <span className="font-semibold text-[#101828]">{formatCurrency(it.price * it.qty)}</span>
                  </div>
                ))}
              </div>

              {/* Financial Breakdown & Action */}
              <div className="space-y-3 text-xs bg-[#F8FAFC] p-4 rounded-xl border border-[#E4E7EC] flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex justify-between text-[#667085]">
                    <span>Items Subtotal:</span>
                    <span>{formatCurrency(order.items.reduce((a, b) => a + b.price * b.qty, 0))}</span>
                  </div>
                  <div className="flex justify-between text-[#667085]">
                    <span>Platform Commission:</span>
                    <span className="text-[#DC2626]">-{formatCurrency(order.commissionAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#059669] border-t border-[#E4E7EC] pt-1">
                    <span>Seller Net Earning:</span>
                    <span>{formatCurrency(order.sellerNet)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {order.status === 'CONFIRMED' && (
                    <Button size="sm" variant="primary" className="w-full gap-1.5">
                      <PackageCheck className="w-3.5 h-3.5" /> Pack & Book Carrier
                    </Button>
                  )}
                  {order.status === 'PACKED' && (
                    <Button size="sm" variant="cyan" className="w-full gap-1.5">
                      <Printer className="w-3.5 h-3.5" /> Print Pathao Label
                    </Button>
                  )}
                  {order.status === 'SHIPPED' && (
                    <Button size="sm" variant="outline" className="w-full gap-1.5">
                      <Truck className="w-3.5 h-3.5" /> Track Consignment
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
