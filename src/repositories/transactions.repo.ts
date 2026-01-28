import { eq, isNull, and, sql, desc, ilike, or } from 'drizzle-orm';
import type { InferInsertModel } from 'drizzle-orm';
import { createDb } from '../libs/db';
import localConfig from '../libs/config';
import {
  transactions,
  transactionCounters,
  transactionProducts,
  users,
  products,
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
    const db = createDb(localConfig.dbUrl);

    const [result] = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, parseInt(id)),
          eq(transactions.transactionType, 'cart'),
          isNull(transactions.deletedAt)
        )
      );

    if (!result) return null;

    const product = await db
      .select()
      .from(transactionProducts)
      .where(eq(transactionProducts.transactionId, result.id));

    return { transaction: result, product };
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

    return result;
  }

  async getAllTransactions(
    limit: number,
    offset: number,
    search?: string,
    date?: string,
    paymentStatus?: string
  ) {
    const db = createDb(localConfig.dbUrl);
    const condition = [
      isNull(transactions.deletedAt),
      eq(transactions.transactionType, 'transaction'),
    ];

    if (search) {
      condition.push(sql`
      ${transactions.customerName} ilike ${`%${search}%`} 
      or ${transactions.code} ilike ${`%${search}%`}
      `);
    }

    if (date) {
      condition.push(ilike(transactions.transactionDate, `${date}%`));
    }

    if (paymentStatus) {
      condition.push(eq(transactions.paymentStatus, paymentStatus));
    }

    if (limit > 0) {
      const [result, total] = await Promise.all([
        db
          .select()
          .from(transactions)
          .where(and(...condition))
          .orderBy(desc(transactions.createdAt))
          .limit(limit)
          .offset(offset)
          .fullJoin(users, eq(transactions.userId, users.id)),
        db.$count(transactions, and(...condition)),
      ]);

      return { data: result, total };
    }

    const [result, total] = await Promise.all([
      db
        .select()
        .from(transactions)
        .where(and(...condition))
        .orderBy(desc(transactions.createdAt))
        .fullJoin(users, eq(transactions.userId, users.id)),
      db.$count(transactions, and(...condition)),
    ]);

    return { data: result, total };
  }

  async getTransactionById(id: string) {
    const db = createDb(localConfig.dbUrl);

    const [result] = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, parseInt(id)), isNull(transactions.deletedAt)))
      .limit(1)
      .leftJoin(users, eq(transactions.userId, users.id));

    if (!result) return null;
    const { transactions: trxData, users: userData } = result;

    const product = await db
      .select()
      .from(transactionProducts)
      .where(eq(transactionProducts.transactionId, trxData.id))
      .innerJoin(products, eq(transactionProducts.productId, products.id));

    return { transaction: trxData, userData, product };
  }

  async generateTransactionCode(prefix: string) {
    const db = createDb(localConfig.dbUrl);

    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');

    const dateKey = `${now.getFullYear()}${mm}${dd}`;

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
          lastNumber: sql.raw(`"transaction_counters"."last_number" + 1`),
        },
      })
      .returning();

    const seq = String(counter.lastNumber).padStart(4, '0');

    return `${prefix}-${yy}${mm}${dd}${seq}`;
  }

  async createTransaction(user: GetOrderRequest, payload: CreateTransactionRequest) {
    const db = createDb(localConfig.dbUrl);
    const userId = Number(user.id);

    console.log('[1] Start transaction');
    const startTime = Date.now();

    try {
      const result = await db.transaction(async (tx) => {
        console.log('[2] Inside transaction, generating code...');
        const codeStart = Date.now();

        // Generate code
        const now = new Date();
        const yy = String(now.getFullYear()).slice(-2);
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const dateKey = `${now.getFullYear()}${mm}${dd}`;

        const [counter] = await tx
          .insert(transactionCounters)
          .values({
            prefix: 'TRX',
            date: dateKey,
            lastNumber: 1,
          })
          .onConflictDoUpdate({
            target: [transactionCounters.prefix, transactionCounters.date],
            set: {
              lastNumber: sql.raw(`"transaction_counters"."last_number" + 1`),
            },
          })
          .returning({ lastNumber: transactionCounters.lastNumber });

        console.log(`[3] Code generated in ${Date.now() - codeStart}ms`);

        const seq = String(counter.lastNumber).padStart(4, '0');
        const code = `TRX-${yy}${mm}${dd}${seq}`;

        // Insert transaction
        console.log('[4] Inserting transaction...');
        const txStart = Date.now();

        const [newOrder] = await tx
          .insert(transactions)
          .values({
            userId,
            code,
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
            payment: payload.payment,
          })
          .returning({ id: transactions.id, code: transactions.code });

        console.log(`[5] Transaction inserted in ${Date.now() - txStart}ms`);

        // Insert items
        if (payload.items.length > 0) {
          console.log(`[6] Inserting ${payload.items.length} items...`);
          const itemsStart = Date.now();

          const itemsValues = payload.items.map((i) => ({
            transactionId: newOrder.id,
            productId: i.productId,
            qty: i.qty,
            subtotal: i.subtotal,
            discount: i.discount,
            notes: i.notes ?? null,
          }));

          await tx.insert(transactionProducts).values(itemsValues);

          console.log(`[7] Items inserted in ${Date.now() - itemsStart}ms`);

          // Update stock
          console.log('[8] Updating stock...');
          const stockStart = Date.now();

          await tx.execute(sql`
            WITH items_to_update AS (
              SELECT "productId", SUM(qty) as total_qty
              FROM transaction_products
              WHERE "transactionId" = ${newOrder.id}
              GROUP BY "productId"
            )
            UPDATE products
            SET stock = products.stock - items_to_update.total_qty
            FROM items_to_update
            WHERE products.id = items_to_update."productId"
              AND products.stock >= items_to_update.total_qty
          `);

          console.log(`[9] Stock updated in ${Date.now() - stockStart}ms`);
        }

        console.log(`[10] Total transaction time: ${Date.now() - startTime}ms`);
        return { code: newOrder.code || '' };
      });

      return result;
    } catch (error) {
      console.error('[ERROR] Transaction failed:', error);
      console.error('[ERROR] Total time before failure:', Date.now() - startTime, 'ms');
      throw error;
    }
  }

  async updateTransaction(id: string, updates: UpdateTransactionRequest) {
    const db = createDb(localConfig.dbUrl);
    const doc: Partial<InferInsertModel<typeof transactions>> = {
      payment: updates.payment,
      updatedAt: new Date(),
    };

    if (updates.transactionType) {
      doc.transactionType = updates.transactionType;
    }
    if (updates.customerName) {
      doc.customerName = updates.customerName;
    }
    if (updates.tableNumber) {
      doc.tableNumber = updates.tableNumber.toString();
    }
    if (updates.paymentType) {
      doc.paymentType = updates.paymentType;
    }
    if (updates.paymentMethod) {
      doc.paymentMethod = updates.paymentMethod;
    }
    if (updates.paymentStatus) {
      doc.paymentStatus = updates.paymentStatus;
    }

    const [result] = await db
      .update(transactions)
      .set(doc)
      .where(eq(transactions.id, parseInt(id)))
      .returning();

    return result;
  }

  async deleteTransaction(id: string) {
    const db = createDb(localConfig.dbUrl);

    const [result] = await db
      .update(transactions)
      .set({ deletedAt: new Date() })
      .where(eq(transactions.id, Number(id)))
      .returning();

    return result;
  }
}
