import { Hono } from 'hono'
import productRoutes from './routes/product.route'
import companyRoutes from './routes/company.route'
import userRoutes from './routes/user.route'
import productsCategoryRoutes from './routes/products_category.route'
import salesRoutes from './routes/sales.route'

const app = new Hono()

app.route('/', productRoutes);
app.route('/', companyRoutes);
app.route('/', userRoutes);
app.route('/', productsCategoryRoutes);
app.route('/', salesRoutes);

app.get('/', (c) => { return c.text('POS Services API') })

export default app
