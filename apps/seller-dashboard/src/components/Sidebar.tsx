'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Warehouse, ShoppingCart, Wallet, Store, LogOut, ExternalLink } from 'lucide-react';
import { cn } from '@marketplace/ui';

const NAV_ITEMS = [
  { label: 'Overview', href: '/', icon: LayoutDashboard },
  { label: 'Products', href: '/products', icon: Package },
  { label: 'Inventory', href: '/inventory', icon: Warehouse },
  { label: 'Orders', href: '/orders', icon: ShoppingCart },
  { label: 'Finance & Wallet', href: '/finance', icon: Wallet },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#101828] text-white flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-[#1E293B] gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#3563E9] flex items-center justify-center font-bold text-white text-sm">
            S
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-white leading-none">Seller Portal</h2>
            <span className="text-[10px] text-[#06B6D4] font-semibold uppercase tracking-wider">Apex Footwear</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all',
                  isActive
                    ? 'bg-[#3563E9] text-white shadow-sm'
                    : 'text-[#98A2B3] hover:text-white hover:bg-[#1E293B]'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Store Link */}
      <div className="p-4 border-t border-[#1E293B] space-y-2">
        <Link
          href="http://localhost:3000"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-xs font-semibold text-[#06B6D4] transition-colors"
        >
          <span className="flex items-center gap-2">
            <Store className="w-3.5 h-3.5" /> View Public Store
          </span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <button className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#98A2B3] hover:text-white transition-colors">
          <LogOut className="w-4 h-4" /> Log Out
        </button>
      </div>
    </aside>
  );
}
