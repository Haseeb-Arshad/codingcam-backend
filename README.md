# CodingCam Backend

This is the backend server for CodingCam, a coding activity tracker inspired by WakaTime.

## Features

- Activity tracking for coding sessions
- User authentication and profiles
- Analytics for coding time, languages, and projects
- Leaderboard for competitive coding tracking
- Full VSCode extension integration

## Prerequisites

- Node.js (v14+)
- MongoDB (local or remote)
- npm or yarn

## Installation

1. Clone the repository
```
git clone https://github.com/yourusername/codingcam-backend.git
cd codingcam-backend
```

2. Install dependencies
```
npm install
```

3. Create a `.env` file in the root directory with the following content:
```
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/codingcam
JWT_SECRET=your_secure_jwt_secret
```

## Running the Application

### Development Mode
```
npm run dev
```

### Production Mode
```
npm start
```

### Docker

You can also run the application using Docker and Docker Compose:

```
docker-compose up -d
```

## Testing

Run the connection test to verify that the backend is connected to MongoDB correctly:

```
npm run test-connection
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user

### Activities
- `GET /api/activities` - Get user activities
- `POST /api/activities` - Record a new activity

### Analytics
- `GET /api/analytics/daily` - Get daily stats
- `GET /api/analytics/languages` - Get language stats
- `GET /api/analytics/projects` - Get project stats

### Leaderboard
- `GET /api/leaderboard` - Get the coding leaderboard

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:userId` - Get public profile of a specific user

### Extension
- `POST /api/extension/heartbeat` - Record a heartbeat from the VSCode extension
- `GET /api/extension/status` - Check extension API status

## Extension Integration

The backend is fully compatible with the CodingCam VSCode extension. The extension sends coding activity data to the backend server for storage and analysis.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request #   c o d i n g c a m - b a c k e n d  
 