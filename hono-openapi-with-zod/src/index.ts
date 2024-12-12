import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { describeRoute } from 'hono-openapi'
import { resolver, validator } from 'hono-openapi/zod'
import { z } from 'zod'

const app = new Hono()

const querySchema = z.object({
  name: z.string().optional(),
})
const responseSchema = z.string()

app.get(
  '/',
  describeRoute({
    description: 'Say hello to the user',
    responses: {
      200: {
        description: 'Successful response',
        content: {
          'text/plain': { schema: resolver(responseSchema) },
        },
      },
    },
  }),
  validator('query', querySchema),
  (c) => {
    const { name } = c.req.valid('query')
    return c.text(`Hello ${name ?? 'Hono'}!`)
  },
)

const port = 3000
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
