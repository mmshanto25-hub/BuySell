import { StatCard, Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@marketplace/ui';
import { DollarSign, Store, ShoppingCart, Users, CheckSquare, ArrowUpRight, ShieldCheck, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@marketplace/utils';

export default function AdminOverviewPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#101828]">Executive Dashboard</h1>
          <p className="text-xs text-[#667085]">Live marketplace telemetry, financial performance, and governance actions</p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="cyan" className="text-xs">All Systems Operational</Badge>
        </div>
      </div>

      {/* 1. Core Platform KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Gross Merchandise Value (GMV)"
          value={formatCurrency(14850000)}
          changePercent={18.4}
          icon={<DollarSign className="w-4 h-4 text-[#06B6D4]" />}
        />
        <StatCard
          title="Platform Net Commission"
          value={formatCurrency(1782000)}
          changePercent={19.1}
          timeframe="12.0% average take rate"
          icon={<DollarSign className="w-4 h-4 text-[#3563E9]" />}
        />
        <StatCard
          title="Active Verified Sellers"
          value="142"
          changePercent={6.5}
          icon={<Store className="w-4 h-4" />}
        />
        <StatCard
          title="Total Orders Processed"
          value="4,820"
          changePercent={12.3}
          icon={<ShoppingCart className="w-4 h-4" />}
        />
      </div>

      {/* 2. Action Required Moderation Queues */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-[#E4E7EC] p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">Seller KYC Approvals</span>
            <Badge variant="warning">5 Pending</Badge>
          </div>
          <p className="text-2xl font-extrabold text-[#101828]">5 Applications</p>
          <p className="text-xs text-[#667085] mt-1 mb-4">Trade license & bank account verification awaiting review.</p>
          <Link href="/sellers">
            <Button size="sm" variant="outline" className="w-full">Inspect Applications</Button>
          </Link>
        </Card>

        <Card className="border-[#E4E7EC] p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">Product Moderation</span>
            <Badge variant="cyan">12 Pending</Badge>
          </div>
          <p className="text-2xl font-extrabold text-[#101828]">12 Listings</p>
          <p className="text-xs text-[#667085] mt-1 mb-4">New catalog items awaiting compliance check.</p>
          <Link href="/moderation">
            <Button size="sm" variant="outline" className="w-full">Review Catalog Queue</Button>
          </Link>
        </Card>

        <Card className="border-[#E4E7EC] p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">Payout Settlements</span>
            <Badge variant="destructive">3 Requests</Badge>
          </div>
          <p className="text-2xl font-extrabold text-[#101828]">{formatCurrency(145000)}</p>
          <p className="text-xs text-[#667085] mt-1 mb-4">Cleared seller balance withdrawals requested.</p>
          <Link href="/finance">
            <Button size="sm" variant="outline" className="w-full">Approve Settlements</Button>
          </Link>
        </Card>
      </div>

      {/* 3. Recent Audit Log Activity */}
      <Card className="border-[#E4E7EC]">
        <CardHeader className="border-b border-[#E4E7EC] pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold text-[#101828]">Security & System Audit Log</CardTitle>
          <span className="text-xs text-[#667085]">Live Immutable Security Stream</span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-[#E4E7EC] text-xs">
            {[
              {
                time: '10 mins ago',
                actor: 'Super Admin (admin@marketplace.com)',
                action: 'COMMISSION_OVERRIDE_UPDATED',
                details: 'Set custom 10% commission rate for Aarong Crafts (Store #88)',
              },
              {
                time: '25 mins ago',
                actor: 'Product Manager (sarah@marketplace.com)',
                action: 'PRODUCT_LISTING_APPROVED',
                details: 'Approved Apex Premium Leather Formal Shoes (SKU: APX-SH-001)',
              },
              {
                time: '1 hour ago',
                actor: 'System Automation (Worker Daemon)',
                action: 'ESCROW_FUNDS_RELEASED',
                details: 'Transferred ৳8,450 from Escrow Holding to Seller Available Balance (Order #ORD-20261105-B12M-S1)',
              },
            ].map((log, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="font-bold text-[#101828]">{log.action}</span>
                  <p className="text-[#667085]">{log.details}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-medium text-[#101828]">{log.actor}</p>
                  <p className="text-[#667085]">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
