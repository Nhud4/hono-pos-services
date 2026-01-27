import { and, desc, eq, gte, isNull, lte, sql } from 'drizzle-orm';
import { createDb } from '../libs/db';
import localConfig from '../libs/config';
import { products, transactionProducts } from '../../drizzle/schema';
import { Sale } from '../types/sales.type';

// Helper function to convert Drizzle result to our Sale type
function convertToSale(drizzleSale: any): Sale {
  return {
    id: drizzleSale.id.toString(),
    productId: drizzleSale.productId,
    sales: drizzleSale.sales,
    income: drizzleSale.income,
    grossIncome: drizzleSale.grossIncome,
    created_at: drizzleSale.createdAt?.toISOString(),
    updated_at: drizzleSale.updatedAt?.toISOString(),
  };
}

export class SalesRepository {
  getMonthRange(month: number, year: number) {
    const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const end = new Date(year, month, 0, 23, 59, 59, 999);
    return { start, end };
  }

  async getAllSales(limit: number, offset: number, productId?: string, month?: string) {
    const db = createDb(localConfig.dbUrl);

    const condition = [isNull(transactionProducts.deletedAt)];

    if (productId) {
      condition.push(eq(transactionProducts.productId, Number(productId)));
    }

    const year = new Date().getFullYear();
    const newMonth = month ? Number(month) : new Date().getMonth() + 1;
    const { start, end } = this.getMonthRange(newMonth, year);
    condition.push(
      gte(transactionProducts.createdAt, start),
      lte(transactionProducts.createdAt, end)
    );

    const whereClause = and(...condition);

    const saleDate = sql`DATE(${transactionProducts.createdAt})`;

    const [dataResult, totalResult] = await Promise.all([
      db
        .select({
          productId: products.id,
          name: products.name,
          date: saleDate.as('date'),
          totalQty: sql<number>`SUM(${transactionProducts.qty})`,
          totalAmount: sql<number>`SUM(${transactionProducts.subtotal})`,
        })
        .from(transactionProducts)
        .where(whereClause)
        .groupBy(products.id, saleDate)
        .orderBy(desc(saleDate))
        .limit(limit)
        .offset(offset)
        .innerJoin(products, eq(transactionProducts.productId, products.id)),

      db
        .select({
          count: sql<number>`COUNT(*)`,
        })
        .from(
          db
            .select({
              productId: transactionProducts.productId,
              date: saleDate,
            })
            .from(transactionProducts)
            .where(whereClause)
            .groupBy(transactionProducts.productId, saleDate)
            .as('grouped')
        ),
    ]);

    return {
      data: dataResult,
      total: totalResult[0]?.count ?? 0,
    };
  }
}
