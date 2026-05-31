/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 审计板块 - 深海蓝
        audit: {
          bg: '#0F172A',
          accent: '#10B981',
          text: '#E2E8F0'
        },
        // 顾问板块 - 深靛蓝
        advisor: {
          bg: '#1E1B4B',
          accent: '#A855F7',
          text: '#E2E8F0'
        },
        // 探索板块 - 极致黑
        explore: {
          bg: '#020617',
          accent: '#B45309',
          text: '#E2E8F0'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
