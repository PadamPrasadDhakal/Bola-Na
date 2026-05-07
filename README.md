# Bola Na - Real-time Chat Application

A modern, production-ready real-time chat application built with Next.js 15, Supabase, and Tailwind CSS. Designed specifically as a private chatting platform for friends with no public registration system.

## Features

### Core Features
- **Username + Password Authentication** - Simple, secure login system
- **Real-time Messaging** - Instant message delivery powered by Supabase Realtime
- **Direct Messages** - One-to-one private conversations
- **Group Chats** - Create and manage group conversations
- **Media Sharing** - Upload images, videos, and files
- **Typing Indicators** - See when friends are typing
- **Read Receipts** - Track message delivery and read status
- **Online Status** - See who's online and last seen
- **Message Search** - Find messages in conversations

### UI/UX Features
- **Modern Design** - Inspired by WhatsApp Web and Telegram
- **Dark/Light Mode** - Automatic theme support
- **Responsive Layout** - Works perfectly on desktop and mobile
- **Smooth Animations** - Glassmorphism effects and transitions
- **Real-time Notifications** - Browser notifications for new messages

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL, Realtime, Storage)
- **Authentication**: JWT + Session-based
- **UI Components**: Custom built + shadcn/ui inspired
- **Real-time**: Supabase Realtime Subscriptions

## Project Structure

```
bola-na/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── login/          # Login page
│   │   ├── chat/           # Chat interface
│   │   ├── settings/       # Settings page
│   │   ├── profile/        # User profile
│   │   ├── layout.tsx      # Root layout
│   │   ├── globals.css     # Global styles
│   │   └── page.tsx        # Home redirect
│   │
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── ChatItem.tsx
│   │   │   └── ...
│   │   ├── Sidebar.tsx
│   │   ├── ChatWindow.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── CreateChatDialog.tsx
│   │
│   ├── lib/                 # Utility functions
│   │   ├── supabase.ts     # Supabase client
│   │   └── auth.ts         # Auth utilities
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts      # Auth hook
│   │   ├── useChat.ts      # Chat operations
│   │   └── useRealtime.ts  # Real-time subscriptions
│   │
│   ├── services/           # API services
│   │   └── supabaseService.ts
│   │
│   ├── store/              # Zustand stores
│   │   └── index.ts        # Auth and Chat stores
│   │
│   ├── types/              # TypeScript types
│   │   └── index.ts        # All type definitions
│   │
│   └── utils/              # Utilities
│       ├── helpers.ts      # Helper functions
│       └── constants.ts    # Constants
│
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql  # Database schema
│   └── config.toml
│
├── public/                 # Static files
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── .env.example
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Supabase account
- PostgreSQL knowledge (basic)

### Installation

1. **Clone or set up the project**
```bash
cd "Bola Na"
npm install
```

2. **Set up Supabase project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for project to be initialized
   - Go to SQL Editor and run the migration script (`supabase/migrations/001_initial_schema.sql`)

3. **Configure environment variables**
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase credentials:
     ```bash
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
     JWT_SECRET=your_jwt_secret_here
     NEXT_PUBLIC_APP_URL=http://localhost:3000
     ```

4. **Create storage bucket**
   - In Supabase console, go to Storage
   - Create a new bucket named `chat-media`
   - Make it public

5. **Create test users**
   - In Supabase console, go to SQL Editor
   - Run this query to create test users:
   ```sql
   INSERT INTO users (username, password_hash, display_name, profile_picture) VALUES
   ('john', 'hashed_password_1', 'John Doe', null),
   ('jane', 'hashed_password_2', 'Jane Smith', null),
   ('mike', 'hashed_password_3', 'Mike Wilson', null);
   ```

6. **Run the development server**
```bash
npm run dev
```

7. **Open your browser**
   - Navigate to `http://localhost:3000`
   - You'll be redirected to login
   - Login with credentials you created

## Key Implementation Details

### Authentication Flow

1. User enters username and password on login page
2. System fetches user from database
3. Validates credentials (in production, use bcrypt comparison)
4. Generates JWT token
5. Stores token and user info in Zustand store
6. Redirects to chat page

### Real-time Features

**Message Updates**
```typescript
useRealtimeMessages(chatId) // Subscribes to new messages in chat
```

**Typing Indicators**
```typescript
useRealtimeTyping(chatId) // Shows when users are typing
```

**Online Presence**
```typescript
useRealtimePresence(chatId) // Tracks user online status
```

### Message Storage

Messages are stored with:
- `id`: UUID primary key
- `chat_id`: Foreign key to chats table
- `sender_id`: User who sent the message
- `content`: Message text
- `media_url`: URL to uploaded media
- `media_type`: image, video, or file
- `created_at`: Timestamp
- `seen_by`: Row Level Security policy controls visibility

### Media Upload

Files are uploaded to Supabase Storage:
1. User selects file
2. File is sent to `/chat-media` bucket
3. URL is returned and sent with message
4. Browser displays media based on type

## Security Features

### Row Level Security (RLS)
- Users can only see messages from chats they're part of
- Users can only view other users' public information
- Messages are private to chat participants

### Password Security
- Passwords are hashed using bcryptjs
- Never stored in plain text

### JWT Tokens
- 30-day expiration
- Refresh token pattern (implement as needed)

### Storage Access
- Private upload bucket
- Public download with signed URLs

## Deployment

### Deploy to Vercel

1. **Push code to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-github-repo
git branch -M main
git push -u origin main
```

2. **Create Vercel project**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy"

3. **Configure environment variables**
   - In Vercel project settings, go to "Environment Variables"
   - Add all variables from `.env.example`:
     ```
     NEXT_PUBLIC_SUPABASE_URL
     NEXT_PUBLIC_SUPABASE_ANON_KEY
     SUPABASE_SERVICE_ROLE_KEY
     JWT_SECRET
     NEXT_PUBLIC_APP_URL=your-vercel-url.vercel.app
     ```

4. **Redeploy**
   - Vercel will automatically redeploy with new environment variables

### Deploy to Self-hosted

1. **Build the project**
```bash
npm run build
npm start
```

2. **Using Docker** (optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Database Schema

### Users Table
```sql
- id: UUID (Primary Key)
- username: TEXT (UNIQUE)
- password_hash: TEXT
- display_name: TEXT
- profile_picture: TEXT (nullable)
- is_online: BOOLEAN
- last_seen: TIMESTAMP (nullable)
- created_at: TIMESTAMP
```

### Chats Table
```sql
- id: UUID (Primary Key)
- name: TEXT (nullable, for groups)
- type: 'direct' or 'group'
- avatar_url: TEXT (nullable)
- created_by: UUID (Foreign Key)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Messages Table
```sql
- id: UUID (Primary Key)
- chat_id: UUID (Foreign Key)
- sender_id: UUID (Foreign Key)
- content: TEXT (nullable)
- media_url: TEXT (nullable)
- media_type: 'image' | 'video' | 'file' (nullable)
- reply_to_message_id: UUID (nullable, for replies)
- created_at: TIMESTAMP
```

### Chat Participants Table
```sql
- id: UUID (Primary Key)
- chat_id: UUID (Foreign Key)
- user_id: UUID (Foreign Key)
- role: 'member' | 'admin'
- joined_at: TIMESTAMP
```

### Message Seen Table
```sql
- id: UUID (Primary Key)
- message_id: UUID (Foreign Key)
- user_id: UUID (Foreign Key)
- seen_at: TIMESTAMP
```

## API Endpoints (Client-side services)

### Auth Service
- `login(username, password)` - Authenticate user
- `getUser(userId)` - Get user by ID
- `updateUserStatus(userId, isOnline)` - Update online status
- `searchUsers(query)` - Search for users

### Chat Service
- `getChats(userId)` - Get all chats for user
- `createDirectChat(userId, otherUserId)` - Create 1-to-1 chat
- `createGroupChat(userId, name, participantIds)` - Create group chat
- `getChatParticipants(chatId)` - Get chat members
- `addChatParticipant(chatId, userId)` - Add user to group
- `removeChatParticipant(chatId, userId)` - Remove user from group

### Message Service
- `getMessages(chatId, limit)` - Get messages in chat
- `sendMessage(chatId, senderId, content, mediaUrl)` - Send message
- `markMessageAsSeen(messageId, userId)` - Mark as read
- `deleteMessage(messageId)` - Delete message

### Storage Service
- `uploadFile(file, bucket)` - Upload media file
- `deleteFile(filePath, bucket)` - Delete media file

## Customization

### Change Colors
Edit `tailwind.config.ts`:
```typescript
theme: {
  colors: {
    primary: '#0084FF', // Change to your color
    // ...
  }
}
```

### Change App Name
Replace "Bola Na" throughout:
- `src/app/layout.tsx` - Metadata
- `src/components/Sidebar.tsx` - Logo
- `src/app/login/page.tsx` - Title

### Add Features
1. **Notifications** - Integrate FCM or browser notifications
2. **Video Calls** - Add WebRTC or Agora
3. **Screen Sharing** - Use Screenshare API
4. **End-to-End Encryption** - Add TweetNaCl.js
5. **Admin Dashboard** - Create admin panel for user management

## Troubleshooting

### Issue: Login fails with "User not found"
- Ensure you've created test users in Supabase
- Check that the username matches exactly

### Issue: Messages not updating in real-time
- Verify Supabase Realtime is enabled
- Check browser console for subscription errors
- Ensure RLS policies are correctly set

### Issue: Media upload fails
- Verify `chat-media` bucket exists in Supabase
- Check bucket is public
- Ensure CORS is configured

### Issue: Environment variables not loading
- Restart dev server after changing `.env.local`
- Verify variables are prefixed correctly (`NEXT_PUBLIC_` for client-side)

## Performance Optimization

### Current Optimizations
- Message pagination (50 messages per load)
- Debounced search
- Lazy loaded components
- Image optimization with Next.js Image component
- CSS animations use GPU acceleration

### Future Optimizations
- Implement infinite scroll for messages
- Add virtual scrolling for large message lists
- Cache frequently accessed chats
- Service Worker for offline support

## Contributing

To contribute to Bola Na:
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or suggestions:
- Check the troubleshooting section
- Review Supabase documentation
- Check Next.js documentation

## Roadmap

- [ ] Video/Audio calls
- [ ] Screen sharing
- [ ] End-to-end encryption
- [ ] Message reactions/emojis
- [ ] Message forwarding
- [ ] Chat backup and export
- [ ] User authentication improvements
- [ ] Admin panel
- [ ] Mobile app (React Native)

---

**Built with ❤️ for real-time communication**
