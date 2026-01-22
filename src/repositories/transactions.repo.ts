import { eq, isNull, and, sql, desc, ilike, or } from 'drizzle-orm';
import type { InferInsertModel } from 'drizzle-orm';
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


  async getAllTransactions(
    limit: number,
    offset: number,
    search?: string,
    date?: string,
    paymentStatus?: string
  ) {
    const db = createDb(localConfig.dbUrl)
    const condition = [
      isNull(transactions.deletedAt),
      eq(transactions.transactionType, 'transaction'),
    ]

    if (search) {
      condition.push(sql`
      ${transactions.customerName} ilike ${`%${search}%`} 
      or ${transactions.code} ilike ${`%${search}%`}
      `)
    }

    if (date) {
      condition.push(ilike(transactions.transactionDate, `${date}%`))
    }

    if (paymentStatus) {
      condition.push(eq(transactions.paymentStatus, paymentStatus))
    }

    const [result, total] = await Promise.all([
      db.select()
        .from(transactions)
        .where(and(...condition))
        .orderBy(desc(transactions.createdAt))
        .limit(limit)
        .offset(offset),
      db.$count(
        transactions,
        and(...condition)
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
    const db = createDb(localConfig.dbUrl);
    const userId = Number(user.id);
    const doc = {
      userId,
      transactionDate: payload.transactionDate,
      transactionType: payload.transactionType,
      deliveryType: payload.deliveryType,
      subtotal: payload.subtotal,
      totalDiscount: payload.totalDiscount,
      ppn: payload.ppn,
      bill: payload.bill,
      createdBy: user.name,
      customerName: payload.customerName,
      tableNumber: payload.tableNumber.toString(),
      paymentType: payload.paymentType,
      paymentMethod: payload.paymentMethod,
      paymentStatus: payload.paymentStatus,
      payment: payload.payment
    }

    const result = await db.transaction(async (tx) => {
      // generate code
      const code = await this.generateTransactionCode('TRX');

      // insert transaksi baru
      const [newOrder] = await tx
        .insert(transactions)
        .values({
          ...doc,
          code,
        })
        .returning();

      // insert item
      const items = payload.items.map((i) => ({
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

  async updateTransaction(id: string, updates: UpdateTransactionRequest) {
    const db = createDb(localConfig.dbUrl)
    const doc: Partial<InferInsertModel<typeof transactions>> = {
      payment: updates.payment,
      updatedAt: new Date()
    }

    if (updates.transactionType) {
      doc.transactionType = updates.transactionType
    }
    if (updates.customerName) {
      doc.customerName = updates.customerName
    }
    if (updates.tableNumber) {
      doc.tableNumber = updates.tableNumber.toString()
    }
    if (updates.paymentType) {
      doc.paymentType = updates.paymentType
    }
    if (updates.paymentMethod) {
      doc.paymentMethod = updates.paymentMethod
    }
    if (updates.paymentStatus) {
      doc.paymentStatus = updates.paymentStatus
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