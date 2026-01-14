import { defineConfig } from 'drizzle-kit';


export default defineConfig({
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: 'postgresql://postgres.rzcqsirfrhvgnsqligbe:9a7175e6dd5b2cbcaf85d5333e631475aab9fea5cc6bdfebfc966d0fdf71a806@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres',
  },
})