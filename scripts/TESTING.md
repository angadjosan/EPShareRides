# Testing Guide for New Features

This document outlines how to test the newly implemented features.

## Feature 1: Email Notifications for Carpool Deletion

### What was implemented
- Modified the `DELETE /api/carpools/:id` endpoint in `routes/apiRoutes.js`
- Added email notifications to all affected users (carpoolers + pending requests) before carpool deletion
- Includes graceful error handling for email failures

### Testing Steps

#### Prerequisites
- Ensure SMTP credentials are configured in environment variables
- Have at least one carpool with carpoolers and/or pending requests

#### Manual Testing
1. **Create a test carpool** with multiple carpoolers and pending requests
2. **Delete the carpool** via the API endpoint: `DELETE /api/carpools/{carpool_id}`
3. **Verify emails sent** to all affected users
4. **Check console logs** for any email failures

#### Expected Results
- All carpoolers receive email notification with:
  - Subject: "Carpool Cancelled - [Event Name]"
  - Event details (name, date, driver info)
  - Instructions to find alternative carpools
- All users with pending requests also receive notifications
- Carpool is successfully deleted from database
- Email failures are logged but don't prevent deletion

#### Email Template Preview
```
Subject: Carpool Cancelled - [Event Name]

We're writing to inform you that the carpool you were part of (or had requested to join) has been cancelled.

Event Details:
- Event: [Event Name]
- Date: [Event Date]
- Driver: [Driver Name]

If you still need transportation for this event, please check the app for other available carpools or consider creating your own.

We apologize for any inconvenience this may cause.

Best regards,
EPShareRides Team
```

## Feature 2: School Start/End Events for September 3rd, 2025

### What was implemented
- Created standalone script: `scripts/addSchoolEvents.js`
- Added API endpoint: `POST /api/setup/school-events` (admin-only)
- Both methods create two events:
  - School Start: September 3rd, 2025 at 8:15 AM PDT
  - School End: September 3rd, 2025 at 3:15 PM PDT

### Testing Steps

#### Method 1: Standalone Script
```bash
# Navigate to project root
cd /path/to/EpShareRides

# Run the script
node scripts/addSchoolEvents.js
```

**Expected Output:**
```
🏫 Adding school events for September 3rd, 2025...

Connected to MongoDB
✅ Successfully added School Start event for September 3rd, 2025 at 8:15 AM
✅ Successfully added School End event for September 3rd, 2025 at 3:15 PM

📚 School events have been successfully added to the database!
Students can now create carpools for the first day of school.

✨ Database connection closed. Script completed successfully!
```

#### Method 2: API Endpoint
1. **Authenticate as admin user**
2. **Make POST request** to `/api/setup/school-events`
3. **Verify response** contains success status and event IDs

**Expected API Response:**
```json
{
  "success": true,
  "message": "School events setup completed",
  "results": [
    {
      "event": "School Start",
      "status": "created",
      "id": "64f..."
    },
    {
      "event": "School End", 
      "status": "created",
      "id": "64f..."
    }
  ]
}
```

#### Verification Steps
1. **Check database** for new events:
   - Query events with `eventName` containing "School Start" or "School End"
   - Verify dates are correct (September 3rd, 2025)
   - Verify times are correct (8:15 AM and 3:15 PM PDT)
2. **Test duplicate prevention** by running script/API again
3. **Verify events appear** in the events list API: `GET /api/events`

#### Database Verification Queries
```javascript
// Check if events were created
db.events.find({
  eventName: { $regex: /School (Start|End)/ },
  date: { $regex: /2025-09-03/ }
})

// Verify event details
db.events.find({
  eventName: "School Start - First Day"
}).pretty()
```

## Integration Testing

### Combined Feature Testing
1. **Create carpools** for the new school events
2. **Delete one of the carpools** and verify email notifications work
3. **Check that** both features work seamlessly together

### Error Scenarios to Test
1. **Email server unavailable** - deletion should still succeed
2. **Invalid carpool ID** - should return 404 error  
3. **Non-admin user** trying to create school events - should return 403
4. **Database connection issues** - should handle gracefully

## Performance Considerations

### Email Notifications
- Emails are sent sequentially to avoid overwhelming SMTP server
- Failed emails don't block carpool deletion
- Email failures are logged for debugging

### Event Creation
- Duplicate prevention queries run before creation
- Admin-only access prevents unauthorized event creation
- Events are created with proper timezone handling

## Monitoring Recommendations

1. **Monitor email delivery rates** after deployment
2. **Check logs** for email failures or errors
3. **Verify school events** are visible in the UI
4. **Test carpool creation** for school events works properly