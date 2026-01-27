import { Hono } from 'hono';
import { basicAuth } from '../middlewares/basic-auth';
import { validate } from '../middlewares/validate';
import * as handler from '../handlers/sales.handler';
import * as schema from '../validators/sales.validator';
import { jwtAuth } from '../middlewares/jwt-auth';
import { allowOrigin } from '../utils/allowOrigin';

const router = new Hono();

router.get(
  '/sales',
  jwtAuth(),
  allowOrigin(['manager']),
  validate('query', schema.listSalesSchema),
  handler.getAllSalesHandler
);

router.get(
  '/sales/summary',
  jwtAuth(),
  allowOrigin(['manager']),
  validate('query', schema.summarySalesSchema),
  handler.summarySales
);

router.get(
  '/sales/year',
  jwtAuth(),
  allowOrigin(['manager']),
  validate('query', schema.yearsSalesSchema),
  handler.yearSales
);

export default router;
