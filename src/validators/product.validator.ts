import { z } from 'zod';

export const createProductSchema = z.object({
  name: z
    .string()
    .nonempty('Nama produk tidak boleh kosong')
    .min(4, 'Nama produk harus lebih dari 4 karakter'),
  categoryId: z.string().regex(/^\d+$/, 'ID tidak valid'),
  description: z.string().optional(),
  normalPrice: z
    .string()
    .nonempty('Harga normal tidak boleh kosong')
    .min(1, 'Harga normal harus lebih dari 1'),
  hpp: z
    .string()
    .nonempty('HPP tidak boleh kosong')
    .min(1, 'HPP harus lebih dari 1'),
  discount: z.string().optional(),
  discountType: z
    .enum(['nominal', 'percentage', ''])
    .optional(),
  stock: z
    .string()
    .nonempty('Stock tidak boleh kosong')
    .min(1, 'Stock harus lebih dari 1'),
  active: z.enum(['true', 'false']),
  img: z.any()
});

export const updateProductSchema = z.object({
  name: z
    .string()
    .nonempty('Nama produk tidak boleh kosong')
    .min(4, 'Nama produk harus lebih dari 4 karakter'),
  categoryId: z.string().regex(/^\d+$/, 'ID tidak valid'),
  description: z.string().optional(),
  normalPrice: z
    .string()
    .nonempty('Harga normal tidak boleh kosong')
    .min(1, 'Harga normal harus lebih dari 1'),
  hpp: z
    .string()
    .nonempty('HPP tidak boleh kosong')
    .min(1, 'HPP harus lebih dari 1'),
  discount: z.string().optional(),
  discountType: z
    .enum(['nominal', 'percentage', ''])
    .optional(),
  stock: z
    .string()
    .nonempty('Stock tidak boleh kosong')
    .min(1, 'Stock harus lebih dari 1'),
  active: z.enum(['true', 'false']),
  img: z.any()
});

export const productIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID tidak valid'),
});

export const listProductsSchema = z.object({
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

export type CreateProductSchema = z.infer<typeof createProductSchema>
export type UpdateProductSchema = z.infer<typeof updateProductSchema>
export type ProductIdSchema = z.infer<typeof productIdSchema>
export type ListProductsSchema = z.infer<typeof listProductsSchema>
