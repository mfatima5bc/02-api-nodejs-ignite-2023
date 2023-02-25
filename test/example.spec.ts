import { beforeAll, afterAll, describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'

describe('Transaction routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to create a new transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })
      .expect(201)
  })

  it('should be able to list all transactions', async () => {
    const createdTransaction = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })
    const cookies = createdTransaction.get('Set-Cookie')

    const listTransactionsResponseBody = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    expect(listTransactionsResponseBody.body.transactions).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        title: 'New transaction',
        amount: 5000,
      }),
    ])
  })
})
