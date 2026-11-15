import { Router } from 'express';
import { SeoService } from './seo.service';

export const seoRouter = Router();

// GET /api/v1/seo/sitemap.xml (Public Google-compliant sitemap)
seoRouter.get('/sitemap.xml', async (req, res, next) => {
  try {
    const xml = await SeoService.generateSitemap();
    res.header('Content-Type', 'application/xml');
    res.status(200).send(xml);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/seo/robots.txt (Public robots crawler policy)
seoRouter.get('/robots.txt', (req, res) => {
  res.header('Content-Type', 'text/plain');
  res.status(200).send(SeoService.getRobotsTxt());
});

// GET /api/v1/seo/metadata/product/:slug (Dynamic OpenGraph & JSON-LD metadata)
seoRouter.get('/metadata/product/:slug', async (req, res, next) => {
  try {
    const metadata = await SeoService.getProductMetadata(req.params.slug);
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Product SEO OpenGraph and JSON-LD metadata retrieved',
      data: metadata,
    });
  } catch (err) {
    next(err);
  }
});
