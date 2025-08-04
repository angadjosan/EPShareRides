# Scripts Directory

This directory contains utility scripts for the EPShareRides application.

## addSchoolEvents.js

Adds school start and end events for September 3rd, 2025 to the database.

### Usage

#### Option 1: Run the standalone script
```bash
node scripts/addSchoolEvents.js
```

#### Option 2: Use the API endpoint
Make a POST request to `/api/setup/school-events` (requires admin authentication)

### Events Created

1. **School Start - First Day**
   - Date: September 3rd, 2025 at 8:15 AM PDT
   - Location: Eastside Preparatory School
   - Category: academic

2. **School End - First Day**
   - Date: September 3rd, 2025 at 3:15 PM PDT
   - Location: Eastside Preparatory School
   - Category: academic

### Features

- Duplicate prevention: Script checks if events already exist before creating new ones
- Proper timezone handling: Times are converted to UTC for database storage
- Error handling: Graceful error reporting and recovery
- Admin-only API access: API endpoint requires admin authentication for security

### Environment Variables

The script uses the following environment variables:
- `MONGO_URI`: MongoDB connection string (defaults to local MongoDB if not set)

### Notes

- Events are created with "System Administrator" as the creator
- The script can be run multiple times safely - it won't create duplicates
- Times are stored in UTC but displayed comments show PDT times for clarity