import { test, describe, expect } from 'bun:test'
import { FetchInstance } from '..'

describe('Woolworths fetchInstance', () => {
  test('Creates instance with cookies for Woolworths', async () => {
    const instance = FetchInstance
    expect(instance).toBeTruthy()
  })
})