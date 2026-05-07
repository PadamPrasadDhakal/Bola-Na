'use client'

import React from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>
          {/* Profile content will be added here */}
        </div>
      </div>
    </ProtectedRoute>
  )
}
