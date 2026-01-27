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

  getYearRange(year: number) {
    const start = new Date(year, 0, 1, 0, 0, 0, 0);
    const end = new Date(year, 11, 31, 23, 59, 59, 999);
    return { start, end };
  }

  normalizeMonthlyData(rows: { month: number; revenue: number }[]) {
    const map = new Map<number, number>();

    rows.forEach((row) => {
      map.set(Number(row.month), Number(row.revenue));
    });

    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      return {
        month,
        revenue: map.get(month) ?? 0,
      };
    });
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

  async getMonthlySummary(month: number, year: number, productId?: string) {
    const db = createDb(localConfig.dbUrl);
    const { start, end } = this.getMonthRange(month, year);

    const conditions = [
      isNull(transactionProducts.deletedAt),
      gte(transactionProducts.createdAt, start),
      lte(transactionProducts.createdAt, end),
    ];

    if (productId) {
      conditions.push(eq(transactionProducts.productId, Number(productId)));
    }

    const result = await db
      .select({
        totalRevenue: sql<number>`
        COALESCE(SUM(${transactionProducts.subtotal}), 0)
      `,
        totalTransaction: sql<number>`
        COUNT(DISTINCT ${transactionProducts.transactionId})
      `,
      })
      .from(transactionProducts)
      .where(and(...conditions));

    return result[0];
  }

  async getYearlyRevenueChart(year: number, productId?: number) {
    const db = createDb(localConfig.dbUrl);
    const { start, end } = this.getYearRange(year);

    const conditions = [
      isNull(transactionProducts.deletedAt),
      gte(transactionProducts.createdAt, start),
      lte(transactionProducts.createdAt, end),
    ];

    if (productId) {
      conditions.push(eq(transactionProducts.productId, productId));
    }
    const monthExpr = sql<number>`
    EXTRACT(MONTH FROM ${transactionProducts.createdAt})
  `;
    const result = await db
      .select({
        month: monthExpr,
        revenue: sql<number>`
        COALESCE(SUM(${transactionProducts.subtotal}), 0)
      `,
      })
      .from(transactionProducts)
      .where(and(...conditions))
      .groupBy(monthExpr)
      .orderBy(monthExpr);

    return this.normalizeMonthlyData(result);
  }
}
