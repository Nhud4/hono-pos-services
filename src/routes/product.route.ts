import { Hono } from 'hono';
import { basicAuth } from '../middlewares/basic-auth';
import { jwtAuth } from '../middlewares/jwt-auth';
import { validate } from '../middlewares/validate';
import * as handler from '../handlers/product.handler';
import * as schema from '../validators/product.validator'

const router = new Hono();

router.get(
  '/products',
  basicAuth(),
  validate('query', schema.listProductsSchema),
  handler.getAllProductsHandler
);
router.get(
  '/products/:id',
  basicAuth(),
  validate('param', schema.productIdSchema),
  handler.getProductByIdHandler
);
router.post(
  '/products',
  jwtAuth(),
  validate('body', schema.createProductSchema),
  handler.createProductHandler
);
router.put(
  '/products/:id',
  jwtAuth(),
  validate('body', schema.updateProductSchema),
  handler.updateProductHandler
);
router.delete(
  '/products/:id',
  jwtAuth(),
  validate('param', schema.productIdSchema),
  handler.deleteProductHandler
);

export default router;