import { z } from 'zod';

// order validator
export const createOrderSchema = z.object({
  transactionDate: z.string(),
  transactionType: z.enum(['cart']),
  deliveryType: z.enum(['in', 'out']),
  subtotal: z.number(),
  totalDiscount: z.number(),
  ppn: z.number(),
  bill: z.number(),
  items: z.array(z.object({
    productId: z.number().positive('ID produk tidak valid'),
    qty: z.number().positive('QTY harus lebih dari 0'),
    discount: z.number(),
    subtotal: z.number().positive('Subtotal harus lebih dari 0'),
    notes: z.string().optional()
  }))
})


export const createTransactionSchema = z.object({
  createdBy: z.string().optional(),
  transactionType: z.enum(['transaction']),
  customerName: z.string(),
  tableNumber: z.number().positive('Nomor meja harus lebih dari 0'),
  paymentType: z.enum(['later', 'now']),
  paymentMethod: z.string().optional(),
  paymentStatus: z.enum(['pending', 'success', 'reject', '']),
  payment: z.number().optional(),
  transactionDate: z.string(),
  deliveryType: z.enum(['dineIn', 'takeWay', 'reservation']),
  subtotal: z.number(),
  totalDiscount: z.number(),
  ppn: z.number(),
  bill: z.number(),
  items: z.array(z.object({
    productId: z.number().positive('ID produk tidak valid'),
    qty: z.number().positive('QTY harus lebih dari 0'),
    discount: z.number(),
    subtotal: z.number().positive('Subtotal harus lebih dari 0'),
    notes: z.string().optional()
  }))
});

export const updateTransactionSchema = z.object({
  transactionType: z.enum(['transaction']),
  customerName: z.string().optional(),
  tableNumber: z.number().optional(),
  paymentType: z.enum(['later', 'now', '']),
  paymentMethod: z.string().optional(),
  paymentStatus: z.enum(['pending', 'success', 'reject', '']),
  payment: z.number().optional()
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
    .nonempty('Size tidak boleh kosong'),
  search: z.string().optional(),
  paymentStatus: z.string().optional(),
  date: z.string().optional()
})

export type CreateTransactionSchema = z.infer<typeof createTransactionSchema>
export type UpdateTransactionSchema = z.infer<typeof updateTransactionSchema>
export type TransactionIdSchema = z.infer<typeof transactionIdSchema>
export type ListTransactionSchema = z.infer<typeof listTransactionSchema>

export type CreateOrderSchema = z.infer<typeof createOrderSchema>