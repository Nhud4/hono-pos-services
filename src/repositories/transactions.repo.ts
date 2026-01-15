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
  OrderData
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
    updated_at: drizzleTransaction.updatedAt?.toISOString(),
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
    const db = createDb(localConfig.dbUrl)

    // generate code
    const code = await this.generateTransactionCode('TRX')

    // transaction table
    const result = await db.transaction(async (tx) => {
      const checkOrder = await tx
        .select()
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, parseInt(user.id)),
            eq(transactions.transactionType, 'cart'),
            isNull(transactions.deletedAt),
          )
        );

      const orderResult = checkOrder[0]

      if (orderResult) {
        // delete data on table transaction product
        await tx
          .delete(transactionProducts)
          .where(eq(transactionProducts.transactionId, orderResult.id));

        // update transaction
        const data = await tx
          .update(transactions)
          .set({
            ...doc,
            userId: parseInt(user.id),
            createdBy: user.name
          })
          .where(eq(transactions.id, orderResult.id))
          .returning()

        // insert transaction product
        const product = doc.items.map((val) => ({
          transactionId: data[0].id,
          productId: val.productId,
          qty: val.qty,
          subtotal: val.subtotal,
          discount: val.discount,
          notes: val.notes || null
        }))

        await tx.insert(transactionProducts).values(product)

        return data[0].code
      }

      // insert transaction table
      const data = await tx
        .insert(transactions)
        .values({
          ...doc,
          code,
          userId: parseInt(user.id),
          createdBy: user.name
        })
        .returning()

      // insert transaction product
      const product = doc.items.map((val) => ({
        transactionId: data[0].id,
        productId: val.productId,
        qty: val.qty,
        subtotal: val.subtotal,
        discount: val.discount,
        notes: val.notes || null
      }))

      await tx.insert(transactionProducts).values(product)

      return data[0].code
    })

    return { code: result || '' }
  }

  async getAllTransactions(limit: number, offset: number): Promise<Transaction[]> {
    const db = createDb(localConfig.dbUrl)

    const result = await db
      .select()
      .from(transactions)
      .where(isNull(transactions.deletedAt))
      .orderBy(transactions.createdAt)
      .limit(limit)
      .offset(offset);
    return result.map(convertToTransaction);
  }

  async getTransactionById(id: string): Promise<Transaction | null> {
    const db = createDb(localConfig.dbUrl)

    const result = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.id, parseInt(id)),
          isNull(transactions.deletedAt)
        )
      );
    return result[0] ? convertToTransaction(result[0]) : null;
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

  // async createTransaction(transactionData: CreateTransactionRequest): Promise<Transaction> {
  //   const db = createDb(localConfig.dbUrl)

  //   const code = await this.generateTransactionCode('TRX')
  //   const doc = {
  //     code,
  //     transactionDate: transactionData.transactionDate,
  //     createdBy: transactionData.createdBy,
  //     userId: transactionData.userId,
  //     transactionType: transactionData.transactionType,
  //     customerName: transactionData.customerName,
  //     deliveryType: transactionData.deliveryType,
  //     tableNumber: transactionData.tableNumber,
  //     paymentType: transactionData.paymentType,
  //     paymentMethod: transactionData.paymentMethod,
  //     paymentStatus: transactionData.paymentStatus,
  //     subtotal: transactionData.subtotal,
  //     totalDiscount: transactionData.totalDiscount,
  //     ppn: transactionData.ppn,
  //     bill: transactionData.bill,
  //     payment: transactionData.payment,
  //   }

  //   const result = await db.insert(transactions).values(doc).returning();
  //   return convertToTransaction(result[0]);
  // }

  // async updateTransaction(id: string, updates: UpdateTransactionRequest): Promise<Transaction | null> {
  //   const db = createDb(localConfig.dbUrl)
  //   const updateData: any = { updatedAt: new Date() };

  //   if (updates.code !== undefined) updateData.code = updates.code;
  //   if (updates.transactionDate !== undefined) updateData.transactionDate = updates.transactionDate;
  //   if (updates.createdBy !== undefined) updateData.createdBy = updates.createdBy;
  //   if (updates.userId !== undefined) updateData.userId = updates.userId;
  //   if (updates.transactionType !== undefined) updateData.transactionType = updates.transactionType;
  //   if (updates.customerName !== undefined) updateData.customerName = updates.customerName;
  //   if (updates.deliveryType !== undefined) updateData.deliveryType = updates.deliveryType;
  //   if (updates.tableNumber !== undefined) updateData.tableNumber = updates.tableNumber;
  //   if (updates.paymentType !== undefined) updateData.paymentType = updates.paymentType;
  //   if (updates.paymentMethod !== undefined) updateData.paymentMethod = updates.paymentMethod;
  //   if (updates.paymentStatus !== undefined) updateData.paymentStatus = updates.paymentStatus;
  //   if (updates.subtotal !== undefined) updateData.subtotal = updates.subtotal;
  //   if (updates.totalDiscount !== undefined) updateData.totalDiscount = updates.totalDiscount;
  //   if (updates.ppn !== undefined) updateData.ppn = updates.ppn;
  //   if (updates.bill !== undefined) updateData.bill = updates.bill;
  //   if (updates.payment !== undefined) updateData.payment = updates.payment;

  //   const result = await db
  //     .update(transactions)
  //     .set(updateData)
  //     .where(eq(transactions.id, parseInt(id)))
  //     .returning();

  //   return result[0] ? convertToTransaction(result[0]) : null;
  // }

  // async deleteTransaction(id: string): Promise<boolean> {
  //   const db = createDb(localConfig.dbUrl)

  //   const result = await db.delete(transactions).where(eq(transactions.id, parseInt(id)));
  //   return true;
  // }
}