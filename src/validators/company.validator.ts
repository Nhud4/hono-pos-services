import { z } from 'zod';

export const createCompanySchema = z.object({
  name: z.string().nonempty('Nama tidak boleh kosong').min(4, 'Name harus lebih dari 4 karakter'),
  address: z
    .string()
    .nonempty('Alamat tidak boleh kosong')
    .min(10, 'Alamat harus lebih dari 10 karakter'),
  phone: z
    .string()
    .nonempty('No Hp tidak boleh kosong')
    .min(9, 'No Hp harus lebih dari 9 karakter')
    .max(15, 'No Hp tidak boleh lebih dari 15 katakter'),
  img: z.any(),
});

export const updateCompanySchema = z.object({
  name: z.string().nonempty('Nama tidak boleh kosong').min(4, 'Name harus lebih dari 4 karakter'),
  address: z
    .string()
    .nonempty('Alamat tidak boleh kosong')
    .min(10, 'Alamat harus lebih dari 10 karakter'),
  phone: z
    .string()
    .nonempty('No Hp tidak boleh kosong')
    .min(9, 'No Hp harus lebih dari 9 karakter')
    .max(15, 'No Hp tidak boleh lebih dari 15 katakter'),
  img: z.string().optional(),
});

export const companyIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID tidak valid'),
});

export type CreateCompanySchema = z.infer<typeof createCompanySchema>;
export type UpdateCompanySchema = z.infer<typeof updateCompanySchema>;
export type CompanyIdSchema = z.infer<typeof companyIdSchema>;
