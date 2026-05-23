# Habit Tracker Backend

REST API for personal habit tracking, authentication, habit management, and daily completion logs.

## Tech Stack

- Node.js
- Express
- MongoDB
- JWT for authentication
- bcryptjs for password hashing

## Features

- Register and login users
- JWT-protected habit routes
- Create, read, update, and delete habits
- Mark habits completed once per day
- View the last 7 days of tracking history
- Habit tags, filtering, pagination, and streak calculation

## Fork and Clone

If you want to work on your own copy of the project:

1. Fork this repository on GitHub.
2. Clone your fork to your machine:

```bash
git clone https://github.com/Arvind054/HabitTracking_Backed
```

3. Move into the project folder:

```bash
cd HabitTracking_Backed
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=3000
MONGODB_URL= MONGODB_URL || mongodb://127.0.0.1:27017/habittracker
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
```

### 3. Run the app

```bash
node index.js
```
## Authentication

### Register

`POST /register`

Request body:

```json
{
  "name": "XYZ",
  "email": "XYZ@example.com",
  "password": "Password123"
}
```

Example response:

```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOi...",
  "user": {
    "id": "6651234567890abcdef12345",
    "name": "XYZ",
    "email": "XYZ@example.com"
  }
}
```

### Login

`POST /login`

Request body:

```json
{
  "email": "XYZ@example.com",
  "password": "Password123"
}
```

Example response:

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOi...",
  "user": {
    "id": "6651234567890abcdef12345",
    "name": "XYZ",
    "email": "XYZ@example.com"
  }
}
```

## JWT Usage

All habit routes require a JWT in the request header.

Add this header:

```http
Authorization: Bearer <token>
```

Example:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

If the token is missing or invalid, the API returns `401 Unauthorized`.

## API Routes

### Public Routes

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/register` | Register a new user |
| POST | `/login` | Authenticate a user and get a JWT |

### Protected Habit Routes

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/habits` | Create a new habit |
| GET | `/habits` | Get all habits for the logged-in user |
| GET | `/habits?tag=health&page=1&limit=10` | Filter and paginate habits |
| GET | `/habits/:id` | Get a specific habit |
| PUT | `/habits/:id` | Update a habit |
| DELETE | `/habits/:id` | Delete a habit |
| POST | `/habits/:id/track` | Mark the habit as completed for today |
| GET | `/habits/:id/history` | Get the last 7 days of tracking history |

## Example Habit Requests

### Create Habit

`POST /habits`

Headers:

```http
Authorization: Bearer <token>
Content-Type: application/json
```

Request body:

```json
{
  "title": "Drink water",
  "description": "Drink 2 liters daily",
  "frequency": "daily",
  "tags": ["health", "wellness"]
}
```

Example response:

```json
{
  "message": "Habit created successfully",
  "habit": {
    "_id": "6651234567890abcdef12346",
    "user": "6651234567890abcdef12345",
    "title": "Drink water",
    "description": "Drink 2 liters daily",
    "frequency": "daily",
    "tags": ["health", "wellness"],
    "currentStreak": 0,
    "bestStreak": 0,
    "createdAt": "2026-05-23T10:00:00.000Z",
    "updatedAt": "2026-05-23T10:00:00.000Z"
  }
}
```

### Get Habits With Filtering and Pagination

`GET /habits?tag=health&page=1&limit=10`

Example response:

```json
{
  "message": "Habits fetched successfully",
  "habits": [
    {
      "_id": "6651234567890abcdef12346",
      "title": "Drink water",
      "tags": ["health", "wellness"],
      "currentStreak": 3,
      "bestStreak": 5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

### Mark Habit as Completed

`POST /habits/:id/track`

Example response:

```json
{
  "message": "Habit marked as completed for today",
  "log": {
    "_id": "6651234567890abcdef12347",
    "habit": "6651234567890abcdef12346",
    "user": "6651234567890abcdef12345",
    "date": "2026-05-23"
  },
  "streaks": {
    "currentStreak": 4,
    "bestStreak": 5
  }
}
```

### View History

`GET /habits/:id/history`

Example response:

```json
{
  "message": "Habit history fetched successfully",
  "habitId": "6651234567890abcdef12346",
  "history": [
    { "date": "2026-05-17", "completed": false },
    { "date": "2026-05-18", "completed": true },
    { "date": "2026-05-19", "completed": true },
    { "date": "2026-05-20", "completed": false },
    { "date": "2026-05-21", "completed": true },
    { "date": "2026-05-22", "completed": true },
    { "date": "2026-05-23", "completed": true }
  ]
}
```

## MongoDB Schema Design

### User

Stores account and login details.

- `name`: user display name
- `email`: unique login email
- `password`: hashed password
- timestamps: `createdAt`, `updatedAt`

### Habit

Stores user habits.

- `user`: reference to the user who owns the habit
- `title`: habit title
- `description`: optional description
- `frequency`: `daily` or `weekly`
- `tags`: array of normalized tag strings
- `currentStreak`: current consecutive completion count
- `bestStreak`: best streak count
- timestamps: `createdAt`, `updatedAt`

### HabitLog

Stores daily completion records.

- `habit`: reference to the habit
- `user`: reference to the owner
- `date`: completion date in `YYYY-MM-DD` format
- `completedAt`: timestamp when the completion was logged
- unique index on `(habit, date)` to allow only one log per day per habit

## Notes

- Habit routes are protected with JWT middleware.
- Habit ownership is enforced by `userId` from the token.
- Tags are normalized to lowercase when saved.
- Streaks are recalculated after every daily completion log.
