import { Hono } from 'hono';
import { jwtAuth } from '../middlewares/jwt-auth';
import { validate } from '../middlewares/validate';
import * as schema from '../validators/transactions.validator';
import * as handler from '../handlers/transaction.handler';

const router = new Hono();

// api basket
router.get('/order', jwtAuth(), handler.getOrder);
router.post('/order', jwtAuth(), validate('json', schema.createOrderSchema), handler.createOrder);

// api transaction
router.get(
  '/transaction',
  jwtAuth(),
  validate('query', schema.listTransactionSchema),
  handler.listTransaction
);
router.get(
  '/transaction/:id',
  jwtAuth(),
  validate('param', schema.transactionIdSchema),
  handler.detailTransaction
);
router.post(
  '/transaction',
  jwtAuth(),
  validate('json', schema.createTransactionSchema),
  handler.createTransaction
);
router.put(
  '/transaction/:id',
  jwtAuth(),
  validate('json', schema.updateTransactionSchema),
  handler.updateTransaction
);
router.delete(
  '/transaction/:id',
  jwtAuth(),
  validate('param', schema.transactionIdSchema),
  handler.deleteTransaction
);

export default router;
