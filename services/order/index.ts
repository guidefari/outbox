import { Hono } from 'hono';
import { createOrder, testDb } from './repo';
import { zValidator } from '@hono/zod-validator';
import { insertOrderSchema } from '@outbox/db/schema';

const app = new Hono();


app.post('/orders', zValidator('json', insertOrderSchema), async (c) => {
  const body = c.req.valid('json');
  try {
    await createOrder(body);
    return c.json({ message: 'Order created successfully' }, 201);
  } catch (error) {
    console.error('Failed to create order:', error);
    return c.json({ error: 'Failed to create order' }, 500);
  }
});

app.get('test-db', async (c) => {
  const result = await testDb();
  return c.json(result);
});


export default {
  port: 3123,
  fetch: app.fetch,
};
