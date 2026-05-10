import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toast } from 'sonner'
import apiService from '../services/api.js'

export const useAuthStore = create(
  persist(
    (set) => ({
      accessToken: null,
      isAuthenticated: false,
      user: null,
      loading: false,

      /**
       * Register new user (buyer or seller)
       */
      register: async ({ email, password, fullname, role }) => {
        try {
          set({ loading: true })
          const response = await apiService.auth.register({
            email,
            password,
            fullname,
            role,
          })

          toast.success('Đăng ký thành công!')
          return response
        } catch (error) {
          console.error('Registration error:', error)
          const errorMessage = error.details
            ? Object.values(error.details).join(', ')
            : error.message || 'Đăng ký thất bại. Vui lòng thử lại.'
          toast.error(errorMessage)
          throw error
        } finally {
          set({ loading: false })
        }
      },

      /**
       * Login user
       */
      login: async ({ email, password }) => {
        try {
          set({ loading: true })
          const response = await apiService.auth.login({ email, password })

          set({
            accessToken: response.data.accessToken,
            isAuthenticated: true,
            user: response.data.user,
          })

          return response
        } catch (error) {
          console.error('Login error:', error)
          toast.error(
            error.message ||
              'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.',
          )
          throw error
        } finally {
          set({ loading: false })
        }
      },

      /**
       * Logout user
       */
      logout: async () => {
        try {
          await apiService.auth.logout()
          set({
            accessToken: null,
            isAuthenticated: false,
            user: null,
          })
          toast.success('Đăng xuất thành công.')
        } catch (error) {
          console.error('Logout error:', error)
          set({
            accessToken: null,
            isAuthenticated: false,
            user: null,
          })
        }
      },

      /**
       * Refresh access token (refreshToken lấy từ httpOnly cookie)
       */
      refreshAccessToken: async () => {
        try {
          const response = await apiService.auth.refreshToken()

          set({
            accessToken: response.data.accessToken,
            user: response.data.user,
            isAuthenticated: true,
          })

          return response.data.accessToken
        } catch (error) {
          console.error('Refresh token error:', error)
          set({
            accessToken: null,
            isAuthenticated: false,
            user: null,
          })
          throw error
        }
      },

      /**
       * Set user data
       */
      setUser: (user) => set({ user }),

      /**
       * Set authentication data
       */
      setAuth: (accessToken, user) =>
        set({ accessToken, user, isAuthenticated: true }),
    }),

    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    },
  ),
)
