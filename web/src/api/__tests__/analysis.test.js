import { describe, it, expect, beforeEach, vi } from 'vitest'
import { analysisApi, resolveAnalysisMode } from '../analysis.js'

const NEWS = {
  id: '1',
  title: '央行降准',
  summary: '释放流动性',
  content: '详细内容',
  source: 'X',
  category: 'finance',
  url: '',
  published_at: new Date().toISOString(),
  tags: ['policy']
}

describe('api/analysis.js', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('resolveAnalysisMode：默认走代理', () => {
    expect(resolveAnalysisMode({})).toBe('proxy')
    expect(resolveAnalysisMode({ useProxy: true })).toBe('proxy')
  })

  it('resolveAnalysisMode：未启用代理且有 API Key 时走 direct', () => {
    expect(resolveAnalysisMode({ useProxy: false, deepseekApiKey: 'sk-abc' })).toBe('direct')
  })

  it('analysisApi.analyze（代理模式）：调 /analysis/analyze 并返回 JSON', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify({
        who: '央行',
        what: '降准',
        when: '本周',
        where: '国内',
        why: '稳增长',
        how: 'MLF + 公开市场操作',
        impact: '短期利好债市'
      }))
    })))
    const result = await analysisApi.analyze({ type: 'seven-elements', newsItem: NEWS })
    expect(fetch.mock.calls.length).toBe(1)
    const url = String(fetch.mock.calls[0][0])
    expect(url).toContain('/analysis/analyze')
    expect(result).toBeTruthy()
  })

  it('analysisApi.analyze：非法输入类型立即拒绝', async () => {
    await expect(analysisApi.analyze({ type: 'unsupported', newsItem: NEWS })).rejects.toThrow()
  })

  it('analysisApi.analyze：代理模式 HTTP 失败抛错', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
      ok: false,
      status: 503,
      text: () => Promise.resolve('service unavailable')
    })))
    await expect(analysisApi.analyze({ type: 'seven-elements', newsItem: NEWS })).rejects.toThrow()
  })
})
