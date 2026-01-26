import { Hono } from 'hono';
import { basicAuth } from '../middlewares/basic-auth';
import { validate } from '../middlewares/validate';
import * as handler from '../handlers/user.handler';
import * as schema from '../validators/user.validator'
import { jwtAuth } from '../middlewares/jwt-auth';
import { allowOrigin } from '../utils/allowOrigin';

const router = new Hono();

router.get(
  '/users',
  jwtAuth(),
  allowOrigin(['manager']),
  validate('query', schema.listUserSchema),
  handler.getAllUsersHandler
);
router.get(
  '/users/:id',
  jwtAuth(),
  allowOrigin(['manager']),
  validate('param', schema.userIdSchema),
  handler.getUserByIdHandler
);
router.post(
  '/users',
  basicAuth(),
  validate('json', schema.createUserSchema),
  handler.createUserHandler);
router.put(
  '/users/:id',
  jwtAuth(),
  allowOrigin(['manager']),
  validate('json', schema.updateUserSchema),
  handler.updateUserHandler
);
router.delete(
  '/users/:id',
  jwtAuth(),
  allowOrigin(['manager']),
  validate('param', schema.userIdSchema),
  handler.deleteUserHandler
);

// Auth routes
router.post('/auth/login', basicAuth(), validate('json', schema.loginSchema), handler.loginHandler);

export default router;