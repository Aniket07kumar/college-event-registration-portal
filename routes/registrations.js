const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Helper to generate unique registration ID
const generateRegistrationCode = (category) => {
    const prefix = category ? category.substring(0, 4).toUpperCase() : 'EVNT';
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `ABESIT-2026-${prefix}-${randomDigits}`;
};

// @route   GET /api/registrations
// @alias   GET /api/registrations/participants (Module 6: GET Participants)
// @desc    Retrieve registrations / participants
router.get(['/', '/participants'], async (req, res) => {
    try {
        const { search, participantType, eventId, status } = req.query;
        let query = {};

        // If user is logged in as a normal participant and not admin, only show their registrations
        if (req.session && req.session.user && req.session.user.role !== 'admin') {
            query.$or = [
                { user: req.session.user._id },
                { email: req.session.user.email.toLowerCase() }
            ];
        }

        // Filters
        if (participantType && participantType !== 'All') {
            query.participantType = participantType;
        }

        if (eventId && eventId !== 'All') {
            query.event = eventId;
        }

        if (status && status !== 'All') {
            query.status = status;
        }

        if (search) {
            const searchRegex = { $regex: search.trim(), $options: 'i' };
            const searchConditions = [
                { fullName: searchRegex },
                { email: searchRegex },
                { phone: searchRegex },
                { collegeName: searchRegex },
                { rollNoOrEmpId: searchRegex },
                { registrationId: searchRegex }
            ];

            if (query.$or) {
                query.$and = [
                    { $or: query.$or },
                    { $or: searchConditions }
                ];
                delete query.$or;
            } else {
                query.$or = searchConditions;
            }
        }

        const registrations = await Registration.find(query)
            .populate('event', 'title category eventDate eventTime venue bannerImage')
            .sort({ registrationDate: -1 });

        res.json({
            success: true,
            count: registrations.length,
            registrations: registrations
        });
    } catch (err) {
        console.error('Error fetching registrations:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve registrations: ' + err.message
        });
    }
});

// @route   GET /api/registrations/stats/summary
// @desc    Admin: Generate summary metrics for dashboard
router.get('/stats/summary', requireAuth, requireAdmin, async (req, res) => {
    try {
        const totalRegistrations = await Registration.countDocuments();
        const studentCount = await Registration.countDocuments({ participantType: 'student' });
        const facultyCount = await Registration.countDocuments({ participantType: 'faculty' });
        const externalCount = await Registration.countDocuments({ participantType: 'external' });
        const totalEvents = await Event.countDocuments();

        // Breakdown by event
        const eventBreakdown = await Registration.aggregate([
            {
                $group: {
                    _id: '$event',
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'events',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'eventDetails'
                }
            },
            {
                $unwind: '$eventDetails'
            },
            {
                $project: {
                    title: '$eventDetails.title',
                    category: '$eventDetails.category',
                    count: 1
                }
            }
        ]);

        res.json({
            success: true,
            stats: {
                totalRegistrations,
                studentCount,
                facultyCount,
                externalCount,
                totalEvents,
                eventBreakdown
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to generate stats: ' + err.message
        });
    }
});

// @route   GET /api/registrations/export/csv
// @desc    Admin: Export participant report as CSV (Module 4: Generate reports)
router.get('/export/csv', requireAuth, requireAdmin, async (req, res) => {
    try {
        const registrations = await Registration.find()
            .populate('event', 'title category eventDate')
            .sort({ registrationDate: -1 });

        // Build CSV string
        const headers = [
            'Registration ID',
            'Full Name',
            'Email',
            'Phone',
            'Participant Type',
            'College / Institution',
            'Department',
            'Roll No / Emp ID',
            'Year / Designation',
            'Event Title',
            'Event Category',
            'Team Name',
            'Status',
            'Registered Date'
        ];

        const escapeCSV = (val) => {
            if (val === null || val === undefined) return '""';
            const str = String(val).replace(/"/g, '""');
            return `"${str}"`;
        };

        const rows = registrations.map(reg => {
            const eventTitle = reg.event ? reg.event.title : 'N/A';
            const eventCat = reg.event ? reg.event.category : 'N/A';
            const regDate = new Date(reg.registrationDate).toLocaleDateString('en-IN');

            return [
                escapeCSV(reg.registrationId),
                escapeCSV(reg.fullName),
                escapeCSV(reg.email),
                escapeCSV(reg.phone),
                escapeCSV(reg.participantType.toUpperCase()),
                escapeCSV(reg.collegeName),
                escapeCSV(reg.department || 'N/A'),
                escapeCSV(reg.rollNoOrEmpId || 'N/A'),
                escapeCSV(reg.yearOrDesignation || 'N/A'),
                escapeCSV(eventTitle),
                escapeCSV(eventCat),
                escapeCSV(reg.teamName || 'N/A'),
                escapeCSV(reg.status),
                escapeCSV(regDate)
            ].join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\r\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="ABESIT_Event_Registrations_Report.csv"');
        res.status(200).send(csvContent);
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to generate CSV report: ' + err.message
        });
    }
});

// @route   GET /api/registrations/:id
// @desc    Get single registration details (used for ticket / confirmation slip)
router.get('/:id', async (req, res) => {
    try {
        let registration;
        // Search by Mongo ObjectId or unique registrationId
        if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            registration = await Registration.findById(req.params.id).populate('event');
        } else {
            registration = await Registration.findOne({ registrationId: req.params.id }).populate('event');
        }

        if (!registration) {
            return res.status(404).json({
                success: false,
                message: 'Registration record not found.'
            });
        }

        res.json({
            success: true,
            registration: registration
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching registration: ' + err.message
        });
    }
});

// @route   POST /api/registrations
// @desc    POST Registration (Module 6: POST Registration)
router.post('/', async (req, res) => {
    try {
        const {
            eventId,
            participantType,
            fullName,
            email,
            phone,
            collegeName,
            department,
            rollNoOrEmpId,
            yearOrDesignation,
            teamName,
            teamMembers,
            notes
        } = req.body;

        // Basic validation
        if (!eventId || !participantType || !fullName || !email || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all mandatory fields (Event, Category, Name, Email, Phone).'
            });
        }

        // Verify Event existence
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Selected event does not exist.'
            });
        }

        // Check if event is full
        if (event.registeredCount >= event.maxSeats) {
            return res.status(400).json({
                success: false,
                message: 'Registration closed: Event has reached its maximum seat capacity.'
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // DUPLICATE ENTRY CHECK: Prevents duplicate registration for the same event
        const duplicate = await Registration.findOne({
            event: eventId,
            email: normalizedEmail
        });

        if (duplicate) {
            return res.status(409).json({
                success: false,
                message: `Duplicate Entry Detected: The participant with email (${normalizedEmail}) is already registered for "${event.title}". Registration ID is: ${duplicate.registrationId}`
            });
        }

        // Link with user account if logged in or if user already exists
        let userId = req.session && req.session.user ? req.session.user._id : null;
        if (!userId) {
            const existingUser = await User.findOne({ email: normalizedEmail });
            if (existingUser) {
                userId = existingUser._id;
            }
        }

        // Generate unique registration ID
        let registrationId = generateRegistrationCode(event.category);
        let existsWithId = await Registration.findOne({ registrationId });
        while (existsWithId) {
            registrationId = generateRegistrationCode(event.category);
            existsWithId = await Registration.findOne({ registrationId });
        }

        const newRegistration = await Registration.create({
            registrationId,
            user: userId,
            event: eventId,
            participantType,
            fullName: fullName.trim(),
            email: normalizedEmail,
            phone: phone.trim(),
            collegeName: (collegeName || 'ABES Institute of Technology (ABESIT), Ghaziabad').trim(),
            department: department ? department.trim() : '',
            rollNoOrEmpId: rollNoOrEmpId ? rollNoOrEmpId.trim() : '',
            yearOrDesignation: yearOrDesignation ? yearOrDesignation.trim() : '',
            teamName: teamName ? teamName.trim() : '',
            teamMembers: teamMembers ? teamMembers.trim() : '',
            status: 'Confirmed',
            notes: notes ? notes.trim() : ''
        });

        // Increment event registeredCount
        await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: 1 } });

        const populated = await Registration.findById(newRegistration._id).populate('event');

        res.status(201).json({
            success: true,
            message: 'Registration completed successfully!',
            registration: populated
        });
    } catch (err) {
        console.error('Registration POST error:', err);
        // MongoDB unique index duplicate key error
        if (err.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Duplicate Entry: You are already registered for this event with this email address.'
            });
        }
        res.status(500).json({
            success: false,
            message: err.message || 'Server error while processing registration.'
        });
    }
});

// @route   PUT /api/registrations/:id
// @desc    PUT Update Registration (Module 6: PUT Update)
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const {
            fullName,
            phone,
            collegeName,
            department,
            rollNoOrEmpId,
            yearOrDesignation,
            teamName,
            teamMembers,
            status,
            notes
        } = req.body;

        let reg = await Registration.findById(req.params.id);
        if (!reg) {
            return res.status(404).json({
                success: false,
                message: 'Registration record not found.'
            });
        }

        // Authorization check: participant can only update their own registration, admin can update any
        if (req.user.role !== 'admin' && String(reg.user) !== String(req.user._id) && reg.email !== req.user.email) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: You can only edit your own registration.'
            });
        }

        if (fullName) reg.fullName = fullName.trim();
        if (phone) reg.phone = phone.trim();
        if (collegeName) reg.collegeName = collegeName.trim();
        if (department !== undefined) reg.department = department.trim();
        if (rollNoOrEmpId !== undefined) reg.rollNoOrEmpId = rollNoOrEmpId.trim();
        if (yearOrDesignation !== undefined) reg.yearOrDesignation = yearOrDesignation.trim();
        if (teamName !== undefined) reg.teamName = teamName.trim();
        if (teamMembers !== undefined) reg.teamMembers = teamMembers.trim();
        if (notes !== undefined) reg.notes = notes.trim();

        // Only Admin can update status
        if (status && req.user.role === 'admin') {
            reg.status = status;
        }

        await reg.save();
        const updated = await Registration.findById(reg._id).populate('event');

        res.json({
            success: true,
            message: 'Registration updated successfully!',
            registration: updated
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error updating registration: ' + err.message
        });
    }
});

// @route   DELETE /api/registrations/:id
// @desc    DELETE Registration (Module 6: DELETE Registration)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const reg = await Registration.findById(req.params.id);
        if (!reg) {
            return res.status(404).json({
                success: false,
                message: 'Registration record not found.'
            });
        }

        const eventId = reg.event;

        await Registration.findByIdAndDelete(req.params.id);

        // Decrement event registeredCount
        if (eventId) {
            await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: -1 } });
        }

        res.json({
            success: true,
            message: `Registration (${reg.registrationId}) for ${reg.fullName} has been deleted successfully.`
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error deleting registration: ' + err.message
        });
    }
});

module.exports = router;
