import { z } from 'zod';

export const createTransactionSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  transactionDate: z.string().min(1, 'Transaction date is required'),
  createdBy: z.string().min(1, 'Created by is required'),
  userId: z.number().positive('User ID must be positive'),
  transactionType: z.string().min(1, 'Transaction type is required'),
  customerName: z.string().optional(),
  deliveryType: z.string().optional(),
  tableNumber: z.string().optional(),
  paymentType: z.string().optional(),
  paymentMethod: z.string().optional(),
  paymentStatus: z.string().optional(),
  subtotal: z.number(),
  totalDiscount: z.number(),
  ppn: z.number(),
  bill: z.number(),
  payment: z.number(),
});

export const updateTransactionSchema = z.object({
  code: z.string().min(1, 'Code cannot be empty').optional(),
  transactionDate: z.string().min(1, 'Transaction date cannot be empty').optional(),
  createdBy: z.string().min(1, 'Created by cannot be empty').optional(),
  userId: z.number().positive('User ID must be positive').optional(),
  transactionType: z.string().min(1, 'Transaction type cannot be empty').optional(),
  customerName: z.string().optional(),
  deliveryType: z.string().optional(),
  tableNumber: z.string().optional(),
  paymentType: z.string().optional(),
  paymentMethod: z.string().optional(),
  paymentStatus: z.string().optional(),
  subtotal: z.number().optional(),
  totalDiscount: z.number().optional(),
  ppn: z.number().optional(),
  bill: z.number().optional(),
  payment: z.number().optional(),
});

export const transactionIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid transaction ID'),
});

export type CreateTransactionSchema = z.infer<typeof createTransactionSchema>
export type UpdateTransactionSchema = z.infer<typeof updateTransactionSchema>
export type TransactionIdSchema = z.infer<typeof transactionIdSchema>