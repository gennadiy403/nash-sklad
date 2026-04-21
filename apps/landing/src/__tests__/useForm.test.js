import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useForm } from '../form/hooks/useForm'

describe('useForm.canProceed', () => {
  it('returns false when required questions unanswered on step 0', () => {
    const { result } = renderHook(() => useForm())
    expect(result.current.canProceed()).toBe(false)
  })
})

describe('useForm.toggleMulti', () => {
  it('toggles value in and out of the array', () => {
    const { result } = renderHook(() => useForm())
    act(() => { result.current.toggleMulti('platforms', 'wb') })
    expect(result.current.answers.platforms).toEqual(['wb'])
    act(() => { result.current.toggleMulti('platforms', 'wb') })
    expect(result.current.answers.platforms).toEqual([])
  })

  it('respects maxSelect cap', () => {
    const { result } = renderHook(() => useForm())
    act(() => { result.current.toggleMulti('x', 'a', 2) })
    act(() => { result.current.toggleMulti('x', 'b', 2) })
    act(() => { result.current.toggleMulti('x', 'c', 2) })
    expect(result.current.answers.x).toEqual(['a', 'b'])
  })
})
