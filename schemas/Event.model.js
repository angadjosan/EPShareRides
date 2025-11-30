// Purpose: Define the schema for the Event model.
const mongoose = require('mongoose');

// Define the schema for the Event model
const eventSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  eventName: {
    type: String,
    required: true,
    trim: true
  },
  wlocation: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  address: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  customCategory: {
    type: String,
    trim: true,
    default: null
  }
});

// Create the Event model
const Event = mongoose.model('Event', eventSchema);

// Export the Event model
module.exports = Event;