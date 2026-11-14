'use client';

import * as React from 'react';
import { Card, CardContent, Badge, Button, Input } from '@marketplace/ui';
import { Scale, CheckCircle2, XCircle, AlertTriangle, ShieldAlert, Store, User, Camera } from 'lucide-react';
import { formatCurrency } from '@marketplace/utils';

export default function DisputesArbitrationPage() {
  const [disputes, setDisputes] = React.useState([
    {
      id: 'RET-202611-0091',
      subOrderNumber: 'ORD-20261114-K89X-S1',
      customer: {
        name: 'Tariqul Islam',
        email: 'tariqul@example.com',
        phone: '+8801712345678',
      },
      seller: {
        storeName: 'Apex Footwear Official',
        merchantName: 'Apex Footwear Ltd.',
      },
      product: {
        title: 'Apex Premium Leather Formal Shoes (Black / 42)',
        sku: 'APX-SHOE-BLK-42',
        price: 4500,
        qty: 1,
      },
      reason: 'SIZE_FIT',
      buyerStatement: 'Shoe is narrower across the vamp than standard size 42. Unworn with tags intact.',
      evidenceImages: [
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=400',
      ],
      sellerContestReason: 'Merchant inspected warehouse CCTV and claims box seal was opened by delivery rider.',
      refundAmount: 4500,
      deliveredAt: 'Nov 12, 2026',
      requestedAt: 'Nov 14, 2026 (Within 7-day policy window)',
      status: 'IN_ARBITRATION',
    },
    {
      id: 'RET-202611-0042',
      subOrderNumber: 'ORD-20261110-M91A-S2',
      customer: {
        name: 'Nadia Sultana',
        email: 'nadia@example.com',
        phone: '+8801899112233',
      },
      seller: {
        storeName: 'Aarong Artisan Crafts',
        merchantName: 'BRAC Aarong Foundation',
      },
      product: {
        title: 'Aarong Hand-Embroidered Jamdani Silk Panjabi (White / 40)',
        sku: 'ARG-PANJ-WHT-40',
        price: 6800,
        qty: 1,
      },
      reason: 'DAMAGED',
      buyerStatement: 'Minor tear along the left cuff seam upon unboxing.',
      evidenceImages: [
        'https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&q=80&w=400',
      ],
      sellerContestReason: 'Fabric underwent 100% pre-dispatch quality control inspection.',
      refundAmount: 6800,
      deliveredAt: 'Nov 11, 2026',
      requestedAt: 'Nov 13, 2026 (Within 7-day policy window)',
      status: 'SELLER_CONTESTED',
    },
  ]);

  const [auditNotes, setAuditNotes] = React.useState<Record<string, string>>({});
  const [resolvedStatus, setResolvedStatus] = React.useState<Record<string, string>>({});

  const handleArbitrate = (disputeId: string, resolution: 'REFUND_BUYER' | 'REJECT_CLAIM') => {
    const notes = auditNotes[disputeId] || 'Policy compliance verified by Support Agent';
    setResolvedStatus((prev) => ({
      ...prev,
      [disputeId]: resolution === 'REFUND_BUYER' ? 'REFUNDED' : 'REJECTED',
    }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-6 h-6 text-[#3563E9]" />
            <h1 className="text-2xl font-extrabold tracking-tight text-[#101828]">
              3-Party Dispute Arbitration Hub
            </h1>
          </div>
          <p className="text-xs text-[#667085] mt-1">
            Review contested returns, arbitrate between buyers and merchants, and issue binding escrow refund verdicts
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {disputes.map((dispute) => {
          const currentStatus = resolvedStatus[dispute.id] || dispute.status;

          return (
            <Card key={dispute.id} className="border-[#E4E7EC] overflow-hidden shadow-sm">
              {/* Header */}
              <div className="bg-[#F8FAFC] px-6 py-4 border-b border-[#E4E7EC] flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-extrabold text-[#101828]">{dispute.id}</span>
                    <Badge variant={currentStatus === 'REFUNDED' ? 'success' : currentStatus === 'REJECTED' ? 'destructive' : 'warning'}>
                      {currentStatus}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#667085] mt-0.5">
                    Sub-Order: <span className="font-mono font-semibold">{dispute.subOrderNumber}</span> • Requested: {dispute.requestedAt}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-[#667085]">Disputed Claim Amount</p>
                  <p className="text-lg font-extrabold text-[#3563E9]">{formatCurrency(dispute.refundAmount)}</p>
                </div>
              </div>

              <CardContent className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Buyer Claim & Photo Evidence (5 cols) */}
                <div className="lg:col-span-5 space-y-3 border-r border-[#E4E7EC] pr-0 lg:pr-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#101828]">
                    <User className="w-4 h-4 text-[#3563E9]" />
                    Buyer Statement ({dispute.customer.name})
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50/40 border border-blue-100 text-xs space-y-1.5">
                    <div className="flex justify-between font-semibold text-[#101828]">
                      <span>Reason: {dispute.reason}</span>
                      <span className="text-[#667085]">{dispute.customer.phone}</span>
                    </div>
                    <p className="text-[#475467]">{dispute.buyerStatement}</p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-[#667085] uppercase tracking-wider flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5" /> Photo Evidence
                    </span>
                    <div className="flex gap-2">
                      {dispute.evidenceImages.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt="Evidence"
                          className="w-20 h-20 rounded-lg object-cover border border-[#E4E7EC]"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Center: Seller Rationale & Store Details (4 cols) */}
                <div className="lg:col-span-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#101828]">
                    <Store className="w-4 h-4 text-[#06B6D4]" />
                    Merchant Contest Rationale ({dispute.seller.storeName})
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50/40 border border-amber-200 text-xs space-y-1.5">
                    <span className="font-semibold text-amber-900 block">Contested by Seller:</span>
                    <p className="text-amber-800">{dispute.sellerContestReason}</p>
                  </div>

                  <div className="text-xs text-[#667085] space-y-1 pt-1">
                    <p>Delivered on: <strong className="text-[#101828]">{dispute.deliveredAt}</strong></p>
                    <p>Item: <strong className="text-[#101828]">{dispute.product.title}</strong></p>
                  </div>
                </div>

                {/* Right: Admin Binding Ruling (3 cols) */}
                <div className="lg:col-span-3 space-y-3 bg-[#F8FAFC] p-4 rounded-xl border border-[#E4E7EC] flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-[#101828] uppercase tracking-wider block">
                      Support Agent Binding Ruling
                    </span>
                    <Input
                      placeholder="Audit rationale (mandatory)..."
                      className="text-xs"
                      value={auditNotes[dispute.id] || ''}
                      onChange={(e) => setAuditNotes({ ...auditNotes, [dispute.id]: e.target.value })}
                      disabled={currentStatus === 'REFUNDED' || currentStatus === 'REJECTED'}
                    />
                  </div>

                  {currentStatus === 'REFUNDED' ? (
                    <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold text-center">
                      ✓ Buyer Refund Approved & Escrow Credited
                    </div>
                  ) : currentStatus === 'REJECTED' ? (
                    <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-bold text-center">
                      ✕ Claim Rejected in Favor of Merchant
                    </div>
                  ) : (
                    <div className="space-y-2 pt-2">
                      <Button
                        size="sm"
                        variant="primary"
                        className="w-full flex items-center justify-center gap-1.5 text-xs"
                        onClick={() => handleArbitrate(dispute.id, 'REFUND_BUYER')}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Refund Buyer ({formatCurrency(dispute.refundAmount)})
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-full flex items-center justify-center gap-1.5 text-xs text-red-600 hover:text-red-700"
                        onClick={() => handleArbitrate(dispute.id, 'REJECT_CLAIM')}
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject Claim
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
