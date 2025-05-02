# Fitness Tracker Web Application

A full-stack fitness tracking and social networking application that allows users to track their fitness activities, connect with friends, and share their progress.

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)

## Project Overview

This project is a comprehensive fitness tracking platform with social features. Users can create accounts, log their fitness activities, connect with friends, and share their achievements. The application provides analytics on fitness progress and facilitates social interaction between fitness enthusiasts.

## Features

### User Features
- User authentication (signup, login, logout)
- Profile management
- Activity tracking and logging
- Friend connections (add, remove friends)
- Activity feed to view friends' updates
- Search for other users

### Admin Features
- User management
- Content moderation
- System statistics

## Technology Stack

### Client
- **Vue.js 3**: Frontend framework
- **Pinia**: State management
- **Vue Router**: Client-side routing
- **Bulma & CSS**: Styling
- **Axios**: HTTP client
- **Supabase Client**: Database client

### Server
- **Node.js**: Runtime environment
- **Express**: Web server framework
- **Supabase**: Database and authentication
- **JWT**: Authentication tokens
- **bcrypt**: Password hashing

## Project Structure

```
/
├── client/                # Vue.js frontend application
│   ├── public/            # Static assets
│   ├── src/               # Source code
│   │   ├── assets/        # Images, styles, etc.
│   │   ├── components/    # Vue components
│   │   ├── pages/         # Page components
│   │   ├── router/        # Vue Router configuration
│   │   ├── services/      # API services
│   │   ├── stores/        # Pinia stores
│   │   ├── utils/         # Utility functions
│   │   ├── App.vue        # Root component
│   │   └── main.ts        # Application entry point
│   └── package.json       # Dependencies and scripts
├── server/                # Node.js backend application
│   ├── controllers/       # Route controllers
│   ├── models/            # Data models
│   ├── utils/             # Utility functions
│   ├── index.js           # Server entry point
│   └── package.json       # Dependencies and scripts
└── tools/                 # Utility tools for development
    ├── diagnose.js        # Diagnostic tool
    ├── check_connectivity.js # Connection testing
    └── test_supabase.js   # Supabase connection testing
```

## Installation

Follow these steps to set up the project locally:

### Prerequisites
- Node.js (v14+ recommended)
- npm or pnpm
- Supabase account and project

### Server Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example` with your Supabase credentials:
   ```
   PORT=3000
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRY=24h
   ```

### Client Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   # or with pnpm
   pnpm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_URL=http://localhost:3000/api
   ```

## Environment Configuration

### Required Environment Variables

#### Server
- `PORT`: Port for the server (default: 3000)
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase service key
- `JWT_SECRET`: Secret for JWT token generation
- `JWT_EXPIRY`: JWT token expiry (e.g., '24h')

#### Client
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_API_URL`: URL for API requests (development: http://localhost:3000/api)

## Running the Application

### Development Mode

#### Server
```bash
cd server
npm run dev
```

#### Client
```bash
cd client
npm run dev
```

### Production Build

#### Server
```bash
cd server
npm start
```

#### Client
```bash
cd client
npm run build
```

## API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/login`: User login
- `POST /api/v1/auth/logout`: User logout
- `GET /api/v1/auth/current-user`: Get current user info

### User Endpoints
- `GET /api/v1/users`: Get all users
- `GET /api/v1/users/:id`: Get user by ID
- `POST /api/v1/users`: Create new user
- `PATCH /api/v1/users/:id`: Update user
- `DELETE /api/v1/users/:id`: Delete user
- `GET /api/v1/users/:id/activities`: Get user activities

### Friends Endpoints
- `GET /api/v1/friends/:userId`: Get user's friends
- `POST /api/v1/friends/:userId/add/:friendId`: Add friend
- `DELETE /api/v1/friends/:userId/remove/:friendId`: Remove friend
- `GET /api/v1/friends/:userId/activities`: Get friend activities

### Activities Endpoints
- Various endpoints for creating, reading, updating, and deleting activities

## Troubleshooting

### Connection Issues
If you're experiencing connection issues with Supabase:

1. Run the diagnostic tool:
   ```bash
   node tools/diagnose.js
   ```

2. Check connectivity:
   ```bash
   node tools/check_connectivity.js
   ```

3. Test Supabase connection:
   ```bash
   node tools/test_supabase.js
   ```

### Common Issues
- **API Connection Errors**: Verify the `VITE_API_URL` in client .env points to the correct server URL
- **Supabase Connection Failures**: Verify your Supabase URL and API keys
- **Authentication Issues**: Ensure your JWT_SECRET is correctly set

### Debug Mode
Enable debug mode in client applications to see additional information:
- Set `isDebug` to `true` in relevant components
