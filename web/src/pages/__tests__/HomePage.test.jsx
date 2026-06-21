import { describe, it, expect } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import HomePage from '../HomePage.jsx'
import useNewsStore from '../../store/news.js'

const SAMPLE_NEWS = [
  { id: 'h1', title: '重要科技新闻', summary: '摘要 摘要', content: '正文', source: 'X', published_at: new Date().toISOString(), category: 'tech', importance: 90, impactScore: 9, tags: ['科技'] },
  { id: 'h2', title: '财经大事', summary: '央行动作', content: '…', source: 'Y', published_at: new Date().toISOString(), category: 'finance', importance: 70, impactScore: 7, tags: ['财经'] },
  { id: 'h3', title: '体育事件', summary: '…', content: '…', source: 'Z', published_at: new Date().toISOString(), category: 'sports', importance: 40, impactScore: 3, tags: ['体育'] }
]

function renderHome() {
  return render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  )
}

describe('pages/HomePage.jsx', () => {
  it('初始渲染：顶部 Banner 与统计数字', () => {
    act(() => useNewsStore.setState({
      newsData: SAMPLE_NEWS,
      currentCategory: 'all',
      source: 'backend',
      loading: false,
      favorites: new Set()
    }))
    renderHome()
    expect(screen.getByText(/点透世界/)).toBeTruthy()
    expect(screen.getByText('↻')).toBeTruthy()
  })

  it('分类筛选条：展示 全部 / 科技 / 财经 按钮', () => {
    act(() => useNewsStore.setState({
      newsData: SAMPLE_NEWS, currentCategory: 'all', source: 'backend', loading: false, favorites: new Set()
    }))
    renderHome()
    expect(screen.getAllByText(/全部/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/科技/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/财经/).length).toBeGreaterThan(0)
  })

  it('渲染新闻列表：至少显示 1 条新闻标题', () => {
    act(() => useNewsStore.setState({
      newsData: SAMPLE_NEWS, currentCategory: 'all', source: 'backend', loading: false, favorites: new Set()
    }))
    renderHome()
    const matches = screen.getAllByText('重要科技新闻')
    expect(matches.length).toBeGreaterThan(0)
  })
})
