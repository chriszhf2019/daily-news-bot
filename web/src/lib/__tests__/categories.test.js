import { describe, it, expect } from 'vitest'
import { CATEGORIES, resolveCategory, listCategoryFilters } from '../categories.js'

describe('categories.js', () => {
  it('CATEGORIES 包含科技 / 财经 / 国际 / 体育 / AI / 自定义', () => {
    expect(CATEGORIES.length).toBeGreaterThanOrEqual(6)
    const keys = CATEGORIES.map(c => c.key)
    expect(keys).toEqual(expect.arrayContaining(['tech', 'finance', 'international', 'sports', 'AI', 'custom']))
  })

  it('每个分类都有 label / icon / accent', () => {
    for (const c of CATEGORIES) {
      expect(c.label).toBeTruthy()
      expect(c.icon).toBeTruthy()
      expect(c.accent).toBeTruthy()
    }
  })

  it('resolveCategory 按 key 匹配', () => {
    expect(resolveCategory('tech').key).toBe('tech')
    expect(resolveCategory('finance').key).toBe('finance')
    expect(resolveCategory('AI').key).toBe('AI')
  })

  it('resolveCategory 大小写不敏感', () => {
    expect(resolveCategory('TECH').key).toBe('tech')
    expect(resolveCategory('Tech').key).toBe('tech')
  })

  it('resolveCategory 对空值与未知值兜底', () => {
    expect(resolveCategory('').key).toBeTruthy()
    expect(resolveCategory(null).key).toBeTruthy()
    expect(resolveCategory('unknown-category').key).toBeTruthy()
  })

  it('listCategoryFilters 第 1 项是"全部"，之后是 CATEGORIES', () => {
    const filters = listCategoryFilters()
    expect(filters[0].key).toBe('all')
    expect(filters[0].label).toMatch(/全部|全/)
    expect(filters.length).toBe(1 + CATEGORIES.length)
  })
})
