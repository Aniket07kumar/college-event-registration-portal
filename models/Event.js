const mongoose = require('mongoose');

const speakerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    designation: { type: String, required: true },
    organization: { type: String, required: true },
    topic: { type: String },
    image: { type: String }
}, { _id: false });

const scheduleItemSchema = new mongoose.Schema({
    time: { type: String, required: true },
    activity: { type: String, required: true },
    speaker: { type: String },
    location: { type: String }
}, { _id: false });

const coordinatorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String }
}, { _id: false });

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Event category is required'],
        enum: ['Hackathon', 'Workshop', 'FDP', 'Startup Expo', 'Pitch Competition'],
        default: 'Hackathon'
    },
    shortDescription: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    eventDate: {
        type: String,
        required: true
    },
    eventTime: {
        type: String,
        required: true
    },
    venue: {
        type: String,
        required: true,
        default: 'Campus Auditorium, ABESIT Ghaziabad'
    },
    mode: {
        type: String,
        enum: ['Offline', 'Online', 'Hybrid'],
        default: 'Offline'
    },
    bannerImage: {
        type: String
    },
    maxSeats: {
        type: Number,
        default: 150
    },
    registeredCount: {
        type: Number,
        default: 0
    },
    speakers: [speakerSchema],
    schedule: [scheduleItemSchema],
    coordinators: [coordinatorSchema],
    status: {
        type: String,
        enum: ['Upcoming', 'Ongoing', 'Completed'],
        default: 'Upcoming'
    },
    prizesOrCertification: {
        type: String,
        default: 'Certificates of Participation & Attractive Cash Prizes for Top Performers'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Event', eventSchema);
