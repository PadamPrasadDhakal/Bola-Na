# API Reference - Bola Na

Complete API reference for services and hooks in Bola Na.

## Supabase Service (`src/services/supabaseService.ts`)

### Authentication Service

#### `authService.login(username: string, password: string): Promise<User>`

Authenticate a user with username and password.

**Parameters:**
- `username` - User's username
- `password` - User's password (currently not verified for demo purposes)

**Returns:** User object with all user details

**Example:**
```typescript
const user = await authService.login('john', 'password123')
console.log(user.display_name) // 'John Doe'
```

---

#### `authService.getUser(userId: string): Promise<User>`

Fetch a single user by ID.

**Parameters:**
- `userId` - UUID of the user

**Returns:** Complete user object

**Example:**
```typescript
const user = await authService.getUser('123e4567-e89b-12d3-a456-426614174000')
```

---

#### `authService.updateUserStatus(userId: string, isOnline: boolean): Promise<void>`

Update user online status and last seen timestamp.

**Parameters:**
- `userId` - User's UUID
- `isOnline` - Boolean indicating online status

**Example:**
```typescript
await authService.updateUserStatus(userId, true) // User is online
await authService.updateUserStatus(userId, false) // User is offline
```

---

#### `authService.updateUserProfile(userId: string, data: Partial<User>): Promise<void>`

Update user profile information.

**Parameters:**
- `userId` - User's UUID
- `data` - Partial user object with fields to update

**Example:**
```typescript
await authService.updateUserProfile(userId, {
  display_name: 'New Name',
  profile_picture: 'https://...'
})
```

---

#### `authService.searchUsers(query: string): Promise<User[]>`

Search for users by username or display name.

**Parameters:**
- `query` - Search query string

**Returns:** Array of matching users (max 10)

**Example:**
```typescript
const results = await authService.searchUsers('john')
// Returns users with 'john' in username or display_name
```

---

### Chat Service

#### `chatService.getChats(userId: string): Promise<Chat[]>`

Get all chats for a user.

**Parameters:**
- `userId` - User's UUID

**Returns:** Array of chat objects

**Example:**
```typescript
const chats = await chatService.getChats(userId)
chats.forEach(chat => console.log(chat.name))
```

---

#### `chatService.getChatById(chatId: string): Promise<Chat>`

Get a single chat by ID.

**Parameters:**
- `chatId` - Chat's UUID

**Returns:** Chat object

---

#### `chatService.createDirectChat(userId: string, otherUserId: string): Promise<Chat>`

Create or get a direct chat between two users.

**Parameters:**
- `userId` - Current user's UUID
- `otherUserId` - Other user's UUID

**Returns:** Chat object

**Note:** If a direct chat already exists between these users, it returns the existing chat.

---

#### `chatService.createGroupChat(userId: string, name: string, participantIds: string[], avatarUrl?: string): Promise<Chat>`

Create a new group chat.

**Parameters:**
- `userId` - Creator's UUID
- `name` - Group chat name
- `participantIds` - Array of user IDs to add
- `avatarUrl` - Optional group avatar URL

**Returns:** Created chat object

**Example:**
```typescript
const groupChat = await chatService.createGroupChat(
  userId,
  'Friends',
  ['uuid1', 'uuid2', 'uuid3']
)
```

---

#### `chatService.getChatParticipants(chatId: string): Promise<User[]>`

Get all participants in a chat.

**Parameters:**
- `chatId` - Chat's UUID

**Returns:** Array of user objects

---

#### `chatService.addChatParticipant(chatId: string, userId: string): Promise<void>`

Add a user to a group chat.

**Parameters:**
- `chatId` - Group chat's UUID
- `userId` - User to add

---

#### `chatService.removeChatParticipant(chatId: string, userId: string): Promise<void>`

Remove a user from a group chat.

**Parameters:**
- `chatId` - Group chat's UUID
- `userId` - User to remove

---

### Message Service

#### `messageService.getMessages(chatId: string, limit?: number): Promise<Message[]>`

Get messages in a chat (ordered by creation time).

**Parameters:**
- `chatId` - Chat's UUID
- `limit` - Number of messages to fetch (default: 50)

**Returns:** Array of message objects in chronological order

**Example:**
```typescript
const messages = await messageService.getMessages(chatId, 100)
```

---

#### `messageService.sendMessage(chatId: string, senderId: string, content?: string, mediaUrl?: string, mediaType?: string, mediaName?: string, replyToMessageId?: string): Promise<Message>`

Send a message to a chat.

**Parameters:**
- `chatId` - Target chat's UUID
- `senderId` - Sender's UUID
- `content` - Message text (optional)
- `mediaUrl` - URL of media (optional)
- `mediaType` - 'image' | 'video' | 'file' (optional)
- `mediaName` - Name of media file (optional)
- `replyToMessageId` - UUID of message to reply to (optional)

**Returns:** Created message object

**Example:**
```typescript
// Text message
const msg = await messageService.sendMessage(
  chatId,
  userId,
  'Hello!'
)

// Message with media
const msgWithMedia = await messageService.sendMessage(
  chatId,
  userId,
  'Check this out',
  'https://...image.jpg',
  'image',
  'photo.jpg'
)
```

---

#### `messageService.markMessageAsSeen(messageId: string, userId: string): Promise<void>`

Mark a message as seen by a user.

**Parameters:**
- `messageId` - Message's UUID
- `userId` - User marking as seen

---

#### `messageService.getMessageSeenCount(messageId: string): Promise<number>`

Get number of users who have seen a message.

**Parameters:**
- `messageId` - Message's UUID

**Returns:** Count of users who have seen the message

---

#### `messageService.deleteMessage(messageId: string): Promise<void>`

Delete a message.

**Parameters:**
- `messageId` - Message's UUID to delete

---

### Storage Service

#### `storageService.uploadFile(file: File, bucket?: string): Promise<string>`

Upload a file to Supabase Storage.

**Parameters:**
- `file` - File object to upload
- `bucket` - Storage bucket name (default: 'chat-media')

**Returns:** Public URL of uploaded file

**Example:**
```typescript
const file = document.querySelector('input[type="file"]').files[0]
const url = await storageService.uploadFile(file)
console.log(url) // 'https://...cdn.../chat-media/...'
```

---

#### `storageService.deleteFile(filePath: string, bucket?: string): Promise<void>`

Delete a file from Supabase Storage.

**Parameters:**
- `filePath` - Path to file in storage
- `bucket` - Storage bucket name (default: 'chat-media')

---

## Custom Hooks

### `useAuth()` - `src/hooks/useAuth.ts`

Authentication hook for managing user login/logout and online status.

**Returns:**
```typescript
{
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setUser: (user: User, token?: string) => void
  logout: () => void
}
```

**Example:**
```typescript
const { user, isAuthenticated, logout } = useAuth()

if (!isAuthenticated) {
  return <div>Please login</div>
}

return <div>Welcome, {user?.display_name}</div>
```

---

### `useAuthRedirect()`

Hook that redirects unauthenticated users to login page.

**Returns:** Current authenticated user

**Example:**
```typescript
const user = useAuthRedirect()
// If not authenticated, user is redirected to /login
```

---

### `useChats()` - `src/hooks/useChat.ts`

Hook for managing user chats.

**Returns:**
```typescript
{
  chats: Chat[]
  isLoading: boolean
  loadChats: () => Promise<void>
  createDirectChat: (otherUserId: string) => Promise<Chat>
  createGroupChat: (name: string, participantIds: string[], avatarUrl?: string) => Promise<Chat>
}
```

**Example:**
```typescript
const { chats, loadChats, createDirectChat } = useChats()

useEffect(() => {
  loadChats()
}, [])

const handleStartChat = async (userId: string) => {
  const chat = await createDirectChat(userId)
  navigate(`/chat/${chat.id}`)
}
```

---

### `useMessages(chatId: string | null)` - `src/hooks/useChat.ts`

Hook for managing messages in a chat.

**Parameters:**
- `chatId` - Current chat UUID (can be null)

**Returns:**
```typescript
{
  messages: Message[]
  isLoading: boolean
  loadMessages: () => Promise<void>
  sendMessage: (
    content?: string,
    mediaUrl?: string,
    mediaType?: string,
    mediaName?: string,
    replyToMessageId?: string
  ) => Promise<Message>
  uploadMedia: (file: File) => Promise<string>
}
```

**Example:**
```typescript
const { messages, sendMessage, uploadMedia } = useMessages(chatId)

const handleSendMessage = async (text: string) => {
  await sendMessage(text)
}
```

---

### `useRealtimeMessages(chatId: string | null)`

Subscribe to real-time message updates in a chat.

**Parameters:**
- `chatId` - Chat UUID to subscribe to

**Side effects:**
- Automatically adds new messages to store
- Updates edited messages
- Removes deleted messages

**Example:**
```typescript
const { messages } = useChatStore()

useRealtimeMessages(chatId)
// messages will update in real-time
```

---

### `useRealtimeTyping(chatId: string | null)`

Subscribe to typing indicators in a chat.

**Parameters:**
- `chatId` - Chat UUID

**Returns:**
```typescript
{
  sendTypingIndicator: () => Promise<void>
}
```

**Example:**
```typescript
const { sendTypingIndicator } = useRealtimeTyping(chatId)

const handleInputChange = () => {
  sendTypingIndicator()
  // Debounce or throttle in production
}
```

---

### `useRealtimePresence(chatId: string | null)`

Subscribe to user online/offline status in a chat.

**Parameters:**
- `chatId` - Chat UUID

**Side effects:**
- Updates online user list in store
- Tracks join/leave events

---

## State Management (Zustand Stores)

### `useAuthStore()`

Global authentication state.

**State:**
```typescript
{
  user: User | null
  token: string | null
  isLoading: boolean
}
```

**Methods:**
```typescript
setUser(user: User | null, token?: string): void
logout(): void
```

**Example:**
```typescript
const { user, token, setUser, logout } = useAuthStore()
```

---

### `useChatStore()`

Global chat and messaging state.

**State:**
```typescript
{
  selectedChatId: string | null
  chats: Chat[]
  messages: { [chatId: string]: Message[] }
  typingUsers: { [chatId: string]: string[] }
  onlineUsers: Set<string>
}
```

**Methods:**
```typescript
setSelectedChat(chatId: string | null): void
setChats(chats: Chat[]): void
addChat(chat: Chat): void
updateChat(chatId: string, chat: Partial<Chat>): void
deleteChat(chatId: string): void

setMessages(chatId: string, messages: Message[]): void
addMessage(chatId: string, message: Message): void
updateMessage(chatId: string, messageId: string, message: Partial<Message>): void
deleteMessage(chatId: string, messageId: string): void
clearMessages(chatId: string): void

setTypingUsers(chatId: string, users: string[]): void
addTypingUser(chatId: string, userId: string): void
removeTypingUser(chatId: string, userId: string): void

setOnlineUsers(users: Set<string>): void
addOnlineUser(userId: string): void
removeOnlineUser(userId: string): void
```

**Example:**
```typescript
const { selectedChatId, addMessage, addOnlineUser } = useChatStore()
```

---

## Utility Functions (`src/utils/helpers.ts`)

### Time Formatting

```typescript
formatTime(date: string | Date): string
// Returns: "5m ago", "2h ago", "Jan 15", etc.

formatTimeOnly(date: string | Date): string
// Returns: "2:30 PM"

formatDate(date: string | Date): string
// Returns: "Jan 15" or "Jan 15, 2024"
```

### Text Utilities

```typescript
getInitials(name: string): string
// "John Doe" → "JD"

truncateText(text: string, length: number): string
// Truncates and adds "..."

getMimeType(file: File): 'image' | 'video' | 'file'
// Determines file type

formatFileSize(bytes: number): string
// 1024 → "1 KB"

generateAvatarUrl(userId: string, displayName: string): string
// Returns avatar placeholder URL
```

### Validation

```typescript
isValidUsername(username: string): boolean
// /^[a-zA-Z0-9_]{3,20}$/

isValidPassword(password: string): boolean
// Minimum 6 characters
```

### DOM Utilities

```typescript
scrollToBottom(elementId?: string): void
// Smooth scroll to bottom

cn(...inputs: ClassValue[]): string
// Tailwind class merge utility
```

### Performance

```typescript
debounce<T>(func: T, wait: number): (...args: Parameters<T>) => void
// Debounce function calls

throttle<T>(func: T, limit: number): (...args: Parameters<T>) => void
// Throttle function calls
```

---

## Type Definitions (`src/types/index.ts`)

### User
```typescript
interface User {
  id: string
  username: string
  display_name: string
  profile_picture: string | null
  is_online: boolean
  last_seen: string | null
  created_at: string
  password_hash?: string
}
```

### Chat
```typescript
interface Chat {
  id: string
  name: string | null
  type: 'direct' | 'group'
  avatar_url: string | null
  created_at: string
  updated_at: string
  created_by: string
}
```

### Message
```typescript
interface Message {
  id: string
  chat_id: string
  sender_id: string
  content: string | null
  media_url: string | null
  media_type: 'image' | 'video' | 'file' | null
  media_name: string | null
  reply_to_message_id: string | null
  created_at: string
  updated_at: string
}
```

---

## Error Handling

All services throw errors that should be caught:

```typescript
try {
  await authService.login(username, password)
} catch (error) {
  const message = error instanceof Error ? error.message : 'Login failed'
  toast.error(message)
}
```

Use toast notifications for user feedback:

```typescript
import toast from 'react-hot-toast'

toast.success('Message sent!')
toast.error('Failed to send message')
toast.loading('Sending...')
```

---

## Best Practices

1. **Always check authentication**
   ```typescript
   const { user } = useAuthStore()
   if (!user) return null
   ```

2. **Handle loading states**
   ```typescript
   const { isLoading } = useChats()
   return <Button disabled={isLoading}>Send</Button>
   ```

3. **Use error boundaries** for components

4. **Debounce user input**
   ```typescript
   const debouncedSearch = debounce(handleSearch, 300)
   ```

5. **Clean up subscriptions**
   - useRealtimeMessages automatically manages cleanup
   - Unsubscribe from channels when component unmounts

---

**For more examples, check the component files in `src/components/`**
