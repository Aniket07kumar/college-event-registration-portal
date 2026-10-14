const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

const seedInitialData = async () => {
    try {
        const userCount = await User.countDocuments();
        const eventCount = await Event.countDocuments();

        if (userCount > 0 && eventCount > 0) {
            console.log('[Database] Initial data already exists. Skipping seeder.');
            return;
        }

        console.log('[Database] Seeding initial data for ABESIT Event Portal...');

        // 1. Create Default Users
        let admin = await User.findOne({ email: 'admin@abesit.in' });
        if (!admin) {
            admin = await User.create({
                fullName: 'ABESIT Event Convener (Admin)',
                email: 'admin@abesit.in',
                password: 'admin123',
                role: 'admin',
                phone: '+91 9811002233',
                collegeName: 'ABES Institute of Technology (ABESIT), Ghaziabad',
                department: 'Department of Computer Science & Engineering',
                rollNoOrEmpId: 'EMP-ADM-001',
                yearOrDesignation: 'Convener & Head - Technical Events'
            });
        }

        let student = await User.findOne({ email: 'rahul.verma@abesit.in' });
        if (!student) {
            student = await User.create({
                fullName: 'Rahul Verma',
                email: 'rahul.verma@abesit.in',
                password: 'student123',
                role: 'student',
                phone: '+91 9876543210',
                collegeName: 'ABES Institute of Technology (ABESIT), Ghaziabad',
                department: 'Computer Science & Engineering',
                rollNoOrEmpId: '2202900100085',
                yearOrDesignation: '3rd Year B.Tech'
            });
        }

        let faculty = await User.findOne({ email: 'dr.priya.sharma@abesit.in' });
        if (!faculty) {
            faculty = await User.create({
                fullName: 'Dr. Priya Sharma',
                email: 'dr.priya.sharma@abesit.in',
                password: 'faculty123',
                role: 'faculty',
                phone: '+91 9822334455',
                collegeName: 'ABES Institute of Technology (ABESIT), Ghaziabad',
                department: 'Information Technology',
                rollNoOrEmpId: 'FAC-IT-104',
                yearOrDesignation: 'Associate Professor'
            });
        }

        let external = await User.findOne({ email: 'neha.gupta@techinnovators.com' });
        if (!external) {
            external = await User.create({
                fullName: 'Neha Gupta',
                email: 'neha.gupta@techinnovators.com',
                password: 'external123',
                role: 'external',
                phone: '+91 9911223344',
                collegeName: 'TechInnovators Labs / Delhi Technological University',
                department: 'Software Engineering',
                rollNoOrEmpId: 'EXT-DEL-552',
                yearOrDesignation: 'Senior Product Engineer'
            });
        }

        // 2. Create Events if none exist
        if (eventCount === 0) {
            const eventsData = [
                {
                    title: 'HackABESIT 2026: 36-Hour National Hackathon',
                    category: 'Hackathon',
                    shortDescription: 'Build next-gen solutions in AI, Web3, FinTech, and Smart Automation over 36 hours of non-stop coding.',
                    description: 'HackABESIT 2026 is the flagship annual national hackathon organized by ABES Institute of Technology, Ghaziabad. Bring your problem-solving mindset and collaborate with the brightest engineering minds across the country. Mentorship from industry leaders, round-the-clock lab access, food, swags, and exciting cash prizes await!',
                    eventDate: 'November 14-15, 2026',
                    eventTime: '09:00 AM (36 Hours Continuous)',
                    venue: 'Central Computing Lab & Innovation Arena, ABESIT Ghaziabad',
                    mode: 'Offline',
                    maxSeats: 200,
                    registeredCount: 0,
                    status: 'Upcoming',
                    prizesOrCertification: '₹1,50,000 Cash Prize Pool, Goodies & Direct Internship Interviews',
                    speakers: [
                        {
                            name: 'Vikramaditya Roy',
                            designation: 'Principal Architect',
                            organization: 'Google Cloud India',
                            topic: 'Architecting Scalable Microservices with GenAI',
                            image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                        },
                        {
                            name: 'Ananya Deshmukh',
                            designation: 'Staff Engineer & Mentor',
                            organization: 'Microsoft Research',
                            topic: 'Building Resilient Full-Stack Distributed Systems',
                            image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
                        }
                    ],
                    schedule: [
                        { time: 'Day 1 - 09:00 AM', activity: 'Registration Verification & Kit Distribution', speaker: 'ABESIT Student Council', location: 'Auditorium Foyer' },
                        { time: 'Day 1 - 10:30 AM', activity: 'Inaugural Address & Problem Statement Release', speaker: 'Director, ABESIT', location: 'Main Auditorium' },
                        { time: 'Day 1 - 12:00 PM', activity: 'Hacking Commences (Round 1 Ideation)', speaker: 'Mentors', location: 'Innovation Arena' },
                        { time: 'Day 1 - 08:00 PM', activity: 'Mentorship Checkpoint & Code Review', speaker: 'Industry Mentors', location: 'Computing Lab 3 & 4' },
                        { time: 'Day 2 - 09:00 AM', activity: 'Semi-Final Presentations & Demos', speaker: 'Jury Panel', location: 'Seminar Hall 1' },
                        { time: 'Day 2 - 04:00 PM', activity: 'Grand Finale, Pitching & Award Ceremony', speaker: 'Chief Guests & Dignitaries', location: 'Main Auditorium' }
                    ],
                    coordinators: [
                        { name: 'Prof. Amit Chauhan', phone: '+91 9811223344', email: 'hackathon@abesit.in' },
                        { name: 'Ayush Sharma (Student Lead)', phone: '+91 9711556677', email: 'ayush.lead@abesit.in' }
                    ]
                },
                {
                    title: 'Hands-on Deep Learning & GenAI Workshop',
                    category: 'Workshop',
                    shortDescription: 'Master Transformers, RAG architectures, and fine-tuning Open-Source LLMs with PyTorch & HuggingFace.',
                    description: 'A comprehensive 2-day hands-on technical workshop designed for engineering students and faculty eager to step into applied machine learning, LLM fine-tuning, retrieval-augmented generation (RAG), and vector databases. Every participant will build and deploy a working AI application.',
                    eventDate: 'November 21-22, 2026',
                    eventTime: '10:00 AM - 04:30 PM',
                    venue: 'Advanced AI & Robotics Lab (Room 302, Block B), ABESIT Campus',
                    mode: 'Hybrid',
                    maxSeats: 120,
                    registeredCount: 0,
                    status: 'Upcoming',
                    prizesOrCertification: 'Authorized Certificate of Completion & Project GitHub Repository Access',
                    speakers: [
                        {
                            name: 'Dr. Sameer Kulkarni',
                            designation: 'Lead AI Scientist',
                            organization: 'NVIDIA AI Tech Center',
                            topic: 'Practical Generative AI & Quantized Model Inference',
                            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
                        }
                    ],
                    schedule: [
                        { time: 'Day 1 - 10:00 AM', activity: 'Deep Dive: Attention Mechanism & Transformer Models', speaker: 'Dr. Sameer Kulkarni', location: 'AI Lab' },
                        { time: 'Day 1 - 01:30 PM', activity: 'Hands-on: Implementing RAG with LangChain & ChromaDB', speaker: 'Lab Instructors', location: 'AI Lab' },
                        { time: 'Day 2 - 10:00 AM', activity: 'Fine-Tuning Llama Models on Custom Datasets', speaker: 'Dr. Sameer Kulkarni', location: 'AI Lab' },
                        { time: 'Day 2 - 02:30 PM', activity: 'Cap-Stone Project Evaluation & Certification', speaker: 'Evaluation Committee', location: 'AI Lab' }
                    ],
                    coordinators: [
                        { name: 'Dr. Ritu Saxena', phone: '+91 9810334455', email: 'ritu.saxena@abesit.in' }
                    ]
                },
                {
                    title: '1-Week National Faculty Development Program (FDP) on Cloud Computing & DevOps',
                    category: 'FDP',
                    shortDescription: 'Empowering engineering educators with modern Cloud Native Infrastructure, Kubernetes, CI/CD, and Terraform.',
                    description: 'This 1-Week Faculty Development Program (FDP) is tailored for faculty members and research scholars to bridge the gap between academic curricula and state-of-the-art enterprise DevOps tooling. Topics include container orchestration with Kubernetes, IaC with Terraform, GitOps with ArgoCD, and automated security scans.',
                    eventDate: 'December 01-05, 2026',
                    eventTime: '09:30 AM - 04:00 PM',
                    venue: 'Seminar Hall 2 & Cloud Computing Virtual Lab, ABESIT Ghaziabad',
                    mode: 'Hybrid',
                    maxSeats: 80,
                    registeredCount: 0,
                    status: 'Upcoming',
                    prizesOrCertification: 'FDP Completion Certificate recognized for CAS & Academic Appraisals',
                    speakers: [
                        {
                            name: 'Prof. K. Venkatesh',
                            designation: 'Adjunct Professor & Cloud Specialist',
                            organization: 'IIT Delhi & AWS Educate',
                            topic: 'Zero-Trust Architecture & Cloud Resiliency',
                            image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
                        }
                    ],
                    schedule: [
                        { time: 'Day 1 - 09:30 AM', activity: 'Inauguration & Evolution of Cloud Computing', speaker: 'Prof. K. Venkatesh', location: 'Seminar Hall 2' },
                        { time: 'Day 2 - 10:00 AM', activity: 'Docker Deep Dive & Container Optimization', speaker: 'DevOps Architects', location: 'Virtual Lab' },
                        { time: 'Day 3 - 10:00 AM', activity: 'Kubernetes Cluster Administration & Networking', speaker: 'Cloud Faculty', location: 'Virtual Lab' },
                        { time: 'Day 4 - 10:00 AM', activity: 'CI/CD Pipelines, GitHub Actions & Security', speaker: 'DevOps Architects', location: 'Virtual Lab' },
                        { time: 'Day 5 - 02:00 PM', activity: 'Assessment, Feedback & Valedictory Session', speaker: 'Dignitaries', location: 'Seminar Hall 2' }
                    ],
                    coordinators: [
                        { name: 'Dr. Manoj Singh', phone: '+91 9911887766', email: 'fdp.coordinator@abesit.in' }
                    ]
                },
                {
                    title: 'ABESIT Startup Expo & Innovation Summit 2026',
                    category: 'Startup Expo',
                    shortDescription: 'Showcase student innovations, connect with angel investors, and explore venture acceleration.',
                    description: 'The ABESIT Startup Expo brings together budding student founders, seasoned angel investors, venture capitalists, and industry ecosystem enablers. More than 40 startup kiosks will exhibit working prototypes, receive direct investor feedback, and compete for seed funding and incubation support.',
                    eventDate: 'December 12, 2026',
                    eventTime: '10:00 AM - 05:30 PM',
                    venue: 'Central Campus Grounds & Innovation Incubation Centre, ABESIT',
                    mode: 'Offline',
                    maxSeats: 300,
                    registeredCount: 0,
                    status: 'Upcoming',
                    prizesOrCertification: 'Seed Funding Grants up to ₹5,00,000 & 6 Months Incubation at ABESIT TBI',
                    speakers: [
                        {
                            name: 'Radhika Bansal',
                            designation: 'Managing Partner',
                            organization: 'Nexus Early Stage Ventures',
                            topic: 'From College Prototype to Venture-Backed Scale',
                            image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80'
                        }
                    ],
                    schedule: [
                        { time: '10:00 AM', activity: 'Exhibition Pavilion Opens & Stalls Showcase', speaker: 'All Founders', location: 'Central Grounds' },
                        { time: '11:30 AM', activity: 'Keynote: Navigating the Startup Landscape in 2026', speaker: 'Radhika Bansal', location: 'Auditorium' },
                        { time: '02:00 PM', activity: '1-on-1 Investor Pitching Speed Rounds', speaker: 'Selected Founders & VCs', location: 'Incubation Centre' },
                        { time: '04:30 PM', activity: 'Announcement of Seed Grants & Best Startup Awards', speaker: 'Jury', location: 'Auditorium' }
                    ],
                    coordinators: [
                        { name: 'Prof. Sanjay Agarwal', phone: '+91 9811445566', email: 'startupexpo@abesit.in' }
                    ]
                },
                {
                    title: 'National Tech Pitch Competition & Shark Tank ABESIT',
                    category: 'Pitch Competition',
                    shortDescription: '5-minute elevator pitches for revolutionary tech ideas judged by venture investors and industry leaders.',
                    description: 'Do you have a breakthrough software, IoT, or green-tech solution? Pitch it in 5 minutes in front of a live panel of judges and angel investors in the flagship Shark Tank ABESIT competition. Live Q&A, mock term-sheet negotiations, and cash grants for winning pitches.',
                    eventDate: 'December 19, 2026',
                    eventTime: '10:00 AM - 04:00 PM',
                    venue: 'Auditorium 1, ABESIT Campus Ghaziabad',
                    mode: 'Offline',
                    maxSeats: 100,
                    registeredCount: 0,
                    status: 'Upcoming',
                    prizesOrCertification: '₹75,000 Cash Pool, Mentorship Vouchers & Angel Backing',
                    speakers: [
                        {
                            name: 'Tanmay Saxena',
                            designation: 'Angel Investor & Founder',
                            organization: 'FinSpire Labs',
                            topic: 'What Investors Look for in a 5-Minute Pitch',
                            image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80'
                        }
                    ],
                    schedule: [
                        { time: '10:00 AM', activity: 'Opening Remarks & Introduction to Shark Panel', speaker: 'Event Lead', location: 'Auditorium 1' },
                        { time: '10:45 AM', activity: 'Pitch Round 1: Software & Web3 Solutions', speaker: 'Teams 1-10', location: 'Auditorium 1' },
                        { time: '01:30 PM', activity: 'Pitch Round 2: Hardware, IoT & Sustainability', speaker: 'Teams 11-20', location: 'Auditorium 1' },
                        { time: '03:30 PM', activity: 'Results Announcement & Shark Feedback', speaker: 'Shark Panel', location: 'Auditorium 1' }
                    ],
                    coordinators: [
                        { name: 'Dr. Neeraj Verma', phone: '+91 9810998877', email: 'pitch.abesit@abesit.in' }
                    ]
                }
            ];

            const createdEvents = await Event.insertMany(eventsData);
            console.log(`[Database] Seeded ${createdEvents.length} technical events.`);

            // 3. Create Sample Registrations
            const sampleRegs = [
                {
                    registrationId: 'ABESIT-2026-HACK-001',
                    user: student._id,
                    event: createdEvents[0]._id,
                    participantType: 'student',
                    fullName: 'Rahul Verma',
                    email: 'rahul.verma@abesit.in',
                    phone: '+91 9876543210',
                    collegeName: 'ABES Institute of Technology (ABESIT), Ghaziabad',
                    department: 'Computer Science & Engineering',
                    rollNoOrEmpId: '2202900100085',
                    yearOrDesignation: '3rd Year B.Tech',
                    teamName: 'CodeWarriors ABESIT',
                    teamMembers: 'Rahul Verma, Aman Tyagi, Sakshi Singhal',
                    status: 'Confirmed',
                    notes: 'Submitted project synopsis on Smart Healthcare Platform.'
                },
                {
                    registrationId: 'ABESIT-2026-FDP-002',
                    user: faculty._id,
                    event: createdEvents[2]._id,
                    participantType: 'faculty',
                    fullName: 'Dr. Priya Sharma',
                    email: 'dr.priya.sharma@abesit.in',
                    phone: '+91 9822334455',
                    collegeName: 'ABES Institute of Technology (ABESIT), Ghaziabad',
                    department: 'Information Technology',
                    rollNoOrEmpId: 'FAC-IT-104',
                    yearOrDesignation: 'Associate Professor',
                    status: 'Confirmed',
                    notes: 'Research focus on Distributed Container Systems.'
                },
                {
                    registrationId: 'ABESIT-2026-EXPO-003',
                    user: external._id,
                    event: createdEvents[3]._id,
                    participantType: 'external',
                    fullName: 'Neha Gupta',
                    email: 'neha.gupta@techinnovators.com',
                    phone: '+91 9911223344',
                    collegeName: 'TechInnovators Labs / DTU Delhi',
                    department: 'Software Engineering',
                    rollNoOrEmpId: 'EXT-DEL-552',
                    yearOrDesignation: 'Senior Product Engineer',
                    teamName: 'EcoTrack IoT',
                    teamMembers: 'Neha Gupta, Rohan Mehra',
                    status: 'Confirmed',
                    notes: 'Exhibiting Smart IoT Energy Auditing Device.'
                },
                {
                    registrationId: 'ABESIT-2026-WKSH-004',
                    user: student._id,
                    event: createdEvents[1]._id,
                    participantType: 'student',
                    fullName: 'Rahul Verma',
                    email: 'rahul.verma@abesit.in',
                    phone: '+91 9876543210',
                    collegeName: 'ABES Institute of Technology (ABESIT), Ghaziabad',
                    department: 'Computer Science & Engineering',
                    rollNoOrEmpId: '2202900100085',
                    yearOrDesignation: '3rd Year B.Tech',
                    status: 'Confirmed',
                    notes: 'Interested in RAG and Vector DB hands-on sessions.'
                }
            ];

            await Registration.insertMany(sampleRegs);

            // Update registered counts on events
            await Event.findByIdAndUpdate(createdEvents[0]._id, { registeredCount: 1 });
            await Event.findByIdAndUpdate(createdEvents[1]._id, { registeredCount: 1 });
            await Event.findByIdAndUpdate(createdEvents[2]._id, { registeredCount: 1 });
            await Event.findByIdAndUpdate(createdEvents[3]._id, { registeredCount: 1 });

            console.log('[Database] Seeded 4 sample registrations across categories.');
        }

        console.log('[Database] Seeder completed successfully!');
    } catch (err) {
        console.error('[Database Seeder Error]', err.message);
    }
};

module.exports = { seedInitialData };
