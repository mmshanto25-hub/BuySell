import { StatCard, Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@marketplace/ui';
import { DollarSign, ShoppingCart, AlertTriangle, Wallet, ArrowUpRight, Plus, Package } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@marketplace/utils';

export default function SellerOverviewPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#101828]">Store Overview</h1>
          <p className="text-xs text-[#667085]">Performance metrics and fulfillment queue for today</p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/products">
            <Button variant="primary" size="sm" className="gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add New Product
            </Button>
          </Link>
        </div>
      </div>

      {/* 1. Metric Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Store Gross Sales"
          value={formatCurrency(485200)}
          changePercent={14.8}
          icon={<DollarSign className="w-4 h-4" />}
        />
        <StatCard
          title="Sub-Orders This Month"
          value="184"
          changePercent={8.2}
          icon={<ShoppingCart className="w-4 h-4" />}
        />
        <StatCard
          title="Available Settlement Balance"
          value={formatCurrency(124800)}
          timeframe="Ready for payout"
          icon={<Wallet className="w-4 h-4" />}
        />
        <StatCard
          title="Low Stock SKUs"
          value="3"
          changePercent={-25.0}
          timeframe="Immediate action required"
          icon={<AlertTriangle className="w-4 h-4 text-[#D97706]" />}
        />
      </div>

      {/* 2. Middle Section: Recent Orders & Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sub-Orders Pending Fulfillment */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-[#E4E7EC]">
            <CardHeader className="flex flex-row items-center justify-between border-b border-[#E4E7EC] pb-4">
              <CardTitle className="text-base font-bold text-[#101828]">Active Fulfillment Queue</CardTitle>
              <Link href="/orders" className="text-xs font-semibold text-[#3563E9] hover:underline flex items-center gap-1">
                View All <ArrowUpRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[#E4E7EC] text-xs">
                {[
                  {
                    subOrder: 'ORD-20261114-K89X-S1',
                    customer: 'Rahim Chowdhury',
                    items: 'Apex Premium Leather Formal Shoes (1x)',
                    total: 4560,
                    status: 'CONFIRMED',
                    badge: 'warning',
                  },
                  {
                    subOrder: 'ORD-20261113-M41Z-S1',
                    customer: 'Farhana Akter',
                    items: 'Apex Casual Slip-on Loafers (2x)',
                    total: 6200,
                    status: 'PACKED',
                    badge: 'cyan',
                  },
                  {
                    subOrder: 'ORD-20261112-L90P-S1',
                    customer: 'Tanvir Hossain',
                    items: 'Apex Oxford Brogues (1x)',
                    total: 5100,
                    status: 'SHIPPED',
                    badge: 'info',
                  },
                ].map((order) => (
                  <div key={order.subOrder} className="p-4 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <span className="font-mono font-bold text-[#101828]">{order.subOrder}</span>
                      <p className="text-[#667085]">{order.customer} • {order.items}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-bold text-[#101828]">{formatCurrency(order.total)}</span>
                      <Badge variant={order.badge as any}>{order.status}</Badge>
                      <Link href="/orders">
                        <Button size="sm" variant="outline" className="h-7 text-xs">Manage</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Store Health & Fast Actions */}
        <div className="space-y-4">
          <Card className="border-[#E4E7EC] p-5 space-y-4">
            <h3 className="text-sm font-bold text-[#101828] border-b border-[#E4E7EC] pb-3">
              Store Escrow Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-[#667085]">Pending Escrow (In Return Window):</span>
                <span className="font-bold text-[#101828]">{formatCurrency(48200)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Cleared Available Balance:</span>
                <span className="font-bold text-[#059669]">{formatCurrency(124800)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Lifetime Withdrawn:</span>
                <span className="font-semibold text-[#101828]">{formatCurrency(312000)}</span>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/finance">
                <Button variant="primary" size="sm" className="w-full">
                  Request Payout Settlement
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
