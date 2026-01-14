// db.ts
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'

export const createDb = (databaseUrl: string) => {
  const sql = postgres(databaseUrl, {
    prepare: false,
  })

  return drizzle(sql)
}
