import { Context, Next } from 'hono';
import { errorResponse } from './wrapper';
import { JwtUser } from '../middlewares/jwt-auth';

const ALLOWED_ORIGINS = {
  cashier: ['http://localhost:5173', 'https://cashier-web-apps.vercel.app'],
  waiters: ['http://localhost:5173', 'https://cashier-web-apps.vercel.app'],
  kitchen: ['http://localhost:5173', 'https://kitchen-web-apps.vercel.app/'],
  manager: ['http://localhost:5173', 'https://dashboard-web-pos.vercel.app'],
};

export function allowOrigin(role: string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user') as JwtUser | undefined;

    if (!user) {
      return c.json(errorResponse('Unauthorized', 401), 401);
    }

    const origin = c.req.header('origin');
    const referer = c.req.header('referer');

    const source = origin || referer;
    if (source) {
      const allowedOrigins = ALLOWED_ORIGINS[user.role as keyof typeof ALLOWED_ORIGINS];
      if (!allowedOrigins) {
        return c.json(errorResponse('Akses ditolak', 403), 403);
      }

      const isAllowed = allowedOrigins.some((allowed) => source.startsWith(allowed));
      if (!isAllowed) {
        return c.json(errorResponse('Akses ditolak', 403), 403);
      }
    }

    const allowedRole = role.includes(user.role);
    if (!allowedRole) {
      return c.json(errorResponse('Akses ditolak', 403), 403);
    }

    await next();
  };
}
