import { eq, isNull, and, sql } from 'drizzle-orm';
import { createDb } from '../libs/db';
import localConfig from '../libs/config';
import {
  transactions,
  transactionCounters,
  transactionProducts,
  users,
  products
} from '../../drizzle/schema';
import {
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  CreateOrderRequest,
  GetOrderRequest,
  OrderData,
} from '../types/transactions.type';

export class TransactionsRepository {
  async getOrderByUser(id: string) {
    const db = createDb(localConfig.dbUrl)

    const [result] = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, parseInt(id)),
          eq(transactions.transactionType, 'cart'),
          isNull(transactions.deletedAt),
        )
      )

    if (!result) return null;

    const product = await db.select().from(transactionProducts)
      .where(eq(transactionProducts.transactionId, result.id))

    return { transaction: result, product }
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


  async getAllTransactions(limit: number, offset: number) {
    const db = createDb(localConfig.dbUrl)

    const [result, total] = await Promise.all([
      db.select({
        id: transactions.id,
        code: transactions.code,
        transactionDate: transactions.transactionDate,
        customerName: transactions.customerName,
        paymentMethod: transactions.paymentMethod,
        bill: transactions.bill
      })
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

    return { data: result, total }
  }

  async getTransactionById(id: string) {
    const db = createDb(localConfig.dbUrl)

    const [result] = await db.select().from(transactions)
      .where(and(
        eq(transactions.id, parseInt(id)),
        isNull(transactions.deletedAt)
      ))
      .limit(1)
      .leftJoin(users, eq(transactions.userId, users.id))

    if (!result) return null
    const { transactions: trxData, users: userData } = result

    const product = await db.select().from(transactionProducts)
      .where(eq(transactionProducts.transactionId, trxData.id))
      .innerJoin(products, eq(transactionProducts.productId, products.id))

    return { transaction: trxData, userData, product };
  }

  async generateTransactionCode(prefix: string) {
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

  async createTransaction(user: GetOrderRequest, payload: CreateTransactionRequest) {
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

    const [result] = await db
      .update(transactions)
      .set(doc)
      .where(eq(transactions.userId, Number(user.id)))
      .returning();

    return result
  }

  async updateTransaction(id: string, updates: UpdateTransactionRequest) {
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

    return result;
  }

  async deleteTransaction(id: string) {
    const db = createDb(localConfig.dbUrl)

    const [result] = await db
      .update(transactions)
      .set({ deletedAt: new Date() })
      .where(eq(transactions.id, Number(id)))
      .returning()

    return result;
  }
}