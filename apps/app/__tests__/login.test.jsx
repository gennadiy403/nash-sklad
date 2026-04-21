import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Login from '../app/(auth)/login/page'

describe('Login page smoke', () => {
  it('renders the Войти heading', () => {
    render(<Login />)
    expect(screen.getByText(/Войти/i)).toBeInTheDocument()
  })
})
