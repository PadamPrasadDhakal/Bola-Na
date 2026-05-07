import React from 'react'
import Image from 'next/image'
import { cn } from '@/utils/helpers'
import { Download, X } from 'lucide-react'

interface MediaPreviewProps {
  type: 'image' | 'video' | 'file'
  url: string
  name?: string
  onRemove?: () => void
  className?: string
}

export function MediaPreview({ type, url, name, onRemove, className }: MediaPreviewProps) {
  return (
    <div className={cn('relative group', className)}>
      {type === 'image' && (
        <img src={url} alt={name} className="rounded-lg max-h-48 object-cover" />
      )}

      {type === 'video' && (
        <video src={url} className="rounded-lg max-h-48 object-cover" controls />
      )}

      {type === 'file' && (
        <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
            📄
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{name || 'File'}</p>
          </div>
          <a
            href={url}
            download
            className="text-blue-500 hover:text-blue-600 transition-colors"
          >
            <Download size={18} />
          </a>
        </div>
      )}

      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}
