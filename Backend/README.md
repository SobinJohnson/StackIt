# StackIt Backend

A real-time Q&A forum platform backend built with Node.js, Express, MongoDB, and Socket.IO.

## 🚀 Features

- **User Authentication** - JWT-based authentication with role-based access
- **Questions & Answers** - Full CRUD operations with rich text support
- **Real-time Updates** - Live notifications, vote updates, and typing indicators
- **Voting System** - Upvote/downvote answers with real-time updates
- **Search & Filtering** - Full-text search with tag-based filtering
- **Notification System** - Real-time notifications for answers, mentions, and votes
- **Admin Features** - User moderation and content management

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   cd Backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   - Copy `config.env` and update the values:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/stackit
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

4. **Start MongoDB**

   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```

5. **Run the server**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 📡 API Endpoints

### Authentication

```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login user
GET    /api/auth/me          - Get current user profile
POST   /api/auth/logout      - Logout user
```

### Questions

```
GET    /api/questions                    - Get all questions (with filters)
GET    /api/questions/:id               - Get single question
POST   /api/questions                   - Create new question
PUT    /api/questions/:id               - Update question
DELETE /api/questions/:id               - Delete question
```

### Answers

```
GET    /api/answers/questions/:questionId  - Get answers for question
POST   /api/answers/questions/:questionId  - Create answer
PUT    /api/answers/:id                    - Update answer
DELETE /api/answers/:id                    - Delete answer
POST   /api/answers/:id/vote              - Vote on answer
POST   /api/answers/:id/accept            - Accept answer
```

### Notifications

```
GET    /api/notifications                - Get user notifications
GET    /api/notifications/unread-count   - Get unread count
PUT    /api/notifications/:id/read       - Mark as read
PUT    /api/notifications/read-all       - Mark all as read
DELETE /api/notifications/:id            - Delete notification
```

## 🔌 Socket.IO Events

### Client → Server

```javascript
// Authenticate
socket.emit("authenticate", { token: "jwt_token" });

// Join question room
socket.emit("join_question", { questionId: "question_id" });

// Typing indicators
socket.emit("typing", { questionId: "question_id" });
socket.emit("stop_typing", { questionId: "question_id" });
```

### Server → Client

```javascript
// New notification
socket.on("new_notification", (data) => {
  // Update notification badge
});

// New answer
socket.on("new_answer", (data) => {
  // Add answer to UI
});

// Vote updated
socket.on("vote_updated", (data) => {
  // Update vote counts
});

// Answer accepted
socket.on("answer_accepted", (data) => {
  // Update UI to show accepted answer
});
```

## 📊 Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  username: String,         // unique
  email: String,            // unique
  passwordHash: String,     // hashed
  role: "user" | "admin",
  avatarUrl: String,        // optional
  bio: String,              // optional
  isBanned: Boolean,        // moderation flag
  createdAt: Date,
  updatedAt: Date
}
```

### Questions Collection

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,            // rich text (HTML)
  tags: [String],                // e.g. ["react", "jwt"]
  authorId: ObjectId,            // ref → Users._id
  answerCount: Number,
  acceptedAnswerId: ObjectId,    // ref → Answers._id
  viewCount: Number,
  searchText: String,            // for full-text search
  createdAt: Date,
  updatedAt: Date
}
```

### Answers Collection

```javascript
{
  _id: ObjectId,
  questionId: ObjectId,        // ref → Questions._id
  authorId: ObjectId,          // ref → Users._id
  content: String,             // rich text
  upvotes: Number,
  downvotes: Number,
  isAccepted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Notifications Collection

```javascript
{
  _id: ObjectId,
  recipientId: ObjectId,      // ref → Users._id
  type: "answer" | "comment" | "mention" | "vote" | "accept",
  questionId: ObjectId,
  answerId: ObjectId,         // optional
  content: String,
  isRead: Boolean,
  senderId: ObjectId,         // ref → Users._id
  createdAt: Date
}
```

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## 🎯 Example Usage

### Register a new user

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securepass123"
  }'
```

### Create a question

```bash
curl -X POST http://localhost:5000/api/questions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "title": "How to implement JWT authentication?",
    "description": "<p>I am building a React app and need help with JWT authentication...</p>",
    "tags": ["react", "jwt", "authentication"]
  }'
```

### Post an answer

```bash
curl -X POST http://localhost:5000/api/answers/questions/<question_id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "content": "<p>Here is how to implement JWT authentication...</p>"
  }'
```

## 🚀 Real-time Features

The backend includes real-time functionality for:

- ✅ Live notifications when someone answers your question
- ✅ Real-time vote count updates
- ✅ Live typing indicators
- ✅ Instant notification badge updates
- ✅ Real-time answer acceptance notifications

## 🔧 Development

### Project Structure

```
Backend/
├── src/
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API route handlers
│   ├── middleware/       # Authentication & validation
│   ├── socket/           # Socket.IO handlers
│   ├── utils/            # Database connection
│   └── app.js           # Main application file
├── package.json
├── config.env
└── README.md
```

### Running Tests

```bash
# Add test scripts to package.json when ready
npm test
```

## 📝 Environment Variables

| Variable      | Description               | Default                             |
| ------------- | ------------------------- | ----------------------------------- |
| `PORT`        | Server port               | `5000`                              |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/stackit` |
| `JWT_SECRET`  | JWT signing secret        | Required                            |
| `NODE_ENV`    | Environment mode          | `development`                       |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.
