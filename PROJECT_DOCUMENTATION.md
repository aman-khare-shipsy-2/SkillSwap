# Skill Swap - Project Documentation

## Overview

Skill Swap is a peer-to-peer skill exchange platform that enables users to teach and learn skills from each other. The platform facilitates skill verification, real-time communication, and structured learning exchanges through a modern web application built with React and Node.js.

---

## 1. Methodology

### 1.1 Development Approach

The project was developed using an **iterative, phased approach** with clear separation between backend and frontend implementation:

#### Backend Development Methodology
- **Phase-by-phase implementation**: Backend was built in 14 distinct phases, starting with core infrastructure and gradually adding features
- **Layered architecture**: Clear separation of concerns with Models → Services → Controllers → Routes
- **API-first design**: RESTful API endpoints designed before frontend integration
- **Test-driven validation**: Each phase was validated through manual API testing using cURL/Postman

#### Frontend Development Methodology
- **Component-based architecture**: React components organized by feature and reusability
- **Progressive enhancement**: Core functionality first, then UI/UX improvements
- **Design system approach**: Centralized design tokens (colors, typography, spacing) applied consistently
- **User-centric flow**: Registration → Skill Selection → Dashboard workflow

### 1.2 Technology Selection Rationale

**Backend Stack:**
- **Node.js + Express**: Fast, scalable, JavaScript ecosystem consistency
- **TypeScript**: Type safety, better developer experience, reduced runtime errors
- **MongoDB + Mongoose**: Flexible schema for evolving user profiles and skill data
- **Socket.io**: Real-time bidirectional communication for chat
- **JWT**: Stateless authentication, scalable across multiple servers
- **Express Validator**: Input validation and sanitization
- **Node-cron**: Scheduled tasks for request expiration and analytics

**Frontend Stack:**
- **React + TypeScript**: Component reusability, type safety, large ecosystem
- **Vite**: Fast development server, optimized builds
- **React Router**: Client-side routing with protected routes
- **Zustand**: Lightweight state management for authentication
- **React Query**: Server state management, caching, automatic refetching
- **Tailwind CSS**: Utility-first CSS, rapid UI development
- **React Hook Form**: Performant form handling with validation

### 1.3 Design Principles

1. **Predefined Skills Model**: Only 14 curated skills are supported, ensuring quality and verification feasibility
2. **Verification Requirement**: Skills must be verified through expert-curated tests before users can offer them
3. **Bidirectional Exchange**: Users must offer a skill to request learning another skill
4. **Real-time Communication**: Integrated chat system for skill exchange sessions
5. **Minimal, Modern UI**: Clean design with Syne font, soft shadows, and consistent spacing

---

## 2. System Design and Implementation

### 2.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Pages   │  │Components│  │ Services │  │  Store   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST API
                         │ WebSocket (Socket.io)
┌────────────────────────▼────────────────────────────────────┐
│                    Backend (Node.js/Express)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Routes   │  │Controllers│  │ Services │  │  Models  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│  │Middleware│  │  Jobs    │  │  Socket  │                │
│  └──────────┘  └──────────┘  └──────────┘                │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    MongoDB Database                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Users   │  │  Skills  │  │ Requests │  │  Chats   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│  │ Ratings  │  │Verification│ │Analytics │                │
│  └──────────┘  └──────────┘  └──────────┘                │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Backend Architecture

#### 2.2.1 Layered Architecture

**Models Layer** (`src/models/`)
- **User Model**: Stores user profiles, offered/desired skills, ratings, verification status
- **Skill Model**: Predefined skills with categories and descriptions
- **SkillRequest Model**: Exchange requests between users with status tracking
- **ChatSession Model**: Real-time chat sessions linked to skill exchanges
- **Rating Model**: User ratings and feedback after skill exchanges
- **VerificationTest Model**: Skill verification tests and results
- **Analytics Model**: Aggregated user statistics and platform metrics

**Services Layer** (`src/services/`)
- Business logic separation from controllers
- Database operations and data transformations
- Reusable functions across multiple controllers
- Examples: `auth.service.ts`, `skills.service.ts`, `requests.service.ts`

**Controllers Layer** (`src/controllers/`)
- Request/response handling
- Input validation coordination
- Error handling and status codes
- Examples: `auth.controller.ts`, `users.controller.ts`, `skills.controller.ts`

**Routes Layer** (`src/routes/`)
- Endpoint definitions
- Middleware composition (authentication, validation, rate limiting)
- Route organization by feature

**Middleware Layer** (`src/middlewares/`)
- **Authentication**: JWT token verification
- **Validation**: Request data validation using express-validator
- **Error Handling**: Centralized error processing
- **Rate Limiting**: Request throttling (disabled for personal project)
- **Sanitization**: Input sanitization to prevent injection attacks
- **Upload**: File upload handling with Multer
- **Logging**: Request logging and monitoring

**Jobs Layer** (`src/jobs/`)
- **Request Expiry Job**: Automatically expires skill exchange requests after 30 days
- **Analytics Update Job**: Daily aggregation of user statistics and platform metrics

#### 2.2.2 Key Backend Features

**Authentication & Authorization**
- JWT-based stateless authentication
- Password hashing with bcryptjs (10 rounds)
- Protected routes with authentication middleware
- User context injection via `req.user` and `req.userId`

**Skill Management**
- Predefined skills list (14 skills) enforced at both frontend and backend
- Automatic skill seeding on server startup
- Skill validation against predefined list
- Case-insensitive skill matching

**Request System**
- Bidirectional skill exchange requests
- Request expiration (30 days)
- Status tracking: pending, accepted, rejected, completed, expired
- Automatic status updates via cron jobs

**Real-time Communication**
- Socket.io integration for chat
- Room-based chat sessions
- File upload support in chat
- Message persistence in database

**Verification System**
- Expert-curated skill verification tests
- Test scoring and passing criteria (70% threshold)
- Verification status tracking per user per skill

### 2.3 Frontend Architecture

#### 2.3.1 Component Structure

```
src/
├── pages/              # Route-level components
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── SkillSelection.tsx
│   ├── Dashboard.tsx
│   ├── Chat.tsx
│   └── VerificationTest.tsx
├── components/         # Reusable UI components
│   ├── layout/
│   │   └── DashboardLayout.tsx
│   └── SearchBar.tsx
├── services/          # API service layer
│   ├── api.ts         # Axios instance with interceptors
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── skill.service.ts
│   └── ...
├── store/             # State management (Zustand)
│   └── authStore.ts
├── routes/            # Route configuration
│   └── AppRoutes.tsx
├── constants/         # App constants
│   ├── index.ts
│   └── skills.ts     # Predefined skills list
└── types/             # TypeScript type definitions
    └── index.ts
```

#### 2.3.2 State Management

**Zustand Store** (`authStore.ts`)
- Global authentication state
- User profile data
- Token management
- Login/logout actions

**React Query** (`@tanstack/react-query`)
- Server state management
- Automatic caching and refetching
- Optimistic updates
- Background synchronization

#### 2.3.3 Design System

**Color Palette**
- Primary: Indigo shades (#6366F1 to #312E81)
- Surface: White (#FFFFFF) and elevation (#F8F9FA)
- Text: Slate shades (#0F172A, #64748B, #94A3B8)
- Border: Light gray shades (#E2E8F0, #CBD5E1)

**Typography**
- Font Family: Syne (Google Fonts)
- Font Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold)
- Typography Scale: h1 (2.5rem), h2 (2rem), h3 (1.5rem), h4 (1.25rem)

**Spacing & Layout**
- Border Radius: xl (1rem), 2xl (1.5rem)
- Shadows: Soft (subtle), Soft-lg (elevated)
- Component Classes: `.btn`, `.input`, `.card` with variants

### 2.4 Database Schema Design

#### 2.4.1 User Schema
```typescript
{
  name: string (required, 2-100 chars)
  email: string (required, unique, validated)
  passwordHash: string (required, hashed)
  offeredSkills: [ObjectId] (references Skill)
  desiredSkills: [ObjectId] (references Skill)
  verifiedSkills: [ObjectId] (references Skill)
  averageRating: number (default: 0)
  totalSessionsTaught: number (default: 0)
  totalSkillsLearnt: number (default: 0)
  ratingsHistory: [Object]
  bio: string (optional, max 500 chars)
  location: string (optional, max 100 chars)
  profilePictureURL: string (optional)
  isActive: boolean (default: true)
}
```

#### 2.4.2 Skill Schema
```typescript
{
  name: string (required, unique, 2-100 chars)
  category: string (required, max 50 chars)
  description: string (optional, max 500 chars)
  createdBy: ObjectId (references User)
  createdAt: Date
  updatedAt: Date
}
```

#### 2.4.3 SkillRequest Schema
```typescript
{
  senderId: ObjectId (references User)
  receiverId: ObjectId (references User)
  offeredSkillId: ObjectId (references Skill)
  requestedSkillId: ObjectId (references Skill)
  status: enum ['pending', 'accepted', 'rejected', 'completed', 'expired']
  expiresAt: Date (30 days from creation)
  createdAt: Date
  updatedAt: Date
}
```

#### 2.4.4 ChatSession Schema
```typescript
{
  requestId: ObjectId (references SkillRequest)
  participants: [ObjectId] (references User)
  messages: [{
    senderId: ObjectId
    content: string
    contentType: enum ['text', 'image', 'video', 'file']
    contentURL: string (optional)
    timestamp: Date
  }]
  isActive: boolean (default: true)
  createdAt: Date
  updatedAt: Date
}
```

### 2.5 API Design

#### 2.5.1 RESTful Endpoints

**Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

**Users**
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/offered-skills` - Add offered skill
- `DELETE /api/users/offered-skills/:id` - Remove offered skill
- `POST /api/users/desired-skills` - Add desired skill
- `DELETE /api/users/desired-skills/:id` - Remove desired skill
- `GET /api/users/analytics` - Get user analytics

**Skills**
- `GET /api/skills` - Get all skills (with pagination, search, filter)
- `GET /api/skills/predefined` - Get predefined skills list
- `GET /api/skills/:id` - Get skill by ID
- `POST /api/skills/seed` - Manually seed predefined skills

**Requests**
- `POST /api/requests` - Create skill exchange request
- `GET /api/requests` - Get user's requests (sent/received)
- `PUT /api/requests/:id/accept` - Accept request
- `PUT /api/requests/:id/reject` - Reject request
- `GET /api/requests/search` - Search for users by skill

**Chat**
- `GET /api/chats` - Get user's chat sessions
- `GET /api/chats/:id` - Get chat session by ID
- `POST /api/chats/:id/messages` - Send message
- `POST /api/chats/:id/end` - End chat session
- `POST /api/chats/upload` - Upload file for chat

**Ratings**
- `POST /api/ratings` - Submit rating for skill exchange

**Verification**
- `GET /api/verification/:skillId` - Get verification test
- `POST /api/verification/:skillId/submit` - Submit test answers

### 2.6 Security Implementation

1. **Password Security**
   - Bcrypt hashing with 10 salt rounds
   - Password strength validation (uppercase, lowercase, number, min length)

2. **Authentication Security**
   - JWT tokens with expiration (7 days)
   - Token stored in memory (frontend), not localStorage
   - Protected routes with authentication middleware

3. **Input Validation**
   - Express-validator for request validation
   - Input sanitization middleware
   - SQL injection prevention (MongoDB NoSQL)
   - XSS prevention through sanitization

4. **File Upload Security**
   - File type validation (images, videos, documents)
   - File size limits (5MB images, 20MB videos)
   - Secure file storage

5. **Rate Limiting** (Disabled for personal project)
   - General API: 100 requests per 15 minutes
   - Auth endpoints: 5 requests per 15 minutes
   - File uploads: 20 uploads per hour

---

## 3. Experimental Setup and Results

### 3.1 Development Environment

**Backend Setup**
- Node.js runtime environment
- MongoDB Atlas (cloud database)
- Environment variables via `.env` file
- Development server: `npm run dev` (nodemon + ts-node)
- Production build: `npm run build` → `npm start`

**Frontend Setup**
- Vite development server (port 3000)
- Hot Module Replacement (HMR) for fast development
- Environment variables via `.env` (VITE_ prefix)
- Development server: `npm run dev`
- Production build: `npm run build`

**Database Setup**
- MongoDB Atlas cloud database
- Connection string in environment variables
- Automatic skill seeding on server startup
- Indexes for performance optimization

### 3.2 Implementation Phases

#### Backend Implementation (14 Phases)

**Phase 1-2: Project Setup & Database Connection**
- Project structure creation
- MongoDB connection with retry logic
- Environment configuration

**Phase 3-4: Authentication System**
- User registration with password hashing
- JWT token generation and validation
- Login endpoint with credential verification

**Phase 5-6: User Management**
- User profile CRUD operations
- Skill management (add/remove offered/desired skills)
- User analytics aggregation

**Phase 7-8: Skill Management**
- Skill CRUD operations
- Predefined skills enforcement
- Skill seeding system

**Phase 9-10: Request System**
- Skill exchange request creation
- Request status management (accept/reject)
- Request expiration handling

**Phase 11-12: Real-time Communication**
- Socket.io integration
- Chat session management
- File upload in chat

**Phase 13-14: Additional Features**
- Rating system
- Verification test system
- Analytics and background jobs
- Deployment preparation

#### Frontend Implementation

**Phase 1: Project Setup**
- React + TypeScript + Vite setup
- Routing configuration
- Basic layout components

**Phase 2: Authentication**
- Login and Register pages
- Auth service integration
- Protected routes

**Phase 3: Dashboard**
- Dashboard layout with tabs
- Analytics, My Skills, My Learnings, Requests tabs
- Search functionality

**Phase 4: Skill Selection**
- Post-registration skill selection
- Predefined skills grid
- Skill addition to profile

**Phase 5: Real-time Features**
- Chat interface
- Verification test interface

**Phase 6: UI/UX Enhancement**
- Design system implementation
- Syne font integration
- Modern, minimal UI with consistent styling

### 3.3 Key Implementation Decisions

#### 3.3.1 Predefined Skills Model

**Decision**: Enforce only 14 predefined skills instead of allowing user-created skills.

**Rationale**:
- Ensures quality and verification feasibility
- Allows expert-curated verification tests
- Maintains platform focus and consistency
- Simplifies skill matching and search

**Implementation**:
- Frontend: Constants file with predefined skills list
- Backend: Validation against predefined list in all skill operations
- Database: Automatic seeding on server startup
- User Experience: Grid-based selection from predefined list only

#### 3.3.2 Skill Verification Requirement

**Decision**: Users must verify skills through tests before offering them.

**Rationale**:
- Ensures users actually possess the skills they offer
- Maintains platform quality and trust
- Prevents false skill claims

**Implementation**:
- Verification test model with questions and answers
- Test scoring system (70% passing threshold)
- Verification status tracking per user per skill
- UI indicators for verified vs unverified skills

#### 3.3.3 Bidirectional Exchange Model

**Decision**: Users must offer a skill to request learning another skill.

**Rationale**:
- Ensures mutual benefit in exchanges
- Creates balanced skill economy
- Encourages active participation

**Implementation**:
- Request validation: sender must offer a skill, receiver must offer requested skill
- Request matching: Users can only send requests if they have matching skills
- Search functionality: Find users based on skill compatibility

#### 3.3.4 Real-time Chat Integration

**Decision**: Use Socket.io for real-time chat instead of polling.

**Rationale**:
- Better user experience with instant messaging
- Reduced server load compared to polling
- Scalable for multiple concurrent users

**Implementation**:
- Socket.io server integration
- Room-based chat sessions
- Message persistence in database
- File upload support in chat

### 3.4 Testing and Validation

#### 3.4.1 Backend API Testing

**Method**: Manual testing with cURL and Postman

**Tested Endpoints**:
- Authentication: Register, Login
- User Management: Profile, Skills
- Skill Management: List, Create, Update
- Request System: Create, Accept, Reject
- Chat: Sessions, Messages
- Ratings: Submit ratings

**Results**:
- All core endpoints functional
- Proper error handling and validation
- Authentication and authorization working correctly
- Database operations successful

#### 3.4.2 Frontend Integration Testing

**Method**: Manual browser testing and console debugging

**Tested Features**:
- User registration and login flow
- Skill selection after registration
- Dashboard navigation and data display
- Skill addition/removal
- Search functionality
- Chat interface (with backend integration)
- Form validation and error handling

**Results**:
- Smooth user flow from registration to dashboard
- Real-time data updates via React Query
- Proper error handling and user feedback
- Responsive design working across screen sizes

#### 3.4.3 Database Validation

**Validation Points**:
- Skill seeding: All 14 predefined skills created successfully
- User creation: Proper password hashing and data storage
- Skill relationships: Proper references between users and skills
- Request system: Status tracking and expiration working
- Indexes: Performance optimization verified

### 3.5 Performance Considerations

#### 3.5.1 Backend Optimizations

1. **Database Indexing**
   - Unique index on user email
   - Unique index on skill name
   - Indexes on frequently queried fields (category, status)

2. **Query Optimization**
   - Population of referenced documents (skills, users)
   - Pagination for large result sets
   - Selective field projection

3. **Caching Strategy**
   - React Query caching on frontend
   - Skill list caching
   - User profile caching

4. **Compression**
   - Gzip compression middleware for API responses
   - Reduced payload sizes

#### 3.5.2 Frontend Optimizations

1. **Code Splitting**
   - Route-based code splitting
   - Lazy loading of components

2. **State Management**
   - React Query for server state (automatic caching)
   - Zustand for minimal client state
   - Optimistic updates for better UX

3. **Bundle Optimization**
   - Vite's built-in optimizations
   - Tree shaking for unused code
   - Minification in production builds

### 3.6 Challenges and Solutions

#### Challenge 1: MongoDB Connection Timeout
**Problem**: Connection timeout errors when connecting to MongoDB Atlas
**Solution**: 
- Increased timeout values (`serverSelectionTimeoutMS: 30000`)
- Added IP whitelisting instructions
- Implemented retry logic with exponential backoff

#### Challenge 2: TypeScript Type Errors
**Problem**: `req.user` not recognized in TypeScript
**Solution**:
- Created custom type definitions in `src/types/express.d.ts`
- Extended Express Request interface with `user` and `userId`
- Configured tsconfig.json to include type definitions

#### Challenge 3: Duplicate Skill Addition
**Problem**: Skills being added twice when creating new skills
**Solution**:
- Removed skill creation logic from frontend
- Users can only select from predefined skills
- Backend validates against predefined list
- Automatic seeding ensures all skills exist

#### Challenge 4: Rate Limiting Blocking Development
**Problem**: Rate limiting preventing login during development
**Solution**:
- Disabled all rate limiters for personal project
- Converted rate limiters to no-op functions
- Can be re-enabled for production deployment

#### Challenge 5: Missing Skills in Database
**Problem**: Some predefined skills not appearing in database
**Solution**:
- Improved seeding function with better error handling
- Added manual seeding endpoint (`POST /api/skills/seed`)
- Enhanced logging for seeding process
- Fixed regex escaping for special characters

### 3.7 Current System Status

**Backend Status**: ✅ Operational
- Server running on port 3001
- MongoDB connected
- All 14 skills seeded
- Rate limiting disabled
- All API endpoints functional

**Frontend Status**: ✅ Operational
- Development server on port 3000
- All pages rendering correctly
- API integration working
- Real-time features ready (pending backend connection)

**Database Status**: ✅ Operational
- MongoDB Atlas connected
- All collections created
- Indexes in place
- Skills seeded successfully

### 3.8 Future Enhancements

1. **Testing**
   - Unit tests for services and utilities
   - Integration tests for API endpoints
   - E2E tests for critical user flows

2. **Performance**
   - Redis caching for frequently accessed data
   - Database query optimization
   - CDN for static assets

3. **Features**
   - Email notifications for requests and messages
   - Push notifications for mobile
   - Advanced search and filtering
   - Skill recommendation system
   - Progress tracking for learning sessions

4. **Security**
   - Re-enable rate limiting for production
   - Add CSRF protection
   - Implement request signing
   - Add API key authentication for admin endpoints

5. **Monitoring**
   - Error tracking (Sentry)
   - Performance monitoring
   - User analytics dashboard
   - Database performance metrics

---

## Conclusion

The Skill Swap platform has been successfully implemented using modern web technologies with a focus on code quality, user experience, and maintainability. The phased development approach allowed for systematic testing and validation at each stage. The predefined skills model ensures quality and verification feasibility, while the bidirectional exchange system creates a balanced skill economy.

The system is currently operational with all core features implemented and tested. The architecture is scalable and can be extended with additional features as needed.

