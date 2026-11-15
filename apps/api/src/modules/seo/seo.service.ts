import { Product } from '../catalog/product.model';
import { Category } from '../catalog/category.model';
import { Store } from '../sellers/store.model';
import { isDatabaseConnected } from '../../common/database/connection';
import { generateProductJsonLd, generateSitemapXml, SitemapUrlEntry } from '@marketplace/utils';

export class SeoService {
  /**
   * Generates dynamic Google-compliant XML sitemap indexing catalog items
   */
  static async generateSitemap(): Promise<string> {
    const baseUrl = 'https://marketplace.com';
    const urls: SitemapUrlEntry[] = [
      { loc: `${baseUrl}/`, changefreq: 'daily', priority: 1.0 },
      { loc: `${baseUrl}/shop`, changefreq: 'daily', priority: 0.9 },
      { loc: `${baseUrl}/categories`, changefreq: 'weekly', priority: 0.8 },
    ];

    if (isDatabaseConnected()) {
      const products = await Product.find({ status: 'APPROVED' }).select('slug updatedAt').limit(1000);
      for (const p of products) {
        urls.push({
          loc: `${baseUrl}/product/${p.slug}`,
          lastmod: p.updatedAt,
          changefreq: 'daily',
          priority: 0.8,
        });
      }

      const categories = await Category.find({ isActive: true }).select('slug updatedAt').limit(200);
      for (const c of categories) {
        urls.push({
          loc: `${baseUrl}/category/${c.slug}`,
          lastmod: c.updatedAt,
          changefreq: 'weekly',
          priority: 0.7,
        });
      }

      const stores = await Store.find({ status: 'ACTIVE' }).select('slug updatedAt').limit(200);
      for (const s of stores) {
        urls.push({
          loc: `${baseUrl}/store/${s.slug}`,
          lastmod: s.updatedAt,
          changefreq: 'weekly',
          priority: 0.7,
        });
      }
    } else {
      // Static catalog sample for sitemap
      const staticSlugs = [
        'apex-mens-genuine-leather-formal-oxford-shoes',
        'aarong-handloom-pure-silk-embroidered-royal-panjabi',
        'soundpulse-active-noise-cancelling-wireless-earbuds',
        'aerowatch-pro-amoled-fitness-heart-rate-smartwatch',
      ];
      for (const s of staticSlugs) {
        urls.push({
          loc: `${baseUrl}/product/${s}`,
          lastmod: new Date(),
          changefreq: 'daily',
          priority: 0.8,
        });
      }
    }

    return generateSitemapXml(urls);
  }

  /**
   * Generates OpenGraph, Twitter, and JSON-LD structured data for a product slug
   */
  static async getProductMetadata(slug: string) {
    let product: any = null;

    if (isDatabaseConnected()) {
      product = await Product.findOne({ slug });
    }

    if (!product) {
      product = {
        title: "Apex Men's Genuine Leather Formal Oxford Shoes",
        slug: slug || 'apex-mens-genuine-leather-formal-oxford-shoes',
        description: 'Handcrafted from 100% full-grain calfskin leather with cushioned memory foam insole.',
        basePrice: 4500,
        rating: 4.8,
        totalReviews: 124,
        brand: 'Apex Footwear',
        imageUrl: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600',
        tags: ['leather', 'formal', 'shoes', 'office'],
      };
    }

    const jsonLd = generateProductJsonLd({
      name: product.title,
      description: product.description,
      image: product.imageUrl || product.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
      sku: product.slug.toUpperCase(),
      brand: product.brand || 'Apex',
      price: product.basePrice || 4500,
      currency: 'BDT',
      ratingValue: product.rating || 4.8,
      reviewCount: product.totalReviews || 124,
      inStock: true,
      sellerName: 'Apex Footwear Ltd.',
    });

    const canonicalUrl = `https://marketplace.com/product/${product.slug}`;

    return {
      title: `${product.title} | Buy Online at Best Price in Bangladesh`,
      description: product.description,
      canonicalUrl,
      keywords: product.tags || ['ecommerce', 'marketplace', 'bangladesh'],
      openGraph: {
        title: product.title,
        description: product.description,
        images: [product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'],
        url: canonicalUrl,
        type: 'product',
        siteName: 'Enterprise Multi-Vendor Marketplace',
      },
      twitter: {
        card: 'summary_large_image',
        title: product.title,
        description: product.description,
        images: [product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'],
      },
      jsonLd,
    };
  }

  /**
   * Generates dynamic robots.txt directives
   */
  static getRobotsTxt(): string {
    return `# Enterprise Multi-Vendor Marketplace Robots Directives
User-agent: *
Allow: /
Allow: /shop
Allow: /product/
Allow: /category/
Allow: /store/

Disallow: /api/
Disallow: /admin/
Disallow: /seller/
Disallow: /cart
Disallow: /checkout

Sitemap: https://marketplace.com/sitemap.xml
`;
  }
}
