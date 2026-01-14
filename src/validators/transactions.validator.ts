import { z } from 'zod';

export const createTransactionSchema = z.object({
  transactionDate: z.string(),
  createdBy: z.string().optional(),
  transactionType: z.enum(['cart', 'transaction']),
  customerName: z.string(),
  deliveryType: z.enum(['in', 'out']),
  tableNumber: z.number().positive('Nomor meja harus lebih dari 0'),
  paymentType: z.enum(['later', 'now']),
  paymentMethod: z.string(),
  paymentStatus: z.enum(['pending', 'success', 'reject']),
  subtotal: z.number(),
  totalDiscount: z.number(),
  ppn: z.number(),
  bill: z.number(),
  payment: z.number(),
});

export const updateTransactionSchema = z.object({
  transactionDate: z.string(),
  createdBy: z.string().optional(),
  transactionType: z.enum(['cart', 'transaction']),
  customerName: z.string(),
  deliveryType: z.enum(['in', 'out']),
  tableNumber: z.number().positive('Nomor meja harus lebih dari 0'),
  paymentType: z.enum(['later', 'now']),
  paymentMethod: z.string(),
  paymentStatus: z.enum(['pending', 'success', 'reject']),
  subtotal: z.number(),
  totalDiscount: z.number(),
  ppn: z.number(),
  bill: z.number(),
  payment: z.number(),
});

export const transactionIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID tidak valid'),
});

export const listTransactionSchema = z.object({
  page: z
    .string()
    .nonempty('Page tidak boleh kosong')
    .min(1, 'Page harus lebih dar 1'),
  size: z
    .string()
    .nonempty('Size tidak boleh kosong')
    .min(1, 'Page harus lebih dar 1'),
  search: z.string().optional()
})

export type CreateTransactionSchema = z.infer<typeof createTransactionSchema>
export type UpdateTransactionSchema = z.infer<typeof updateTransactionSchema>
export type TransactionIdSchema = z.infer<typeof transactionIdSchema>
export type ListTransactionSchema = z.infer<typeof listTransactionSchema>