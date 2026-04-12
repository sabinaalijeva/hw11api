import { LoginDTO } from '../dto/LoginDTO'
import { APIRequestContext, APIResponse } from 'playwright'
import { OrderDTO } from '../dto/OrderDTO'

const AUTH_URL = 'https://backend.tallinn-learning.ee/login/student'
const ORDERS_URL = 'https://backend.tallinn-learning.ee/orders'

export async function getJwt(request: APIRequestContext): Promise<string> {
  const loginResponse = await request.post(AUTH_URL, {
    data: LoginDTO.generateCorrectPair(),
  })
  return await loginResponse.text()
}

export async function createOrder(request: APIRequestContext, token: string): Promise<APIResponse> {
  return request.post(ORDERS_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: OrderDTO.generateDefault(),
  })
}
