const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new user (Student / Faculty / External)
router.post('/register', async (req, res) => {
    try {
        const {
            fullName,
            email,
            password,
            role,
            phone,
            collegeName,
            department,
            rollNoOrEmpId,
            yearOrDesignation
        } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide full name, email, and password.'
            });
        }

        // Check if user already exists
        const existing = await User.findOne({ email: email.toLowerCase().trim() });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'A user with this email address already exists. Please log in.'
            });
        }

        const newUser = await User.create({
            fullName,
            email: email.toLowerCase().trim(),
            password,
            role: role || 'student',
            phone,
            collegeName: collegeName || 'ABES Institute of Technology (ABESIT), Ghaziabad',
            department,
            rollNoOrEmpId,
            yearOrDesignation
        });

        // Set session
        req.session.user = newUser;

        res.status(201).json({
            success: true,
            message: 'Registration successful! You are now logged in.',
            user: newUser
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({
            success: false,
            message: err.message || 'Server error during registration.'
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login for Admin and Participants (Student/Faculty/External)
router.post('/login', async (req, res) => {
    try {
        const { email, password, roleRequired } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both email and password.'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials. User with this email does not exist.'
            });
        }

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials. Password does not match.'
            });
        }

        // If roleRequired is specified (e.g., admin portal login)
        if (roleRequired && roleRequired === 'admin' && user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied: This login form is restricted to Administrators only.'
            });
        }

        // Store user in session
        req.session.user = user;

        res.status(200).json({
            success: true,
            message: `Welcome back, ${user.fullName}!`,
            user: user,
            redirectUrl: user.role === 'admin' ? '/admin-dashboard.html' : '/participant-dashboard.html'
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({
            success: false,
            message: err.message || 'Server error during login.'
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get currently logged in user info
router.get('/me', async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'No active session found.'
            });
        }
        const freshUser = await User.findById(req.session.user._id);
        if (!freshUser) {
            req.session.destroy();
            return res.status(401).json({
                success: false,
                message: 'User account no longer exists.'
            });
        }
        req.session.user = freshUser;
        res.json({
            success: true,
            user: freshUser
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// @route   PUT /api/auth/profile
// @desc    Update current participant's profile (Module 4: Participants can update profile)
router.put('/profile', requireAuth, async (req, res) => {
    try {
        const {
            fullName,
            phone,
            collegeName,
            department,
            rollNoOrEmpId,
            yearOrDesignation
        } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        if (fullName) user.fullName = fullName.trim();
        if (phone) user.phone = phone.trim();
        if (collegeName) user.collegeName = collegeName.trim();
        if (department) user.department = department.trim();
        if (rollNoOrEmpId) user.rollNoOrEmpId = rollNoOrEmpId.trim();
        if (yearOrDesignation) user.yearOrDesignation = yearOrDesignation.trim();

        await user.save();
        req.session.user = user;

        res.json({
            success: true,
            message: 'Profile updated successfully!',
            user: user
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || 'Failed to update profile.'
        });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user and clear session
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error clearing session.'
            });
        }
        res.clearCookie('connect.sid');
        res.json({
            success: true,
            message: 'Logged out successfully.'
        });
    });
});

module.exports = router;
