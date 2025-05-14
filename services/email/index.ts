import { Hono } from 'hono'

const app = new Hono()

app.post('/send', async (c) => {
  const { to, subject, body } = await c.req.json()
  await new Promise((resolve) => setTimeout(resolve, 1000))
  console.log(`Email sent to ${to}: ${subject} - ${body}`)
  return c.json({ status: 'sent', to, subject })
})

export default {
  port: 4321,
  fetch: app.fetch,
};