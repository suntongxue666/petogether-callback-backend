# Petogether Callback Backend

This is the backend service for the Petogether app that handles callbacks from the Nano Banana API for image generation tasks.

## Features

- RESTful API for handling Nano Banana API callbacks
- Task management system with status tracking
- Security measures including callback verification and rate limiting
- Comprehensive logging with Winston
- Environment-based configuration

## Project Structure

```
petogether-callback-backend/
├── config/              # Configuration files
├── logs/                # Log files (gitignored)
├── middleware/          # Express middleware
├── models/              # Data models
├── routes/              # API route definitions
├── utils/               # Utility functions
├── server.js            # Main server file
├── .env                 # Environment variables (gitignored)
├── .gitignore           # Git ignore rules
├── package.json         # Project dependencies and scripts
└── README.md            # This file
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=3000
NODE_ENV=development
API_KEY=your-api-key-here
CALLBACK_SECRET=your-callback-secret-here
```

## API Endpoints

### 1. Callback Endpoint
- **URL**: `POST /api/callback`
- **Description**: Receives notifications from Nano Banana API
- **Headers**: 
  - `x-callback-secret`: Must match CALLBACK_SECRET from environment variables
- **Body**:
  ```json
  {
    "taskId": "unique-task-id",
    "status": "completed",
    "resultUrl": "https://example.com/result-image.jpg"
  }
  ```

### 1b. Nano Banana API Callback Endpoint (Alternative)
- **URL**: `POST /api/nanobananaapi-callback`
- **Description**: Alternative endpoint for receiving notifications from Nano Banana API
- **Headers**: 
  - `x-callback-secret`: Must match CALLBACK_SECRET from environment variables
- **Body**:
  ```json
  {
    "taskId": "unique-task-id",
    "status": "completed",
    "resultUrl": "https://example.com/result-image.jpg"
  }
  ```

### 2. Task Status Query
- **URL**: `GET /api/task/:taskId`
- **Description**: Get the status of a specific task
- **Response**:
  ```json
  {
    "taskId": "unique-task-id",
    "status": "completed",
    "resultUrl": "https://example.com/result-image.jpg",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:05:00.000Z"
  }
  ```

### 3. All Tasks List
- **URL**: `GET /api/tasks`
- **Description**: Get a list of all tasks
- **Response**:
  ```json
  [
    {
      "taskId": "unique-task-id-1",
      "status": "completed",
      "resultUrl": "https://example.com/result-image1.jpg",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:05:00.000Z"
    },
    {
      "taskId": "unique-task-id-2",
      "status": "pending",
      "resultUrl": null,
      "createdAt": "2023-01-01T00:10:00.000Z",
      "updatedAt": "2023-01-01T00:10:00.000Z"
    }
  ]
  ```

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your configuration
4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment to Render

### Option 1: Manual Deployment
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the build command to: `npm install`
4. Set the start command to: `npm start`
5. Add environment variables in the Render dashboard:
   - `NODE_ENV`: `production`
   - `PORT`: `8080` (Render's default port)
   - `CALLBACK_SECRET`: your-secret-key

### Option 2: Automatic Deployment with render.yaml
This project includes a `render.yaml` file for automatic deployment configuration. Render will automatically:
- Use `npm install` as the build command
- Use `npm start` as the start command
- Set the required environment variables
- Configure the service to run on port 8080

To use this:
1. Fork this repository to your GitHub account
2. Create a new Web Service on Render
3. Connect your forked repository
4. Render will automatically detect and use the `render.yaml` configuration
5. Set the `CALLBACK_SECRET` environment variable in the Render dashboard

## Security Features

- Callback verification using secret tokens
- Rate limiting to prevent abuse
- Helmet.js for HTTP security headers
- Request size limiting
- Comprehensive logging

## Logging

The application uses Winston for logging with the following features:

- Console output for development
- File logging for production
- Error logs separated from general logs
- Log rotation to prevent large log files