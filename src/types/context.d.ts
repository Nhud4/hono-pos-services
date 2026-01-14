import 'hono'

declare module 'hono' {
  interface ContextVariableMap {
    user?: {
      id: string
      role?: string
      email?: string
    }
    basicUser?: {
      username: string
    }
    payload: unknown
  }
}
