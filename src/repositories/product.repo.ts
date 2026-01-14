import { createDb } from '../libs/db';
import localConfig from '../libs/config';
import { products } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { Product, CreateProductRequest, UpdateProductRequest } from '../types/product.type';

// Helper function to convert Drizzle result to our Product type
function convertToProduct(drizzleProduct: any): Product {
  return {
    id: drizzleProduct.id.toString(),
    name: drizzleProduct.name,
    description: drizzleProduct.description || undefined,
    price: drizzleProduct.normalPrice,
    created_at: drizzleProduct.createdAt?.toISOString(),
    updated_at: drizzleProduct.updatedAt?.toISOString(),
  };
}

export class ProductRepository {
  async getAllProducts(limit: number = 50, offset: number = 0): Promise<{
    data: Product[],
    total: number
  }> {
    const db = createDb(localConfig.dbUrl)

    const [dataResult, totalResult] = await Promise.all([
      db.select().from(products).orderBy(products.createdAt).limit(limit).offset(offset),
      db.$count(products)
    ]);
    return {
      data: dataResult.map(convertToProduct),
      total: totalResult
    };
  }

  async getProductById(id: string): Promise<Product | null> {
    const db = createDb(localConfig.dbUrl)

    const result = await db.select().from(products).where(eq(products.id, parseInt(id)));
    return result[0] ? convertToProduct(result[0]) : null;
  }

  async createProduct(product: CreateProductRequest): Promise<Product> {
    const db = createDb(localConfig.dbUrl)

    const result = await db.insert(products).values({
      name: product.name,
      description: product.description,
      normalPrice: product.price, // Fixed: use normalPrice and correct type
    }).returning();
    return convertToProduct(result[0]);
  }

  async updateProduct(id: string, updates: UpdateProductRequest): Promise<Product | null> {
    const db = createDb(localConfig.dbUrl)
    const updateData: any = { updatedAt: new Date() };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.price !== undefined) updateData.normalPrice = updates.price; // Fixed: use normalPrice

    const result = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, parseInt(id))) // Fixed: parse id
      .returning();

    return result[0] ? convertToProduct(result[0]) : null;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const db = createDb(localConfig.dbUrl)

    const result = await db.delete(products).where(eq(products.id, parseInt(id)));
    return true; // Drizzle doesn't return affected rows, assume success
  }
}