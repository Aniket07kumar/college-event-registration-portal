const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// @route   GET /api/events
// @desc    Get all events with optional category filter
router.get('/', async (req, res) => {
    try {
        const { category, search } = req.query;
        let filter = {};

        if (category && category !== 'All') {
            filter.category = category;
        }

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { shortDescription: { $regex: search, $options: 'i' } }
            ];
        }

        const events = await Event.find(filter).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: events.length,
            events: events
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve events: ' + err.message
        });
    }
});

// @route   GET /api/events/:id
// @desc    Get single event by ID with speakers and schedule
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found.'
            });
        }
        res.json({
            success: true,
            event: event
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching event details: ' + err.message
        });
    }
});

// @route   POST /api/events
// @desc    Admin: Create new technical event
router.post('/', requireAuth, requireAdmin, async (req, res) => {
    try {
        const {
            title,
            category,
            shortDescription,
            description,
            eventDate,
            eventTime,
            venue,
            mode,
            maxSeats,
            prizesOrCertification,
            speakers,
            schedule,
            coordinators
        } = req.body;

        if (!title || !category || !shortDescription || !description || !eventDate || !eventTime) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required event details.'
            });
        }

        const newEvent = await Event.create({
            title,
            category,
            shortDescription,
            description,
            eventDate,
            eventTime,
            venue: venue || 'Campus Auditorium, ABESIT Ghaziabad',
            mode: mode || 'Offline',
            maxSeats: maxSeats || 150,
            prizesOrCertification,
            speakers: speakers || [],
            schedule: schedule || [],
            coordinators: coordinators || []
        });

        res.status(201).json({
            success: true,
            message: 'Event published successfully!',
            event: newEvent
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error creating event: ' + err.message
        });
    }
});

// @route   PUT /api/events/:id
// @desc    Admin: Update event
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Event not found.'
            });
        }
        res.json({
            success: true,
            message: 'Event updated successfully!',
            event: updated
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error updating event: ' + err.message
        });
    }
});

// @route   DELETE /api/events/:id
// @desc    Admin: Delete event
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found.'
            });
        }
        res.json({
            success: true,
            message: 'Event deleted successfully.'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error deleting event: ' + err.message
        });
    }
});

module.exports = router;
