import Link from 'next/link';
import { ProductCard } from '@marketplace/ui';
import { Filter, SlidersHorizontal } from 'lucide-react';

const SHOP_PRODUCTS = [
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

export default function ShopPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E4E7EC] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101828]">
            Marketplace Catalog
          </h1>
          <p className="text-sm text-[#667085]">
            Showing 4 verified products from independent merchant stores
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E4E7EC] bg-white text-xs font-semibold text-[#101828]">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Sort: Popularity
          </button>
        </div>
      </div>

      {/* Main Content: Sidebar Filters + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar */}
        <aside className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-[#E4E7EC] space-y-6">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
              <h3 className="text-sm font-bold text-[#101828] flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#3563E9]" /> Faceted Filters
              </h3>
              <button className="text-xs text-[#3563E9] hover:underline font-medium">Clear All</button>
            </div>

            {/* Category Filter */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#667085]">Categories</h4>
              <div className="space-y-1.5 text-xs text-[#101828]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-[#3563E9]" />
                  <span>Fashion & Apparel (1,420)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-[#3563E9]" />
                  <span>Footwear & Leather (680)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-[#3563E9]" />
                  <span>Consumer Electronics (940)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-[#3563E9]" />
                  <span>Artisan Home & Crafts (390)</span>
                </label>
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#667085]">Price Range (BDT)</h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min (৳)"
                  defaultValue={1000}
                  className="w-full h-8 px-2.5 text-xs rounded-lg border border-[#E4E7EC]"
                />
                <span className="text-xs text-[#667085]">-</span>
                <input
                  type="number"
                  placeholder="Max (৳)"
                  defaultValue={60000}
                  className="w-full h-8 px-2.5 text-xs rounded-lg border border-[#E4E7EC]"
                />
              </div>
            </div>

            {/* Verified Seller Checkbox */}
            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs font-medium text-[#101828] cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-[#06B6D4]" />
                <span>Verified Official Flagship Stores Only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Right Products Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SHOP_PRODUCTS.map((prod) => (
              <Link key={prod.id} href={`/product/${prod.slug}`} className="block h-full">
                <ProductCard {...prod} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
