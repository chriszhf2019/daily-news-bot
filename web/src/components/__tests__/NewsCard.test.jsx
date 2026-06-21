import { describe, it, expect, beforeEach } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import NewsCard from '../NewsCard.jsx'
import useNewsStore from '../../store/news.js'

const NEWS = {
  id: 'c1',
  title: '示例新闻标题',
  summary: '摘要内容摘要内容摘要内容',
  content: '完整正文',
  source: 'NewsBrief',
  published_at: new Date().toISOString(),
  category: 'tech',
  importance: 75,
  impactScore: 8,
  tags: ['政策', '科技']
}

function renderCard(news = NEWS, compact = false) {
  return render(
    <BrowserRouter>
      <NewsCard news={news} compact={compact} />
    </BrowserRouter>
  )
}

describe('components/NewsCard.jsx', () => {
  beforeEach(() => {
    act(() => useNewsStore.setState({ favorites: new Set() }))
  })

  it('渲染标题 / 摘要 / 来源 / 分类标签', () => {
    renderCard()
    expect(screen.getByText('示例新闻标题')).toBeTruthy()
    expect(screen.getByText(/摘要内容/)).toBeTruthy()
    expect(screen.getByText(/NewsBrief/)).toBeTruthy()
    expect(screen.getByText('#科技')).toBeTruthy()
    expect(screen.getByText('#政策')).toBeTruthy()
  })

  it('标题是可点击的 Link（跳转到 /seven-elements/:id）', () => {
    renderCard()
    const link = screen.getByText('示例新闻标题').closest('a')
    expect(link).toBeTruthy()
    expect(link.getAttribute('href')).toContain('/seven-elements/c1')
  })

  it('点击收藏按钮切换状态', () => {
    renderCard()
    // 收藏按钮文本是 "收藏" 或图标按钮（带 aria-label）
    const starBtn = screen.getByLabelText('收藏') || screen.getByText('收藏').closest('button')
    expect(starBtn).toBeTruthy()
    fireEvent.click(starBtn)
    expect(useNewsStore.getState().favorites.has('c1')).toBe(true)
  })

  it('存在 "七要素" 跳转按钮', () => {
    renderCard()
    const analyzeBtn = screen.getByText(/七要素/)
    expect(analyzeBtn).toBeTruthy()
  })
})
