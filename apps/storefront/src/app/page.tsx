import Link from 'next/link';
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Zap, Store } from 'lucide-react';
import { Button, ProductCard } from '@marketplace/ui';

// Baseline products representing verified multi-vendor marketplace data
const FEATURED_PRODUCTS = [
  {
    id: 'prod_1',
    title: 'Apex Premium Leather Formal Shoes',
    slug: 'apex-premium-leather-formal-shoes',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800',
    storeName: 'Apex Footwear Official',
    basePrice: 4500,
    compareAtPrice: 5200,
    rating: 4.8,
    totalReviews: 124,
    isFlashSale: true,
  },
  {
    id: 'prod_2',
    title: 'Aarong Hand-Embroidered Jamdani Silk Panjabi',
    slug: 'aarong-jamdani-silk-panjabi',
    imageUrl: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&q=80&w=800',
    storeName: 'Aarong Crafts',
    basePrice: 6800,
    compareAtPrice: 7500,
    rating: 4.9,
    totalReviews: 89,
    isFlashSale: false,
  },
  {
    id: 'prod_3',
    title: 'Walton 4K Ultra HD Frameless Smart Android TV 55"',
    slug: 'walton-4k-smart-tv-55',
    imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=800',
    storeName: 'Walton Plaza Official',
    basePrice: 54900,
    compareAtPrice: 62000,
    rating: 4.7,
    totalReviews: 215,
    isFlashSale: true,
  },
  {
    id: 'prod_4',
    title: 'Shadhin Artisan Brass Table Lamp & Lantern',
    slug: 'shadhin-artisan-brass-lamp',
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800',
    storeName: 'Dhamrai Brass Studio',
    basePrice: 3200,
    compareAtPrice: 3800,
    rating: 4.6,
    totalReviews: 42,
    isFlashSale: false,
  },
];

const CATEGORIES = [
  { name: 'Fashion & Apparel', count: '1,420 Items', icon: '👔', slug: 'fashion' },
  { name: 'Footwear & Leather', count: '680 Items', icon: '👞', slug: 'footwear' },
  { name: 'Consumer Electronics', count: '940 Items', icon: '📱', slug: 'electronics' },
  { name: 'Home & Living', count: '510 Items', icon: '🛋️', slug: 'home-living' },
  { name: 'Health & Beauty', count: '820 Items', icon: '✨', slug: 'beauty' },
  { name: 'Artisan & Crafts', count: '390 Items', icon: '🏺', slug: 'crafts' },
];

export default function HomePage() {
  return (
    <div className="space-y-16 py-8">
      {/* 1. Hero Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#101828] via-[#1E293B] to-[#0F172A] text-white p-8 sm:p-14 shadow-xl border border-[#334155]/40">
          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#06B6D4]/15 border border-[#06B6D4]/40 text-[#06B6D4] text-xs font-bold tracking-wide uppercase">
              <Zap className="w-3.5 h-3.5" />
              Multi-Vendor Marketplace
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              One Cart. Multiple Verified Sellers. Seamless Split Checkout.
            </h1>

            <p className="text-base sm:text-lg text-[#98A2B3] leading-relaxed">
              Shop directly from independent merchants, flagship brands, and artisans across Bangladesh with guaranteed delivery and an escrow-protected 7-day return window.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/shop">
                <Button size="lg" variant="primary" className="gap-2">
                  Explore Marketplace <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <Link href="http://localhost:3001" target="_blank">
                <Button size="lg" variant="outline" className="bg-transparent border-[#475467] text-white hover:bg-white/10">
                  <Store className="w-4 h-4 mr-1.5" /> Become a Seller
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Value Propositions Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-2xl border border-[#E4E7EC] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#EFF4FF] text-[#3563E9] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#101828]">Escrow-Backed Buyer Protection</h4>
              <p className="text-xs text-[#667085]">Seller funds are securely held until 7-day return window expires.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#101828]">Integrated Express Delivery</h4>
              <p className="text-xs text-[#667085]">Automated dispatch via Pathao, Steadfast, and RedX nationwide.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#101828]">7-Day Hassle-Free Returns</h4>
              <p className="text-xs text-[#667085]">Instant automated refund directly back to your payment source.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#101828]">Shop by Category</h2>
            <p className="text-sm text-[#667085]">Curated collections from verified merchant stores</p>
          </div>
          <Link href="/shop" className="text-sm font-semibold text-[#3563E9] hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop?category=${cat.slug}`}
              className="group p-5 rounded-2xl bg-white border border-[#E4E7EC] hover:border-[#3563E9] hover:shadow-card transition-all text-center flex flex-col items-center justify-center gap-2"
            >
              <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">{cat.icon}</div>
              <h4 className="text-xs font-bold text-[#101828] group-hover:text-[#3563E9] transition-colors">{cat.name}</h4>
              <span className="text-[11px] text-[#667085]">{cat.count}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Trending Multi-Vendor Products Listing */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#101828]">Trending Across Sellers</h2>
            <p className="text-sm text-[#667085]">Real-time bestsellers with instant stock availability</p>
          </div>
          <Link href="/shop" className="text-sm font-semibold text-[#3563E9] hover:underline flex items-center gap-1">
            See More <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_PRODUCTS.map((prod) => (
            <ProductCard key={prod.id} {...prod} />
          ))}
        </div>
      </section>
    </div>
  );
}
