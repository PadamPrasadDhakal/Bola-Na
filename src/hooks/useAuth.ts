import { useEffect } from 'react'
import { useAuthStore } from '@/store'
import { authService } from '@/services/supabaseService'
import toast from 'react-hot-toast'

export function useAuth() {
  const { user, token, setUser, logout } = useAuthStore()

  useEffect(() => {
    if (user) {
      // Update user online status
      authService.updateUserStatus(user.id, true).catch(console.error)

      const handleBeforeUnload = () => {
        authService.updateUserStatus(user.id, false).catch(console.error)
      }

      window.addEventListener('beforeunload', handleBeforeUnload)

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload)
        authService.updateUserStatus(user.id, false).catch(console.error)
      }
    }
  }, [user])

  return {
    user,
    token,
    isAuthenticated: !!user && !!token,
    setUser,
    logout: async () => {
      if (user) {
        await authService.updateUserStatus(user.id, false)
      }
      logout()
      toast.success('Logged out successfully')
    },
  }
}

export function useAuthRedirect() {
  const { user } = useAuthStore()

  useEffect(() => {
    if (!user) {
      window.location.href = '/login'
    }
  }, [user])

  return user
}
