# 📚 Chat Application - Complete Project Documentation

> A modern real-time chat application built with Next.js 16, Express.js 5, Socket.IO, PostgreSQL, and Prisma ORM.

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Tech Stack](#-tech-stack)
3. [Architecture](#-architecture)
4. [Project Structure](#-project-structure)
5. [Database Schema](#-database-schema)
6. [Authentication System](#-authentication-system)
7. [API Routes](#-api-routes)
8. [Socket.IO Events](#-socketio-events)
9. [Client-Side Architecture](#-client-side-architecture)
10. [Features](#-features)
11. [Setup & Installation](#-setup--installation)
12. [Environment Variables](#-environment-variables)
13. [Best Practices Applied](#-best-practices-applied)

---

## 🎯 Project Overview

This is a **full-stack real-time chat application** that enables users to:

- **Communicate in real-time** with friends via private messaging
- **Send friend requests** and manage friendships
- **Share media** (images, videos, files) in conversations
- **Make audio/video calls** with friends
- **See typing indicators** and online/offline status
- **React to messages** with emojis
- **Edit and delete messages** within a time window

### Key Highlights

| Feature | Description |
|---------|-------------|
| **Real-time Messaging** | Instant message delivery using Socket.IO |
| **JWT Authentication** | Secure auth with access & refresh tokens |
| **Google OAuth** | Sign in with Google account |
| **Email Verification** | Verify email before accessing features |
| **Friend System** | Send/accept/reject friend requests |
| **Private Chats** | 1-on-1 conversations between friends |
| **Read Receipts** | Know when messages are read |
| **Typing Indicators** | See when someone is typing |
| **Message Reactions** | React to messages with emojis |
| **Audio/Video Calls** | Real-time calls using WebRTC (PeerJS) |

---

## 🛠 Tech Stack

### Backend (Server)

| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime |
| **Express.js 5** | Web framework |
| **TypeScript** | Type safety |
| **Socket.IO** | Real-time bidirectional communication |
| **Prisma ORM** | Database ORM |
| **PostgreSQL** | Relational database |
| **JWT** | Authentication tokens |
| **Passport.js** | Google OAuth authentication |
| **Nodemailer** | Email service |
| **Cloudinary** | Image/file storage |
| **Zod** | Schema validation |
| **Bcrypt** | Password hashing |
| **Helmet** | Security headers |

### Frontend (Client)

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework (App Router) |
| **React 19** | UI library |
| **TypeScript** | Type safety |
| **TanStack Query** | Server state management |
| **Zustand** | Client state management |
| **Socket.IO Client** | Real-time communication |
| **React Hook Form** | Form handling |
| **Zod** | Form validation |
| **Tailwind CSS** | Styling |
| **Lucide React** | Icons |
| **Axios** | HTTP client |
| **PeerJS** | WebRTC for video/audio calls |
| **js-cookie** | Cookie management |

---

## 🏗 Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Next.js 16)                         │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  • App Router (RSC + Client Components)                      │   │
│  │  • TanStack Query (Server State)                             │   │
│  │  • Zustand (Client State)                                    │   │
│  │  • Socket.IO Client (Real-time)                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                              │
           ┌──────────────────┴──────────────────┐
           │ HTTP REST API      │ WebSocket       │
           ▼                    ▼                 │
┌─────────────────────────────────────────────────────────────────────┐
│                      SERVER (Express.js 5)                          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Middleware: CORS, Helmet, JWT Auth, Validation               │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │ Controllers → Services → Prisma ORM                          │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │ Socket.IO: Real-time events (messages, typing, presence)     │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      DATABASE (PostgreSQL)                          │
│  Users, Conversations, Messages, Friends, Calls, etc.               │
└─────────────────────────────────────────────────────────────────────┘
```

### HTTP vs Socket.IO Decision

| Operation | HTTP | Socket.IO | Reason |
|-----------|------|-----------|--------|
| Send Message | ❌ | ✅ | Instant delivery to online users |
| Fetch History | ✅ | ❌ | Historical data, pagination |
| Edit/Delete Message | ❌ | ✅ | Broadcast changes instantly |
| Search Messages | ✅ | ❌ | Query operation |
| Mark as Read | ✅ | ✅ | HTTP for bulk, Socket for broadcast |
| Typing Indicator | ❌ | ✅ | Real-time only, no persistence |
| Online Status | ❌ | ✅ | Real-time presence |
| React to Message | ❌ | ✅ | Broadcast reaction instantly |

---

## 📁 Project Structure

### Server Structure

```
server/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── server.ts              # HTTP & Socket.IO server
│   ├── config/
│   │   ├── db.ts              # Prisma client instance
│   │   ├── env.config.ts      # Environment variables
│   │   ├── google-auth.config.ts  # Google OAuth setup
│   │   └── cloudinary.config.ts   # Cloudinary setup
│   ├── controllers/
│   │   ├── auth.controller.ts      # Auth endpoints
│   │   ├── user.controller.ts      # User endpoints
│   │   ├── friend.controller.ts    # Friend endpoints
│   │   ├── conversation.controller.ts  # Chat endpoints
│   │   ├── message.controller.ts   # Message endpoints
│   │   └── call.controller.ts      # Call endpoints
│   ├── services/
│   │   ├── auth.service.ts         # Auth business logic
│   │   ├── user.service.ts         # User business logic
│   │   ├── friend.service.ts       # Friend business logic
│   │   ├── conversation.service.ts # Conversation logic
│   │   ├── message.service.ts      # Message logic
│   │   ├── call.service.ts         # Call logic
│   │   └── email.service.ts        # Email sending
│   ├── routes/
│   │   ├── auth.route.ts           # Auth routes
│   │   ├── user.route.ts           # User routes
│   │   ├── friend.route.ts         # Friend routes
│   │   ├── conversation.route.ts   # Conversation routes
│   │   ├── message.route.ts        # Message routes
│   │   └── call.route.ts           # Call routes
│   ├── socket/
│   │   └── chat.socket.ts          # Socket.IO event handlers
│   ├── middleware/
│   │   ├── auth.middleware.ts      # JWT authentication
│   │   ├── error.middleware.ts     # Error handling
│   │   ├── validate.middleware.ts  # Request validation
│   │   └── upload.middleware.ts    # File upload (Multer)
│   ├── dto/
│   │   ├── auth.dto.ts             # Auth schemas (Zod)
│   │   ├── user.dto.ts             # User schemas
│   │   ├── friend.dto.ts           # Friend schemas
│   │   ├── conversation.dto.ts     # Conversation schemas
│   │   └── message.dto.ts          # Message schemas
│   ├── types/
│   │   └── error.types.ts          # Custom error classes
│   └── utils/
│       ├── jwt.util.ts             # JWT token utilities
│       ├── email.util.ts           # Email templates
│       ├── cloudinary.util.ts      # Cloudinary helpers
│       └── response.util.ts        # Response helpers
└── package.json
```

### Client Structure

```
client/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home page (redirect)
│   │   ├── (auth)/                 # Auth pages (public)
│   │   │   ├── signIn/
│   │   │   ├── sginUp/
│   │   │   ├── forgotPassword/
│   │   │   ├── resetPassword/
│   │   │   ├── verifyEmail/
│   │   │   └── resendVerification/
│   │   └── (main)/                 # Main pages (protected)
│   │       ├── chats/
│   │       ├── calls/
│   │       └── profile/
│   ├── components/
│   │   ├── layout/                 # Layout components
│   │   ├── pages/                  # Page-specific components
│   │   └── ui/                     # Reusable UI components
│   ├── hooks/
│   │   └── useAuth.ts              # Auth hooks
│   ├── lib/
│   │   └── axios.ts                # Axios instance with interceptors
│   ├── protect/
│   │   └── index.ts                # Auth protection utilities
│   ├── providers/
│   │   └── index.tsx               # React Query provider
│   ├── services/
│   │   └── auth.service.ts         # Auth API calls
│   ├── store/                      # Zustand stores
│   ├── styles/
│   │   └── globals.css             # Global styles
│   └── types/                      # TypeScript types
├── middleware.ts                   # Next.js middleware (route protection)
└── package.json
```

---

## 🗄 Database Schema

### Entity Relationship Diagram

```
┌────────────┐       ┌─────────────────┐       ┌──────────────┐
│   User     │──────▶│ FriendRequest   │◀──────│    User      │
│            │1    N │                 │N     1│              │
│  • id      │       │ • senderId      │       │              │
│  • email   │       │ • receiverId    │       │              │
│  • name    │       │ • status        │       │              │
│  • avatar  │       └─────────────────┘       └──────────────┘
│  • password│
│  • role    │       ┌─────────────────┐
│  • status  │──────▶│    Friend       │
│            │1    N │                 │
└────────────┘       │ • userId        │
      │              │ • friendId      │
      │              └─────────────────┘
      │
      │              ┌─────────────────┐       ┌──────────────┐
      └─────────────▶│ Conversation    │◀─────▶│   Message    │
                  N  │ Participant     │  N    │              │
                     │                 │       │ • content    │
                     │ • userId        │       │ • type       │
                     │ • conversationId│       │ • senderId   │
                     └─────────────────┘       │ • status     │
                            │                  │ • reactions  │
                            │                  └──────────────┘
                            ▼
                     ┌─────────────────┐
                     │  Conversation   │
                     │                 │
                     │ • lastMessageAt │
                     │ • isArchived    │
                     └─────────────────┘
```

### Models

#### User Model
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String?
  name          String?
  avatar        String?
  bio           String?
  role          UserRole  @default(USER)
  status        String    @default("offline")
  emailVerified Boolean   @default(false)
  refreshToken  String?
  googleId      String?   @unique
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum UserRole {
  ADMIN
  USER
}
```

#### Message Model
```prisma
model Message {
  id             String        @id @default(cuid())
  conversationId String
  senderId       String
  content        String
  type           MessageType   @default(TEXT)
  mediaUrls      String[]
  status         MessageStatus @default(SENT)
  isEdited       Boolean       @default(false)
  editedAt       DateTime?
  createdAt      DateTime      @default(now())
}

enum MessageType {
  TEXT
  IMAGE
  VIDEO
  FILE
  SYSTEM_MESSAGE
}

enum MessageStatus {
  SENT
  DELIVERED
  READ
  FAILED
}
```

#### Call Model
```prisma
model Call {
  id             String     @id @default(cuid())
  conversationId String
  callerId       String
  receiverId     String?
  type           CallType   @default(AUDIO)
  status         CallStatus @default(INITIATING)
  duration       Int?
  startedAt      DateTime?
  endedAt        DateTime?
}

enum CallType {
  AUDIO
  VIDEO
}

enum CallStatus {
  INITIATING
  RINGING
  ACTIVE
  ENDED
  DECLINED
  MISSED
  CANCELED
}
```

---

## 🔐 Authentication System

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                     AUTHENTICATION FLOW                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. REGISTRATION                                                    │
│     User → POST /api/v1/auth/register                              │
│     ├─ Validate input (Zod)                                        │
│     ├─ Check if email exists                                       │
│     ├─ Hash password (bcrypt)                                      │
│     ├─ Create user in DB                                           │
│     ├─ Generate verification token                                 │
│     └─ Send verification email                                     │
│                                                                     │
│  2. EMAIL VERIFICATION                                              │
│     User → GET /api/v1/auth/verify-email?token=xxx                 │
│     ├─ Hash token and find in DB                                   │
│     ├─ Check expiration (24 hours)                                 │
│     ├─ Mark user as verified                                       │
│     └─ Delete verification record                                  │
│                                                                     │
│  3. LOGIN                                                           │
│     User → POST /api/v1/auth/login                                 │
│     ├─ Validate credentials                                        │
│     ├─ Check password (bcrypt.compare)                             │
│     ├─ Generate Access Token (15 min / 7 days)                     │
│     ├─ Generate Refresh Token (7 days / 30 days)                   │
│     └─ Set refresh token in httpOnly cookie                        │
│                                                                     │
│  4. AUTHENTICATED REQUEST                                           │
│     Client → API Request                                            │
│     ├─ Include: Authorization: Bearer <accessToken>                │
│     ├─ Middleware verifies token                                   │
│     └─ Attach user to request (req.user)                           │
│                                                                     │
│  5. TOKEN REFRESH                                                   │
│     Client → POST /api/v1/auth/refresh-tokens                      │
│     ├─ Read refresh token from cookie                              │
│     ├─ Verify refresh token                                        │
│     └─ Issue new access token                                      │
│                                                                     │
│  6. GOOGLE OAUTH                                                    │
│     User → GET /api/v1/auth/google                                 │
│     ├─ Redirect to Google consent screen                           │
│     ├─ Google callback with profile                                │
│     ├─ Find or create user                                         │
│     ├─ Generate tokens                                             │
│     └─ Redirect to client with tokens                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### JWT Token Structure

```typescript
// Access Token Payload
{
  userId: string;    // User ID
  email: string;     // User email
  role: string;      // "USER" | "ADMIN"
  iat: number;       // Issued at
  exp: number;       // Expires at
}

// Token Durations
- Access Token:  7 days  (JWT_EXPIRE)
- Refresh Token: 30 days (JWT_REFRESH_EXPIRE)
```

### Client-Side Token Management

```typescript
// Token stored in cookies
- accessToken:  7 days expiry
- refreshToken: 30 days expiry

// Axios interceptor handles:
- Adding Authorization header
- Automatic token refresh on 401
- Request queuing during refresh
```

---

## 📡 API Routes

### Authentication Routes (`/api/v1/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | ❌ | Register new user |
| POST | `/login` | ❌ | Login user |
| GET | `/verify-email` | ❌ | Verify email token |
| POST | `/resend-verification` | ❌ | Resend verification email |
| POST | `/forgot-password` | ❌ | Request password reset |
| POST | `/reset-password` | ❌ | Reset password with token |
| POST | `/refresh-tokens` | ❌ | Refresh access token |
| POST | `/logout` | ✅ | Logout user |
| GET | `/google` | ❌ | Start Google OAuth |
| GET | `/google/callback` | ❌ | Google OAuth callback |

### User Routes (`/api/v1/users`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/profile` | ✅ | Get current user profile |
| GET | `/:id` | ✅ | Get user by ID |
| PATCH | `/profile` | ✅ | Update profile |
| POST | `/avatar` | ✅ | Upload avatar |
| GET | `/search` | ✅ | Search users |
| DELETE | `/` | ✅ | Delete account |
| PATCH | `/status` | ✅ | Update online status |
| GET | `/` | ✅ | Get all users |

### Friend Routes (`/api/v1/friends`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/request` | ✅ | Send friend request |
| PATCH | `/request/:id/accept` | ✅ | Accept friend request |
| PATCH | `/request/:id/reject` | ✅ | Reject friend request |
| DELETE | `/request/:id` | ✅ | Cancel friend request |
| GET | `/requests` | ✅ | Get friend requests |
| GET | `/` | ✅ | Get friends list |
| DELETE | `/:friendId` | ✅ | Remove friend |

### Conversation Routes (`/api/v1/conversations`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | ✅ | Create/get conversation |
| GET | `/` | ✅ | Get all conversations |
| GET | `/:id` | ✅ | Get conversation by ID |
| GET | `/:id/user` | ✅ | Get other user in conversation |
| PATCH | `/archive` | ✅ | Archive conversation |
| PATCH | `/unarchive` | ✅ | Unarchive conversation |
| DELETE | `/` | ✅ | Delete conversation |

### Message Routes (`/api/v1/messages`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | ✅ | Send message |
| GET | `/:conversationId` | ✅ | Get messages |
| PATCH | `/edit` | ✅ | Edit message |
| DELETE | `/` | ✅ | Delete message |
| POST | `/mark-as-read` | ✅ | Mark messages as read |
| GET | `/:id/read-receipts` | ✅ | Get read receipts |
| POST | `/react` | ✅ | React to message |
| DELETE | `/react` | ✅ | Remove reaction |
| GET | `/:id/reactions` | ✅ | Get reactions |
| GET | `/search` | ✅ | Search messages |

### Call Routes (`/api/v1/calls`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/initiate` | ✅ | Initiate a call |
| PATCH | `/:id/status` | ✅ | Update call status |
| POST | `/:id/end` | ✅ | End a call |
| GET | `/:id` | ✅ | Get call details |
| GET | `/history` | ✅ | Get call history |

---

## 🔌 Socket.IO Events

### Connection Authentication

```typescript
// Client connects with JWT token
const socket = io(SERVER_URL, {
  auth: {
    token: accessToken
  }
});

// Server middleware extracts userId
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const decoded = verifyAccessToken(token);
  socket.data.userId = decoded.userId;
  next();
});
```

### Message Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `message:send` | Client → Server | Send a new message |
| `message:received` | Server → Client | New message broadcasted |
| `message:edit` | Client → Server | Edit a message |
| `message:edited` | Server → Client | Edit broadcasted |
| `message:delete` | Client → Server | Delete a message |
| `message:deleted` | Server → Client | Deletion broadcasted |
| `message:react` | Client → Server | React to a message |
| `message:reaction` | Server → Client | Reaction broadcasted |
| `message:read` | Client → Server | Mark messages as read |
| `user:read-receipt` | Server → Client | Read receipt broadcasted |

### Conversation Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `conversation:open` | Client → Server | Open/join conversation room |
| `conversation:close` | Client → Server | Leave conversation room |
| `messages:read` | Server → Client | All messages marked as read |

### Typing & Presence

| Event | Direction | Description |
|-------|-----------|-------------|
| `typing:start` | Client → Server | User started typing |
| `typing:stop` | Client → Server | User stopped typing |
| `user:typing` | Server → Client | Typing status broadcasted |
| `user:online` | Client → Server | User came online |
| `user:status` | Server → Client | Online status broadcasted |

### Error Handling

```typescript
socket.on('error', (data) => {
  console.error('Socket error:', data.message);
});
```

---

## 💻 Client-Side Architecture

### Route Protection

```typescript
// Next.js Middleware (middleware.ts)
- Protected routes: /chats, /calls, /profile
- Auth routes: /signIn, /signUp, /forgotPassword, etc.

// Protection Logic:
- If accessing protected route without token → redirect to /signIn
- If accessing auth route with valid token → redirect to /chats
- Root path / → redirect based on auth status
```

### State Management

```typescript
// Server State (TanStack Query)
- API data fetching
- Caching (5 min stale time)
- Background refetching

// Client State (Zustand)
- UI state
- Socket connection state
- Typing indicators
- Online users
```

### Token Refresh Flow

```typescript
// Axios Response Interceptor
1. Request fails with 401
2. Check if we have refresh token
3. Queue the failed request
4. Call /refresh-tokens
5. Update stored access token
6. Retry queued requests
7. If refresh fails → logout
```

---

## ✨ Features

### 1. Authentication
- ✅ Email/Password registration
- ✅ Email verification
- ✅ Login with JWT tokens
- ✅ Token refresh mechanism
- ✅ Google OAuth login
- ✅ Password reset via email
- ✅ Protected routes (server + client)

### 2. User Management
- ✅ Profile viewing and editing
- ✅ Avatar upload (Cloudinary)
- ✅ Bio and status
- ✅ User search
- ✅ Online/offline status

### 3. Friend System
- ✅ Send friend requests
- ✅ Accept/reject requests
- ✅ Cancel sent requests
- ✅ View pending requests
- ✅ Friends list
- ✅ Remove friends

### 4. Conversations
- ✅ Create private conversations
- ✅ Conversation list with last message
- ✅ Search conversations
- ✅ Archive/unarchive
- ✅ Delete conversations

### 5. Messaging
- ✅ Real-time message sending
- ✅ Message types (text, image, video, file)
- ✅ Edit messages (within 5 minutes)
- ✅ Delete messages
- ✅ Message reactions (emojis)
- ✅ Read receipts
- ✅ Message search

### 6. Real-time Features
- ✅ Instant message delivery
- ✅ Typing indicators
- ✅ Online/offline presence
- ✅ Real-time read receipts
- ✅ Real-time reactions

### 7. Calls (In Progress)
- ✅ Initiate audio/video calls
- ✅ Call status management
- ✅ Call history
- ⏳ WebRTC integration

---

## 🚀 Setup & Installation

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Clone Repository

```bash
git clone https://github.com/Hussein-shsx3/WebSocket-Project.git
cd WebSocket-Project
```

### 2. Setup Server

```bash
cd server

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your values

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### 3. Setup Client

```bash
cd client

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Start development server
npm run dev
```

### 4. Access Application

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000
- **API Health:** http://localhost:5000/api/health

---

## 🔧 Environment Variables

### Server (.env)

```env
# Server
NODE_ENV=development
PORT=5000
SERVER_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/chatdb?schema=public

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRE=30d

# Bcrypt
BCRYPT_ROUNDS=10

# Email (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@chatapp.com

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Client (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## 📐 Best Practices Applied

### 1. Architecture Patterns

- ✅ **Layered Architecture:** Controllers → Services → Data Access
- ✅ **Single Responsibility:** Each service handles one domain
- ✅ **DTO Pattern:** Zod schemas for input validation
- ✅ **Repository Pattern:** Prisma for data access

### 2. Security

- ✅ **Helmet:** HTTP security headers
- ✅ **CORS:** Restricted to client origin
- ✅ **JWT:** Stateless authentication
- ✅ **bcrypt:** Password hashing (10 rounds)
- ✅ **httpOnly Cookies:** Refresh token storage
- ✅ **Input Validation:** Zod schemas

### 3. Error Handling

- ✅ **Custom Error Classes:** AppError, NotFoundError, etc.
- ✅ **Global Error Middleware:** Centralized error handling
- ✅ **Async Handler:** Wrapper for async route handlers
- ✅ **Prisma Error Handling:** Mapped to HTTP status codes

### 4. Code Quality

- ✅ **TypeScript:** Type safety throughout
- ✅ **ESLint:** Code linting
- ✅ **Consistent Naming:** camelCase, PascalCase conventions
- ✅ **Comments:** JSDoc-style documentation

### 5. Real-time Best Practices

- ✅ **Room-based Messaging:** Efficient broadcasting
- ✅ **Service Layer Reuse:** Socket.IO uses same services as HTTP
- ✅ **Event-Driven:** Clear event naming conventions
- ✅ **Error Broadcasting:** Socket error events

---

## 📝 Scripts Reference

### Server Scripts

```bash
npm run dev      # Start with ts-node (hot reload)
npm run build    # Compile TypeScript
npm run start    # Run compiled code
npm run watch    # Watch mode for TypeScript
npm run lint     # Run ESLint
```

### Client Scripts

```bash
npm run dev      # Start Next.js dev server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Database Scripts

```bash
npx prisma generate          # Generate Prisma client
npx prisma migrate dev       # Run migrations (dev)
npx prisma migrate deploy    # Run migrations (prod)
npx prisma studio            # Open Prisma Studio GUI
npx prisma db push           # Push schema without migration
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

**Hussein** - [GitHub](https://github.com/Hussein-shsx3)

---

> 📅 Last Updated: December 15, 2025
