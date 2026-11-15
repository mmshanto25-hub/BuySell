import { test, describe } from 'node:test';
import assert from 'node:assert';
import { AiService } from './ai.service';
import { ReviewService } from '../reviews/review.service';
import { CouponService } from '../marketing/coupon.service';
import { SeoService } from '../seo/seo.service';
import { generateProductJsonLd, generateSitemapXml } from '@marketplace/utils';

describe('Phase 7: AI Integration, SEO Optimization & Marketing Automation', () => {
  const mockProductId = 'prod_apex_leather';

  test('7.1 - Natural language semantic vector search matches conceptual intent with cosine similarity', async () => {
    const results = await AiService.searchSemantic({
      query: 'comfortable breathable formal shoes for office wear',
      limit: 3,
      minScore: 0.1,
    });

    assert.ok(results, 'Semantic search results must be returned');
    assert.ok(results.totalMatched > 0, 'Must match at least one relevant product');
    assert.strictEqual(results.results[0].id, mockProductId, 'Apex formal shoes must rank first for office shoe query');
    assert.ok(results.results[0].similarityScore > 0.3, 'Similarity score must be positive and significant');
    assert.ok(results.results[0].relevanceMatch, 'Relevance classification label must be assigned');
  });

  test('7.2 - AI Review Sentiment Analyzer detects polarity and flags spam/abusive contact content', () => {
    // 1. Positive review
    const posAnalysis = ReviewService.analyzeSentiment('Excellent handcrafted shoes! Premium quality leather and fast shipping.', 5);
    assert.ok(posAnalysis.score > 0.5, 'Positive review must score high (> 0.5)');
    assert.strictEqual(posAnalysis.flagged, false, 'Genuine positive review must not be flagged');

    // 2. Severe negative review
    const negAnalysis = ReviewService.analyzeSentiment('Worst product ever, completely fake and defective terrible waste of money.', 1);
    assert.ok(negAnalysis.score < -0.5, 'Negative review must score low (< -0.5)');
    assert.strictEqual(negAnalysis.flagged, true, 'Severe negative review must be flagged for support review');

    // 3. Spam with WhatsApp contact
    const spamAnalysis = ReviewService.analyzeSentiment('Contact me on WhatsApp +8801999999 for free money and crypto prizes!', 5);
    assert.strictEqual(spamAnalysis.flagged, true, 'Review containing WhatsApp link/spam must be flagged');
    assert.match(spamAnalysis.reason || '', /spam/i);
  });

  test('7.3 - Verified customer review submission creates record and computes summary stats', async () => {
    const review = await ReviewService.createReview({
      customerId: 'user_cust_77',
      customerName: 'Rahim Chowdhury',
      productId: mockProductId,
      subOrderId: 'ORD-20261114-K89X-S1',
      rating: 5,
      title: 'Remarkable comfort and craftsmanship',
      comment: 'Superb leather quality and soft insole, perfect for daily corporate use.',
    });

    assert.ok(review, 'Review must be created');
    assert.strictEqual(review.rating, 5);
    assert.strictEqual(review.isVerifiedPurchase, true);
    assert.strictEqual(review.moderationStatus, 'APPROVED');

    // Query product reviews
    const summary = await ReviewService.getProductReviews(mockProductId);
    assert.ok(summary.summary.totalReviews >= 1, 'Total review count must update');
    assert.ok(summary.summary.averageRating >= 4.0, 'Average rating must be positive');
  });

  test('7.4 - Marketing coupon engine validates eligibility and calculates percentage & fixed discounts', async () => {
    // Create new test coupon
    const couponCode = 'WINTERFEST20';
    const coupon = await CouponService.createCoupon({
      code: couponCode,
      description: '20% discount on orders over ৳2,000 capped at ৳600',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      maxDiscountAmount: 600,
      minOrderSubtotal: 2000,
      expiresAt: new Date(Date.now() + 14 * 86400000),
    });

    assert.strictEqual(coupon.code, couponCode);

    // Validate with order under minimum threshold (৳1,500 < ৳2,000)
    await assert.rejects(
      async () => {
        await CouponService.validateCoupon({
          code: couponCode,
          cartSubtotal: 1500,
        });
      },
      /below minimum required/,
      'Must reject cart below minimum threshold'
    );

    // Validate with ৳4,000 subtotal (20% of ৳4,000 = ৳800, capped at ৳600)
    const validResult = await CouponService.validateCoupon({
      code: couponCode,
      cartSubtotal: 4000,
    });

    assert.strictEqual(validResult.isValid, true);
    assert.strictEqual(validResult.discountAmount, 600, 'Discount must be capped at ৳600');
    assert.strictEqual(validResult.newSubtotal, 3400, 'New subtotal must equal 4000 - 600');
  });

  test('7.5 - AI Catalog Assistant auto-generates SEO titles, markdown descriptions, and search tags', async () => {
    const copy = await AiService.generateCatalogCopy({
      productTitle: 'Aarong Handloom Cotton Panjabi',
      categoryName: 'Traditional Ethnic Menswear',
      features: ['100% breathable organic cotton', 'Hand-stitched mandarin collar', 'Side welt pockets'],
    });

    assert.ok(copy, 'Catalog copy must be generated');
    assert.match(copy.generatedSeoTitle, /Aarong Handloom Cotton Panjabi/);
    assert.match(copy.detailedDescription, /### Product Overview/);
    assert.match(copy.detailedDescription, /100% breathable organic cotton/);
    assert.ok(copy.searchTags.length >= 4, 'Must generate multiple SEO search tags');
    assert.ok(copy.metaDescription.length > 20, 'Meta description must be generated');
  });

  test('7.6 - RAG Conversational Shopping Assistant chatbot returns contextual products within budget', async () => {
    const botResponse = await AiService.chatShoppingAssistant({
      query: 'I need noise cancelling wireless earbuds under 5000 taka for gym',
      budgetLimit: 5000,
    });

    assert.ok(botResponse, 'Chatbot response must be generated');
    assert.ok(botResponse.reply.length > 20, 'Assistant reply narrative must be returned');
    assert.ok(botResponse.recommendedProducts.length > 0, 'Must recommend matching catalog products');
    assert.ok(
      botResponse.recommendedProducts.some((p) => p.title.includes('Earbuds')),
      'Should recommend SoundPulse Earbuds'
    );
    assert.ok(
      botResponse.recommendedProducts.every((p) => p.price <= 5000),
      'All recommendations must respect budget limit'
    );
  });

  test('7.7 - SEO Dynamic XML Sitemap generator outputs Google-compliant XML with URLs and priorities', async () => {
    const sitemapXml = await SeoService.generateSitemap();

    assert.ok(sitemapXml, 'Sitemap XML must be generated');
    assert.match(sitemapXml, /<\?xml version="1\.0" encoding="UTF-8"\?>/);
    assert.match(sitemapXml, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
    assert.match(sitemapXml, /<loc>https:\/\/marketplace\.com\/<\/loc>/);
    assert.match(sitemapXml, /<loc>https:\/\/marketplace\.com\/product\//);
    assert.match(sitemapXml, /<priority>1\.0<\/priority>/);
  });

  test('7.8 - Schema.org JSON-LD generator builds valid Product, Offer, Brand, and AggregateRating data', () => {
    const jsonLd = generateProductJsonLd({
      name: "Apex Men's Genuine Leather Shoes",
      description: 'Handcrafted full-grain calfskin leather formal shoes.',
      image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4',
      sku: 'APEX-SHOE-OXFORD-01',
      brand: 'Apex Footwear Ltd.',
      price: 4500,
      currency: 'BDT',
      ratingValue: 4.8,
      reviewCount: 124,
      inStock: true,
      sellerName: 'Apex Official Store',
    });

    assert.strictEqual(jsonLd['@context'], 'https://schema.org/');
    assert.strictEqual(jsonLd['@type'], 'Product');
    assert.strictEqual(jsonLd.name, "Apex Men's Genuine Leather Shoes");
    assert.strictEqual(jsonLd.brand.name, 'Apex Footwear Ltd.');
    assert.strictEqual(jsonLd.offers.price, 4500);
    assert.strictEqual(jsonLd.offers.priceCurrency, 'BDT');
    assert.strictEqual(jsonLd.offers.availability, 'https://schema.org/InStock');
    assert.strictEqual(jsonLd.aggregateRating.ratingValue, '4.8');
    assert.strictEqual(jsonLd.aggregateRating.reviewCount, 124);
  });
});
