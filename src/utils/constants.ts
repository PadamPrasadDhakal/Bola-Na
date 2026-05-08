export const COLOR_PALETTE = {
  primary: '#0084FF',
  secondary: '#E5E5EA',
  success: '#34C759',
  danger: '#FF3B30',
  warning: '#FF9500',
  background: '#FFFFFF',
  darkBackground: '#000000',
  text: '#000000',
  darkText: '#FFFFFF',
  border: '#E5E5EA',
  darkBorder: '#3C3C3C',
}

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
}

export const API_ERRORS = {
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Not found',
  SERVER_ERROR: 'Server error',
  NETWORK_ERROR: 'Network error',
}

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-m4v',
]
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
]

export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB

export const PAGINATION = {
  MESSAGES_PER_PAGE: 50,
  CHATS_PER_PAGE: 20,
  USERS_PER_PAGE: 20,
}

export const SOCKET_EVENTS = {
  TYPING: 'typing',
  STOP_TYPING: 'stop_typing',
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  MESSAGE_SEEN: 'message_seen',
}

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_ID: 'user_id',
  THEME: 'theme',
  NOTIFICATIONS_ENABLED: 'notifications_enabled',
}
