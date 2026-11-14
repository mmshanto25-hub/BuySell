import type { Metadata } from 'next';
import './globals.css';
import { AdminSidebar } from '../components/AdminSidebar';
import { ShieldCheck, Bell } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admin Command Center | Enterprise Marketplace',
  description: 'Platform administration, RBAC, KYC verification, moderation, and financial ledger.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex bg-[#F8FAFC] text-[#101828]">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Admin Header */}
          <header className="h-16 bg-white border-b border-[#E4E7EC] px-8 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#101828]">Enterprise Platform Governance</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3563E9] bg-[#EFF4FF] px-2 py-0.5 rounded-full border border-[#DBE7FE]">
                <ShieldCheck className="w-3 h-3" /> Production Environment
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-lg text-[#667085] hover:bg-[#F8FAFC]">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#06B6D4]"></span>
              </button>
              <div className="w-8 h-8 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-xs font-bold">
                SA
              </div>
            </div>
          </header>

          <main className="flex-1 p-8 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
