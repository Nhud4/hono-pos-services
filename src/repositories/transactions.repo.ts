import { eq } from 'drizzle-orm';
import { createDb } from '../libs/db';
import localConfig from '../libs/config';
import { transactions } from '../../drizzle/schema';
import { Transaction, CreateTransactionRequest, UpdateTransactionRequest } from '../types/transactions.type';

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
  async getAllTransactions(limit: number = 50, offset: number = 0): Promise<Transaction[]> {
    const db = createDb(localConfig.dbUrl)

    const result = await db
      .select()
      .from(transactions)
      .orderBy(transactions.createdAt)
      .limit(limit).offset(offset);
    return result.map(convertToTransaction);
  }

  async getTransactionById(id: string): Promise<Transaction | null> {
    const db = createDb(localConfig.dbUrl)

    const result = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, parseInt(id)));
    return result[0] ? convertToTransaction(result[0]) : null;
  }

  async createTransaction(transactionData: CreateTransactionRequest): Promise<Transaction> {
    const db = createDb(localConfig.dbUrl)

    const result = await db.insert(transactions).values({
      code: transactionData.code,
      transactionDate: transactionData.transactionDate,
      createdBy: transactionData.createdBy,
      userId: transactionData.userId,
      transactionType: transactionData.transactionType,
      customerName: transactionData.customerName,
      deliveryType: transactionData.deliveryType,
      tableNumber: transactionData.tableNumber,
      paymentType: transactionData.paymentType,
      paymentMethod: transactionData.paymentMethod,
      paymentStatus: transactionData.paymentStatus,
      subtotal: transactionData.subtotal,
      totalDiscount: transactionData.totalDiscount,
      ppn: transactionData.ppn,
      bill: transactionData.bill,
      payment: transactionData.payment,
    }).returning();
    return convertToTransaction(result[0]);
  }

  async updateTransaction(id: string, updates: UpdateTransactionRequest): Promise<Transaction | null> {
    const db = createDb(localConfig.dbUrl)
    const updateData: any = { updatedAt: new Date() };

    if (updates.code !== undefined) updateData.code = updates.code;
    if (updates.transactionDate !== undefined) updateData.transactionDate = updates.transactionDate;
    if (updates.createdBy !== undefined) updateData.createdBy = updates.createdBy;
    if (updates.userId !== undefined) updateData.userId = updates.userId;
    if (updates.transactionType !== undefined) updateData.transactionType = updates.transactionType;
    if (updates.customerName !== undefined) updateData.customerName = updates.customerName;
    if (updates.deliveryType !== undefined) updateData.deliveryType = updates.deliveryType;
    if (updates.tableNumber !== undefined) updateData.tableNumber = updates.tableNumber;
    if (updates.paymentType !== undefined) updateData.paymentType = updates.paymentType;
    if (updates.paymentMethod !== undefined) updateData.paymentMethod = updates.paymentMethod;
    if (updates.paymentStatus !== undefined) updateData.paymentStatus = updates.paymentStatus;
    if (updates.subtotal !== undefined) updateData.subtotal = updates.subtotal;
    if (updates.totalDiscount !== undefined) updateData.totalDiscount = updates.totalDiscount;
    if (updates.ppn !== undefined) updateData.ppn = updates.ppn;
    if (updates.bill !== undefined) updateData.bill = updates.bill;
    if (updates.payment !== undefined) updateData.payment = updates.payment;

    const result = await db
      .update(transactions)
      .set(updateData)
      .where(eq(transactions.id, parseInt(id)))
      .returning();

    return result[0] ? convertToTransaction(result[0]) : null;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const db = createDb(localConfig.dbUrl)

    const result = await db.delete(transactions).where(eq(transactions.id, parseInt(id)));
    return true;
  }
}