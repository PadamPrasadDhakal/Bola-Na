'use client'

import React from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
          {/* Settings content will be added here */}
        </div>
      </div>
    </ProtectedRoute>
  )
}
