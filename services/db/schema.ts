import { pgTable, serial, text, timestamp, varchar, integer, jsonb, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const ordersTable = pgTable('orders', {
  id: serial('id').primaryKey(),
  customerId: varchar('customer_id', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  total: integer('total').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const outboxTable = pgTable('outbox', {
  id: serial('id').primaryKey(),
  processed: boolean('processed').notNull().default(false),
  payload: jsonb('payload').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Order = typeof ordersTable.$inferSelect;
export type NewOrder = typeof ordersTable.$inferInsert; 

export const insertOrderSchema = createInsertSchema(ordersTable);
export const selectOrderSchema = createSelectSchema(ordersTable);

export type Outbox = typeof outboxTable.$inferSelect;
export type NewOutbox = typeof outboxTable.$inferInsert; 

export const insertOutboxSchema = createInsertSchema(outboxTable);
export const selectOutboxSchema = createSelectSchema(outboxTable);