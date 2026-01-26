import {
  pgTable,
  serial,
  varchar,
  boolean,
  timestamp,
  text,
  integer,
  primaryKey,
} from 'drizzle-orm/pg-core';

export const company = pgTable('company', {
  id: serial('id').primaryKey(),
  name: varchar('name'),
  address: varchar('address'),
  phone: varchar('phone'),
  img: varchar('img'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
  deletedAt: timestamp('deletedAt'),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 16 }).unique(),
  name: varchar('name'),
  role: varchar('role'),
  username: varchar('username'),
  password: varchar('password'),
  active: boolean('active'),
  lastLogin: timestamp('lastLogin'),
  companyId: integer('companyId').references(() => company.id),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
  deletedAt: timestamp('deletedAt'),
});

export const productsCategory = pgTable('products_category', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 16 }).unique(),
  name: varchar('name'),
  totalProduct: integer('totalProduct'),
  status: boolean('status'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
  deletedAt: timestamp('deletedAt'),
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 16 }).unique(),
  categoryId: integer('categoryId').references(() => productsCategory.id),
  name: varchar('name'),
  description: text('description'),
  normalPrice: integer('normalPrice'),
  hpp: integer('hpp'),
  discount: integer('discount'),
  discountType: varchar('discountType'),
  stock: integer('stock'),
  active: boolean('active'),
  available: boolean('available'),
  img: varchar('img'),
  allocation: varchar('allocation'),
  discountPrice: integer('discountPrice'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
  deletedAt: timestamp('deletedAt'),
});

export const sales = pgTable('sales', {
  id: serial('id').primaryKey(),
  productId: integer('productId').references(() => products.id),
  sales: integer('sales'),
  income: integer('income'),
  grossIncome: integer('grossIncome'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
  deletedAt: timestamp('deletedAt'),
});

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 16 }).unique(),
  transactionDate: varchar('transactionDate'),
  createdBy: varchar('createdBy'),
  userId: integer('userId').references(() => users.id),
  transactionType: varchar('transactionType'),
  customerName: varchar('customerName'),
  deliveryType: varchar('deliveryType'),
  tableNumber: varchar('tableNumber'),
  paymentType: varchar('paymentType'),
  paymentMethod: varchar('paymentMethod'),
  paymentStatus: varchar('paymentStatus'),
  subtotal: integer('subtotal'),
  totalDiscount: integer('totalDiscount'),
  ppn: integer('ppn'),
  bill: integer('bill'),
  payment: integer('payment'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
  deletedAt: timestamp('deletedAt'),
});

export const transactionProducts = pgTable('transaction_products', {
  id: serial('id').primaryKey(),
  transactionId: integer('transactionId').references(() => transactions.id),
  productId: integer('productId').references(() => products.id),
  qty: integer('qty'),
  subtotal: integer('subtotal'),
  discount: integer('discount'),
  notes: text('notes'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
  deletedAt: timestamp('deletedAt'),
});

export const transactionPrint = pgTable('transaction_print', {
  id: serial('id').primaryKey(),
  transactionId: integer('transactionId').references(() => transactions.id),
  role: varchar('role'),
  status: boolean('status'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
  deletedAt: timestamp('deletedAt'),
});

export const refundTransactions = pgTable('refund_transactions', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 16 }).unique(),
  transactionId: integer('transactionId').references(() => transactions.id),
  status: varchar('status'),
  note: varchar('note'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
  deletedAt: timestamp('deletedAt'),
});

export const transactionCounters = pgTable(
  'transaction_counters',
  {
    prefix: text('prefix').notNull(),
    date: text('date').notNull(),
    lastNumber: integer('last_number').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.prefix, table.date] }),
  })
);

// Type exports
export type Company = typeof company.$inferSelect;
export type NewCompany = typeof company.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type ProductsCategory = typeof productsCategory.$inferSelect;
export type NewProductsCategory = typeof productsCategory.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type Sale = typeof sales.$inferSelect;
export type NewSale = typeof sales.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

export type TransactionProduct = typeof transactionProducts.$inferSelect;
export type NewTransactionProduct = typeof transactionProducts.$inferInsert;

export type TransactionPrint = typeof transactionPrint.$inferSelect;
export type NewTransactionPrint = typeof transactionPrint.$inferInsert;

export type RefundTransaction = typeof refundTransactions.$inferSelect;
export type NewRefundTransaction = typeof refundTransactions.$inferInsert;

export type TransactionCounters = typeof transactionCounters.$inferSelect;
export type NewTransactionCounters = typeof transactionCounters.$inferInsert;
