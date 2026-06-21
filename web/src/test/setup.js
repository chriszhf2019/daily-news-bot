import '@testing-library/jest-dom/vitest'
// 禁止在测试期间访问真实网络
if (typeof globalThis.fetch === 'undefined') {
  // jsdom 自带 fetch
}
