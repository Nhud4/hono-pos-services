import { eq, isNull, and, sql } from 'drizzle-orm';
import { createDb } from '../libs/db';
import localConfig from '../libs/config';
import {
  transactions,
  transactionCounters,
  transactionProducts
} from '../../drizzle/schema';
import {
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  CreateOrderRequest,
  GetOrderRequest,
  OrderData,
} from '../types/transactions.type';

// Helper function to convert Drizzle result to our Transaction type
function convertToTransaction(drizzleTransaction: any): Transaction {
  return {
    id: drizzleTransaction.id.toString(),
    code: drizzleTransaction.code,
    transactionDate: drizzleTransaction.transactionDate,
    createdBy: drizzleTransaction.createdBy,
    userId: drizzleTransaction.userId,
    transactionType: drizzleTransaction.transactionType,
    customerName: drizzleTransaction.customerName || undefined,
    deliveryType: drizzleTransaction.deliveryType || undefined,
    tableNumber: drizzleTransaction.tableNumber || undefined,
    paymentType: drizzleTransaction.paymentType || undefined,
    paymentMethod: drizzleTransaction.paymentMethod || undefined,
    paymentStatus: drizzleTransaction.paymentStatus || undefined,
    subtotal: drizzleTransaction.subtotal,
    totalDiscount: drizzleTransaction.totalDiscount,
    ppn: drizzleTransaction.ppn,
    bill: drizzleTransaction.bill,
    payment: drizzleTransaction.payment,
    created_at: drizzleTransaction.createdAt?.toISOString(),
  };
}

export class TransactionsRepository {
  async getOrderByUser(id: string): Promise<OrderData | null> {
    const db = createDb(localConfig.dbUrl)

    const result = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, parseInt(id)),
          eq(transactions.transactionType, 'cart'),
          isNull(transactions.deletedAt),
        )
      )

    const product = await db.select().from(transactionProducts)
      .where(eq(transactionProducts.transactionId, result[0].id))

    const data = result[0]
    if (data) {
      return {
        id: data.id,
        code: data.code,
        transactionDate: data.transactionDate || '',
        createdBy: data.createdBy || '',
        transactionType: data.transactionType || '',
        deliveryType: data.deliveryType || '',
        paymentType: data.paymentType || '',
        subtotal: data.subtotal || 0,
        totalDiscount: data.totalDiscount || 0,
        ppn: data.ppn || 0,
        bill: data.bill || 0,
        items: product.map((val) => ({
          productId: val.productId || 0,
          qty: val.qty || 0,
          discount: val.discount || 0,
          subtotal: val.subtotal || 0,
          notes: val.notes || ''
        })) || []
      }
    }

    return null
  }

  async createOrder(user: GetOrderRequest, doc: CreateOrderRequest): Promise<{ code: string }> {
    const db = createDb(localConfig.dbUrl);
    const userId = Number(user.id);

    const result = await db.transaction(async (tx) => {
      // cari data order
      const [existingOrder] = await tx
        .select()
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.transactionType, 'cart'),
            isNull(transactions.deletedAt),
          )
        )
        .limit(1);

      if (existingOrder) {
        // kembalikan stock lama
        const res = await tx.execute(sql`
          UPDATE products
          SET stock = stock + tp.qty
          FROM transaction_products tp
          WHERE products.id = tp."productId" 
            AND tp."transactionId" = ${existingOrder.id}
        `);
        console.log("UPDATE STOCK ROW COUNT:", res);

        // hapus item lama
        await tx
          .delete(transactionProducts)
          .where(eq(transactionProducts.transactionId, existingOrder.id));

        // update data transaksi
        await tx
          .update(transactions)
          .set({
            ...doc,
            userId,
            createdBy: user.name,
          })
          .where(eq(transactions.id, existingOrder.id));

        // / insert item baru
        const newItems = doc.items.map((i) => ({
          transactionId: existingOrder.id,
          productId: i.productId,
          qty: i.qty,
          subtotal: i.subtotal,
          discount: i.discount,
          notes: i.notes ?? null,
        }));

        await tx.insert(transactionProducts).values(newItems);

        // update stock product
        await tx.execute(sql`
          UPDATE products
          SET stock = stock - tp.qty
          FROM transaction_products tp
          WHERE products.id = tp."productId"
            AND tp."transactionId" = ${existingOrder.id}
        `);

        return { code: existingOrder.code || '' };
      }

      // generate code
      const code = await this.generateTransactionCode('TRX');

      // insert transaksi baru
      const [newOrder] = await tx
        .insert(transactions)
        .values({
          ...doc,
          code,
          userId,
          createdBy: user.name,
        })
        .returning();

      // insert item
      const items = doc.items.map((i) => ({
        transactionId: newOrder.id,
        productId: i.productId,
        qty: i.qty,
        subtotal: i.subtotal,
        discount: i.discount,
        notes: i.notes ?? null,
      }));
      await tx.insert(transactionProducts).values(items);

      // update stock
      await tx.execute(sql`
        UPDATE products
        SET stock = stock - tp.qty
        FROM transaction_products tp
        WHERE products.id = tp."productId"
          AND tp."transactionId" = ${newOrder.id}
          AND products.stock >= tp.qty
      `);

      return { code: newOrder.code || '' };
    });

    return result
  }


  async getAllTransactions(limit: number, offset: number): Promise<{ data: Transaction[], total: number }> {
    const db = createDb(localConfig.dbUrl)

    const [result, total] = await Promise.all([
      db
        .select()
        .from(transactions)
        .where(
          and(
            isNull(transactions.deletedAt),
            eq(transactions.transactionType, 'transaction'),
          )
        )
        .orderBy(transactions.createdAt)
        .limit(limit)
        .offset(offset),
      db.$count(
        transactions,
        and(
          isNull(transactions.deletedAt),
          eq(transactions.transactionType, 'transaction'),
        )
      )
    ])

    return {
      data: result.map(convertToTransaction),
      total
    }
  }

  async getTransactionById(id: string): Promise<Transaction | null> {
    const db = createDb(localConfig.dbUrl)

    const [result] = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.id, parseInt(id)),
          isNull(transactions.deletedAt)
        )
      )
      .limit(1);
    return result ? convertToTransaction(result) : null;
  }

  async generateTransactionCode(prefix: string): Promise<string> {
    const db = createDb(localConfig.dbUrl)

    const now = new Date()
    const yy = String(now.getFullYear()).slice(-2)
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')

    const dateKey = `${now.getFullYear()}${mm}${dd}`

    const [counter] = await db
      .insert(transactionCounters)
      .values({
        prefix,
        date: dateKey,
        lastNumber: 1,
      })
      .onConflictDoUpdate({
        target: [transactionCounters.prefix, transactionCounters.date],
        set: {
          lastNumber: sql`${transactionCounters.lastNumber} + 1`,
        },
      })
      .returning()

    const seq = String(counter.lastNumber).padStart(4, '0')

    return `${prefix}-${yy}${mm}${dd}${seq}`
  }

  async createTransaction(user: GetOrderRequest, payload: CreateTransactionRequest): Promise<{ code: string }> {
    const db = createDb(localConfig.dbUrl)

    const doc = {
      createdBy: payload.createdBy,
      transactionType: payload.transactionType,
      customerName: payload.customerName,
      tableNumber: payload.tableNumber.toString(),
      paymentType: payload.paymentType,
      paymentMethod: payload.paymentMethod,
      paymentStatus: payload.paymentStatus,
      payment: payload.payment,
      updatedAt: new Date()
    }

    const result = await db
      .update(transactions)
      .set(doc)
      .where(eq(transactions.userId, Number(user.id)))
      .returning();

    return { code: result[0].code || '' };
  }

  async updateTransaction(id: string, updates: UpdateTransactionRequest): Promise<Transaction | null> {
    const db = createDb(localConfig.dbUrl)
    const doc = {
      createdBy: updates.createdBy,
      transactionType: updates.transactionType,
      customerName: updates.customerName,
      tableNumber: updates.tableNumber.toString(),
      paymentType: updates.paymentType,
      paymentMethod: updates.paymentMethod,
      paymentStatus: updates.paymentStatus,
      payment: updates.payment,
      updatedAt: new Date()
    }

    const [result] = await db
      .update(transactions)
      .set(doc)
      .where(eq(transactions.id, parseInt(id)))
      .returning();

    return result ? convertToTransaction(result) : null;
  }

  async deleteTransaction(id: string): Promise<Transaction | null> {
    const db = createDb(localConfig.dbUrl)

    const [result] = await db
      .update(transactions)
      .set({ deletedAt: new Date() })
      .where(eq(transactions.id, Number(id)))
      .returning()

    return result ? convertToTransaction(result) : null;
  }
}