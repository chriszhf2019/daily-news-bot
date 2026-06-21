import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { userApi } from '../api/news.js'

/**
 * 用户/应用设置
 *
 * - deepseekApiKey / deepseekEndpoint = 用户自备的 API Key
 * - useProxy = 推荐使用，把请求交给自建后端 (/api/analysis/analyze) 代理
 * - useMockOnFallback = 当后端新闻接口不可达时自动展示示例新闻
 */

const DEFAULTS = {
  deepseekApiKey: '',
  deepseekEndpoint: 'https://api.deepseek.com/v1',
  useProxy: true,
  useMockOnFallback: true
}

const useSettingsStore = create(
  persist(
    function (set, get) {
      return {
        deepseekApiKey: DEFAULTS.deepseekApiKey,
        deepseekEndpoint: DEFAULTS.deepseekEndpoint,
        useProxy: DEFAULTS.useProxy,
        useMockOnFallback: DEFAULTS.useMockOnFallback,
        userId: null,
        visitorId: (function () {
          try {
            var id = localStorage.getItem('visitorId')
            if (!id) {
              id = 'visitor_' + Math.random().toString(36).slice(2, 11)
              localStorage.setItem('visitorId', id)
            }
            return id
          } catch (e) {
            return 'visitor_' + Math.random().toString(36).slice(2, 11)
          }
        })(),

        setConfig: function (config) {
          var next = Object.assign({}, get(), config)
          set(next)
          // 若后端可用，同步保存到用户设置
          var userId = get().userId
          if (userId && userApi && userApi.updateSettings) {
            userApi.updateSettings(userId, next).catch(function () { /* ignore */ })
          }
        },

        setDeepseekApiKey: function (v) { get().setConfig({ deepseekApiKey: v || '' }) },
        setDeepseekEndpoint: function (v) { get().setConfig({ deepseekEndpoint: v || 'https://api.deepseek.com/v1' }) },
        setUseProxy: function (v) { get().setConfig({ useProxy: !!v }) },
        setUseMockOnFallback: function (v) { get().setConfig({ useMockOnFallback: !!v }) },

        resetAll: function () {
          set(Object.assign({}, DEFAULTS, { userId: null }))
        },

        initUser: async function () {
          try {
            var resp = await userApi.init(get().visitorId)
            if (resp && resp.id) {
              set({ userId: resp.id })
              if (resp.settings) {
                set({
                  deepseekApiKey: resp.settings.deepseekApiKey || '',
                  deepseekEndpoint: resp.settings.deepseekEndpoint || 'https://api.deepseek.com/v1',
                  useProxy: resp.settings.useProxy !== false,
                  useMockOnFallback: resp.settings.useMockOnFallback !== false
                })
              }
              return resp
            }
            return null
          } catch (e) {
            return null
          }
        },

        getAnalysisConfig: function () {
          var s = get()
          return {
            deepseekApiKey: s.deepseekApiKey,
            deepseekEndpoint: s.deepseekEndpoint,
            useProxy: s.useProxy
          }
        }
      }
    },
    {
      name: 'newsbrief-settings',
      partialize: function (state) {
        return {
          deepseekApiKey: state.deepseekApiKey,
          deepseekEndpoint: state.deepseekEndpoint,
          useProxy: state.useProxy,
          useMockOnFallback: state.useMockOnFallback,
          userId: state.userId,
          visitorId: state.visitorId
        }
      }
    }
  )
)

export default useSettingsStore
