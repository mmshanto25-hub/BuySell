import { Types } from 'mongoose';
import { ProductEmbedding, IProductEmbeddingDocument } from './embedding.model';
import { Product } from '../catalog/product.model';
import { isDatabaseConnected } from '../../common/database/connection';
import { formatCurrency } from '@marketplace/utils';

// Pre-seeded catalog items for in-memory and testing
const catalogKnowledgeBase = [
  {
    id: 'prod_apex_leather',
    title: "Apex Men's Genuine Leather Formal Oxford Shoes",
    slug: 'apex-mens-genuine-leather-formal-oxford-shoes',
    category: 'Footwear & Men Fashion',
    brand: 'Apex Footwear',
    price: 4500,
    rating: 4.8,
    totalReviews: 124,
    tags: ['leather', 'formal', 'shoes', 'office', 'oxford', 'breathable', 'footwear'],
    description: 'Handcrafted from 100% full-grain calfskin leather with cushioned memory foam insole and slip-resistant rubber outsole.',
    imageUrl: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600',
  },
  {
    id: 'prod_aarong_panjabi',
    title: 'Aarong Handloom Pure Silk Embroidered Royal Panjabi',
    slug: 'aarong-handloom-pure-silk-embroidered-royal-panjabi',
    category: 'Traditional Menswear & Ethnic',
    brand: 'Aarong Handloom',
    price: 6800,
    rating: 4.9,
    totalReviews: 89,
    tags: ['silk', 'panjabi', 'aarong', 'wedding', 'festive', 'traditional', 'handloom', 'eid'],
    description: 'Exquisite heritage Rajshahi silk featuring intricate Kantha embroidery on collar and cuffs. Breathable luxury for festive occasions.',
    imageUrl: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?w=600',
  },
  {
    id: 'prod_wireless_earbuds',
    title: 'SoundPulse Active Noise Cancelling Wireless Earbuds',
    slug: 'soundpulse-active-noise-cancelling-wireless-earbuds',
    category: 'Electronics & Audio',
    brand: 'SoundPulse',
    price: 3200,
    rating: 4.6,
    totalReviews: 215,
    tags: ['earbuds', 'wireless', 'bluetooth', 'anc', 'audio', 'electronics', 'gym', 'bass'],
    description: 'Hybrid ANC with 35dB noise cancellation, 40-hour total battery life with fast charging, and IPX7 sweatproof rating.',
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600',
  },
  {
    id: 'prod_smartwatch_fit',
    title: 'AeroWatch Pro AMOLED Fitness & Heart Rate Smartwatch',
    slug: 'aerowatch-pro-amoled-fitness-heart-rate-smartwatch',
    category: 'Electronics & Wearables',
    brand: 'AeroTech',
    price: 4999,
    rating: 4.7,
    totalReviews: 76,
    tags: ['smartwatch', 'amoled', 'fitness', 'heartrate', 'tracker', 'wearable', 'waterproof'],
    description: '1.43-inch ultra-bright AMOLED display with continuous SpO2 and heart-rate monitoring, 110+ workout modes, and 14-day battery.',
    imageUrl: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600',
  },
];

export class AiService {
  /**
   * Generates a deterministic dense 64-dimensional float vector from text
   * Uses token hashing and semantic n-gram weighting with L2 normalization
   */
  static generateEmbeddingVector(text: string, dimensions = 64): number[] {
    const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const tokens = clean.split(/\s+/).filter((t) => t.length > 1);

    const vector = new Array(dimensions).fill(0);
    if (tokens.length === 0) return vector;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      // Multi-hash token projection
      let hash = 0;
      for (let j = 0; j < token.length; j++) {
        hash = (hash << 5) - hash + token.charCodeAt(j);
        hash |= 0;
      }
      const index = Math.abs(hash) % dimensions;
      const weight = 1.0 + 1.0 / (i + 1);
      vector[index] += weight;

      // Bigram projection
      if (i > 0) {
        const bigram = tokens[i - 1] + '_' + token;
        let bHash = 0;
        for (let j = 0; j < bigram.length; j++) {
          bHash = (bHash << 5) - bHash + bigram.charCodeAt(j);
          bHash |= 0;
        }
        const bIndex = Math.abs(bHash) % dimensions;
        vector[bIndex] += 1.5;
      }
    }

    // L2 Vector Normalization: v / ||v||
    let normSq = 0;
    for (let i = 0; i < dimensions; i++) {
      normSq += vector[i] * vector[i];
    }
    const norm = Math.sqrt(normSq);
    if (norm > 0) {
      for (let i = 0; i < dimensions; i++) {
        vector[i] = Math.round((vector[i] / norm) * 10000) / 10000;
      }
    }

    return vector;
  }

  /**
   * Computes Cosine Similarity between two normalized vectors: cos(θ) = A · B
   */
  static cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dotProduct = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
    }
    return Math.max(0, Math.min(1, Math.round(dotProduct * 10000) / 10000));
  }

  /**
   * Natural Language Semantic Vector Search across product catalog
   */
  static async searchSemantic(params: { query: string; limit?: number; minScore?: number }) {
    const limit = Math.min(50, Math.max(1, params.limit || 10));
    const minScore = params.minScore !== undefined ? params.minScore : 0.25;
    const queryVector = this.generateEmbeddingVector(params.query);

    let items = catalogKnowledgeBase;

    if (isDatabaseConnected()) {
      const dbProducts = await Product.find({ status: 'APPROVED' }).limit(100);
      if (dbProducts.length > 0) {
        items = dbProducts.map((p) => ({
          id: p._id.toString(),
          title: p.title,
          slug: p.slug,
          category: 'Catalog Item',
          brand: 'Verified Brand',
          price: p.basePrice,
          rating: p.rating || 4.5,
          totalReviews: p.totalReviews || 0,
          tags: p.tags || [],
          description: p.description,
          imageUrl: p.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
        }));
      }
    }

    const scored = items.map((item) => {
      const corpus = `${item.title} ${item.category} ${item.brand} ${item.tags.join(' ')} ${item.description}`;
      const itemVector = this.generateEmbeddingVector(corpus);
      const similarity = this.cosineSimilarity(queryVector, itemVector);
      return {
        ...item,
        similarityScore: similarity,
        relevanceMatch: similarity >= 0.6 ? 'HIGH' : similarity >= 0.35 ? 'MEDIUM' : 'LOW',
      };
    });

    const filtered = scored
      .filter((s) => s.similarityScore >= minScore)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);

    return {
      query: params.query,
      totalMatched: filtered.length,
      results: filtered,
    };
  }

  /**
   * AI Catalog Assistant: Auto-generates compelling SEO titles, descriptions, and tags
   */
  static async generateCatalogCopy(params: {
    productTitle: string;
    categoryName?: string;
    features?: string[];
    targetAudience?: string;
  }) {
    const cleanTitle = params.productTitle.trim();
    const cat = params.categoryName || 'General Merchandise';
    const audience = params.targetAudience || 'discerning shoppers and lifestyle enthusiasts';
    const featuresList = params.features && params.features.length > 0
      ? params.features
      : ['Premium grade craftsmanship', 'Engineered for all-day durability', 'Ergonomic functional design'];

    const seoTitle = `${cleanTitle} — Premium Quality | Authentic Marketplace Edition`;
    const metaDescription = `Discover ${cleanTitle}. Expertly designed for ${audience}. Featuring ${featuresList.slice(0, 2).join(', ')}. Fast shipping across Bangladesh with 7-day verified return guarantee.`;

    const detailedDescription = `### Product Overview
${cleanTitle} represents the pinnacle of modern craftsmanship in the ${cat} collection. Designed meticulously for ${audience}, this product seamlessly balances aesthetic sophistication with everyday utilitarian resilience.

#### Key Features & Highlights
${featuresList.map((f) => `- **${f.split(' ')[0]}**: ${f}`).join('\n')}
- **Verified Authenticity**: 100% genuine merchandise sourced directly from certified brand workshops.
- **Eco-Conscious Packaging**: Delivered in protective, recyclable fulfillment containers.

#### Specifications & Care Instructions
- **Category Taxonomy**: ${cat}
- **Warranty Protection**: Standard 1-Year Official Manufacturer Warranty
- **Maintenance**: Wipe clean with a soft dry microfiber cloth. Avoid harsh abrasive solvents.`;

    const tags = [
      cleanTitle.toLowerCase().split(' ')[0],
      cat.toLowerCase().replace(/[^a-z]/g, '-'),
      'premium-quality',
      'authentic-2026',
      'fast-delivery',
    ];

    return {
      generatedSeoTitle: seoTitle,
      metaDescription,
      detailedDescription,
      suggestedCategory: cat,
      searchTags: tags,
      generatedAt: new Date(),
    };
  }

  /**
   * RAG-Powered Conversational Shopping Assistant Chatbot
   */
  static async chatShoppingAssistant(params: {
    query: string;
    budgetLimit?: number;
    preferredCategory?: string;
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  }) {
    const { query, budgetLimit, preferredCategory } = params;

    // 1. Semantic search for relevant product context
    const searchRes = await this.searchSemantic({ query, limit: 3, minScore: 0.2 });
    let recommendations = searchRes.results;

    // Filter by budget if provided
    if (budgetLimit) {
      const budgetMatched = recommendations.filter((r) => r.price <= budgetLimit);
      if (budgetMatched.length > 0) recommendations = budgetMatched;
    }

    // 2. Synthesize conversational assistant response
    let assistantMessage = '';

    if (recommendations.length > 0) {
      const topPick = recommendations[0];
      assistantMessage = `Hello! Based on what you're looking for, I highly recommend the **${topPick.title}** (${formatCurrency(
        topPick.price
      )}). It's rated **${topPick.rating}★** by ${topPick.totalReviews} verified buyers and is one of our top-rated selections in ${topPick.category}.\n\nHere are the best matches currently available in our marketplace:`;
    } else {
      assistantMessage = `I searched our catalog for "${query}", but couldn't find an exact match within that specific criteria. You might want to explore our popular categories like Footwear, Traditional Menswear, or Smart Electronics. How else can I assist your shopping today?`;
    }

    return {
      reply: assistantMessage,
      recommendedProducts: recommendations.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        price: p.price,
        formattedPrice: formatCurrency(p.price),
        rating: p.rating,
        totalReviews: p.totalReviews,
        imageUrl: p.imageUrl,
        relevanceScore: p.similarityScore,
      })),
      timestamp: new Date(),
    };
  }

  /**
   * AI Recommendations: Returns similar items based on vector proximity
   */
  static async getRecommendations(productId: string, limit = 4) {
    const target = catalogKnowledgeBase.find((p) => p.id === productId || p.slug === productId) || catalogKnowledgeBase[0];
    const targetCorpus = `${target.title} ${target.category} ${target.brand} ${target.tags.join(' ')}`;
    const targetVector = this.generateEmbeddingVector(targetCorpus);

    const scored = catalogKnowledgeBase
      .filter((p) => p.id !== target.id)
      .map((item) => {
        const corpus = `${item.title} ${item.category} ${item.brand} ${item.tags.join(' ')}`;
        const vec = this.generateEmbeddingVector(corpus);
        return {
          ...item,
          similarityScore: this.cosineSimilarity(targetVector, vec),
          formattedPrice: formatCurrency(item.price),
        };
      })
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);

    return {
      targetProduct: { id: target.id, title: target.title },
      recommendations: scored,
    };
  }
}
