import { expect, test } from '@playwright/test'
import { LoginDTO } from '../src/dto/LoginDTO'
import { z } from 'zod'

test.describe('Login API Tests', () => {
  const BaseEndpointURL = 'https://backend.tallinn-learning.ee/login/student'

  test('wrong login', async ({ request }) => {
    const loginResponse = await request.post(BaseEndpointURL, {
      data: LoginDTO.generateIncorrectPair(),
    })
    expect(loginResponse.status()).toBe(401)
  })
  test('correct login', async ({ request }) => {
    console.log(LoginDTO.generateCorrectPair())
    const loginResponse = await request.post(BaseEndpointURL, {
      data: LoginDTO.generateCorrectPair(),
    })
    const token = await loginResponse.text()
    expect(loginResponse.status()).toBe(200)
    expect(token.length).toBeGreaterThan(0)
  })
})
export const LoginSchema =  z.string()

export type Login = z.infer<typeof LoginSchema>
