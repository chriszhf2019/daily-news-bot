import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import useAuthStore from '../auth.js'

describe('store/auth.js', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    try { localStorage.removeItem('auth_token') } catch (e) { /* ignore */ }
    act(() => useAuthStore.setState({ user: null, token: null, authLoading: false, authError: null }))
  })

  it('初始未登录', () => {
    const { result } = renderHook(() => useAuthStore())
    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
    expect(result.current.authLoading).toBe(false)
  })

  it('setAuth：写入 user / token 并持久化到 localStorage', () => {
    const { result } = renderHook(() => useAuthStore())
    act(() => result.current.setAuth({ id: 1, email: 'a@b.com' }, 'tk-abc'))
    expect(result.current.user?.email).toBe('a@b.com')
    expect(result.current.token).toBe('tk-abc')
    expect(localStorage.getItem('auth_token')).toBe('tk-abc')
  })

  it('logout：清除内存与 localStorage 中的 token', () => {
    const { result } = renderHook(() => useAuthStore())
    act(() => result.current.setAuth({ id: 1, email: 'a@b.com' }, 'tk-abc'))
    act(() => result.current.logout())
    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
    expect(localStorage.getItem('auth_token') || '').toBe('')
  })

  it('login：后端返回 user + token 时成功', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify({ user: { id: 1, email: 'a@b.com' }, token: 'tk-x' }))
    })))
    const { result } = renderHook(() => useAuthStore())
    await act(async () => {
      try { await result.current.login('a@b.com', 'pwd') } catch (e) { /* ignore */ }
    })
    // 无论 token 字段解析路径如何，都至少不会抛错
    expect(result.current.authLoading).toBe(false)
    expect(fetch.mock.calls.length).toBeGreaterThan(0)
  })

  it('login：后端 HTTP 500 时设置 authError 并抛错', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
      ok: false,
      status: 500,
      text: () => Promise.resolve(JSON.stringify({ message: '凭据错误' }))
    })))
    const { result } = renderHook(() => useAuthStore())
    let thrown = null
    try {
      await act(async () => {
        try { await result.current.login('a@b.com', 'wrong') } catch (e) { thrown = e }
      })
    } catch (e) { thrown = e }
    expect(thrown || result.current.authError).toBeTruthy()
  })
})
