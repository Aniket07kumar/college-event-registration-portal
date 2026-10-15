# College Event Registration & Management Portal
**Institution:** ABES Institute of Technology (ABESIT), Ghaziabad (AKTU Code: 290)

---

## 📌 Problem Statement Addressed
Colleges organize technical events such as **Hackathons, Workshops, FDPs, Startup Expos, and Pitch Competitions**. Traditional manual registration processes result in duplicate entries, inefficient participant management, and poor communication. 

This responsive web application automates event registration, validates participant details client-side and server-side, prevents duplicate entries via compound database indexing, generates digital confirmation passes with QR verification, and provides an administrative management console.

---

## 🛠️ Technologies Used
- **Frontend:** HTML5, CSS3, JavaScript (ES6+), AJAX (Fetch API)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose ODM
- **Security & Utilities:** Bcrypt.js, Express Session, Cookie-Parser, CORS, Dotenv

---

## 🚀 Key Modules & Functional Requirements

### Module 1: Home Page (`public/index.html`)
- **Responsive Navigation:** Sticky header with mobile hamburger drawer and live login state detection.
- **Hero Banner:** ABESIT branding, quick statistics counters, and live event spotlight cards.
- **About Section:** Information on technical events (Hackathons, Workshops, FDPs).
- **Event Schedule:** Interactive tabbed timeline (HackABESIT 2026, Deep Learning Workshop, Startup Expo).
- **Keynote Speakers Section:** Cards highlighting industry experts from Google Cloud, Microsoft, NVIDIA, and VC firms.
- **Contact Information:** Dedicated campus address, phone numbers, and official emails (`public/contact.html`).

### Module 2: Registration (`public/register.html`)
- **Student Registration:** Roll number, department/branch, academic year, college, and optional team details.
- **Faculty Registration:** Employee ID, academic designation, department, and institution.
- **External Participant Registration:** Organization, professional role, and participant reference.
- **Client-Side Validation (`public/js/validation.js`):**
  - Name length validation
  - Regex-based email verification
  - 10-digit Indian phone number verification
  - Role-specific required fields
  - Terms of conduct validation
- **AJAX Communication:** Instant asynchronous submission (`POST /api/registrations`) with duplicate prevention.
- **Confirmation Modal:** Displays the generated registration code with a 1-click button to view the confirmation pass.

### Module 3: Authentication & Login (`public/login.html`)
- **Participant Login:** For registered students, faculty, and external attendees.
- **Admin Login:** Restricted login for ABESIT Event Conveners and Faculty Coordinators.
- **1-Click Demo Fillers:** Fast-fill buttons for testing Student, Faculty, External, and Admin accounts in 1 second.
- **Role Redirection:** Directs admins to `/admin-dashboard.html` and participants to `/participant-dashboard.html`.

### Module 4: Dashboards
#### 1. Participant Dashboard (`public/participant-dashboard.html`)
- View registered events with live status badges (`Confirmed`, `Attended`, etc.).
- **Download Confirmation Slip / Ticket:** Generates an official ABESIT Event Pass with QR code simulation, barcode, registration ID, venue info, and a print trigger (`window.print()`).
- **Update Profile:** Form allowing participants to update their name, phone, department, roll number, and designation via AJAX `PUT /api/auth/profile`.

#### 2. Admin Dashboard (`public/admin-dashboard.html`)
- **Analytics Metrics:** KPI counters for total registrations, student count, faculty count, external attendees, and active events.
- **Registrations Distribution:** Visual progress bars per event.
- **Search Participants:** Live search bar filtering by name, email, roll no, college, or registration ID.
- **Category & Status Filters:** Filter participants by Event, Type, and Status.
- **Status Updates:** Update status to `Confirmed`, `Attended`, or `Cancelled` via AJAX `PUT /api/registrations/:id`.
- **Delete Registrations:** Secure delete prompt calling AJAX `DELETE /api/registrations/:id` and releasing event seat quota.
- **Generate Reports:**
  - **Export CSV Report:** Generates and downloads a clean CSV file (`GET /api/registrations/export/csv`).
  - **Printable Summary Report:** Formatted summary for official audits.
- **Add New Event:** Modal to publish new technical events to the portal (`POST /api/events`).

### Module 5: Database Schema (MongoDB Mongoose)
- **`Users` Collection:** Name, email, hashed password, role (`student`, `faculty`, `external`, `admin`), college, department, roll/emp ID, phone.
- **`Events` Collection:** Title, category, dates, time, venue, mode, seat capacity, registered count, speakers array, schedule itinerary.
- **`Registrations` Collection:** Unique registration ID (`ABESIT-2026-XXXX`), user ref, event ref, participant type, contact details, team details, status (`Confirmed`, `Attended`, etc.).
- **Duplicate Prevention Index:** Compound unique index on `{ event: 1, email: 1 }` prevents participants from registering multiple times for the same event.

### Module 6: REST API Specification
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/events` | List all published events (supports `?category=` and `?search=`) |
| `GET` | `/api/events/:id` | Get full event details, speakers, and schedule |
| `POST` | `/api/events` | Admin publish a new technical event |
| `GET` | `/api/registrations` | **GET Participants** (filtered by search, event, type) |
| `GET` | `/api/registrations/participants` | Alias endpoint for participants listing |
| `GET` | `/api/registrations/:id` | Get registration details & confirmation pass data |
| `POST` | `/api/registrations` | **POST Registration** (with validation & duplicate checks) |
| `PUT` | `/api/registrations/:id` | **PUT Update** (update details or participant status) |
| `DELETE` | `/api/registrations/:id` | **DELETE Registration** (delete record & adjust event count) |
| `GET` | `/api/registrations/export/csv` | Export all participants as a downloadable CSV report |
| `POST` | `/api/auth/login` | Authenticate participant or admin |
| `POST` | `/api/auth/register` | Register new participant account |
| `PUT` | `/api/auth/profile` | Update current logged-in participant profile |

---

## 🔑 Pre-Configured Test Accounts (Seeded Automatically)

| Role | Email | Password | Details |
|---|---|---|---|
| **Admin** | `admin@abesit.in` | `admin123` | Event Convener (Full Admin Access) |
| **Student** | `rahul.verma@abesit.in` | `student123` | 3rd Year B.Tech CSE Student |
| **Faculty** | `dr.priya.sharma@abesit.in` | `faculty123` | Associate Professor, IT Dept |
| **External** | `neha.gupta@techinnovators.com` | `external123` | Senior Engineer, DTU / TechInnovators |

*(You can also use the 1-Click test buttons on the login page!)*

---

## 🏃 Running the Application

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the server:**
   ```bash
   npm start
   ```
3. **Open in browser:**
   ```
   http://localhost:3000
   ```
