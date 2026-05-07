import React from 'react'
import { cn } from '@/utils/helpers'

interface AvatarProps {
  src?: string
  alt?: string
  initials?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
}

export function Avatar({ src, alt, initials, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn('rounded-full object-cover', sizeClasses[size], className)}
      />
    )
  }

  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-purple-500',
    'bg-pink-500',
  ]

  const colorIndex = initials
    ? initials.charCodeAt(0) % colors.length
    : Math.floor(Math.random() * colors.length)

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold text-white',
        sizeClasses[size],
        colors[colorIndex],
        className
      )}
    >
      {initials}
    </div>
  )
}
