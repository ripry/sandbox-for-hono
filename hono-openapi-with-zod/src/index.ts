import { serve } from '@hono/node-server'
import { apiReference } from '@scalar/hono-api-reference'
import { Hono } from 'hono'
import { describeRoute, openAPISpecs } from 'hono-openapi'
import { resolver, validator } from 'hono-openapi/zod'
import { prettyJSON } from 'hono/pretty-json'
import { z } from 'zod'

import 'zod-openapi/extend'

const app = new Hono()

const querySchema = z.object({
  name: z.string().optional().openapi({ description: 'Name of the user' }),
})
const responseSchema = z.string().openapi({ description: 'Greeting message' })

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

app.get(
  '/openapi.json',
  openAPISpecs(app, {
    documentation: {
      info: { title: 'Hono API', version: '1.0.0', description: 'Greeting API' },
      servers: [{ url: 'http://localhost:3000', description: 'Local Server' }],
    },
  }),
  prettyJSON(),
)

app.get(
  '/docs',
  apiReference({
    theme: 'saturn',
    spec: { url: '/openapi.json' },
  }),
)

const port = 3000
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
