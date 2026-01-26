import { Hono } from 'hono';
import { basicAuth } from '../middlewares/basic-auth';
import { validate } from '../middlewares/validate';
import * as handler from '../handlers/sales.handler';
import * as schema from '../validators/sales.validator';

const router = new Hono();

router.get('/sales', basicAuth(), handler.getAllSalesHandler);
router.get('/sales/:id', validate('param', schema.saleIdSchema), handler.getSaleByIdHandler);
router.post('/sales', handler.createSaleHandler);
router.put('/sales/:id', handler.updateSaleHandler);
router.delete('/sales/:id', handler.deleteSaleHandler);

export default router;
