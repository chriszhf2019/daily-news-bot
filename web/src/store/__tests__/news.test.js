import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import useNewsStore from '../news.js'

const SAMPLE = {
  id: '1',
  title: '央行降准',
  summary: '释放流动性',
  content: '正文',
  source: 'X',
  published_at: new Date().toISOString(),
  category: 'finance',
  importance: 80,
  impactScore: 9,
  tags: ['policy']
}

function fakeBackend(list) {
  vi.stubGlobal('fetch', vi.fn((url) => {
    if (String(url).includes('/news/refresh')) {
      return Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve('"ok"') })
    }
    return Promise.resolve({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify(list))
    })
  }))
}

function failingBackend() {
  vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('502 bad gateway'))))
}

describe('store/news.js', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    act(() => {
      useNewsStore.setState({
        newsData: [],
        currentCategory: 'all',
        loading: false,
        error: null,
        source: null,
        refreshAt: null,
        favorites: new Set()
      })
    })
  })

  it('初始状态：空列表、分类 all、无 loading', () => {
    const { result } = renderHook(() => useNewsStore())
    expect(result.current.newsData).toEqual([])
    expect(result.current.currentCategory).toBe('all')
    expect(result.current.loading).toBe(false)
  })

  it('setCurrentCategory 切换分类', () => {
    const { result } = renderHook(() => useNewsStore())
    act(() => result.current.setCurrentCategory('tech'))
    expect(result.current.currentCategory).toBe('tech')
  })

  it('setNewsData：字段规范化（重要性、分类 key）', () => {
    const { result } = renderHook(() => useNewsStore())
    act(() => result.current.setNewsData([SAMPLE]))
    const items = result.current.newsData
    expect(items.length).toBe(1)
    expect(items[0].title).toBe('央行降准')
    expect(items[0].category).toBe('finance')
    expect(items[0].impactScore).toBeGreaterThan(0)
  })

  it('getFilteredNews：按 currentCategory 过滤', () => {
    const { result } = renderHook(() => useNewsStore())
    act(() => {
      result.current.setNewsData([
        SAMPLE,
        { ...SAMPLE, id: '2', category: 'tech', title: 'Tech News' }
      ])
    })
    expect(result.current.getFilteredNews().length).toBe(2)
    act(() => result.current.setCurrentCategory('tech'))
    const filtered = result.current.getFilteredNews()
    expect(filtered.length).toBe(1)
    expect(filtered[0].category).toBe('tech')
  })

  it('getStats：统计总数、高影响、收藏数', () => {
    const { result } = renderHook(() => useNewsStore())
    act(() => {
      result.current.setNewsData([
        { ...SAMPLE, id: '1', importance: 90, impactScore: 9 },
        { ...SAMPLE, id: '2', importance: 30, impactScore: 3 }
      ])
      result.current.toggleFavorite('1')
    })
    const stats = result.current.getStats()
    expect(stats.total).toBe(2)
    expect(stats.highImpact).toBeGreaterThanOrEqual(1)
    expect(stats.favorites).toBe(1)
  })

  it('toggleFavorite：可重复切换', () => {
    const { result } = renderHook(() => useNewsStore())
    act(() => result.current.setNewsData([SAMPLE]))
    act(() => result.current.toggleFavorite('1'))
    expect(result.current.favorites.has('1')).toBe(true)
    act(() => result.current.toggleFavorite('1'))
    expect(result.current.favorites.has('1')).toBe(false)
  })

  it('findNews：按 id 精确查找 / 未找到返回 null', () => {
    const { result } = renderHook(() => useNewsStore())
    act(() => result.current.setNewsData([SAMPLE, { ...SAMPLE, id: '2' }]))
    expect(result.current.findNews('2').id).toBe('2')
    expect(result.current.findNews('nope')).toBe(null)
  })

  it('fetchNews：成功时 source=backend，请求 URL 带参数', async () => {
    fakeBackend([SAMPLE, { ...SAMPLE, id: '2', title: '第二条' }])
    const { result } = renderHook(() => useNewsStore())
    await act(async () => {
      const ok = await result.current.fetchNews({ category: 'tech' })
      expect(ok).toBe(true)
    })
    expect(result.current.source).toBe('backend')
    expect(result.current.newsData.length).toBe(2)
    // 验证 fetch 被调用
    expect(fetch.mock.calls.length).toBeGreaterThan(0)
    const calledUrl = String(fetch.mock.calls[0][0])
    expect(calledUrl).toContain('/news')
  })

  it('fetchNews：后端不可达时自动降级到 mock 数据', async () => {
    failingBackend()
    const { result } = renderHook(() => useNewsStore())
    await act(async () => {
      const ok = await result.current.fetchNews()
      expect(ok).toBe(true)
    })
    expect(result.current.source).toBe('mock')
    expect(result.current.newsData.length).toBeGreaterThan(0)
  })

  it('refreshNews：后端不可达时也降级', async () => {
    failingBackend()
    const { result } = renderHook(() => useNewsStore())
    await act(async () => {
      await result.current.refreshNews()
    })
    expect(result.current.source).toBe('mock')
    expect(result.current.newsData.length).toBeGreaterThan(0)
  })
})
