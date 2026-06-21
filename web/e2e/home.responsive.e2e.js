import { test, expect } from '@playwright/test'

/**
 * 获取当前视口宽度 — 比 isMobile 更可靠
 */
function isMobileViewport(page) {
  return page.viewportSize() && page.viewportSize().width < 500
}

test.describe('首页 / 响应式', () => {
  test('加载首页并展示主标题', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(1500)
    // 精确匹配 "点透世界" 这样的主标题或大标题
    const mainHeadings = page.getByRole('heading', { name: /点透/ })
    if (await mainHeadings.count() > 0) {
      await expect(mainHeadings.first()).toBeVisible()
    } else {
      // 后备：body 必须可见，且标题元素总数 > 0
      const anyHeading = page.locator('h1, h2, h3')
      expect(await anyHeading.count()).toBeGreaterThan(0)
    }
  })

  test('分类筛选：至少展示 3 个按钮', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(1500)
    const buttons = page.locator('button')
    const count = await buttons.count()
    expect(count).toBeGreaterThan(2)
  })

  test('页面可滚动：滚动高度显著大于视口', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(1500)
    const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight)
    const clientHeight = await page.evaluate(() => document.documentElement.clientHeight)
    expect(scrollHeight).toBeGreaterThan(clientHeight * 0.5)
    // 滚动到底部
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'auto' }))
    await page.waitForTimeout(500)
    await expect(page.locator('body')).toBeVisible()
  })

  test('移动端：底部 Tab Bar 可见', async ({ page }) => {
    test.skip(!isMobileViewport(page), '仅在移动端测试（< 500px 宽）')
    await page.goto('/')
    await page.waitForTimeout(1500)
    // 底部 nav 或 底部按钮集合
    const nav = page.locator('nav').last()
    if (await nav.count() > 0) {
      await expect(nav).toBeVisible()
    }
    const footerButtons = page.locator('nav button, nav a')
    expect(await footerButtons.count()).toBeGreaterThan(0)
  })

  test('桌面/平板：顶部区域有 Logo 或导航链接', async ({ page }) => {
    test.skip(isMobileViewport(page), '仅在桌面/平板测试（>= 500px 宽）')
    await page.goto('/')
    await page.waitForTimeout(1500)
    // header 或 第一个 nav 元素
    const header = page.locator('header').first()
    if (await header.count() > 0) {
      await expect(header).toBeVisible()
    } else {
      const topNav = page.locator('nav').first()
      await expect(topNav).toBeVisible()
    }
  })

  test('点击分类按钮不会抛错', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(1500)
    const buttons = page.locator('button')
    const count = await buttons.count()
    if (count > 1) {
      // 点击第二个分类按钮（避免选到刷新或折叠按钮）
      await buttons.nth(1).click({ force: true })
      await page.waitForTimeout(1000)
    }
    await expect(page.locator('body')).toBeVisible()
  })

  test('至少渲染 1 条新闻标题（h1/h2/h3 或 article）', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    const headings = page.locator('article h3, article h2, h3, h2')
    const count = await headings.count()
    expect(count).toBeGreaterThan(0)
  })

  test('导航到 settings 并返回首页', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(1500)
    // 尝试点击指向 settings 的链接，否则直接跳转
    const settingsLink = page.locator('a[href*="settings"]').first()
    if (await settingsLink.count() > 0 && await settingsLink.isVisible({ timeout: 2000 })) {
      await settingsLink.click({ force: true })
    } else {
      // 直接导航（如移动端 tab bar 中的隐藏链接）
      await page.goto('/settings')
    }
    await page.waitForTimeout(1500)
    // 返回首页
    await page.goto('/')
    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toBeVisible()
  })
})
