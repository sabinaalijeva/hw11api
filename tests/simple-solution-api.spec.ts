import { expect, test } from '@playwright/test'
import { StatusCodes } from 'http-status-codes'
import { OrderDTO, OrderSchema } from '../src/dto/OrderDTO'
import { createOrder, getJwt } from '../src/helpers/api-helper'

const ORDERS_URL = 'https://backend.tallinn-learning.ee/orders'

test('post order with correct data should receive code 201', async ({ request }) => {
  const token = await getJwt(request)

  const response = await createOrder(request)

  const responseBody: OrderDTO = await response.json()
  const statusCode = response.status()

  console.log('response body:', responseBody)
  expect(statusCode).toBe(StatusCodes.OK)
  const TestOrder = OrderSchema.parse(responseBody)
  expect(TestOrder.id).not.toBeUndefined()
  expect(TestOrder.status).toBe('OPEN')
})

test('get order with correct id should receive code 200', async ({ request }) => {
  const token = await getJwt(request)

  const response = await createOrder(request)
  const responseBody: OrderDTO = await response.json()

  const responseSearch = await request.get(`${ORDERS_URL}/${responseBody.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  const responseBodySearch: OrderDTO = await responseSearch.json()
  console.log('found created order:', responseBodySearch)
  const statusCode = responseSearch.status()
  expect(statusCode).toBe(200)
  const TestSearchOrder = OrderSchema.parse(responseBodySearch)
  expect(TestSearchOrder.id).not.toBeUndefined()
  expect(TestSearchOrder.status).toBe('OPEN')
})

test('PUT /orders/{id}/status', async ({ request }) => {
  const token = await getJwt(request)

  const response = await createOrder(request)
  const responseBody: OrderDTO = await response.json()

  const putStatus = await request.put(`${ORDERS_URL}/${responseBody.id}/status`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { status: 'INPROGRESS' },
  })
  expect(putStatus.status()).toBe(200) // I get 403 here :(

  const responseSearch = await request.get(`${ORDERS_URL}/${responseBody.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const responseBodySearch: OrderDTO = await responseSearch.json()
  console.log('found updated order:', responseBodySearch)
  const TestSearchOrder = OrderSchema.parse(responseBodySearch)
  expect(TestSearchOrder.status).toBe('INPROGRESS')
})

test('DELETE /orders/{id}/status', async ({ request }) => {
  const token = await getJwt(request)
  const response = await createOrder(request)
  const responseBody: OrderDTO = await response.json()
  const deleteStatus = await request.delete(`${ORDERS_URL}/${responseBody.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  expect(deleteStatus.status()).toBe(200)
  const responseDelete = await deleteStatus.text()
  expect(responseDelete).toBe('true')

  const responseSearch = await request.get(`${ORDERS_URL}/${responseBody.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  expect(responseSearch.status()).toBe(404) // I get 200 with empty body...
})
