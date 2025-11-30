# Skill Swap Frontend

Frontend application for the Skill Swap platform - a peer-to-peer skill exchange marketplace built with React, TypeScript, and Vite.

## Features

- 🔐 JWT-based authentication (Login/Register)
- 📊 Dashboard with Analytics, Skills, Learnings, and Requests tabs
- 🔍 Skill search functionality
- 💬 Real-time chat with Socket.io
- ✅ Skill verification tests
- ⭐ Rating system integration
- 📁 File upload support (images, videos, documents)
- 🎨 Modern, responsive UI

## Tech Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v7
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Forms**: React Hook Form
- **Real-time**: Socket.io Client
- **Charts**: Recharts
- **Notifications**: React Hot Toast
- **Icons**: React Icons
- **Styling**: Tailwind CSS (via inline classes)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running (see backend README)

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:3001/api
   VITE_SOCKET_URL=http://localhost:3001
   VITE_ENV=development
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components
│   └── SearchBar.tsx   # Search functionality
├── pages/              # Page components
│   ├── dashboard/      # Dashboard tab pages
│   ├── Login.tsx       # Login page
│   ├── Register.tsx    # Registration page
│   ├── Chat.tsx        # Chat interface
│   └── VerificationTest.tsx  # Skill verification
├── services/           # API service functions
│   ├── api.ts          # Axios configuration
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── skill.service.ts
│   ├── request.service.ts
│   ├── chat.service.ts
│   ├── rating.service.ts
│   ├── verification.service.ts
│   └── socket.ts        # Socket.io client
├── store/              # State management
│   └── authStore.ts    # Authentication store
├── routes/             # Route configuration
│   └── AppRoutes.tsx
├── types/              # TypeScript types
│   └── index.ts
├── constants/          # Constants and configuration
│   └── index.ts
├── styles/             # Global styles
│   └── index.css
└── main.tsx           # Application entry point
```

## Key Features Implementation

### Authentication
- Login and registration pages
- JWT token management
- Protected routes
- Auto-redirect based on auth state

### Dashboard
- **Analytics Tab**: Displays user rating, sessions, and skills learnt with rating trend chart
- **My Skills Tab**: Manage offered skills, view verification status, start verification tests
- **My Learnings Tab**: View currently learning, wishlist, and completed skills
- **Requests Tab**: View and manage sent/received skill exchange requests

### Real-Time Chat
- Socket.io integration for real-time messaging
- Support for text, images, videos, documents, and links
- File upload functionality
- Message history with pagination

### Skill Verification
- Multi-question verification tests
- Progress tracking
- Score display and pass/fail status

## API Integration

All API calls are made through service functions in the `services/` directory. The API client is configured with:
- Automatic JWT token injection
- Global error handling
- Request/response interceptors
- Toast notifications for errors

## State Management

Authentication state is managed using Zustand with persistence:
- User information
- JWT token
- Login/logout actions

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3001/api` |
| `VITE_SOCKET_URL` | WebSocket server URL | `http://localhost:3001` |
| `VITE_ENV` | Environment (development/production) | `development` |

## Development

The application uses:
- **Vite** for fast development and building
- **TypeScript** for type safety
- **React Query** for server state management
- **React Hook Form** for form handling
- **Tailwind CSS** for styling (via utility classes)

## Production Build

```bash
npm run build
```

The production build will be in the `dist/` directory.

## Deployment

The frontend can be deployed to:
- **Vercel** (recommended for React apps)
- **Netlify**
- **GitHub Pages**
- Any static hosting service

Make sure to set the environment variables in your hosting platform.

## Troubleshooting

### CORS Issues
Ensure the backend CORS configuration allows requests from your frontend URL.

### Socket Connection Issues
Check that:
- Backend Socket.io server is running
- `VITE_SOCKET_URL` is correctly set
- JWT token is valid

### API Connection Issues
Verify:
- Backend API is running
- `VITE_API_URL` is correctly set
- Backend is accessible from the frontend

## Next Steps

- [ ] Add dark mode support
- [ ] Implement message search
- [ ] Add notification system
- [ ] Enhance responsive design
- [ ] Add unit tests
- [ ] Implement E2E tests

## License

ISC

