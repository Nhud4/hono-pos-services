import { MiddlewareHandler } from 'hono';
import { errorResponse } from '../utils/wrapper';
import localConfig from '../libs/config';

export const basicAuth = (): MiddlewareHandler => async (c, next) => {
  const auth = c.req.header('Authorization');

  if (!auth || !auth.startsWith('Basic ')) {
    return c.json(errorResponse('Unauthorized', 401), 401);
  }

  const decoded = atob(auth.replace('Basic ', ''));
  const [username, password] = decoded.split(':');

  if (username !== localConfig.basic.user || password !== localConfig.basic.pass) {
    return c.json(errorResponse('Invalid credentials', 401), 401);
  }

  c.set('basicUser', { username });
  await next();
};
