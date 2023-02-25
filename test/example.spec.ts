import { beforeAll, afterAll, describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'child_process'

describe('Transaction routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
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

  it('should be able to get a specific transaction', async () => {
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

    const transactionId = listTransactionsResponseBody.body.transactions[0].id

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getTransactionResponse.body.transactions).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        title: 'New transaction',
        amount: 5000,
      }),
    )
  })

  it('should be able to get the summary', async () => {
    const createdTransaction = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })
    const cookies = createdTransaction.get('Set-Cookie')

    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'Debit transaction',
        amount: 2000,
        type: 'debit',
      })

    const summaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)
      .expect(200)

    expect(summaryResponse.body.summary).toEqual({
      amount: 3000,
    })
  })
})
