'use client';

import * as React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Trash2, Store, ShieldCheck, CheckCircle2, Tag, Clock, Truck, CreditCard } from 'lucide-react';
import { Button, PriceDisplay, Badge, Card, CardContent, Input } from '@marketplace/ui';
import { formatCurrency } from '@marketplace/utils';

export default function CartPage() {
  const [cartState, setCartState] = React.useState({
    couponCode: '',
    appliedCoupon: null as string | null,
    discountAmount: 0,
    sellerGroups: [
      {
        storeId: 'store_apex',
        storeName: 'Apex Footwear Official',
        estimatedShipping: 60,
        items: [
          {
            id: 'item_1',
            productId: 'prod_apex_01',
            variantId: 'var_apex_01_blk_42',
            sku: 'APX-SHOE-BLK-42',
            title: 'Apex Premium Leather Formal Shoes',
            variantTitle: 'Black / Size 42',
            price: 4500,
            quantity: 1,
            availableStock: 25,
            imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=300',
          },
        ],
      },
      {
        storeId: 'store_aarong',
        storeName: 'Aarong Artisan Crafts',
        estimatedShipping: 60,
        items: [
          {
            id: 'item_2',
            productId: 'prod_aarong_01',
            variantId: 'var_aarong_01_wht_40',
            sku: 'ARG-PANJ-WHT-40',
            title: 'Aarong Hand-Embroidered Jamdani Silk Panjabi',
            variantTitle: 'Off-White / Size 40',
            price: 6800,
            quantity: 1,
            availableStock: 18,
            imageUrl: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&q=80&w=300',
          },
        ],
      },
    ],
  });

  const [checkoutModalOpen, setCheckoutModalOpen] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState<'BKASH' | 'NAGAD' | 'COD' | 'SSLCOMMERZ'>('BKASH');
  const [shippingAddress, setShippingAddress] = React.useState({
    recipientName: 'Tariqul Islam',
    phone: '+8801712345678',
    streetAddress: 'House 42, Road 11, Block D, Banani',
    city: 'Dhaka',
    division: 'Dhaka',
    postalCode: '1213',
    deliveryNotes: 'Call before delivery',
  });

  const [isCheckingOut, setIsCheckingOut] = React.useState(false);
  const [orderConfirmed, setOrderConfirmed] = React.useState<any>(null);
  const [couponError, setCouponError] = React.useState<string | null>(null);

  // Recalculate totals
  const itemsSubtotal = cartState.sellerGroups.reduce(
    (acc, group) => acc + group.items.reduce((iAcc, item) => iAcc + item.price * item.quantity, 0),
    0
  );

  const totalShipping = cartState.sellerGroups.length * 60;
  const grandTotal = Math.max(0, itemsSubtotal + totalShipping - cartState.discountAmount);

  // Quantity handlers
  const updateQuantity = (variantId: string, newQty: number) => {
    if (newQty < 1) return;
    setCartState((prev) => {
      const nextGroups = prev.sellerGroups.map((group) => ({
        ...group,
        items: group.items.map((item) =>
          item.variantId === variantId ? { ...item, quantity: Math.min(newQty, item.availableStock) } : item
        ),
      }));
      return { ...prev, sellerGroups: nextGroups };
    });
  };

  const removeItem = (variantId: string) => {
    setCartState((prev) => {
      const nextGroups = prev.sellerGroups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => item.variantId !== variantId),
        }))
        .filter((group) => group.items.length > 0);
      return { ...prev, sellerGroups: nextGroups };
    });
  };

  // Coupon application
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const code = cartState.couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'PLATFORM10' || code === 'EID2026') {
      const discount = Math.round(itemsSubtotal * 0.1);
      setCartState((prev) => ({
        ...prev,
        appliedCoupon: code,
        discountAmount: discount,
      }));
    } else {
      setCouponError('Invalid coupon code. Try PLATFORM10 for 10% off.');
    }
  };

  const handleRemoveCoupon = () => {
    setCartState((prev) => ({
      ...prev,
      couponCode: '',
      appliedCoupon: null,
      discountAmount: 0,
    }));
  };

  // Place multi-vendor split order
  const handlePlaceOrder = () => {
    setIsCheckingOut(true);

    setTimeout(() => {
      setIsCheckingOut(false);
      setCheckoutModalOpen(false);

      const parentOrderNumber = 'ORD-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

      setOrderConfirmed({
        parentOrderNumber,
        grandTotal,
        paymentMethod,
        recipient: shippingAddress.recipientName,
        address: `${shippingAddress.streetAddress}, ${shippingAddress.city}`,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        subOrders: cartState.sellerGroups.map((group, index) => ({
          number: `${parentOrderNumber}-S${index + 1}`,
          store: group.storeName,
          subtotal: group.items.reduce((acc, i) => acc + i.price * i.quantity, 0),
          shipping: 60,
          itemCount: group.items.length,
          items: group.items,
        })),
      });

      // Clear cart
      setCartState((prev) => ({
        ...prev,
        sellerGroups: [],
        appliedCoupon: null,
        discountAmount: 0,
      }));
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-2 mb-8">
        <ShoppingBag className="w-6 h-6 text-[#3563E9]" />
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101828]">
          Multi-Vendor Shopping Cart
        </h1>
      </div>

      {orderConfirmed ? (
        <Card className="max-w-3xl mx-auto p-8 border-[#059669]/30 bg-[#ECFDF5]/20 shadow-lg">
          <CardContent className="space-y-6 p-0 text-center">
            <div className="w-16 h-16 rounded-full bg-[#059669] text-white flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101828]">Order Placed Successfully!</h2>
              <p className="text-sm text-[#667085]">
                Parent Order <span className="font-mono font-bold text-[#101828] text-base">{orderConfirmed.parentOrderNumber}</span> generated with {orderConfirmed.subOrders.length} independent vendor fulfillment units.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
                <Clock className="w-4 h-4 text-amber-600" />
                Stock conditionally reserved for 15 minutes (Until {orderConfirmed.expiresAt})
              </div>
            </div>

            {/* Split Sub-Orders Detail Cards */}
            <div className="space-y-4 text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#667085]">Autonomous Seller Sub-Orders:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orderConfirmed.subOrders.map((so: any) => (
                  <div key={so.number} className="bg-white p-5 rounded-xl border border-[#E4E7EC] shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Store className="w-4 h-4 text-[#3563E9]" />
                          <p className="font-bold text-sm text-[#101828]">{so.store}</p>
                        </div>
                        <p className="text-xs font-mono text-[#667085] mt-0.5">{so.number}</p>
                      </div>
                      <Badge variant="warning">Awaiting Pack</Badge>
                    </div>

                    <div className="text-xs text-[#667085] divide-y divide-[#F2F4F7]">
                      {so.items.map((it: any) => (
                        <div key={it.id} className="py-1 flex justify-between">
                          <span>{it.quantity}x {it.title}</span>
                          <span className="font-medium text-[#101828]">{formatCurrency(it.price * it.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-[#F2F4F7] flex justify-between items-center text-xs font-bold text-[#101828]">
                      <span>Package Total (incl. ৳60 Shipping):</span>
                      <span className="text-[#3563E9] text-sm">{formatCurrency(so.subtotal + so.shipping)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery & Payment Summary */}
            <div className="bg-white p-4 rounded-xl border border-[#E4E7EC] text-left text-xs grid grid-cols-2 gap-4">
              <div>
                <span className="text-[#667085] block mb-1">Delivering To:</span>
                <p className="font-bold text-[#101828]">{orderConfirmed.recipient}</p>
                <p className="text-[#667085]">{orderConfirmed.address}</p>
              </div>
              <div>
                <span className="text-[#667085] block mb-1">Payment Method:</span>
                <p className="font-bold text-[#101828]">{orderConfirmed.paymentMethod} (Pending Gateway Settlement)</p>
                <p className="text-[#059669] font-bold mt-1">Grand Total: {formatCurrency(orderConfirmed.grandTotal)}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href={`/orders/${orderConfirmed.parentOrderNumber}`} className="flex-1">
                <Button variant="primary" className="w-full">
                  Track Packages & View Order Details
                </Button>
              </Link>
              <Button onClick={() => setOrderConfirmed(null)} variant="secondary" className="flex-1">
                Return to Shop
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : cartState.sellerGroups.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 border-[#E4E7EC]">
          <ShoppingBag className="w-12 h-12 text-[#98A2B3] mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#101828] mb-1">Your Shopping Cart is Empty</h3>
          <p className="text-sm text-[#667085] mb-6">Discover thousands of verified products from Bangladesh's top merchants.</p>
          <Link href="/shop">
            <Button variant="primary">Explore Catalog</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Vendor-Grouped Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cartState.sellerGroups.map((group) => (
              <Card key={group.storeId} className="overflow-hidden border-[#E4E7EC] shadow-sm">
                {/* Seller Group Header */}
                <div className="bg-[#F8FAFC] px-5 py-3.5 border-b border-[#E4E7EC] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-[#3563E9]" />
                    <span className="text-sm font-bold text-[#101828]">{group.storeName}</span>
                    <Badge variant="cyan">Direct Storefront</Badge>
                  </div>
                  <span className="text-xs font-semibold text-[#667085] flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" />
                    Courier Delivery: {formatCurrency(group.estimatedShipping)}
                  </span>
                </div>

                {/* Items from this Seller */}
                <div className="divide-y divide-[#E4E7EC]">
                  {group.items.map((item) => (
                    <div key={item.id} className="p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                      <div className="flex gap-4 items-center">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-20 h-20 rounded-lg object-cover border border-[#E4E7EC] shrink-0"
                        />
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold text-[#101828]">{item.title}</h4>
                          <p className="text-xs text-[#667085]">{item.variantTitle}</p>
                          <p className="text-xs font-mono text-[#98A2B3]">SKU: {item.sku}</p>
                          <PriceDisplay price={item.price} size="sm" />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-end sm:self-center">
                        <div className="flex items-center border border-[#D0D5DD] rounded-lg overflow-hidden bg-white">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="px-2.5 py-1 text-sm font-bold text-[#667085] hover:bg-[#F2F4F7] transition"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="px-3 py-1 text-xs font-bold text-[#101828] min-w-[32px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="px-2.5 py-1 text-sm font-bold text-[#667085] hover:bg-[#F2F4F7] transition"
                            disabled={item.quantity >= item.availableStock}
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="text-[#98A2B3] hover:text-[#DC2626] p-1.5 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          {/* Right Column: Order Summary & Checkout Drawer */}
          <div className="space-y-6">
            <Card className="border-[#E4E7EC] p-6 shadow-sm">
              <h3 className="text-base font-bold text-[#101828] mb-4">Multi-Vendor Order Summary</h3>

              {/* Coupon Code Section */}
              <div className="mb-5">
                {cartState.appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-green-50 border border-green-200 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-green-800">
                      <Tag className="w-4 h-4 text-green-600" />
                      {cartState.appliedCoupon} (10% Saved)
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-xs text-red-600 hover:underline font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <Input
                      placeholder="Coupon Code (e.g. PLATFORM10)"
                      value={cartState.couponCode}
                      onChange={(e) => setCartState((prev) => ({ ...prev, couponCode: e.target.value }))}
                      className="text-xs uppercase"
                    />
                    <Button type="submit" variant="secondary" size="sm">
                      Apply
                    </Button>
                  </form>
                )}
                {couponError && <p className="text-xs text-red-600 mt-1.5">{couponError}</p>}
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-2.5 text-sm border-t border-[#E4E7EC] pt-4 text-[#667085]">
                <div className="flex justify-between">
                  <span>Merchandise Subtotal</span>
                  <span className="font-medium text-[#101828]">{formatCurrency(itemsSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee ({cartState.sellerGroups.length} Vendors)</span>
                  <span className="font-medium text-[#101828]">{formatCurrency(totalShipping)}</span>
                </div>
                {cartState.discountAmount > 0 && (
                  <div className="flex justify-between text-[#059669] font-medium">
                    <span>Coupon Discount</span>
                    <span>-{formatCurrency(cartState.discountAmount)}</span>
                  </div>
                )}
                <div className="border-t border-[#E4E7EC] pt-3 flex justify-between items-baseline text-base font-bold text-[#101828]">
                  <span>Grand Total</span>
                  <span className="text-[#3563E9] text-xl font-extrabold">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <Button
                onClick={() => setCheckoutModalOpen(true)}
                variant="primary"
                size="lg"
                className="w-full mt-6 flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </Button>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[#667085]">
                <ShieldCheck className="w-4 h-4 text-[#059669]" />
                <span>100% Buyer Protection & 7-Day Escrow Guarantee</span>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Checkout Modal / Bottom Sheet */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-[#E4E7EC]">
              <h3 className="text-lg font-bold text-[#101828]">Confirm Split Checkout</h3>
              <button
                onClick={() => setCheckoutModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Delivery Address */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#667085]">Recipient Delivery Address</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[#667085] block mb-1">Full Name</label>
                  <Input
                    value={shippingAddress.recipientName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, recipientName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[#667085] block mb-1">Phone Number</label>
                  <Input
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="text-xs">
                <label className="text-[#667085] block mb-1">Street Address</label>
                <Input
                  value={shippingAddress.streetAddress}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, streetAddress: e.target.value })}
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#667085]">Select Payment Method</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'BKASH', label: 'bKash Wallet', sub: 'Instant Online Pay' },
                  { id: 'NAGAD', label: 'Nagad Pay', sub: 'Instant Online Pay' },
                  { id: 'SSLCOMMERZ', label: 'Cards / Banking', sub: 'Visa, Master, Amex' },
                  { id: 'COD', label: 'Cash on Delivery', sub: 'Pay on Arrival' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-3 rounded-xl border text-left transition ${
                      paymentMethod === m.id
                        ? 'border-[#3563E9] bg-blue-50/50 ring-2 ring-[#3563E9]/20'
                        : 'border-[#E4E7EC] hover:bg-gray-50'
                    }`}
                  >
                    <p className="text-xs font-bold text-[#101828]">{m.label}</p>
                    <p className="text-[10px] text-[#667085]">{m.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Order Split Summary */}
            <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E4E7EC] text-xs space-y-1">
              <div className="flex justify-between text-[#667085]">
                <span>Orders to be created:</span>
                <span className="font-bold text-[#101828]">1 Parent + {cartState.sellerGroups.length} Sub-Orders</span>
              </div>
              <div className="flex justify-between text-[#667085]">
                <span>Total Items:</span>
                <span>{cartState.sellerGroups.reduce((acc, g) => acc + g.items.length, 0)} Items</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#101828] pt-2 border-t border-[#E4E7EC]">
                <span>Payable Amount:</span>
                <span className="text-[#3563E9]">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <Button
              onClick={handlePlaceOrder}
              disabled={isCheckingOut}
              variant="primary"
              className="w-full"
            >
              {isCheckingOut ? 'Reserving Stock & Placing Order...' : `Confirm & Pay ${formatCurrency(grandTotal)}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
