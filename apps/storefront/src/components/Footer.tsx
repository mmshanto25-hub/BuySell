import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[#101828] text-white border-t border-[#1E293B] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-[#06B6D4] mb-4">Customer Care</h4>
            <ul className="space-y-2 text-sm text-[#98A2B3]">
              <li><Link href="/help" className="hover:text-white">Help Center & FAQ</Link></li>
              <li><Link href="/account/orders" className="hover:text-white">Track Order</Link></li>
              <li><Link href="/return-policy" className="hover:text-white">7-Day Returns Policy</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-[#06B6D4] mb-4">Sell on Marketplace</h4>
            <ul className="space-y-2 text-sm text-[#98A2B3]">
              <li><Link href="http://localhost:3001" className="hover:text-white">Seller Registration</Link></li>
              <li><Link href="http://localhost:3001" className="hover:text-white">Seller Commission Rates</Link></li>
              <li><Link href="http://localhost:3001" className="hover:text-white">Fulfillment Guidelines</Link></li>
              <li><Link href="http://localhost:3001" className="hover:text-white">Seller Help Hub</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-[#06B6D4] mb-4">About Platform</h4>
            <ul className="space-y-2 text-sm text-[#98A2B3]">
              <li><Link href="/about" className="hover:text-white">Our Mission</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/blog" className="hover:text-white">Marketplace Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-[#06B6D4] mb-4">Verified Logistics</h4>
            <p className="text-xs text-[#98A2B3] leading-relaxed mb-3">
              Direct integrated dispatch via Pathao Courier, Steadfast Logistics, and RedX across all 64 districts in Bangladesh.
            </p>
            <div className="text-xs text-[#667085]">
              Cash on Delivery, bKash, Nagad, and Cards accepted.
            </div>
          </div>
        </div>

        <div className="border-t border-[#1E293B] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#667085]">
          <p>© 2026 Enterprise Multi-Vendor Marketplace. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="http://localhost:3002" target="_blank" className="hover:text-white">Admin Command Center</Link>
            <Link href="http://localhost:5000/api/v1/products" target="_blank" className="hover:text-white">REST API v1</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
