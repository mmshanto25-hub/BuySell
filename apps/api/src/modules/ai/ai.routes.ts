import { Router } from 'express';
import { validateRequest } from '../../common/middleware/validate';
import { aiCatalogAssistantSchema, aiShoppingAssistantSchema, semanticSearchSchema } from '@marketplace/validators';
import { AiService } from './ai.service';
import { authGuard, requireRole } from '../../common/middleware/authGuard';

export const aiRouter = Router();

// POST /api/v1/ai/search/vector (Natural language semantic vector search)
aiRouter.post('/search/vector', validateRequest({ body: semanticSearchSchema }), async (req, res, next) => {
  try {
    const results = await AiService.searchSemantic({
      query: req.body.query,
      limit: req.body.limit,
      minScore: req.body.minScore,
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Semantic vector search results retrieved',
      data: results,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/ai/generate-catalog-copy (Seller AI copywriter)
aiRouter.post(
  '/generate-catalog-copy',
  authGuard,
  requireRole('SELLER', 'PRODUCT_MANAGER', 'ADMIN', 'SUPER_ADMIN'),
  validateRequest({ body: aiCatalogAssistantSchema }),
  async (req, res, next) => {
    try {
      const generated = await AiService.generateCatalogCopy({
        productTitle: req.body.productTitle,
        categoryName: req.body.categoryName,
        features: req.body.features,
        targetAudience: req.body.targetAudience,
      });

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'AI-generated catalog copy, SEO titles, and tags generated',
        data: generated,
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/v1/ai/shopping-assistant (RAG conversational customer assistant)
aiRouter.post('/shopping-assistant', validateRequest({ body: aiShoppingAssistantSchema }), async (req, res, next) => {
  try {
    const response = await AiService.chatShoppingAssistant({
      query: req.body.query,
      budgetLimit: req.body.budgetLimit,
      preferredCategory: req.body.preferredCategory,
      conversationHistory: req.body.conversationHistory,
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'AI shopping assistant response generated',
      data: response,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/ai/recommendations/:productId (AI Product Recommendations)
aiRouter.get('/recommendations/:productId', async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 4;
    const recommendations = await AiService.getRecommendations(req.params.productId, limit);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'AI vector-based product recommendations retrieved',
      data: recommendations,
    });
  } catch (err) {
    next(err);
  }
});
