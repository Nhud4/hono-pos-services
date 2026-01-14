import { Hono } from 'hono';
import { basicAuth } from '../middlewares/basic-auth';
import { validate } from '../middlewares/validate';
import * as handler from '../handlers/product.handler';
import * as schema from '../validators/product.validator'

const router = new Hono();

router.get('/products', basicAuth(), handler.getAllProductsHandler);
router.get('/products/:id', validate('param', schema.productIdSchema), handler.getProductByIdHandler);
router.post('/products', handler.createProductHandler);
router.put('/products/:id', handler.updateProductHandler);
router.delete('/products/:id', handler.deleteProductHandler);

export default router;