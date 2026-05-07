'use client'

import React, { useRef, useState } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuthStore } from '@/store'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { authService, storageService } from '@/services/supabaseService'
import { getInitials } from '@/utils/helpers'
import toast from 'react-hot-toast'
import { Camera } from 'lucide-react'

export default function ProfilePage() {
  const { user, token, setUser } = useAuthStore()
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return

    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be under 5MB')
      return
    }

    try {
      setIsSaving(true)
      const uploadedUrl = await storageService.uploadFile(file)
      await authService.updateUserProfile(user.id, {
        profile_picture: uploadedUrl,
      })

      setUser(
        {
          ...user,
          profile_picture: uploadedUrl,
        },
        token || undefined
      )

      toast.success('Profile picture updated')
    } catch (error) {
      console.error('Failed to update profile picture:', error)
      toast.error('Failed to update profile picture')
    } finally {
      setIsSaving(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <Avatar
                src={user?.profile_picture || ''}
                initials={getInitials(user?.display_name || 'User')}
                size="xl"
              />
              <div>
                <p className="text-xl font-semibold text-gray-900">{user?.display_name}</p>
                <p className="text-sm text-gray-600">@{user?.username}</p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                className="hidden"
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                isLoading={isSaving}
              >
                <Camera size={18} className="mr-2" />
                Upload Profile Image
              </Button>
              <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
