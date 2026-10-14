const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    registrationId: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Can be registered directly or through user account
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: [true, 'Event is required']
    },
    participantType: {
        type: String,
        enum: ['student', 'faculty', 'external'],
        required: [true, 'Participant category is required']
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    collegeName: {
        type: String,
        required: [true, 'College or Institution name is required'],
        trim: true
    },
    department: {
        type: String,
        trim: true
    },
    rollNoOrEmpId: {
        type: String,
        trim: true
    },
    yearOrDesignation: {
        type: String,
        trim: true
    },
    teamName: {
        type: String,
        trim: true
    },
    teamMembers: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['Confirmed', 'Pending', 'Attended', 'Cancelled'],
        default: 'Confirmed'
    },
    registrationDate: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        trim: true
    }
});

// Ensure a participant cannot register more than once for the same event
registrationSchema.index({ event: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
