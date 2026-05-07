'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store'
import { authService } from '@/services/supabaseService'
import { useRouter } from 'next/navigation'
import { LogIn } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const { setUser } = useAuthStore()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validation
    if (!username.trim()) {
      setErrors((prev) => ({ ...prev, username: 'Username is required' }))
      return
    }

    if (!password) {
      setErrors((prev) => ({ ...prev, password: 'Password is required' }))
      return
    }

    setIsLoading(true)

    try {
      const user = await authService.login(username, password)

      // Generate a token and set user
      // In production, this should be done on the backend
      const token = `token_${Date.now()}`

      setUser(user, token)
      toast.success(`Welcome, ${user.display_name}!`)

      router.push('/chat')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed'
      toast.error(message)
      setErrors({ username: 'Invalid credentials' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              💬
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Bola Na</h1>
          <p className="text-gray-600 mt-2">Private realtime chat for friends</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <Input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={errors.username}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full"
          >
            <LogIn size={20} className="mr-2" />
            Sign In
          </Button>
        </form>

        {/* Footer Note */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-gray-600 text-center">
            <span className="font-semibold">Demo Note:</span> Contact your admin for login credentials. This is a private chat platform for friends only.
          </p>
        </div>
      </div>
    </div>
  )
}
