import { MiddlewareHandler } from 'hono'
import { verify } from 'hono/jwt'
import { errorResponse } from '../utils/wrapper'
import localConfig from '../libs/config'

export type JwtUser = {
  id: string
  role: string
  email: string
  username: string,
  name: string,
  exp: string,
}

export const jwtAuth =
  (): MiddlewareHandler =>
    async (c, next) => {
      const auth = c.req.header('Authorization')

      if (!auth || !auth.startsWith('Bearer ')) {
        return c.json(errorResponse('Unauthorized', 401), 401)
      }

      const token = auth.slice(7)

      try {
        const payload = await verify(token, localConfig.jwt, 'HS256') as unknown as JwtUser
        c.set('user', payload)
        await next()
      } catch {
        return c.json(errorResponse('Invalid token', 401), 401)
      }
    }
