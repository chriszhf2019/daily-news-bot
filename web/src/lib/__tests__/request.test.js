import { describe, it, expect, beforeEach, vi } from 'vitest'
import http from '../request.js'

describe('lib/request.js', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    try { localStorage.removeItem('auth_token') } catch (e) { /* ignore */ }
  })

  it('GET 请求成功：自动解析 JSON', async () => {
    const payload = { ok: true, items: [{ id: 1 }] }
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify(payload))
    })))

    const res = await http.get('/news', { category: 'tech' })
    expect(res).toEqual(payload)
    const call = fetch.mock.calls[0]
    expect(call[0]).toContain('/news')
    expect(call[0]).toContain('category=tech')
  })

  it('POST 请求：发送 JSON body', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify({ id: 42 }))
    })))

    await http.post('/auth/login', { email: 'a@b.com', password: 'pwd' })
    const call = fetch.mock.calls[0]
    const init = call[1]
    expect(init.method).toBe('POST')
    expect(init.body).toContain('a@b.com')
    expect(init.headers['Content-Type']).toBe('application/json')
  })

  it('HTTP 非 2xx 抛出 RequestError 并含 status/message', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
      ok: false,
      status: 500,
      text: () => Promise.resolve(JSON.stringify({ message: 'DB down' }))
    })))

    await expect(http.get('/news')).rejects.toThrow(/DB down/)
  })

  it('自动注入 localStorage 中的 Bearer token', async () => {
    try { localStorage.setItem('auth_token', 'tk-123') } catch (e) {}
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
      ok: true,
      status: 200,
      text: () => Promise.resolve('"ok"')
    })))

    await http.get('/me')
    const init = fetch.mock.calls[0][1]
    expect(init.headers['Authorization']).toBe('Bearer tk-123')
  })

  it('网络失败（fetch reject）抛错', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('network off'))))
    await expect(http.get('/x')).rejects.toThrow(/network/)
  })

  it('PUT / DELETE 方法可用', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
      ok: true,
      status: 200,
      text: () => Promise.resolve('"done"')
    })))
    const putRes = await http.put('/a', { v: 1 })
    expect(putRes).toBe('done')
    await http.delete('/a', { v: 2 })
    expect(fetch.mock.calls.length).toBe(2)
    expect(fetch.mock.calls[1][1].method).toBe('DELETE')
  })
})
