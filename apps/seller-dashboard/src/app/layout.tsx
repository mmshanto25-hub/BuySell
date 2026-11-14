import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '../components/Sidebar';
import { Bell, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Seller Dashboard | Enterprise Marketplace',
  description: 'Merchant operations, catalog, inventory, fulfillment, and financial ledger.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex bg-[#F8FAFC] text-[#101828]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Operational Header */}
          <header className="h-16 bg-white border-b border-[#E4E7EC] px-8 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#101828]">Apex Footwear Official</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#A7F3D0]">
                <ShieldCheck className="w-3 h-3" /> KYC Verified Merchant
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-lg text-[#667085] hover:bg-[#F8FAFC]">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#3563E9]"></span>
              </button>
              <div className="w-8 h-8 rounded-full bg-[#101828] text-white flex items-center justify-center text-xs font-bold">
                AF
              </div>
            </div>
          </header>

          <main className="flex-1 p-8 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
