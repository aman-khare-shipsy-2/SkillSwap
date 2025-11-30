# Skill Swap Backend API

A Node.js/Express backend API for the Skill Swap platform - a peer-to-peer skill exchange marketplace.

## Features

- 🔐 JWT-based authentication
- 👥 User profile management
- 🎯 Skills management
- 📝 Skill exchange requests
- 💬 Real-time chat with Socket.io
- ⭐ Rating system
- ✅ Skill verification tests
- 📊 User analytics
- 🔒 Security features (rate limiting, input sanitization, validation)
- 📁 File upload support
- 📝 Comprehensive logging

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Language:** TypeScript
- **Real-time:** Socket.io
- **Authentication:** JWT (jsonwebtoken)
- **Security:** Helmet, CORS, express-rate-limit, express-mongo-sanitize
- **Validation:** express-validator
- **File Upload:** Multer
- **Background Jobs:** node-cron
- **Logging:** Custom logger with Morgan

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   cd skill-swap-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/skill-swap
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=7d
   UPLOAD_PATH=./uploads
   MAX_FILE_SIZE=20971520
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Create upload directory**
   ```bash
   mkdir -p uploads
   ```

## Running the Application

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:5000` (or the port specified in `.env`).

### Production Mode

1. **Build the TypeScript code**
   ```bash
   npm run build
   ```

2. **Start the server**
   ```bash
   npm start
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/skill-swap` |
| `JWT_SECRET` | Secret key for JWT tokens | `default-secret-change-in-production` |
| `JWT_EXPIRES_IN` | JWT token expiration time | `7d` |
| `UPLOAD_PATH` | Directory for file uploads | `./uploads` |
| `MAX_FILE_SIZE` | Maximum file size in bytes | `20971520` (20MB) |
| `CORS_ORIGIN` | Allowed CORS origins (comma-separated) | `http://localhost:3000` |

## Project Structure

```
skill-swap-backend/
├── src/
│   ├── config/           # Configuration
│   ├── controllers/      # Route controllers
│   ├── database/         # Database connection
│   ├── jobs/             # Background jobs (cron)
│   ├── middlewares/      # Express middlewares
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── socket/           # Socket.io setup
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   ├── validators/       # Input validators
│   ├── app.ts            # Express app setup
│   └── server.ts         # Server entry point
├── uploads/              # File uploads directory
├── .env                  # Environment variables (not in git)
├── .env.example          # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
├── API_DOCUMENTATION.md  # API documentation
└── README.md
```

## API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API documentation including:
- All endpoints
- Request/response formats
- Authentication flow
- Error codes
- WebSocket events
- Rate limiting
- File upload limits

## API Endpoints Overview

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/me` - Get profile
- `PUT /api/users/me` - Update profile
- `POST /api/users/me/skills/offered` - Add offered skill
- `DELETE /api/users/me/skills/offered/:skillId` - Remove offered skill
- `POST /api/users/me/skills/desired` - Add desired skill
- `DELETE /api/users/me/skills/desired/:skillId` - Remove desired skill
- `GET /api/users/me/analytics` - Get analytics

### Skills
- `GET /api/skills` - Get all skills
- `GET /api/skills/:id` - Get skill by ID
- `POST /api/skills` - Create skill (authenticated)
- `PUT /api/skills/:id` - Update skill (authenticated)
- `DELETE /api/skills/:id` - Delete skill (authenticated)

### Requests
- `POST /api/requests` - Create request
- `GET /api/requests/me` - Get my requests
- `GET /api/requests/search` - Search users
- `POST /api/requests/:id/accept` - Accept request
- `POST /api/requests/:id/reject` - Reject request
- `POST /api/requests/:id/forfeit` - Forfeit request

### Chats
- `GET /api/chats` - Get my chats
- `GET /api/chats/:id` - Get chat session
- `POST /api/chats/:id/messages` - Send message
- `POST /api/chats/upload` - Upload file
- `POST /api/chats/:id/end` - End chat session

### Ratings
- `POST /api/ratings` - Create rating
- `GET /api/ratings/me` - Get my ratings
- `GET /api/ratings/:id` - Get rating by ID

### Verification
- `POST /api/verification/start` - Start test
- `POST /api/verification/submit` - Submit test
- `GET /api/verification/status` - Get verification status
- `GET /api/verification/:id` - Get test by ID

### Health Check
- `GET /api/health` - Check API status

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-token>
```

Get a token by registering or logging in through the `/api/auth/register` or `/api/auth/login` endpoints.

## WebSocket Connection

Connect to the WebSocket server for real-time chat:

```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

See API documentation for available WebSocket events.

## Background Jobs

The application includes background jobs that run automatically:

1. **Request Expiry Job** - Runs daily at midnight to expire pending requests
2. **Analytics Update Job** - Runs daily at 2 AM to update user analytics

## Security Features

- **Rate Limiting:** Prevents abuse with configurable limits
- **Input Sanitization:** Protects against XSS and NoSQL injection
- **JWT Authentication:** Secure token-based authentication
- **Password Hashing:** BCrypt for password security
- **CORS:** Configurable cross-origin resource sharing
- **Helmet:** Security headers
- **Validation:** Comprehensive input validation

## File Uploads

File uploads are supported for:
- User profile images
- Chat messages (images, videos, documents)

Files are stored in the `uploads/` directory (configurable via `UPLOAD_PATH`).

### File Size Limits
- Images: 5MB max
- Videos: 20MB max
- Documents: 10MB max
- General: 20MB max

## Logging

The application includes comprehensive logging:
- Request logging with timing
- Error logging with context
- Database operation logging
- File upload logging
- Authentication event logging

Logs are output to console. In production, consider integrating with a logging service.

## Error Handling

The API uses consistent error responses:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Error type",
  "details": "Additional details (optional)"
}
```

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Type Checking

```bash
npx tsc --noEmit
```

## Testing

Manual testing endpoints using:
- Postman
- cURL
- Any HTTP client

See API_DOCUMENTATION.md for request/response examples.

## Deployment

### Deploy to Render (Free Tier)

The easiest way to deploy this backend is using Render's free tier. See the complete deployment guide: [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)

**Quick Steps:**
1. Push your code to GitHub
2. Create a MongoDB Atlas account (free tier)
3. Create a new Web Service on Render
4. Connect your GitHub repository
5. Set environment variables
6. Deploy!

**Render automatically provides:**
- HTTPS/SSL certificates
- Automatic deployments on git push
- Health checks
- Logs and monitoring

### Production Checklist

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET` (32+ characters)
3. Configure proper `CORS_ORIGIN`
4. Set up MongoDB connection string (MongoDB Atlas recommended)
5. Configure file upload directory
6. Set up monitoring and alerts
7. Test all endpoints after deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/skill-swap?retryWrites=true&w=majority
JWT_SECRET=your-very-strong-secret-key-here-minimum-32-characters
JWT_EXPIRES_IN=7d
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=20971520
CORS_ORIGIN=https://yourdomain.com,http://localhost:3000
```

**Note:** On Render, `PORT` is automatically set. For other platforms, use the port provided by your hosting service.

## Troubleshooting

### MongoDB Connection Issues
- Verify MongoDB is running
- Check `MONGODB_URI` in `.env`
- Ensure network connectivity

### Port Already in Use
- Change `PORT` in `.env`
- Or stop the process using the port

### File Upload Issues
- Ensure `uploads/` directory exists
- Check file size limits
- Verify file type is allowed

## Contributing

1. Follow TypeScript best practices
2. Use consistent error handling
3. Add logging for important operations
4. Update API documentation for new endpoints
5. Test all endpoints before committing

## License

[Your License Here]

## Support

For issues and questions, please open an issue in the repository.

