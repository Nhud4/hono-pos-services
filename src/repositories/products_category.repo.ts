import { eq, isNull, and } from 'drizzle-orm';
import { createDb } from '../libs/db';
import localConfig from '../libs/config';
import { generateCode } from '../utils/codeGenerator';
import { productsCategory, products } from '../../drizzle/schema';
import {
  ProductsCategory,
  CreateProductsCategoryRequest,
  UpdateProductsCategoryRequest,
} from '../types/products_category.type';

// Helper function to convert Drizzle result to our ProductsCategory type
function convertToProductsCategory(drizzleCategory: any): ProductsCategory {
  return {
    id: drizzleCategory.id.toString(),
    code: drizzleCategory.code,
    name: drizzleCategory.name,
    totalProduct: drizzleCategory.totalProduct,
    status: drizzleCategory.status,
    printTarget: drizzleCategory.printTarget,
  };
}

export class ProductsCategoryRepository {
  async getAllProductsCategories(
    limit: number,
    offset: number
  ): Promise<{
    data: ProductsCategory[];
    total: number;
  }> {
    const db = createDb(localConfig.dbUrl);

    if (limit > 0) {
      const [dataResult, totalResult] = await Promise.all([
        db
          .select()
          .from(productsCategory)
          .where(isNull(productsCategory.deletedAt))
          .orderBy(productsCategory.createdAt)
          .limit(limit)
          .offset(offset),
        db.$count(productsCategory, isNull(productsCategory.deletedAt)),
      ]);
      return {
        data: dataResult.map(convertToProductsCategory),
        total: totalResult,
      };
    }

    const [dataResult, totalResult] = await Promise.all([
      db
        .select()
        .from(productsCategory)
        .where(isNull(productsCategory.deletedAt))
        .orderBy(productsCategory.createdAt),
      db.$count(productsCategory, isNull(productsCategory.deletedAt)),
    ]);
    return {
      data: dataResult.map(convertToProductsCategory),
      total: totalResult,
    };
  }

  async getProductsCategoryById(id: string): Promise<ProductsCategory | null> {
    const db = createDb(localConfig.dbUrl);

    const result = await db
      .select()
      .from(productsCategory)
      .where(and(eq(productsCategory.id, parseInt(id)), isNull(productsCategory.deletedAt)));
    return result[0] ? convertToProductsCategory(result[0]) : null;
  }

  async getProductsCategoryByName(name: string): Promise<ProductsCategory | null> {
    const db = createDb(localConfig.dbUrl);

    const result = await db
      .select()
      .from(productsCategory)
      .where(and(eq(productsCategory.name, name), isNull(productsCategory.deletedAt)));
    return result[0] ? convertToProductsCategory(result[0]) : null;
  }

  async createProductsCategory(
    categoryData: CreateProductsCategoryRequest
  ): Promise<ProductsCategory> {
    const db = createDb(localConfig.dbUrl);

    const result = await db
      .insert(productsCategory)
      .values({
        code: generateCode('CAT'),
        name: categoryData.name.toLowerCase(),
        totalProduct: 0,
        status: categoryData.status === 'true' ? true : false,
        printTarget: categoryData.printTarget,
      })
      .returning();
    return convertToProductsCategory(result[0]);
  }

  async updateProductsCategory(
    id: string,
    updates: UpdateProductsCategoryRequest
  ): Promise<ProductsCategory | null> {
    const db = createDb(localConfig.dbUrl);

    const updateData: any = {
      updatedAt: new Date(),
      printTarget: updates.printTarget,
    };

    if (updates.name) updateData.name = updates.name;
    if (updates.status) updateData.status = updates.status === 'true' ? true : false;

    const result = await db.transaction(async (tx) => {
      // update category
      const category = await tx
        .update(productsCategory)
        .set(updateData)
        .where(eq(productsCategory.id, parseInt(id)))
        .returning();

      if (updates.status === 'false') {
        // inactive product
        await tx
          .update(products)
          .set({ active: false })
          .where(eq(products.categoryId, parseInt(id)));
      }

      return category[0] ? convertToProductsCategory(category[0]) : null;
    });

    return result;
  }

  async deleteProductsCategory(id: string): Promise<ProductsCategory | null> {
    const db = createDb(localConfig.dbUrl);

    return await db.transaction(async (tx) => {
      // delete category
      const category = await tx
        .update(productsCategory)
        .set({ deletedAt: new Date() })
        .where(eq(productsCategory.id, parseInt(id)))
        .returning();

      // inactive product
      await tx
        .update(products)
        .set({ active: false })
        .where(eq(products.categoryId, parseInt(id)));

      return category[0] ? convertToProductsCategory(category[0]) : null;
    });
  }
}
