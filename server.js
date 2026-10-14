require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const connectDB = require('./config/db');
const { seedInitialData } = require('./utils/seeder');

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const registrationRoutes = require('./routes/registrations');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Database and run initial Seeder
connectDB().then(async () => {
    await seedInitialData();
});

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET || 'abesit_event_portal_secret_key_2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

// Serve static frontend files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);

// Fallback for SPA or unknown HTML route
app.get('/health', (req, res) => {
    res.json({
        status: 'UP',
        appName: 'ABESIT Event Registration & Management Portal',
        timestamp: new Date()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

app.listen(PORT, () => {
    console.log(`==========================================================`);
    console.log(`🎓 ABESIT Event Registration & Management Portal Started!`);
    console.log(`🚀 Server Running at: http://localhost:${PORT}`);
    console.log(`📍 Institution: ABES Institute of Technology (ABESIT), Ghaziabad`);
    console.log(`🔑 Admin Login: admin@abesit.in | Pass: admin123`);
    console.log(`👤 Participant: rahul.verma@abesit.in | Pass: student123`);
    console.log(`==========================================================`);
});
