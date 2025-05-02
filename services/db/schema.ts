import { pgTable, serial, text, timestamp, varchar, integer, jsonb, boolean } from 'drizzle-orm/pg-core';

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  customerId: varchar('customer_id', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  total: integer('total').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const outbox = pgTable('outbox', {
  id: serial('id').primaryKey(),
  processed: boolean('processed').notNull().default(false),
  payload: jsonb('payload').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert; 