import { z } from 'zod';

export const listSalesSchema = z.object({
  page: z.string().nonempty('Page tidak boleh kosong').min(1, 'Page harus lebih dar 1'),
  size: z.string().nonempty('Size tidak boleh kosong'),
  productId: z.string().optional(),
  month: z.string().optional(),
});

export type ListSalesSchema = z.infer<typeof listSalesSchema>;
