import { ordersTable, outboxTable, type NewOrder } from "@outbox/db/schema";
import { env } from './env';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from "drizzle-orm";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

const db = drizzle(pool);
console.log('DATABASE_URL:', env.DATABASE_URL)

export async function createOrder(order: NewOrder) {
  return await db.transaction(async (tx) => {
    const [createdOrder] = await tx.insert(ordersTable)
      .values(order)
      .returning();

    await tx.insert(outboxTable).values({
      payload: {
        type: 'ORDER_CREATED',
        data: createdOrder
      },
      processed: false
    });

    return createdOrder;
  });
}

export async function getOrder(id: number) {
  return await db.select().from(ordersTable).where(eq(ordersTable.id, id));
}

export async function testDb() {
  return await db.select().from(ordersTable);
}

