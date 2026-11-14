import Link from 'next/link';
import { Search, ShoppingBag, Heart, User, Store, ShieldCheck } from 'lucide-react';
import { Button } from '@marketplace/ui';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-[#E4E7EC]">
      {/* Top Announcement Bar */}
      <div className="bg-[#101828] text-white py-1.5 px-4 text-xs font-medium text-center flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-[#06B6D4]" />
        <span>Authentic Multi-Vendor Marketplace. Verified sellers & 7-day hassle-free returns.</span>
        <span className="text-[#06B6D4] font-semibold ml-1">Free delivery over ৳2,500</span>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Marketplace Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#3563E9] flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
            M
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-[#101828] leading-none">
              MARKET<span className="text-[#3563E9]">PLACE</span>
            </span>
            <span className="text-[10px] uppercase font-semibold text-[#667085] tracking-widest">
              Enterprise Multi-Vendor
            </span>
          </div>
        </Link>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search products, brands, or verified sellers..."
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-[#E4E7EC] bg-[#F8FAFC] text-sm text-[#101828] placeholder:text-[#667085] focus:outline-none focus:border-[#3563E9] focus:bg-white transition-all"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#667085]" />
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex items-center gap-2">
          <Link href="/shop" className="hidden lg:inline-flex text-sm font-semibold text-[#101828] hover:text-[#3563E9] px-3 py-2 transition-colors">
            All Products
          </Link>

          <Link href="http://localhost:3001" target="_blank" className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#3563E9] bg-[#EFF4FF] hover:bg-[#DBE7FE] px-3 py-2 rounded-lg transition-colors">
            <Store className="w-3.5 h-3.5" />
            Seller Portal
          </Link>

          <Link href="/cart" className="relative p-2 rounded-lg text-[#101828] hover:bg-[#F8FAFC] transition-colors" aria-label="Shopping Cart">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#3563E9] text-white text-[10px] font-bold flex items-center justify-center">
              2
            </span>
          </Link>

          <Link href="/account" className="p-2 rounded-lg text-[#101828] hover:bg-[#F8FAFC] transition-colors" aria-label="Account">
            <User className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
