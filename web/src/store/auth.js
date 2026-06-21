import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import authApi from '../api/auth.js'

/**
 * 认证状态管理
 *
 * state: user / token / authLoading
 * actions: login, register, logout, checkAuth, updateProfile
 * persist: user & token 会自动写入 localStorage
 */

const useAuthStore = create(
  persist(
    function (set, get) {
      return {
        user: null,
        token: null,
        authLoading: false,
        authError: null,

        setAuth: function (user, token) {
          if (token) {
            try { localStorage.setItem('auth_token', token) } catch (e) { /* noop */ }
          }
          set({ user: user, token: token })
        },

        clearAuth: function () {
          try { localStorage.removeItem('auth_token') } catch (e) { /* noop */ }
          set({ user: null, token: null })
        },

        checkAuth: async function () {
          const token = get().token
          if (!token) return null
          try {
            const user = await authApi.me()
            set({ user: user })
            return user
          } catch (e) {
            get().clearAuth()
            return null
          }
        },

        login: async function (email, password) {
          set({ authLoading: true, authError: null })
          try {
            const resp = await authApi.login(email, password)
            const user = resp && resp.user ? resp.user : (resp || { email: email })
            const token = resp && resp.token ? resp.token : (get().token || '')
            set({ user: user, token: token, authLoading: false })
            if (token) {
              try { localStorage.setItem('auth_token', token) } catch (e) { /* noop */ }
            }
            return true
          } catch (err) {
            set({ authLoading: false, authError: err.message || '登录失败' })
            throw err
          }
        },

        register: async function (email, password, name) {
          set({ authLoading: true, authError: null })
          try {
            const resp = await authApi.register(email, password, name)
            const user = resp && resp.user ? resp.user : (resp || { email: email, name: name })
            const token = resp && resp.token ? resp.token : (get().token || '')
            set({ user: user, token: token, authLoading: false })
            if (token) {
              try { localStorage.setItem('auth_token', token) } catch (e) { /* noop */ }
            }
            return true
          } catch (err) {
            set({ authLoading: false, authError: err.message || '注册失败' })
            throw err
          }
        },

        logout: function () { get().clearAuth() },

        updateProfile: async function (data) {
          const updated = await authApi.updateProfile(data)
          set({ user: updated })
          return updated
        }
      }
    },
    {
      name: 'newsbrief-auth',
      partialize: function (state) {
        return { user: state.user, token: state.token }
      }
    }
  )
)

export default useAuthStore
