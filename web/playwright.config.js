import { defineConfig } from '@playwright/test'

/**
 * Playwright E2E 测试配置
 * - 三种分辨率模拟：移动端 390×844、平板 820×1180、桌面 1440×900
 * - 统一使用 Chromium（已安装 v1228），无需额外 webkit/firefox
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.js',
  timeout: 45000,
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    baseURL: 'http://127.0.0.1:4173'
  },

  webServer: {
    command: 'npx vite preview --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
    stdout: 'pipe',
    stderr: 'pipe'
  },

  projects: [
    {
      name: 'mobile (390 × 844) - 移动端',
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 3,
        browserName: 'chromium'
      }
    },
    {
      name: 'tablet (820 × 1180) - 平板',
      use: {
        viewport: { width: 820, height: 1180 },
        isMobile: false,
        hasTouch: true,
        deviceScaleFactor: 2,
        browserName: 'chromium'
      }
    },
    {
      name: 'desktop (1440 × 900) - 桌面',
      use: {
        viewport: { width: 1440, height: 900 },
        isMobile: false,
        hasTouch: false,
        deviceScaleFactor: 1,
        browserName: 'chromium'
      }
    }
  ]
})
