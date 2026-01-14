import { z } from 'zod';

export const createProductsCategorySchema = z.object({
  name: z
    .string()
    .nonempty('Nama kategori tidak boleh kosong')
    .min(4, 'Nama kategori harus lebih dari 4 karakter'),
  status: z.enum(['true', 'false']),
});

export const updateProductsCategorySchema = z.object({
  name: z
    .string()
    .nonempty('Nama kategori tidak boleh kosong')
    .min(4, 'Nama kategori harus lebih dari 4 karakter'),
  status: z.enum(['true', 'false']),
});

export const productsCategoryIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID tidak valid'),
});

export const listProductsCategorySchema = z.object({
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

export type CreateProductsCategorySchema = z.infer<typeof createProductsCategorySchema>
export type UpdateProductsCategorySchema = z.infer<typeof updateProductsCategorySchema>
export type ProductsCategoryIdSchema = z.infer<typeof productsCategoryIdSchema>
export type ListProductsCategorySchema = z.infer<typeof listProductsCategorySchema>
