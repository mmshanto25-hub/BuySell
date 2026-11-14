'use client';

import * as React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Trash2, Store, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button, PriceDisplay, Badge, Card, CardContent } from '@marketplace/ui';
import { formatCurrency } from '@marketplace/utils';

export default function CartPage() {
  // Demonstration multi-vendor cart with 2 distinct sellers
  const [cartState, setCartState] = React.useState({
    sellerGroups: [
      {
        storeId: 'store_apex',
        storeName: 'Apex Footwear Official',
        estimatedShipping: 60,
        items: [
          {
            id: 'item_1',
            title: 'Apex Premium Leather Formal Shoes',
            variantTitle: 'Black / Size 42',
            price: 4500,
            quantity: 1,
            imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=300',
          },
        ],
      },
      {
        storeId: 'store_aarong',
        storeName: 'Aarong Crafts',
        estimatedShipping: 60,
        items: [
          {
            id: 'item_2',
            title: 'Aarong Hand-Embroidered Jamdani Silk Panjabi',
            variantTitle: 'Off-White / Size 40',
            price: 6800,
            quantity: 1,
            imageUrl: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&q=80&w=300',
          },
        ],
      },
    ],
  });

  const [isCheckingOut, setIsCheckingOut] = React.useState(false);
  const [orderConfirmed, setOrderConfirmed] = React.useState<any>(null);

  const itemsSubtotal = cartState.sellerGroups.reduce(
    (acc, group) => acc + group.items.reduce((iAcc, item) => iAcc + item.price * item.quantity, 0),
    0
  );

  const totalShipping = cartState.sellerGroups.reduce((acc, group) => acc + group.estimatedShipping, 0);
  const grandTotal = itemsSubtotal + totalShipping;

  const handleSimulateSplitCheckout = () => {
    setIsCheckingOut(true);

    setTimeout(() => {
      setIsCheckingOut(false);
      setOrderConfirmed({
        parentOrderNumber: 'ORD-20261114-K89X',
        subOrders: [
          { number: 'ORD-20261114-K89X-S1', store: 'Apex Footwear Official', subtotal: 4500, shipping: 60 },
          { number: 'ORD-20261114-K89X-S2', store: 'Aarong Crafts', subtotal: 6800, shipping: 60 },
        ],
      });
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-2 mb-8">
        <ShoppingBag className="w-6 h-6 text-[#3563E9]" />
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101828]">
          Shopping Cart ({cartState.sellerGroups.reduce((acc, g) => acc + g.items.length, 0)} Items)
        </h1>
      </div>

      {orderConfirmed ? (
        <Card className="max-w-2xl mx-auto p-8 text-center border-[#059669]/30 bg-[#ECFDF5]/30">
          <CardContent className="space-y-6 p-0">
            <div className="w-16 h-16 rounded-full bg-[#059669] text-white flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[#101828]">Multi-Vendor Order Created!</h2>
              <p className="text-sm text-[#667085]">
                Parent Order <span className="font-mono font-bold text-[#101828]">{orderConfirmed.parentOrderNumber}</span> generated with 2 vendor-specific sub-orders.
              </p>
            </div>

            <div className="space-y-3 text-left bg-white p-5 rounded-xl border border-[#E4E7EC]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#667085]">Independent Seller Sub-Orders:</h4>
              {orderConfirmed.subOrders.map((so: any) => (
                <div key={so.number} className="flex justify-between items-center py-2 border-b border-[#F8FAFC] last:border-none text-sm">
                  <div>
                    <p className="font-semibold text-[#101828]">{so.store}</p>
                    <p className="text-xs font-mono text-[#667085]">{so.number}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#101828]">{formatCurrency(so.subtotal + so.shipping)}</p>
                    <Badge variant="warning">Awaiting Pack</Badge>
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={() => setOrderConfirmed(null)} variant="primary" className="w-full">
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Vendor Grouped Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cartState.sellerGroups.map((group) => (
              <Card key={group.storeId} className="overflow-hidden border-[#E4E7EC]">
                {/* Seller Header */}
                <div className="bg-[#F8FAFC] px-5 py-3 border-b border-[#E4E7EC] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-[#3563E9]" />
                    <span className="text-sm font-bold text-[#101828]">{group.storeName}</span>
                    <Badge variant="cyan">Verified Seller</Badge>
                  </div>
                  <span className="text-xs font-medium text-[#667085]">
                    Shipping: {formatCurrency(group.estimatedShipping)}
                  </span>
                </div>

                {/* Items from this Seller */}
                <div className="divide-y divide-[#E4E7EC]">
                  {group.items.map((item) => (
                    <div key={item.id} className="p-5 flex gap-4 items-center">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-20 h-20 rounded-lg object-cover border border-[#E4E7EC] shrink-0"
                      />

                      <div className="flex-1 space-y-1">
                        <h4 className="text-sm font-semibold text-[#101828]">{item.title}</h4>
                        <p className="text-xs text-[#667085]">{item.variantTitle}</p>
                        <PriceDisplay price={item.price} size="sm" />
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-[#667085]">Qty: {item.quantity}</span>
                        <button className="text-[#667085] hover:text-[#DC2626] p-1.5 transition-colors" aria-label="Remove item">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          {/* Right Column: Order Summary */}
          <div className="space-y-6">
            <Card className="p-6 border-[#E4E7EC] bg-white space-y-5">
              <h3 className="text-base font-bold text-[#101828] border-b border-[#E4E7EC] pb-3">
                Order Summary
              </h3>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-[#667085]">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-[#101828]">{formatCurrency(itemsSubtotal)}</span>
                </div>

                <div className="flex justify-between text-[#667085]">
                  <span>Total Delivery Fee (2 Sellers)</span>
                  <span className="font-semibold text-[#101828]">{formatCurrency(totalShipping)}</span>
                </div>

                <div className="border-t border-[#E4E7EC] pt-3 flex justify-between items-baseline">
                  <span className="text-base font-bold text-[#101828]">Total Amount</span>
                  <span className="text-xl font-extrabold text-[#3563E9]">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleSimulateSplitCheckout}
                  isLoading={isCheckingOut}
                  variant="primary"
                  size="lg"
                  className="w-full gap-2 shadow-sm"
                >
                  Simulate Split Checkout <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="pt-2 flex items-center justify-center gap-2 text-xs text-[#667085]">
                <ShieldCheck className="w-4 h-4 text-[#059669]" />
                <span>Protected by 7-Day Escrow Buyer Guarantee</span>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
