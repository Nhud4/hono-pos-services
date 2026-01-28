import { Hono } from 'hono';
import { jwtAuth } from '../middlewares/jwt-auth';
import { validate } from '../middlewares/validate';
import * as schema from '../validators/transactions.validator';
import * as handler from '../handlers/transaction.handler';
import { allowOrigin } from '../utils/allowOrigin';

const router = new Hono();

// api basket
router.get('/order', jwtAuth(), handler.getOrder);
router.post('/order', jwtAuth(), validate('json', schema.createOrderSchema), handler.createOrder);

// api transaction
router.get(
  '/transaction',
  jwtAuth(),
  allowOrigin(['cashier', 'manager', 'kitchen']),
  validate('query', schema.listTransactionSchema),
  handler.listTransaction
);
router.get(
  '/transaction/:id',
  jwtAuth(),
  allowOrigin(['cashier', 'manager', 'kitchen']),
  validate('param', schema.transactionIdSchema),
  handler.detailTransaction
);
router.post(
  '/transaction',
  jwtAuth(),
  allowOrigin(['cashier', 'waiters']),
  validate('json', schema.createTransactionSchema),
  handler.createTransaction
);
router.put(
  '/transaction/:id',
  jwtAuth(),
  allowOrigin(['cashier', 'manager']),
  validate('json', schema.updateTransactionSchema),
  handler.updateTransaction
);
router.delete(
  '/transaction/:id',
  jwtAuth(),
  allowOrigin(['manager']),
  validate('param', schema.transactionIdSchema),
  handler.deleteTransaction
);

export default router;
