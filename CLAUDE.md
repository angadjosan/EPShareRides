# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Start development server: `npm run dev`
- Start production server: `npm start`
- Install dependencies: `npm install`
- Run tests: `npm test`
- Run in Docker: `docker-compose up`

## Project Structure
EPShareRides is a Node.js web application for carpooling coordination at Eastside Preparatory School.

### Backend Architecture
- **Framework**: Express.js with EJS templates
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Firebase Admin SDK with JWT tokens stored in cookies
- **Email**: Nodemailer with Gmail SMTP
- **Security**: express-rate-limit, bcrypt for password hashing
- **Scheduling**: node-cron for automated carpool reminders

### Key Directories
- `routes/`: Express route handlers
  - `authRoutes.js`: Authentication (signin, logout)
  - `apiRoutes.js`: All API endpoints for carpools, events, users
- `schemas/`: Mongoose models
  - `User.model.js`: User accounts with CO2 tracking
  - `Carpool.model.js`: Carpool data with carpoolers and pending requests
  - `Event.model.js`: School events for carpooling
  - `UserSettings.model.js`: User preferences
- `utils/`: Helper functions
  - `authUtils.js`: Firebase authentication middleware
  - `co2Calculator.js`: CO2 savings calculations
  - `studentUtils.js`: Student data processing and search
  - `geoUtils.js`: Geographic calculations
- `views/`: EJS templates for web pages
- `public/`: Static assets (CSS, client-side JS, images)

### Core Features
1. **Authentication**: Firebase-based user authentication
2. **Event Management**: Create and manage school events
3. **Carpool Creation**: Users can create carpools for events
4. **Join Requests**: Approval system for joining carpools
5. **CO2 Tracking**: Environmental impact calculations
6. **Student Search**: Find nearby students by address
7. **Email Notifications**: Automated carpool reminders and updates

### Database Models
- **User**: Personal info, admin status, CO2 savings, preferences
- **Carpool**: Driver info, route details, carpoolers, pending requests
- **Event**: School events with location and category
- **UserSettings**: User preferences

### Authentication Flow
- Firebase ID tokens stored in `idToken` cookie
- `authenticateToken` middleware validates tokens and sets `req.email`
- `ensureNoToken` middleware prevents authenticated users from accessing signin

### API Patterns
- Rate limiting on all routes (100 requests per 15 minutes)
- JWT authentication required for most endpoints
- MongoDB ObjectId validation and error handling
- CO2 savings automatically calculated and updated

## Code Style Guidelines
- Use camelCase for variables and functions
- Use PascalCase for classes and models
- Organize routes in separate files based on functionality
- Follow MongoDB/Mongoose patterns for database operations
- Use async/await for asynchronous operations
- Handle errors with try/catch blocks
- Comment complex logic and business rules

## Security Practices
- Validate user input with Mongoose schemas
- Implement rate limiting for API endpoints
- Use Firebase Admin SDK for authentication
- Never expose sensitive credentials in code
- Clear cookies on authentication errors

## Environment Variables
- `MODE`: Set to 'PROD' for production, otherwise loads .env file
- `MONGO_URI`: MongoDB connection string
- `SMTP_USER`/`SMTP_PASS`: Gmail credentials for email notifications
- `PORT`: Server port (defaults to 8080)

## Testing
- Jest testing framework configured
- Test files in `__tests__/` directory
- Use `npm test` to run tests