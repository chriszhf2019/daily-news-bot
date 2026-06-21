import { describe, it, expect } from 'vitest'
import { validateAnalysisInput, buildPrompt, parseJsonResponse } from '../deepseekPrompt.js'

describe('api/deepseekPrompt.js', () => {
  const sampleNews = {
    id: 'n1',
    title: '央行降准',
    summary: '释放流动性',
    content: '详细内容…',
    source: 'X',
    category: 'finance',
    url: 'https://example.com',
    published_at: '2025-01-01T00:00:00.000Z',
    tags: ['policy']
  }

  describe('validateAnalysisInput', () => {
    it('拒绝空 newsItem', () => {
      const r = validateAnalysisInput(null)
      expect(r.error).toBeTruthy()
    })

    it('拒绝空白的新闻', () => {
      const r = validateAnalysisInput({ newsItem: { title: '', summary: '', content: '' } })
      expect(r.error).toBeTruthy()
    })

    it('拒绝未知分析类型', () => {
      const r = validateAnalysisInput({ type: 'whatever', newsItem: sampleNews })
      expect(r.error).toMatch(/不支持/)
    })

    it('seven-elements / relevance / deep-exploration 三种类型通过', () => {
      for (const t of ['seven-elements', 'relevance', 'deep-exploration']) {
        const r = validateAnalysisInput({ type: t, newsItem: sampleNews })
        expect(r.error).toBeFalsy()
        expect(r.value.newsItem.title).toBe('央行降准')
      }
    })
  })

  describe('buildPrompt', () => {
    it('为 seven-elements 返回字符串 prompt 与 outputShape', () => {
      const built = buildPrompt({ type: 'seven-elements', newsItem: sampleNews })
      expect(typeof built.prompt).toBe('string')
      expect(built.prompt.length).toBeGreaterThan(20)
      expect(built.prompt).toContain('央行降准')
      expect(built.outputShape).toBeTruthy()
      expect(built.outputShape.who).toBe('')
      expect(built.outputShape.impact).toBe('')
    })

    it('为 relevance 注入 persona', () => {
      const built = buildPrompt({ type: 'relevance', newsItem: sampleNews, persona: 'investor' })
      expect(built.prompt).toMatch(/投资人|投资/)
      expect(built.outputShape.risks).toBe('')
      expect(built.outputShape.opportunities).toBe('')
    })

    it('为 deep-exploration 返回 timeline / stakeholders 等字段', () => {
      const built = buildPrompt({ type: 'deep-exploration', newsItem: sampleNews })
      expect(built.outputShape.timeline).toBe('')
      expect(built.outputShape.stakeholders).toBe('')
      expect(built.outputShape.deeper).toBe('')
    })
  })

  describe('parseJsonResponse', () => {
    it('普通 JSON 可解析', () => {
      const res = parseJsonResponse('{"a":1,"b":"x"}')
      expect(res).toEqual({ a: 1, b: 'x' })
    })

    it('去除 markdown code fence 包裹', () => {
      const res = parseJsonResponse('```json\n{"ok":true}\n```')
      expect(res).toEqual({ ok: true })
    })

    it('从文本片段中抽取第一个完整 JSON', () => {
      const res = parseJsonResponse('一些前置文本\n{"nested":"yes"}\n后续文本')
      expect(res).toEqual({ nested: 'yes' })
    })

    it('与 outputShape 合并后缺失字段得到默认值', () => {
      const res = parseJsonResponse('{"who":"央行","what":"降准"}', {
        shape: { who: '', what: '', when: '', where: '', why: '', how: '', impact: '' }
      })
      expect(res.who).toBe('央行')
      expect(res.what).toBe('降准')
      expect(res.impact).toBe('')
      expect(res.why).toBe('')
    })

    it('完全乱码输入抛错', () => {
      expect(() => parseJsonResponse('not json at all')).toThrow()
    })

    it('空内容抛错', () => {
      expect(() => parseJsonResponse('')).toThrow()
    })
  })
})
