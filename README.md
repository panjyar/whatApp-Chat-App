# WhapApp Chat App

A real-time chat application built with React, Node.js, and PostgreSQL, featuring instant messaging, user authentication, and contact management. This implementation uses local PostgreSQL with pgAdmin for database management.

## 🚀 Features

- **Real-time Messaging**: Instant message delivery with Socket.IO
- **JWT Authentication**: Secure login with access/refresh tokens
- **Contact Management**: Add and manage contacts
- **Message Threads**: Organized conversations between users
- **Search**: Find messages and conversations
- **AI Assistant**: Generate AI-powered replies (mock implementation)
- **Responsive UI**: Modern, mobile-friendly interface
- **Presence Indicators**: See when contacts are online/offline

## 🛠 Tech Stack

**Frontend:**
- React 18 with Vite
- React Router for navigation
- Tailwind CSS for styling
- Socket.IO Client for real-time features
- Axios for API calls
- Lucide React for icons

**Backend:**
- Node.js with Express
- Prisma ORM with PostgreSQL
- Socket.IO for WebSocket connections
- JWT for authentication
- bcryptjs for password hashing
- Express Rate Limit for security

**Database:**
- PostgreSQL 13
- Prisma migrations and seeding

## 🏗 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │   Express API   │    │   PostgreSQL    │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (Database)    │
│                 │    │                 │    │                 │
│ - Auth Context  │    │ - REST API      │    │ - Users         │
│ - Socket Context│    │ - Socket.IO     │    │ - Threads       │
│ - Components    │    │ - JWT Auth      │    │ - Messages      │
└─────────────────┘    └─────────────────┘    │ - Contacts      │
                                              └─────────────────┘
```

## 🚀 Quickstart

### Prerequisites
- Node.js 18+
- PostgreSQL 13+ (installed locally)
- pgAdmin 4
- npm or pnpm

### Database Setup

1. **Configure PostgreSQL**
   - Install PostgreSQL and pgAdmin if not already installed
   - Open pgAdmin and connect to your PostgreSQL server
   - Create a new database:
     ```sql
     CREATE DATABASE whatapp_chat;
     ```
   - Note your connection details (host, port, database name, username, password)

### Application Setup

1. **Clone and setup environment**
   ```bash
   git clone https://github.com/panjyar/whatApp-Chat-App.git
   cd WhapApp-Chat-App
   ```

3. **Setup Backend**
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma migrate dev
   npm run seed
   npm run dev
   ```

4. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Access the app**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - Database: localhost:5432


## 📚 API Documentation

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user

### Users
- `GET /api/v1/users/me` - Get current user
- `GET /api/v1/users/:id` - Get user by ID

### Contacts
- `GET /api/v1/contacts` - List user's contacts
- `POST /api/v1/contacts` - Add contact by email
- `DELETE /api/v1/contacts/:id` - Remove contact

### Threads & Messages
- `GET /api/v1/threads` - List user's threads
- `POST /api/v1/threads` - Create/get thread with user
- `GET /api/v1/threads/:id/messages` - Get thread messages
- `POST /api/v1/threads/:id/messages` - Send message
- `PUT /api/v1/threads/:id/messages/:msgId/read` - Mark message as read
- `POST /api/v1/threads/:id/ai` - Ask AI assistant

### Search
- `GET /api/v1/search?q=term&type=threads|messages` - Search

## 🔌 Socket.IO Events

### Client → Server
- `message:send` - Send message `{ threadId, content }`
- `message:read` - Mark message as read `{ threadId, messageId }`
- `typing` - Typing indicator `{ threadId, isTyping }`

### Server → Client
- `message:received` - New message received
- `message:read` - Message was read by recipient
- `typing` - User is typing
- `user:online` - Contact came online
- `user:offline` - Contact went offline

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## � Database Management

### Using pgAdmin
1. Open pgAdmin 4
2. Connect to your PostgreSQL server
3. Navigate to your database (whatapp_chat)
4. You can:
   - View tables and their relationships
   - Execute SQL queries
   - Monitor database performance
   - Manage backups

### Backup and Restore
1. **Creating a backup**
   ```bash
   pg_dump -U your_username -d whatapp_chat > backup.sql
   ```

2. **Restoring from backup**
   ```bash
   psql -U your_username -d whatapp_chat < backup.sql
   ```

## 🔒 Security Features

- JWT access tokens (15min expiry)
- HTTP-only refresh tokens (30 days)
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS protection
- Input validation and sanitization
- Helmet security headers

## 📱 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@postgres:5432/chatapp
JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d
PORT=4000
AI_PROVIDER_API_KEY=your-ai-key
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:4000/api/v1
VITE_WS_URL=http://localhost:4000
```


## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details
