import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be greater than 0'),
});

export const updateProductSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').optional(),
  description: z.string().optional(),
  price: z.number().positive('Price must be greater than 0').optional(),
});

export const productIdSchema = z.object({
  id: z.string().uuid('Invalid product ID'),
});

export type CreateProductSchema = z.infer<typeof createProductSchema>
export type UpdateProductSchema = z.infer<typeof updateProductSchema>
export type ProductIdSchema = z.infer<typeof productIdSchema>
