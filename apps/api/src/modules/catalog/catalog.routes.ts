import { Router } from 'express';
import { IProduct, ICategory } from '@marketplace/types';

export const catalogRouter = Router();

// In-memory baseline catalog for First Milestone API demonstration
const MOCK_CATEGORIES: ICategory[] = [
  {
    id: 'cat_electronics',
    name: 'Consumer Electronics',
    slug: 'electronics',
    parentId: null,
    ancestors: [],
    level: 0,
    commissionRate: 8,
    isActive: true,
  },
  {
    id: 'cat_fashion',
    name: 'Fashion & Apparel',
    slug: 'fashion',
    parentId: null,
    ancestors: [],
    level: 0,
    commissionRate: 15,
    isActive: true,
  },
  {
    id: 'cat_footwear',
    name: 'Footwear & Shoes',
    slug: 'footwear',
    parentId: 'cat_fashion',
    ancestors: ['cat_fashion'],
    level: 1,
    commissionRate: 12,
    isActive: true,
  },
];

const MOCK_PRODUCTS: IProduct[] = [
  {
    id: 'prod_1',
    storeId: 'store_apex',
    sellerId: 'seller_apex',
    title: 'Apex Premium Leather Formal Shoes',
    slug: 'apex-premium-leather-formal-shoes',
    shortDescription: 'Handcrafted genuine leather formal shoes for men.',
    description: 'Constructed from top-grain cowhide leather with cushioned insoles for all-day comfort.',
    categoryId: 'cat_footwear',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800',
        alt: 'Apex Leather Shoes',
        isPrimary: true,
        sortOrder: 0,
      },
    ],
    attributes: [
      { name: 'Upper Material', value: 'Genuine Leather' },
      { name: 'Sole', value: 'Anti-slip Rubber' },
    ],
    hasVariants: true,
    basePrice: 4500,
    compareAtPrice: 5200,
    status: 'PUBLISHED',
    moderationStatus: 'APPROVED',
    rating: 4.8,
    totalReviews: 124,
    totalSold: 340,
    tags: ['leather', 'formal', 'shoes', 'men'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'prod_2',
    storeId: 'store_aarong',
    sellerId: 'seller_aarong',
    title: 'Aarong Hand-Embroidered Jamdani Silk Panjabi',
    slug: 'aarong-jamdani-silk-panjabi',
    shortDescription: 'Traditional artisan hand-spun silk panjabi.',
    description: 'Made from authentic heritage Bangladeshi silk with intricate geometric woven patterns.',
    categoryId: 'cat_fashion',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&q=80&w=800',
        alt: 'Silk Panjabi',
        isPrimary: true,
        sortOrder: 0,
      },
    ],
    attributes: [
      { name: 'Fabric', value: '100% Silk' },
      { name: 'Craft', value: 'Jamdani' },
    ],
    hasVariants: true,
    basePrice: 6800,
    compareAtPrice: 7500,
    status: 'PUBLISHED',
    moderationStatus: 'APPROVED',
    rating: 4.9,
    totalReviews: 89,
    totalSold: 210,
    tags: ['silk', 'panjabi', 'heritage', 'festive'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// GET /api/v1/categories
catalogRouter.get('/categories', (req, res) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Categories retrieved successfully',
    data: MOCK_CATEGORIES,
  });
});

// GET /api/v1/products
catalogRouter.get('/products', (req, res) => {
  const { category, search } = req.query;
  let filtered = [...MOCK_PRODUCTS];

  if (category) {
    filtered = filtered.filter((p) => p.categoryId === category);
  }

  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter((p) => p.title.toLowerCase().includes(q) || p.tags.some((t) => t.includes(q)));
  }

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Products retrieved successfully',
    data: filtered,
    meta: {
      page: 1,
      limit: 20,
      totalItems: filtered.length,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    },
  });
});

// GET /api/v1/products/:slug
catalogRouter.get('/products/:slug', (req, res) => {
  const product = MOCK_PRODUCTS.find((p) => p.slug === req.params.slug);

  if (!product) {
    return res.status(404).json({
      success: false,
      statusCode: 404,
      error: {
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product listing could not be found',
      },
    });
  }

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Product retrieved successfully',
    data: product,
  });
});
