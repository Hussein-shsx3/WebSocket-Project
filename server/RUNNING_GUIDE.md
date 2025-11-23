# Server Setup & Running Guide

## ✅ Server is Running!

Your backend server is now running on **http://localhost:5000** in development mode with the following features:

### 🚀 Currently Running:
- **Express Server** - API endpoints ready
- **Socket.IO** - Real-time WebSocket communication
- **JWT Authentication** - Access & Refresh tokens
- **Email Service** - Email verification capabilities
- **Database** - Offline mode (ready to connect when DB is available)

---

## 📦 Available npm Scripts

```bash
npm run dev      # Start development server with hot reload (ts-node)
npm run build    # Compile TypeScript to JavaScript
npm start        # Run compiled server from dist/
npm run watch    # Watch TypeScript files and compile on changes
npm run lint     # Run ESLint on src directory
npm test         # Run tests (placeholder)
```

---

## 🗄️ Database Setup

### Option 1: Using PostgreSQL Locally

1. **Install PostgreSQL** (if not already installed)
   - Download from https://www.postgresql.org/download/

2. **Create Database**
   ```bash
   # Using psql command line
   createdb chatdb
   ```

3. **Update .env with your database credentials**
   ```dotenv
   DATABASE_URL="postgresql://username:password@localhost:5432/chatdb?schema=public"
   ```

4. **Run Prisma migrations**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Seed database (optional)**
   ```bash
   npx prisma db seed
   ```

### Option 2: Using Docker

1. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   
   services:
     postgres:
       image: postgres:15-alpine
       environment:
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: password
         POSTGRES_DB: chatdb
       ports:
         - "5432:5432"
       volumes:
         - postgres_data:/var/lib/postgresql/data
   
   volumes:
     postgres_data:
   ```

2. **Start PostgreSQL**
   ```bash
   docker-compose up -d
   ```

3. **Update .env**
   ```dotenv
   DATABASE_URL="postgresql://postgres:password@localhost:5432/chatdb?schema=public"
   ```

4. **Run migrations**
   ```bash
   npx prisma migrate dev --name init
   ```

---

## 🔌 API Endpoints

### Health Check
```bash
GET http://localhost:5000/api/health
```

Response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-11-23T12:00:00.000Z"
}
```

### Protected Routes
To access protected endpoints, include Authorization header:
```bash
Authorization: Bearer <accessToken>
```

---

## 🌐 WebSocket Events

The server is listening for WebSocket connections at `http://localhost:5000`

### Available Socket Events:
- `join_room` - Join a chat room
- `send_message` - Send a message
- `leave_room` - Leave a chat room
- `disconnect` - Client disconnects

Example WebSocket connection (Client-side):
```typescript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.emit('join_room', 'room-id');
```

---

## 📋 Environment Variables

Your `.env` file is configured with:

```dotenv
# Server
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://..."

# JWT (15m access, 7d refresh)
JWT_SECRET="..."
JWT_EXPIRE="15m"
JWT_REFRESH_SECRET="..."
JWT_REFRESH_EXPIRE="7d"

# Email Service (Gmail)
EMAIL_SERVICE="gmail"
EMAIL_USER="husseinshsx3@gmail.com"
EMAIL_PASSWORD="tgtutktlosuhazsq"
EMAIL_FROM="Chat App"

# Bcrypt
BCRYPT_ROUNDS=10
```

---

## 🔧 Troubleshooting

### Issue: "Database connection failed"
**Solution:** This is normal if PostgreSQL is not running. The server will run in offline mode.
- Install PostgreSQL or Docker
- Start the database service
- Update DATABASE_URL in .env
- Restart the server

### Issue: "Port 5000 already in use"
**Solution:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

Or change PORT in .env:
```dotenv
PORT=5001
```

### Issue: "Cannot find module 'ts-node'"
**Solution:**
```bash
npm install
```

### Issue: "Prisma client not initialized"
**Solution:**
```bash
npx prisma generate
```

---

## 📁 Project Structure

```
server/
├── src/
│   ├── app.ts                 # Express app setup
│   ├── server.ts              # HTTP server & Socket.IO
│   ├── config/
│   │   └── env.config.ts      # Environment configuration
│   ├── middleware/
│   │   ├── auth.middleware.ts    # JWT authentication
│   │   ├── error.middleware.ts   # Error handling
│   │   └── validate.middleware.ts # Zod validation
│   ├── utils/
│   │   └── jwt.util.ts        # JWT token functions
│   ├── services/
│   │   └── email.service.ts   # Email sending
│   ├── controllers/           # (To be created)
│   ├── routes/               # (To be created)
│   ├── types/
│   │   └── error.types.ts    # Custom error classes
│   └── validators/           # (To be created)
├── prisma/
│   └── schema.prisma         # Database schema
├── .env                       # Environment variables
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
└── README.md
```

---

## 🚀 Next Steps

1. ✅ Set up PostgreSQL database
2. ✅ Run Prisma migrations
3. ✅ Create API routes:
   - Authentication (register, login, refresh)
   - Users (profile, update, delete)
   - Conversations (create, get, list)
   - Messages (send, get, edit, delete)
4. ✅ Implement controllers for each route
5. ✅ Test with Postman or Thunder Client
6. ✅ Connect to Next.js frontend

---

## 📚 Documentation

- **JWT & Email Setup:** See `JWT_EMAIL_SETUP.md`
- **Setup Complete:** See `SETUP_COMPLETE.md`
- **Prisma Docs:** https://www.prisma.io/docs/
- **Express Docs:** https://expressjs.com/
- **Socket.IO Docs:** https://socket.io/docs/

---

## 🎯 Quick Command Reference

```bash
# Development
npm run dev              # Start dev server
npm run watch           # Watch & compile TypeScript

# Production
npm run build           # Compile to dist/
npm start              # Run compiled server

# Database
npx prisma generate    # Generate Prisma client
npx prisma migrate dev # Create and run migrations
npx prisma studio     # Open Prisma Studio (GUI)

# Code Quality
npm run lint           # Run linter
```

---

## ✅ Server Status

**Current State:** ✅ Running
- **Host:** localhost
- **Port:** 5000
- **URL:** http://localhost:5000
- **WebSocket:** Available
- **Database:** Offline mode (optional)

Your server is ready for development! 🎉
