'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Star, ShieldCheck, Truck, RotateCcw, Store, Heart, Share2, Check, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button, PriceDisplay, Badge, Card, CardContent } from '@marketplace/ui';
import { formatCurrency } from '@marketplace/utils';

interface Variant {
  id: string;
  sku: string;
  title: string;
  size: string;
  color: string;
  price: number;
  compareAtPrice: number;
  availableStock: number;
  imageUrl: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'apex-leather-formal-shoes';

  // Demo Product with Multi-Dimensional Variants
  const product = {
    id: 'prod_apex_01',
    title: 'Apex Premium Handcrafted Full-Grain Leather Formal Shoes',
    slug,
    brand: 'Apex Footwear',
    category: 'Men > Footwear > Formal Shoes',
    store: {
      id: 'store_apex',
      name: 'Apex Footwear Official Flagship Store',
      rating: 4.9,
      reviewsCount: 1420,
      isVerified: true,
      city: 'Dhaka (Banani Warehouse)',
      responseTime: 'Under 1 hour',
    },
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800',
    ],
    description:
      'Engineered with 100% full-grain calf leather and an orthopedic cushioned footbed, these formal shoes combine traditional craftsmanship with modern comfort. Features anti-skid rubber outer soles, breathable leather lining, and reinforced welt stitching for superior longevity.',
    attributes: [
      { name: 'Upper Material', value: '100% Full Grain Calf Leather' },
      { name: 'Sole', value: 'High-Density Anti-Skid Rubber' },
      { name: 'Lining', value: 'Breathable Leather' },
      { name: 'Closure', value: 'Waxed Lace-Up' },
      { name: 'Origin', value: 'Dhaka, Bangladesh' },
      { name: 'Warranty', value: '180 Days Repair Guarantee' },
    ],
    variants: [
      {
        id: 'var_1',
        sku: 'APX-SHOE-BLK-40',
        title: 'Black / 40',
        size: '40',
        color: 'Classic Black',
        price: 4500,
        compareAtPrice: 5200,
        availableStock: 12,
        imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800',
      },
      {
        id: 'var_2',
        sku: 'APX-SHOE-BLK-41',
        title: 'Black / 41',
        size: '41',
        color: 'Classic Black',
        price: 4500,
        compareAtPrice: 5200,
        availableStock: 15,
        imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800',
      },
      {
        id: 'var_3',
        sku: 'APX-SHOE-BLK-42',
        title: 'Black / 42',
        size: '42',
        color: 'Classic Black',
        price: 4500,
        compareAtPrice: 5200,
        availableStock: 25,
        imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800',
      },
      {
        id: 'var_4',
        sku: 'APX-SHOE-BRN-42',
        title: 'Oxford Brown / 42',
        size: '42',
        color: 'Oxford Brown',
        price: 4800,
        compareAtPrice: 5500,
        availableStock: 8,
        imageUrl: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&q=80&w=800',
      },
    ] as Variant[],
  };

  const [selectedImage, setSelectedImage] = React.useState(0);
  const [selectedVariant, setSelectedVariant] = React.useState<Variant>(product.variants[2]);
  const [quantity, setQuantity] = React.useState(1);
  const [addedToast, setAddedToast] = React.useState(false);

  const handleAddToCart = () => {
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="text-xs font-medium text-[#667085] flex items-center gap-2">
        <Link href="/" className="hover:text-[#3563E9]">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-[#3563E9]">Footwear</Link>
        <span>/</span>
        <span className="text-[#101828] font-semibold truncate max-w-sm">{product.title}</span>
      </nav>

      {/* Main Product Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Visual Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden border border-[#E4E7EC] bg-white shadow-sm relative">
            <img
              src={product.images[selectedImage]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <Badge variant="cyan">{product.brand}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImage(idx)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition ${
                  selectedImage === idx ? 'border-[#3563E9] ring-2 ring-[#3563E9]/20' : 'border-[#E4E7EC] opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Center Column: Product Configuration & Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3563E9]">Verified Brand</span>
              <span className="text-xs text-[#98A2B3]">•</span>
              <div className="flex items-center text-amber-500 text-xs font-bold gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>4.9</span>
                <span className="text-[#667085] font-normal">(184 Reviews)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101828] leading-tight">
              {product.title}
            </h1>
            <p className="text-xs font-mono text-[#667085] mt-1">SKU: {selectedVariant.sku}</p>
          </div>

          {/* Pricing Display */}
          <div className="flex items-baseline gap-3 p-4 rounded-xl bg-[#F8FAFC] border border-[#E4E7EC]">
            <PriceDisplay price={selectedVariant.price} size="lg" />
            {selectedVariant.compareAtPrice && (
              <>
                <span className="text-sm line-through text-[#98A2B3]">
                  {formatCurrency(selectedVariant.compareAtPrice)}
                </span>
                <span className="text-xs font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#059669]/20">
                  {Math.round(((selectedVariant.compareAtPrice - selectedVariant.price) / selectedVariant.compareAtPrice) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          {/* Variant Selector */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#101828] uppercase tracking-wider block mb-2">
                Select Variant / Color & Size:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`p-3 rounded-xl border text-left transition ${
                      selectedVariant.id === v.id
                        ? 'border-[#3563E9] bg-blue-50/50 ring-2 ring-[#3563E9]/20'
                        : 'border-[#E4E7EC] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <p className="text-xs font-bold text-[#101828]">{v.color}</p>
                    <p className="text-xs text-[#667085]">Size: {v.size}</p>
                    <p className="text-xs font-bold text-[#3563E9] mt-1">{formatCurrency(v.price)}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Inventory Stock Indicator */}
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-emerald-700">
                In Stock ({selectedVariant.availableStock} pairs ready in Banani warehouse)
              </span>
            </div>
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-[#D0D5DD] rounded-xl overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-2 text-base font-bold text-[#667085] hover:bg-[#F2F4F7]"
                >
                  -
                </button>
                <span className="px-4 py-2 text-sm font-bold text-[#101828] min-w-[40px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(selectedVariant.availableStock, quantity + 1))}
                  className="px-3.5 py-2 text-base font-bold text-[#667085] hover:bg-[#F2F4F7]"
                >
                  +
                </button>
              </div>

              <Button
                onClick={handleAddToCart}
                variant="primary"
                size="lg"
                className="flex-1 flex items-center justify-center gap-2 shadow-md"
              >
                <ShoppingBag className="w-5 h-5" />
                Add to Cart ({formatCurrency(selectedVariant.price * quantity)})
              </Button>
            </div>

            <Link href="/cart" className="block">
              <Button variant="secondary" size="lg" className="w-full flex items-center justify-center gap-2">
                Buy Now & Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            {addedToast && (
              <div className="p-3 bg-[#ECFDF5] border border-[#059669]/30 rounded-xl text-xs font-semibold text-[#059669] flex items-center gap-2">
                <Check className="w-4 h-4" />
                Added {quantity} unit(s) of {selectedVariant.title} to multi-vendor cart!
              </div>
            )}
          </div>

          {/* Seller Store Card */}
          <Card className="border-[#E4E7EC] p-4 bg-[#F8FAFC]">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3563E9]/10 flex items-center justify-center text-[#3563E9]">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-[#101828]">{product.store.name}</p>
                    <Badge variant="cyan">Official</Badge>
                  </div>
                  <p className="text-xs text-[#667085]">
                    ⭐ {product.store.rating} ({product.store.reviewsCount} reviews) • {product.store.city}
                  </p>
                </div>
              </div>
              <Button variant="secondary" size="sm">
                View Store
              </Button>
            </div>
          </Card>

          {/* Delivery & Protection Guarantees */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs text-[#667085] border-t border-[#E4E7EC] pt-4">
            <div className="space-y-1">
              <Truck className="w-5 h-5 mx-auto text-[#3563E9]" />
              <p className="font-semibold text-[#101828]">৳60 Standard Delivery</p>
              <p className="text-[10px]">Within 2-3 business days</p>
            </div>
            <div className="space-y-1">
              <ShieldCheck className="w-5 h-5 mx-auto text-[#059669]" />
              <p className="font-semibold text-[#101828]">100% Genuine</p>
              <p className="text-[10px]">Direct brand authorized</p>
            </div>
            <div className="space-y-1">
              <RotateCcw className="w-5 h-5 mx-auto text-amber-600" />
              <p className="font-semibold text-[#101828]">7-Day Return Policy</p>
              <p className="text-[10px]">Hassle-free escrow refund</p>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Review Tabs */}
      <div className="border-t border-[#E4E7EC] pt-8 space-y-6">
        <h3 className="text-lg font-bold text-[#101828]">Product Specifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {product.attributes.map((attr, idx) => (
            <div key={idx} className="flex justify-between py-2.5 px-4 rounded-lg bg-[#F8FAFC] border border-[#E4E7EC] text-xs">
              <span className="font-medium text-[#667085]">{attr.name}</span>
              <span className="font-bold text-[#101828]">{attr.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
