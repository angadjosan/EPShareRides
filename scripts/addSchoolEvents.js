/**
 * Script to add school start and end events for September 3rd, 2025
 * Run this script once to populate the database with these recurring events
 */

const mongoose = require('mongoose');
const Event = require('../schemas/Event.model.js');

// MongoDB connection setup
const connectDB = async () => {
  try {
    // Use environment variable if available, otherwise default connection
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/epsharerides';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Function to add school events
const addSchoolEvents = async () => {
  try {
    // School Start Event - September 3rd, 2025 at 8:15 AM
    const schoolStartEvent = new Event({
      firstName: 'System',
      lastName: 'Administrator',
      eventName: 'School Start - First Day',
      wlocation: 'Eastside Preparatory School',
      address: '10613 NE 38th Place, Kirkland, WA 98033',
      date: new Date('2025-09-03T08:15:00.000Z').toISOString(), // 8:15 AM UTC (adjust for timezone as needed)
      category: 'academic'
    });

    // School End Event - September 3rd, 2025 at 3:15 PM
    const schoolEndEvent = new Event({
      firstName: 'System',
      lastName: 'Administrator',
      eventName: 'School End - First Day',
      wlocation: 'Eastside Preparatory School',
      address: '10613 NE 38th Place, Kirkland, WA 98033',
      date: new Date('2025-09-03T15:15:00.000Z').toISOString(), // 3:15 PM UTC (adjust for timezone as needed)
      category: 'academic'
    });

    // Check if events already exist to avoid duplicates
    const existingStartEvent = await Event.findOne({
      eventName: 'School Start - First Day',
      date: schoolStartEvent.date
    });

    const existingEndEvent = await Event.findOne({
      eventName: 'School End - First Day',
      date: schoolEndEvent.date
    });

    if (existingStartEvent) {
      console.log('School Start event already exists for September 3rd, 2025');
    } else {
      await schoolStartEvent.save();
      console.log('✅ Successfully added School Start event for September 3rd, 2025 at 8:15 AM');
    }

    if (existingEndEvent) {
      console.log('School End event already exists for September 3rd, 2025');
    } else {
      await schoolEndEvent.save();
      console.log('✅ Successfully added School End event for September 3rd, 2025 at 3:15 PM');
    }

    console.log('\n📚 School events have been successfully added to the database!');
    console.log('Students can now create carpools for the first day of school.');

  } catch (error) {
    console.error('Error adding school events:', error);
  }
};

// Main execution function
const main = async () => {
  console.log('🏫 Adding school events for September 3rd, 2025...\n');
  
  await connectDB();
  await addSchoolEvents();
  
  // Close the database connection
  await mongoose.connection.close();
  console.log('\n✨ Database connection closed. Script completed successfully!');
};

// Run the script if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

module.exports = { addSchoolEvents };