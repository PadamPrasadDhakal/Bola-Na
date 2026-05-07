import React, { useState } from 'react'
import { cn } from '@/utils/helpers'
import { X } from 'lucide-react'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function Dialog({ open, onOpenChange, title, children, footer }: DialogProps) {
  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-md w-full mx-4 z-50 animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4">{children}</div>
        {footer && <div className="border-t border-gray-200 p-4">{footer}</div>}
      </div>
    </>
  )
}
