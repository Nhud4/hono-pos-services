import { eq, isNull, and, ilike } from 'drizzle-orm';
import { createDb } from '../libs/db';
import localConfig from '../libs/config';
import { products, productsCategory } from '../../drizzle/schema';
import { Product, CreateProductRequest, UpdateProductRequest } from '../types/product.type';
import { generateCode } from '../utils/codeGenerator';

// Helper function to convert Drizzle result to our Product type
function convertToProduct(drizzleProduct: any): Product {
  return {
    id: drizzleProduct.id.toString(),
    code: drizzleProduct.code,
    name: drizzleProduct.name,
    description: drizzleProduct.description || undefined,
    categoryId: drizzleProduct.categoryId,
    normalPrice: drizzleProduct.normalPrice,
    hpp: drizzleProduct.hpp,
    discountType: drizzleProduct.discountType,
    discount: drizzleProduct.discount,
    stock: drizzleProduct.stock,
    active: drizzleProduct.active,
    available: drizzleProduct.available,
    img: drizzleProduct.img,
    allocation: drizzleProduct.allocation,
    created_at: drizzleProduct.createdAt?.toISOString(),
    updated_at: drizzleProduct.updatedAt?.toISOString(),
  };
}

export class ProductRepository {
  async getAllProducts(
    limit: number,
    offset: number,
    search?: string,
    categoryId?: string,
    allocation?: string
  ) {
    const db = createDb(localConfig.dbUrl)
    const condition = [isNull(products.deletedAt)]

    if (search) {
      condition.push(ilike(products.name, `%${search}%`))
    }

    if (categoryId) {
      condition.push(eq(products.categoryId, Number(categoryId)))
    }

    if (allocation) {
      condition.push(eq(products.allocation, allocation))
    }


    if (limit < 1) {
      const [dataResult, totalResult] = await Promise.all([
        db.select().from(products)
          .where(and(...condition))
          .orderBy(products.createdAt)
          .innerJoin(productsCategory, eq(products.categoryId, productsCategory.id)),
        db.$count(products, isNull(products.deletedAt))
      ]);
      return { data: dataResult, total: totalResult };
    }

    const [dataResult, totalResult] = await Promise.all([
      db.select().from(products)
        .where(and(...condition))
        .orderBy(products.createdAt)
        .limit(limit)
        .offset(offset)
        .innerJoin(productsCategory, eq(products.categoryId, productsCategory.id)),
      db.$count(products, and(...condition))
    ]);
    return { data: dataResult, total: totalResult };
  }

  async getProductById(id: string) {
    const db = createDb(localConfig.dbUrl)

    const [result] = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.id, parseInt(id)),
          isNull(products.deletedAt)
        )
      )
      .innerJoin(productsCategory, eq(products.categoryId, productsCategory.id))
    return result;
  }

  async getProductByName(name: string): Promise<Product | null> {
    const db = createDb(localConfig.dbUrl)

    const result = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.name, name),
          isNull(products.deletedAt)
        )
      );
    return result[0] ? convertToProduct(result[0]) : null;
  }

  async createProduct(product: CreateProductRequest): Promise<Product> {
    const db = createDb(localConfig.dbUrl)
    let discountPrice = 0
    if (product.discount && parseInt(product.discount) > 0) {
      discountPrice = parseInt(product.normalPrice) * parseInt(product.discount) / 100
    }

    const doc = {
      code: generateCode('MNU'),
      name: product.name.toLowerCase(),
      categoryId: parseInt(product.categoryId),
      description: product.description || null,
      normalPrice: parseInt(product.normalPrice),
      hpp: parseInt(product.hpp),
      discountType: product.discountType || null,
      discount: product.discount ? parseInt(product.discount) : 0,
      active: product.active === 'true' ? true : false,
      available: true,
      stock: parseInt(product.stock),
      allocation: product.allocation,
      img: product.img,
      discountPrice
    }

    const result = await db.transaction(async (tx) => {
      const product = await tx.insert(products).values(doc).returning();

      // get category
      const [category] = await tx.select()
        .from(productsCategory)
        .where(eq(productsCategory.id, doc.categoryId))
        .limit(1)

      // update category
      await tx.update(productsCategory)
        .set({ totalProduct: (category.totalProduct || 0) + 1 })
        .where(eq(productsCategory.id, doc.categoryId))

      return product
    })
    return convertToProduct(result[0]);
  }

  async updateProduct(id: string, updates: UpdateProductRequest): Promise<Product | null> {
    const db = createDb(localConfig.dbUrl)
    let discountPrice = 0
    if (updates.discount && parseInt(updates.discount) > 0) {
      discountPrice = parseInt(updates.normalPrice) * parseInt(updates.discount) / 100
    }

    const updateData = {
      ...updates,
      name: updates.name.toLowerCase(),
      categoryId: parseInt(updates.categoryId),
      description: updates.description || null,
      normalPrice: parseInt(updates.normalPrice),
      hpp: parseInt(updates.hpp),
      discountType: updates.discountType || null,
      discount: updates.discount ? parseInt(updates.discount) : 0,
      active: updates.active === 'true' ? true : false,
      stock: parseInt(updates.stock),
      updatedAt: new Date(),
      discountPrice
    };

    const result = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, parseInt(id))) // Fixed: parse id
      .returning();

    return result[0] ? convertToProduct(result[0]) : null;
  }

  async deleteProduct(id: string): Promise<Product | null> {
    const db = createDb(localConfig.dbUrl)

    const result = await db.transaction(async (tx) => {
      const [remove] = await tx.
        update(products)
        .set({ deletedAt: new Date() })
        .where(eq(products.id, parseInt(id)))
        .returning()

      // get category
      const [category] = await tx.select()
        .from(productsCategory)
        .where(eq(productsCategory.id, remove.categoryId as number))
        .limit(1)

      // update category
      await tx.update(productsCategory)
        .set({ totalProduct: (category.totalProduct || 0) + 1 })
        .where(eq(productsCategory.id, remove.categoryId as number))

      return remove
    })

    return result ? convertToProduct(result) : null; // Drizzle doesn't return affected rows, assume success
  }
}