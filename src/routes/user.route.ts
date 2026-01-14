import { Hono } from 'hono';
import { basicAuth } from '../middlewares/basic-auth';
import { validate } from '../middlewares/validate';
import * as handler from '../handlers/user.handler';
import * as schema from '../validators/user.validator'

const router = new Hono();

router.get('/users', basicAuth(), validate('query', schema.listUserSchema), handler.getAllUsersHandler);
router.get('/users/:id', basicAuth(), validate('param', schema.userIdSchema), handler.getUserByIdHandler);
router.post('/users', basicAuth(), validate('json', schema.createUserSchema), handler.createUserHandler);
router.put('/users/:id', basicAuth(), validate('json', schema.createUserSchema), handler.updateUserHandler);
router.delete('/users/:id', basicAuth(), validate('param', schema.userIdSchema), handler.deleteUserHandler);

// Auth routes
router.post('/auth/login', basicAuth(), validate('json', schema.loginSchema), handler.loginHandler);

export default router;