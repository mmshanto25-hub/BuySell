'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle2, Clock, Truck, Package, Store, MapPin, CreditCard, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button, Badge, Card, CardContent } from '@marketplace/ui';
import { formatCurrency } from '@marketplace/utils';

export default function OrderDetailsPage() {
  const params = useParams();
  const orderNumber = (params?.orderNumber as string) || 'ORD-20261114-K89X';

  const orderData = {
    orderNumber,
    orderStatus: 'PROCESSING',
    paymentStatus: 'PAID',
    paymentMethod: 'BKASH',
    placedAt: 'November 14, 2026 at 3:15 PM',
    currency: 'BDT',
    itemsSubtotal: 11300,
    totalShippingFee: 120,
    totalDiscount: 1130,
    grandTotal: 10290,
    shippingAddress: {
      recipientName: 'Tariqul Islam',
      phone: '+8801712345678',
      streetAddress: 'House 42, Road 11, Block D, Banani',
      city: 'Dhaka',
      division: 'Dhaka',
      postalCode: '1213',
    },
    subOrders: [
      {
        subOrderNumber: `${orderNumber}-S1`,
        storeName: 'Apex Footwear Official Flagship',
        carrier: 'PATHAO',
        trackingCode: 'PTH-9921448',
        status: 'CONFIRMED',
        estimatedDelivery: 'Nov 16, 2026',
        items: [
          {
            title: 'Apex Premium Leather Formal Shoes',
            variant: 'Classic Black / Size 42',
            sku: 'APX-SHOE-BLK-42',
            price: 4500,
            quantity: 1,
            imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=300',
          },
        ],
        subtotal: 4500,
        shippingFee: 60,
      },
      {
        subOrderNumber: `${orderNumber}-S2`,
        storeName: 'Aarong Artisan Crafts',
        carrier: 'STEADFAST',
        trackingCode: 'STF-5582910',
        status: 'PENDING',
        estimatedDelivery: 'Nov 17, 2026',
        items: [
          {
            title: 'Aarong Hand-Embroidered Jamdani Silk Panjabi',
            variant: 'Off-White / Size 40',
            sku: 'ARG-PANJ-WHT-40',
            price: 6800,
            quantity: 1,
            imageUrl: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&q=80&w=300',
          },
        ],
        subtotal: 6800,
        shippingFee: 60,
      },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link href="/cart" className="text-xs text-[#667085] hover:text-[#3563E9] flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Cart
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-[#101828]">Order #{orderData.orderNumber}</h1>
            <Badge variant="cyan">Multi-Vendor Split</Badge>
          </div>
          <p className="text-xs text-[#667085] mt-1">Placed on {orderData.placedAt}</p>
        </div>

        <div className="text-right">
          <Badge variant="success" className="text-sm px-3 py-1">
            Payment Verified (bKash)
          </Badge>
        </div>
      </div>

      {/* Progress Timeline */}
      <Card className="p-6 border-[#E4E7EC]">
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-full bg-[#059669] text-white flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="font-bold text-[#101828]">Order Placed</p>
            <p className="text-[10px] text-[#667085]">Confirmed</p>
          </div>

          <div className="space-y-2">
            <div className="w-8 h-8 rounded-full bg-[#3563E9] text-white flex items-center justify-center mx-auto shadow-md">
              <Package className="w-4 h-4" />
            </div>
            <p className="font-bold text-[#101828]">Processing</p>
            <p className="text-[10px] text-[#3563E9] font-medium">Split to 2 Vendors</p>
          </div>

          <div className="space-y-2 opacity-50">
            <div className="w-8 h-8 rounded-full bg-[#F2F4F7] text-[#667085] flex items-center justify-center mx-auto">
              <Truck className="w-4 h-4" />
            </div>
            <p className="font-medium text-[#667085]">Shipped</p>
            <p className="text-[10px] text-[#667085]">Courier Picked Up</p>
          </div>

          <div className="space-y-2 opacity-50">
            <div className="w-8 h-8 rounded-full bg-[#F2F4F7] text-[#667085] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <p className="font-medium text-[#667085]">Delivered</p>
            <p className="text-[10px] text-[#667085]">Escrow Cleared</p>
          </div>
        </div>
      </Card>

      {/* Split Packages Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#101828]">Fulfillment Packages ({orderData.subOrders.length} Shipments)</h3>

        <div className="space-y-6">
          {orderData.subOrders.map((so, idx) => (
            <Card key={so.subOrderNumber} className="border-[#E4E7EC] overflow-hidden shadow-sm">
              <div className="bg-[#F8FAFC] px-5 py-3.5 border-b border-[#E4E7EC] flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-[#3563E9]" />
                  <span className="font-bold text-sm text-[#101828]">{so.storeName}</span>
                  <span className="text-xs font-mono text-[#667085]">({so.subOrderNumber})</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs text-right">
                    <span className="text-[#667085] block">Carrier: {so.carrier}</span>
                    <span className="font-mono text-[#3563E9] font-semibold">{so.trackingCode}</span>
                  </div>
                  <Badge variant={so.status === 'CONFIRMED' ? 'warning' : 'outline'}>
                    {so.status}
                  </Badge>
                </div>
              </div>

              <div className="p-5 divide-y divide-[#F2F4F7]">
                {so.items.map((item, iIdx) => (
                  <div key={iIdx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img src={item.imageUrl} alt={item.title} className="w-16 h-16 rounded-lg object-cover border border-[#E4E7EC]" />
                      <div>
                        <h4 className="text-sm font-semibold text-[#101828]">{item.title}</h4>
                        <p className="text-xs text-[#667085]">{item.variant}</p>
                        <p className="text-xs font-mono text-[#98A2B3]">SKU: {item.sku}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-[#101828]">{formatCurrency(item.price * item.quantity)}</p>
                      <p className="text-xs text-[#667085]">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[#FCFCFD] px-5 py-3 border-t border-[#F2F4F7] flex justify-between text-xs text-[#667085]">
                <span>Estimated Arrival: <strong className="text-[#101828]">{so.estimatedDelivery}</strong></span>
                <span>Sub-order Total: <strong className="text-[#101828]">{formatCurrency(so.subtotal + so.shippingFee)}</strong></span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Address */}
        <Card className="p-5 border-[#E4E7EC] space-y-2">
          <div className="flex items-center gap-2 text-[#101828] font-bold text-sm">
            <MapPin className="w-4 h-4 text-[#3563E9]" />
            Recipient Shipping Address
          </div>
          <p className="text-xs font-semibold text-[#101828]">{orderData.shippingAddress.recipientName}</p>
          <p className="text-xs text-[#667085]">{orderData.shippingAddress.phone}</p>
          <p className="text-xs text-[#667085]">
            {orderData.shippingAddress.streetAddress}, {orderData.shippingAddress.city} - {orderData.shippingAddress.postalCode}
          </p>
        </Card>

        {/* Payment Summary */}
        <Card className="p-5 border-[#E4E7EC] space-y-2 text-xs text-[#667085]">
          <div className="flex items-center gap-2 text-[#101828] font-bold text-sm mb-3">
            <CreditCard className="w-4 h-4 text-[#059669]" />
            Payment Summary
          </div>
          <div className="flex justify-between">
            <span>Items Subtotal:</span>
            <span className="font-semibold text-[#101828]">{formatCurrency(orderData.itemsSubtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Charges (2 Sellers):</span>
            <span className="font-semibold text-[#101828]">{formatCurrency(orderData.totalShippingFee)}</span>
          </div>
          <div className="flex justify-between text-[#059669]">
            <span>Applied Coupon Discount:</span>
            <span className="font-semibold">-{formatCurrency(orderData.totalDiscount)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-[#101828] pt-2 border-t border-[#E4E7EC]">
            <span>Paid Grand Total:</span>
            <span className="text-[#3563E9] text-base">{formatCurrency(orderData.grandTotal)}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
