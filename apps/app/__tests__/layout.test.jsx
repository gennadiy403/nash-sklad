import { describe, it, expect } from 'vitest'
import RootLayout from '../app/layout'

describe('RootLayout smoke', () => {
  it('is exported as a function component', () => {
    expect(typeof RootLayout).toBe('function')
  })
})
