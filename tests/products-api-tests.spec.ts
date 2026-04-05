import { expect, test } from '@playwright/test'

import { StatusCodes } from 'http-status-codes'

test.describe('Lesson 11 -> Product API tests', () => {
  const BaseEndpointURL = 'https://backend.tallinn-learning.ee/products'
  const AUTH = { 'X-API-Key': 'my-secret-api-key' }
  type Product = {
    id: number
    name: string
    price: number
    createdAt: string | null
  }

  test('GET /products - check API returns array with length >= 1', async ({ request }) => {
    const response = await request.get(BaseEndpointURL, {
      headers: AUTH,
    })

    const responseBody: Product[] = await response.json()
    expect(response.status()).toBe(StatusCodes.OK)
    expect(responseBody.length).toBeDefined()
    expect(responseBody.length).toBeGreaterThanOrEqual(1)
  })

  test('POST /products; GET /products/{id} - check product creation and product search by id', async ({
    request,
  }) => {
    const testProduct: Product = {
      id: 0,
      name: 'test lesson 11',
      price: 124523643,
      createdAt: '2026-03-23T18:04:11.285Z',
    }

    const createResponse = await request.post(BaseEndpointURL, {
      headers: AUTH,
      data: testProduct,
    })

    const createResponseBody: Product = await createResponse.json()
    expect(createResponseBody.id).toBeGreaterThan(0)
    expect(createResponseBody.name).toBe(testProduct.name)
    expect(createResponseBody.price).toBe(testProduct.price)
    expect(createResponseBody.createdAt).toBeDefined()

    const searchResponse = await request.get(`${BaseEndpointURL}/${createResponseBody.id}`, {
      headers: AUTH,
    })
    const searchResponseBody: Product = await searchResponse.json()
    expect(searchResponse.status()).toBe(StatusCodes.OK)
    expect.soft(searchResponseBody.id).toBe(createResponseBody.id)
    expect.soft(searchResponseBody.name).toBe(testProduct.name)
    expect.soft(searchResponseBody.price).toBe(testProduct.price)
    expect.soft(searchResponseBody.createdAt).toBeDefined()
  })

  test('DELETE /products - check not existing product deletion', async ({ request }) => {
    const deleteResponse = await request.delete(`${BaseEndpointURL}/-1`, {
      headers: AUTH,
    })

    expect(deleteResponse.status()).toBe(400)
  })

  test('DELETE /products - check product deletion', async ({ request }) => {
    const testProduct: Product = {
      id: 0,
      name: 'test lesson 11',
      price: 124523643,
      createdAt: '2026-03-23T18:04:11.285Z',
    }

    const createResponse = await request.post(BaseEndpointURL, {
      headers: AUTH,
      data: testProduct,
    })
    const createResponseBody: Product = await createResponse.json()

    const deleteResponse = await request.delete(`${BaseEndpointURL}/${createResponseBody.id}`, {
      headers: AUTH,
    })

    expect(deleteResponse.status()).toBe(204)
  })

  // new tests

  type ProductRequestDTO = {
    name: string
    price: number
  }
  type ProductResponseDTO = {
    id: number
    name: string
    price: number
    createdAt: string | null
  }
  type ProductUpdateDTO = {
    name?: string
    price?: number
  }
  test('PUT /products/{id} - check product update (create-update-search)', async ({ request }) => {
    const testProductCreate: ProductRequestDTO = {
      name: 'sabtest',
      price: 888,
    }
    const createResponse = await request.post(BaseEndpointURL, {
      headers: AUTH,
      data: testProductCreate,
    })
    const createResponseBody: ProductResponseDTO = await createResponse.json()
    expect(createResponse.status()).toBe(StatusCodes.OK)

    const testProductUpdate: ProductUpdateDTO = {
      name: 'sabtest-update',
      price: 1000,
    }
    const updateResponse = await request.put(`${BaseEndpointURL}/${createResponseBody.id}`, {
      headers: AUTH,
      data: testProductUpdate,
    })
    expect(updateResponse.status()).toBe(StatusCodes.OK)

    const searchResponse = await request.get(`${BaseEndpointURL}/${createResponseBody.id}`, {
      headers: AUTH,
    })
    const searchResponseBody: ProductResponseDTO = await searchResponse.json()
    expect(searchResponseBody.name).toBe('sabtest-update')
    expect(searchResponseBody.price).toBe(1000)
  })

  test('GET /products/{id} - invalid API key', async ({ request }) => {
    const testProductCreate: ProductRequestDTO = {
      name: 'new_product',
      price: 999,
    }
    const createResponse = await request.post(BaseEndpointURL, {
      headers: AUTH,
      data: testProductCreate,
    })
    const createResponseBody: ProductResponseDTO = await createResponse.json()
    expect(createResponse.status()).toBe(StatusCodes.OK)

    const searchResponse = await request.get(`${BaseEndpointURL}/${createResponseBody.id}`, {
      headers: { 'X-API-Key': 'my-invalid-api-key' },
    })
    expect(searchResponse.status()).toBe(StatusCodes.UNAUTHORIZED)
  })

  test('GET /products/{id} - non existing product', async ({ request }) => {
    const searchResponse = await request.get(`${BaseEndpointURL}/${0}`, {
      headers: AUTH,
    })

    const responseText = await searchResponse.text()
    expect(searchResponse.status()).toBe(StatusCodes.BAD_REQUEST)
    expect(responseText).toContain('Product not found with id')
  })
})
