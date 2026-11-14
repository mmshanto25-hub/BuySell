'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Store,
  CheckSquare,
  ShoppingCart,
  DollarSign,
  ShieldAlert,
  Settings,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@marketplace/ui';

const ADMIN_NAV = [
  { label: 'Admin Overview', href: '/', icon: LayoutDashboard },
  { label: 'User Management', href: '/users', icon: Users },
  { label: 'Seller & KYC Hub', href: '/sellers', icon: Store },
  { label: 'Product Moderation', href: '/moderation', icon: CheckSquare },
  { label: 'Global Orders', href: '/orders', icon: ShoppingCart },
  { label: 'Finance & Ledger', href: '/finance', icon: DollarSign },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0F172A] text-white flex flex-col justify-between shrink-0 min-h-screen border-r border-[#1E293B]">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-[#1E293B] gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#06B6D4] flex items-center justify-center font-extrabold text-[#0F172A] text-sm">
            A
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-white leading-none">Admin Center</h2>
            <span className="text-[10px] text-[#06B6D4] font-semibold uppercase tracking-wider">Super Admin</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all',
                  isActive
                    ? 'bg-[#06B6D4] text-[#0F172A] font-bold shadow-sm'
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

      {/* External Portal Links */}
      <div className="p-4 border-t border-[#1E293B] space-y-2 text-xs">
        <Link
          href="http://localhost:3000"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#1E293B] text-[#98A2B3] hover:text-white transition-colors"
        >
          <span>Storefront</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        <Link
          href="http://localhost:3001"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#1E293B] text-[#98A2B3] hover:text-white transition-colors"
        >
          <span>Seller Portal</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </aside>
  );
}
