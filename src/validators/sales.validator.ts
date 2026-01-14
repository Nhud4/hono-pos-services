import { z } from 'zod';

export const createSaleSchema = z.object({
  productId: z.number().positive('Product ID must be positive'),
  sales: z.number().min(0, 'Sales must be non-negative'),
  income: z.number(),
  grossIncome: z.number(),
});

export const updateSaleSchema = z.object({
  productId: z.number().positive('Product ID must be positive').optional(),
  sales: z.number().min(0, 'Sales must be non-negative').optional(),
  income: z.number().optional(),
  grossIncome: z.number().optional(),
});

export const saleIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid sale ID'),
});

export type CreateSaleSchema = z.infer<typeof createSaleSchema>
export type UpdateSaleSchema = z.infer<typeof updateSaleSchema>
export type SaleIdSchema = z.infer<typeof saleIdSchema>