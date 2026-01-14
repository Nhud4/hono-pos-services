import { z } from 'zod';

export const createUserSchema = z.object({
  name: z
    .string()
    .nonempty('Nama tidak boleh kosong')
    .min(3, 'Nama harus lebih dari 3 karakter'),
  role: z.enum(['cashier', 'waiters', 'kitchen', 'manager', 'inventory']),
  username: z
    .string()
    .nonempty('Username tidak boleh kosong')
    .min(4, 'Username harus lebih dari 4 karakter'),
  password: z
    .string()
    .nonempty('Kata sandi tidka boleh kosong')
    .min(6, 'Kata sandi harus lebih dari 6 karakter'),
  active: z.enum(['true', 'false']),
  companyId: z.number(),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .nonempty('Nama tidak boleh kosong')
    .min(3, 'Nama harus lebih dari 3 karakter'),
  role: z.enum(['cashier', 'waiters', 'kitchen', 'manager', 'inventory']),
  username: z
    .string()
    .nonempty('Username tidak boleh kosong')
    .min(4, 'Username harus lebih dari 4 karakter'),
  password: z
    .string()
    .nonempty('Kata sandi tidka boleh kosong')
    .min(6, 'Kata sandi harus lebih dari 6 karakter'),
  active: z.enum(['true', 'false']),
  companyId: z.number().optional(),
});

export const userIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID tidak valid'),
});

export const listUserSchema = z.object({
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

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['cashier', 'waiters', 'kitchen', 'manager', 'inventory']),
});

export type CreateUserSchema = z.infer<typeof createUserSchema>
export type UpdateUserSchema = z.infer<typeof updateUserSchema>
export type UserIdSchema = z.infer<typeof userIdSchema>
export type ListUserSchema = z.infer<typeof listUserSchema>
export type LoginSchema = z.infer<typeof loginSchema>