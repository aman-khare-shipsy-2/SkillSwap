# Skill Swap API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication using JWT (JSON Web Tokens). Include the token in the Authorization header:

```
Authorization: Bearer <your-token>
```

### Authentication Flow

1. **Register** - Create a new user account
2. **Login** - Get authentication token
3. **Use Token** - Include token in Authorization header for protected endpoints

---

## Endpoints

### Health Check

#### GET `/api/health`
Check if the API is running.

**Response:**
```json
{
  "status": "OK",
  "message": "API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Authentication Endpoints

### Register

#### POST `/api/auth/register`
Create a new user account.

**Rate Limit:** 5 requests per 15 minutes per IP

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "offeredSkills": ["skillId1", "skillId2"]
}
```

**Validation:**
- `name`: Required, string, 2-50 characters
- `email`: Required, valid email format
- `password`: Required, string, min 8 characters, must contain uppercase, lowercase, and number
- `offeredSkills`: Optional, array of skill IDs

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "userId",
      "name": "John Doe",
      "email": "john@example.com",
      "offeredSkills": ["skillId1", "skillId2"],
      "desiredSkills": [],
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt-token-here"
  }
}
```

**Error Responses:**
- `400` - Validation error
- `409` - Email already exists
- `429` - Too many requests

---

### Login

#### POST `/api/auth/login`
Authenticate user and get JWT token.

**Rate Limit:** 5 requests per 15 minutes per IP

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Validation:**
- `email`: Required, valid email format
- `password`: Required, string

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "userId",
      "name": "John Doe",
      "email": "john@example.com",
      "offeredSkills": ["skillId1"],
      "desiredSkills": ["skillId2"]
    },
    "token": "jwt-token-here"
  }
}
```

**Error Responses:**
- `400` - Validation error
- `401` - Invalid credentials
- `429` - Too many requests

---

## User Endpoints

All user endpoints require authentication.

### Get Profile

#### GET `/api/users/me`
Get current user's profile.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "userId",
    "name": "John Doe",
    "email": "john@example.com",
    "offeredSkills": [
      {
        "_id": "skillId",
        "name": "JavaScript",
        "category": "Programming"
      }
    ],
    "desiredSkills": [],
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Update Profile

#### PUT `/api/users/me`
Update current user's profile.

**Request Body:**
```json
{
  "name": "John Updated",
  "bio": "Updated bio"
}
```

**Validation:**
- `name`: Optional, string, 2-50 characters
- `bio`: Optional, string, max 500 characters

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "userId",
    "name": "John Updated",
    "email": "john@example.com",
    "bio": "Updated bio"
  }
}
```

---

### Add Offered Skill

#### POST `/api/users/me/skills/offered`
Add a skill to user's offered skills.

**Request Body:**
```json
{
  "skillId": "skillId"
}
```

**Validation:**
- `skillId`: Required, valid MongoDB ObjectId

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "userId",
    "offeredSkills": ["skillId1", "skillId2"]
  }
}
```

---

### Remove Offered Skill

#### DELETE `/api/users/me/skills/offered/:skillId`
Remove a skill from user's offered skills.

**URL Parameters:**
- `skillId`: MongoDB ObjectId

**Response (200):**
```json
{
  "success": true,
  "message": "Skill removed from offered skills"
}
```

---

### Add Desired Skill

#### POST `/api/users/me/skills/desired`
Add a skill to user's desired skills.

**Request Body:**
```json
{
  "skillId": "skillId"
}
```

**Validation:**
- `skillId`: Required, valid MongoDB ObjectId

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "userId",
    "desiredSkills": ["skillId1"]
  }
}
```

---

### Remove Desired Skill

#### DELETE `/api/users/me/skills/desired/:skillId`
Remove a skill from user's desired skills.

**URL Parameters:**
- `skillId`: MongoDB ObjectId

**Response (200):**
```json
{
  "success": true,
  "message": "Skill removed from desired skills"
}
```

---

### Get User Analytics

#### GET `/api/users/me/analytics`
Get current user's analytics.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "averageRating": 4.5,
    "totalRatings": 10,
    "totalSessions": 5,
    "completedExchanges": 3
  }
}
```

---

## Skills Endpoints

### Get All Skills

#### GET `/api/skills`
Get all skills with search, filter, and pagination.

**Query Parameters:**
- `search`: Optional, string - Search by skill name
- `category`: Optional, string - Filter by category
- `page`: Optional, number - Page number (default: 1)
- `limit`: Optional, number - Items per page (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "skillId",
      "name": "JavaScript",
      "category": "Programming",
      "description": "JavaScript programming language"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

---

### Get Skill by ID

#### GET `/api/skills/:id`
Get a specific skill by ID.

**URL Parameters:**
- `id`: MongoDB ObjectId

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "skillId",
    "name": "JavaScript",
    "category": "Programming",
    "description": "JavaScript programming language"
  }
}
```

**Error Responses:**
- `404` - Skill not found

---

### Create Skill

#### POST `/api/skills`
Create a new skill. Requires authentication.

**Request Body:**
```json
{
  "name": "Python",
  "category": "Programming",
  "description": "Python programming language"
}
```

**Validation:**
- `name`: Required, string, 2-50 characters
- `category`: Required, string
- `description`: Optional, string, max 500 characters

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "skillId",
    "name": "Python",
    "category": "Programming",
    "description": "Python programming language"
  }
}
```

---

### Update Skill

#### PUT `/api/skills/:id`
Update a skill. Requires authentication.

**URL Parameters:**
- `id`: MongoDB ObjectId

**Request Body:**
```json
{
  "name": "Python 3",
  "description": "Updated description"
}
```

**Validation:**
- `name`: Optional, string, 2-50 characters
- `category`: Optional, string
- `description`: Optional, string, max 500 characters

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "skillId",
    "name": "Python 3",
    "category": "Programming",
    "description": "Updated description"
  }
}
```

---

### Delete Skill

#### DELETE `/api/skills/:id`
Delete a skill. Requires authentication.

**URL Parameters:**
- `id`: MongoDB ObjectId

**Response (200):**
```json
{
  "success": true,
  "message": "Skill deleted successfully"
}
```

---

## Request Endpoints

All request endpoints require authentication.

### Create Request

#### POST `/api/requests`
Create a skill exchange request.

**Request Body:**
```json
{
  "toUserId": "userId",
  "offeredSkillId": "skillId1",
  "requestedSkillId": "skillId2",
  "message": "I'd like to exchange skills"
}
```

**Validation:**
- `toUserId`: Required, valid MongoDB ObjectId, cannot be self
- `offeredSkillId`: Required, valid MongoDB ObjectId
- `requestedSkillId`: Required, valid MongoDB ObjectId
- `message`: Optional, string, max 500 characters

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "requestId",
    "fromUser": "userId1",
    "toUser": "userId2",
    "offeredSkill": "skillId1",
    "requestedSkill": "skillId2",
    "status": "pending",
    "message": "I'd like to exchange skills",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Validation error or cannot send to self
- `404` - User or skill not found

---

### Get My Requests

#### GET `/api/requests/me`
Get user's sent and received requests.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sent": [
      {
        "_id": "requestId",
        "toUser": {
          "_id": "userId",
          "name": "Jane Doe"
        },
        "offeredSkill": {
          "_id": "skillId1",
          "name": "JavaScript"
        },
        "requestedSkill": {
          "_id": "skillId2",
          "name": "Python"
        },
        "status": "pending"
      }
    ],
    "received": []
  }
}
```

---

### Search Users

#### GET `/api/requests/search`
Search users for skill exchange.

**Query Parameters:**
- `skillId`: Required, string - Skill ID to search for
- `page`: Optional, number - Page number (default: 1)
- `limit`: Optional, number - Items per page (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "userId",
      "name": "Jane Doe",
      "offeredSkills": [
        {
          "_id": "skillId",
          "name": "Python"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

---

### Accept Request

#### POST `/api/requests/:id/accept`
Accept a skill exchange request.

**URL Parameters:**
- `id`: MongoDB ObjectId

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "requestId",
    "status": "accepted",
    "chatSession": "chatSessionId"
  }
}
```

**Error Responses:**
- `400` - Request not in pending status
- `404` - Request not found

---

### Reject Request

#### POST `/api/requests/:id/reject`
Reject a skill exchange request.

**URL Parameters:**
- `id`: MongoDB ObjectId

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "requestId",
    "status": "rejected"
  }
}
```

---

### Forfeit Request

#### POST `/api/requests/:id/forfeit`
Forfeit a skill exchange request (cancel by sender).

**URL Parameters:**
- `id`: MongoDB ObjectId

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "requestId",
    "status": "forfeited"
  }
}
```

---

## Chat Endpoints

All chat endpoints require authentication.

### Get My Chats

#### GET `/api/chats`
Get user's chat sessions.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "chatId",
      "participants": [
        {
          "_id": "userId1",
          "name": "John Doe"
        },
        {
          "_id": "userId2",
          "name": "Jane Doe"
        }
      ],
      "messages": [],
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Get Chat Session

#### GET `/api/chats/:id`
Get a specific chat session with messages.

**URL Parameters:**
- `id`: MongoDB ObjectId

**Query Parameters:**
- `page`: Optional, number - Page number (default: 1)
- `limit`: Optional, number - Messages per page (default: 50)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "chatId",
    "participants": [
      {
        "_id": "userId1",
        "name": "John Doe"
      }
    ],
    "messages": [
      {
        "_id": "messageId",
        "sender": "userId1",
        "content": "Hello!",
        "type": "text",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "status": "active"
  }
}
```

---

### Send Message

#### POST `/api/chats/:id/messages`
Send a message in a chat session.

**URL Parameters:**
- `id`: MongoDB ObjectId

**Request Body (multipart/form-data):**
- `content`: Optional, string - Message text
- `type`: Required, string - "text", "image", "video", or "document"
- `file`: Optional, file - File attachment

**Validation:**
- `content`: Required if type is "text", string, max 1000 characters
- `type`: Required, enum: ["text", "image", "video", "document"]
- `file`: Required if type is not "text", valid file type

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "messageId",
    "sender": "userId",
    "content": "Hello!",
    "type": "text",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Upload File

#### POST `/api/chats/upload`
Upload a file for chat. Returns file URL.

**Rate Limit:** 20 requests per hour per IP

**Request Body (multipart/form-data):**
- `file`: Required, file - File to upload

**Response (200):**
```json
{
  "success": true,
  "data": {
    "url": "/uploads/filename-1234567890.jpg",
    "filename": "filename-1234567890.jpg"
  }
}
```

---

### End Chat Session

#### POST `/api/chats/:id/end`
End a chat session.

**URL Parameters:**
- `id`: MongoDB ObjectId

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "chatId",
    "status": "ended",
    "endedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Rating Endpoints

All rating endpoints require authentication.

### Create Rating

#### POST `/api/ratings`
Create a rating for a completed skill exchange.

**Request Body:**
```json
{
  "chatSessionId": "chatId",
  "ratedUserId": "userId",
  "rating": 5,
  "comment": "Great exchange!"
}
```

**Validation:**
- `chatSessionId`: Required, valid MongoDB ObjectId
- `ratedUserId`: Required, valid MongoDB ObjectId, cannot be self
- `rating`: Required, number, 1-5
- `comment`: Optional, string, max 500 characters

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "ratingId",
    "rater": "userId1",
    "rated": "userId2",
    "chatSession": "chatId",
    "rating": 5,
    "comment": "Great exchange!",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Cannot rate self, already rated, or invalid chat session
- `404` - Chat session or user not found

---

### Get My Ratings

#### GET `/api/ratings/me`
Get user's ratings (given and received).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "given": [
      {
        "_id": "ratingId",
        "rated": {
          "_id": "userId",
          "name": "Jane Doe"
        },
        "rating": 5,
        "comment": "Great!"
      }
    ],
    "received": [],
    "averageRating": 0,
    "totalRatings": 0
  }
}
```

---

### Get Rating by ID

#### GET `/api/ratings/:id`
Get a specific rating by ID.

**URL Parameters:**
- `id`: MongoDB ObjectId

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "ratingId",
    "rater": {
      "_id": "userId1",
      "name": "John Doe"
    },
    "rated": {
      "_id": "userId2",
      "name": "Jane Doe"
    },
    "rating": 5,
    "comment": "Great exchange!"
  }
}
```

---

## Verification Endpoints

All verification endpoints require authentication.

### Start Test

#### POST `/api/verification/start`
Start a verification test for a skill.

**Request Body:**
```json
{
  "skillId": "skillId"
}
```

**Validation:**
- `skillId`: Required, valid MongoDB ObjectId

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "testId",
    "skill": "skillId",
    "user": "userId",
    "status": "in-progress",
    "questions": [
      {
        "question": "What is JavaScript?",
        "options": ["A", "B", "C", "D"],
        "type": "multiple-choice"
      }
    ],
    "startedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Submit Test

#### POST `/api/verification/submit`
Submit test answers.

**Request Body:**
```json
{
  "testId": "testId",
  "answers": [
    {
      "questionId": "questionId1",
      "answer": "A"
    }
  ]
}
```

**Validation:**
- `testId`: Required, valid MongoDB ObjectId
- `answers`: Required, array of answer objects

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "testId",
    "status": "completed",
    "score": 8,
    "totalQuestions": 10,
    "passed": true,
    "completedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Get Test Status

#### GET `/api/verification/status`
Get user's verification status for all skills.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "skill": {
        "_id": "skillId",
        "name": "JavaScript"
      },
      "status": "verified",
      "score": 9,
      "completedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Get Test by ID

#### GET `/api/verification/:id`
Get a specific test by ID.

**URL Parameters:**
- `id`: MongoDB ObjectId

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "testId",
    "skill": {
      "_id": "skillId",
      "name": "JavaScript"
    },
    "status": "completed",
    "score": 8,
    "totalQuestions": 10,
    "passed": true
  }
}
```

---

## WebSocket Events

### Connection
Connect to WebSocket server:
```
ws://localhost:5000
```

Include JWT token in connection:
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events

#### `join-chat`
Join a chat room.

**Emit:**
```json
{
  "chatId": "chatId"
}
```

#### `leave-chat`
Leave a chat room.

**Emit:**
```json
{
  "chatId": "chatId"
}
```

#### `send-message`
Send a real-time message.

**Emit:**
```json
{
  "chatId": "chatId",
  "content": "Hello!",
  "type": "text"
}
```

**Receive:**
```json
{
  "_id": "messageId",
  "sender": "userId",
  "content": "Hello!",
  "type": "text",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### `typing`
Indicate user is typing.

**Emit:**
```json
{
  "chatId": "chatId"
}
```

#### `stop-typing`
Indicate user stopped typing.

**Emit:**
```json
{
  "chatId": "chatId"
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Error type",
  "details": "Additional error details (optional)"
}
```

### HTTP Status Codes

- `200` - OK
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error

### Common Error Messages

- `INVALID_CREDENTIALS` - Invalid email or password
- `UNAUTHORIZED` - Unauthorized access
- `TOKEN_EXPIRED` - Token has expired
- `TOKEN_INVALID` - Invalid token
- `USER_NOT_FOUND` - User not found
- `VALIDATION_ERROR` - Validation error
- `NOT_FOUND` - Resource not found
- `FORBIDDEN` - Access forbidden

---

## Rate Limiting

- **General API:** 100 requests per 15 minutes per IP
- **Authentication:** 5 requests per 15 minutes per IP
- **File Uploads:** 20 uploads per hour per IP

Rate limit headers are included in responses:
- `X-RateLimit-Limit` - Request limit
- `X-RateLimit-Remaining` - Remaining requests
- `X-RateLimit-Reset` - Reset time (Unix timestamp)

---

## File Upload Limits

- **Max File Size:** 20MB (configurable)
- **Max Image Size:** 5MB
- **Max Video Size:** 20MB
- **Max Document Size:** 10MB

### Allowed File Types

**Images:**
- `image/jpeg`
- `image/png`
- `image/gif`
- `image/webp`

**Videos:**
- `video/mp4`
- `video/webm`
- `video/ogg`

**Documents:**
- `application/pdf`
- `application/msword`
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

---

## Pagination

List endpoints support pagination with query parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

Pagination response format:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

