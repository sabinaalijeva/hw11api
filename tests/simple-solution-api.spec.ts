import { expect, test } from '@playwright/test'

import { StatusCodes } from 'http-status-codes'
import { OrderDTO } from '../src/dto/OrderDTO'

test('get order with correct id should receive code 200', async ({ request }) => {
  // Build and send a GET request to the server
  const response = await request.get('https://backend.tallinn-learning.ee/test-orders/1')

  // parse raw response body to json
  const responseBody = await response.json()
  const statusCode = response.status()

  // Log the response status, body and headers
  console.log('response body:', responseBody)
  // Check if the response status is 200
  expect(statusCode).toBe(200)
})

test('post order with correct data should receive code 201', async ({ request }) => {
  // prepare request body
  const dtoBody: OrderDTO = OrderDTO.generateDefault();
  // Send a POST request to the server
  const response = await request.post('https://backend.tallinn-learning.ee/test-orders', {
    data: dtoBody,
  })
  // parse raw response body to json
  const responseBody = await response.json() //"age:20,title:'123'"
  const statusCode = response.status()

  // Log the response status and body
  console.log('response status:', statusCode)
  console.log('response body:', responseBody)
  expect(statusCode).toBe(StatusCodes.OK)
  // check that body.comment is string type
  expect(typeof responseBody.comment).toBe('string')
  // check that body.courierId is number type
  expect(typeof responseBody.courierId).toBe('number')
})
