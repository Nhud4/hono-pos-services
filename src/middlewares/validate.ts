import { MiddlewareHandler } from 'hono';
import { ZodSchema, ZodError } from 'zod';
import { errorResponse } from '../utils/wrapper';

type Source = 'json' | 'body' | 'query' | 'param';

export const validate =
  <T>(source: Source, schema: ZodSchema<T>): MiddlewareHandler =>
  async (c, next) => {
    try {
      let raw: unknown;

      if (source === 'json') raw = await c.req.json();
      if (source === 'body') raw = await c.req.parseBody();
      if (source === 'query') raw = c.req.query();
      if (source === 'param') raw = c.req.param();

      const parsed = schema.parse(raw);

      // 🔑 single source of truth
      c.set('payload', parsed);

      await next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errData = JSON.parse(err.message);
        return c.json(errorResponse('Validation error', 422, errData), 422);
      }
      throw err;
    }
  };
