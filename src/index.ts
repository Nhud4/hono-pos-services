import { Hono } from 'hono';
import productRoutes from './routes/product.route';
import companyRoutes from './routes/company.route';
import userRoutes from './routes/user.route';
import productsCategoryRoutes from './routes/products_category.route';
import salesRoutes from './routes/sales.route';
import transactionRoutes from './routes/transaction.route';
import { cors } from 'hono/cors';

const app = new Hono();

app.use(
  '*',
  cors({
    origin: (origin) => origin ?? '',
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

app.route('/', productRoutes);
app.route('/', companyRoutes);
app.route('/', userRoutes);
app.route('/', productsCategoryRoutes);
app.route('/', salesRoutes);
app.route('/', transactionRoutes);

app.get('/', (c) => {
  return c.text('POS Services API');
});

export default app;
