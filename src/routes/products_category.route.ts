import { Hono } from 'hono';
import { basicAuth } from '../middlewares/basic-auth';
import { jwtAuth } from '../middlewares/jwt-auth';
import { validate } from '../middlewares/validate';
import * as handler from '../handlers/products_category.handler';
import * as schema from '../validators/products_category.validator';
import { allowOrigin } from '../utils/allowOrigin';

const router = new Hono();

router.get(
  '/products-categories',
  basicAuth(),
  validate('query', schema.listProductsCategorySchema),
  handler.getAllProductsCategoriesHandler
);
router.get(
  '/products-categories/:id',
  jwtAuth(),
  allowOrigin(['manager']),
  validate('param', schema.productsCategoryIdSchema),
  handler.getProductsCategoryByIdHandler
);
router.post(
  '/products-categories',
  jwtAuth(),
  allowOrigin(['manager']),
  validate('json', schema.createProductsCategorySchema),
  handler.createProductsCategoryHandler
);
router.put(
  '/products-categories/:id',
  jwtAuth(),
  allowOrigin(['manager']),
  validate('json', schema.updateProductsCategorySchema),
  handler.updateProductsCategoryHandler
);
router.delete(
  '/products-categories/:id',
  jwtAuth(),
  allowOrigin(['manager']),
  validate('param', schema.productsCategoryIdSchema),
  handler.deleteProductsCategoryHandler
);

export default router;
