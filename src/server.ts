import fastify from 'fastify'
import cookie from '@fastify/cookie'

import { env } from './env'
import { transactionsRoutes } from './routes/transactions'

const app = fastify()

app.register(cookie)

app.register(transactionsRoutes, {
  prefix: 'transactions',
})

app.addHook('preHandler', async (req, replay) => {
  console.log('global')
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('Http Server is running! 🚀')
  })
