import { eq } from 'drizzle-orm';
import { createDb } from '../libs/db';
import localConfig from '../libs/config';
import { sales } from '../../drizzle/schema';
import { Sale, CreateSaleRequest, UpdateSaleRequest } from '../types/sales.type';

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
  async getAllSales(
    limit: number = 50,
    offset: number = 0
  ): Promise<{ data: Sale[]; total: number }> {
    const db = createDb(localConfig.dbUrl);

    const [dataResult, totalResult] = await Promise.all([
      db.select().from(sales).orderBy(sales.createdAt).limit(limit).offset(offset),
      db.$count(sales),
    ]);
    return {
      data: dataResult.map(convertToSale),
      total: totalResult,
    };
  }

  async getSaleById(id: string): Promise<Sale | null> {
    const db = createDb(localConfig.dbUrl);

    const result = await db
      .select()
      .from(sales)
      .where(eq(sales.id, parseInt(id)));
    return result[0] ? convertToSale(result[0]) : null;
  }

  async createSale(saleData: CreateSaleRequest): Promise<Sale> {
    const db = createDb(localConfig.dbUrl);

    const result = await db
      .insert(sales)
      .values({
        productId: saleData.productId,
        sales: saleData.sales,
        income: saleData.income,
        grossIncome: saleData.grossIncome,
      })
      .returning();
    return convertToSale(result[0]);
  }

  async updateSale(id: string, updates: UpdateSaleRequest): Promise<Sale | null> {
    const db = createDb(localConfig.dbUrl);
    const updateData: any = { updatedAt: new Date() };

    if (updates.productId !== undefined) updateData.productId = updates.productId;
    if (updates.sales !== undefined) updateData.sales = updates.sales;
    if (updates.income !== undefined) updateData.income = updates.income;
    if (updates.grossIncome !== undefined) updateData.grossIncome = updates.grossIncome;

    const result = await db
      .update(sales)
      .set(updateData)
      .where(eq(sales.id, parseInt(id)))
      .returning();

    return result[0] ? convertToSale(result[0]) : null;
  }

  async deleteSale(id: string): Promise<boolean> {
    const db = createDb(localConfig.dbUrl);

    const result = await db.delete(sales).where(eq(sales.id, parseInt(id)));
    return true;
  }
}
