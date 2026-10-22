const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// ─── File-based persistent store ─────────────────────────────────────────────
const fs = require('fs');
const DB_FILE = path.join(__dirname, 'db.json');

function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = { resources: initialResources, bookings: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return { resources: initialResources, bookings: [] };
  }
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Expose db helpers on app so routes can use them
app.locals.loadDB = loadDB;
app.locals.saveDB = saveDB;

// ─── Initial resource seed data ───────────────────────────────────────────────
const initialResources = [
  {
    "id": "amphi-central",
    "name": "Central Open-Air Amphitheater",
    "type": "amphitheater",
    "capacity": 500,
    "location": "Campus Plaza - Central Quad",
    "equipment": ["Concert Sound System", "LED Stage Floodlights", "Tiered Stone Seating", "Backstage Green Room"],
    "description": "Vast outdoor venue for university annual festivals, theatrical drama, cultural showcases, and student union assemblies.",
    "is_active": 1
  },
  {
    "id": "lab-robotics",
    "name": "Cyber-Physical Systems & Robotics Lab",
    "type": "lab",
    "capacity": 30,
    "location": "Engineering Wing - 1st Floor (Room E-105)",
    "equipment": ["Robotic Test Arena", "3D Prototyping Stations", "Digital Oscilloscopes", "Overhead Tracking Cameras"],
    "description": "Specialized lab equipped for embedded systems, autonomous robot navigation, and sensor integration testing.",
    "is_active": 1
  },
  {
    "id": "conf-board",
    "name": "Executive Board Room",
    "type": "board_room",
    "capacity": 25,
    "location": "Administrative Tower - 5th Floor (Room AD-501)",
    "equipment": ["Polycom Studio X70 Video Bar", "85-inch 4K Commercial Display", "Table-Embedded Mics", "VoIP Telephony"],
    "description": "High-security board room suited for university governing council and international partner negotiations.",
    "is_active": 1
  },
  {
    "id": "conf-faculty",
    "name": "Faculty Senate Conference Room",
    "type": "board_room",
    "capacity": 20,
    "location": "Administrative Tower - 2nd Floor (Room AD-205)",
    "equipment": ["Dual 65-inch Displays", "Jabra Panacast Camera", "Omnidirectional Speakerphone", "Glass Whiteboard"],
    "description": "Collaborative meeting space for faculty committees, curriculum review panels, and research grant working groups.",
    "is_active": 1
  },
  {
    "id": "hall-b",
    "name": "Science Seminar Hall B",
    "type": "seminar_hall",
    "capacity": 120,
    "location": "Science Complex - 2nd Floor (Room S-204)",
    "equipment": ["4K Laser Projector", "Boundary Microphones", "PTZ Tracking Camera", "Document Camera"],
    "description": "Medium-sized seminar hall optimized for scientific paper presentations and department colloquia.",
    "is_active": 1
  },
  {
    "id": "hall-a",
    "name": "Seminar Hall A",
    "type": "seminar_hall",
    "capacity": 200,
    "location": "Academic Block 1 - Ground Floor (Room G-01)",
    "equipment": ["Dual Laser Projectors", "Surround Sound Audio", "Wireless Lapel Mics", "PTZ Video Camera", "Integrated Podium"],
    "description": "Premier institutional hall with acoustic wall paneling and professional A/V recording for conferences and symposia.",
    "is_active": 1
  },
  {
    "id": "amphi-indoor",
    "name": "Sir C.V. Raman Indoor Amphitheater",
    "type": "amphitheater",
    "capacity": 350,
    "location": "Student Life Center - Ground Floor (Room SLC-G1)",
    "equipment": ["Cinema-Grade 4K DCI Laser Projector", "Dolby Atmos 7.1 Audio", "DMX Lighting Console"],
    "description": "Acoustically isolated auditorium engineered for cinematic screenings, dramatic recitals, and academic convocations.",
    "is_active": 1
  },
  {
    "id": "class-101",
    "name": "Smart Classroom 101",
    "type": "classroom",
    "capacity": 60,
    "location": "Academic Block 1 - 1st Floor (Room A-101)",
    "equipment": ["Interactive 75-inch Touch Display", "Ceiling Sound Reinforcement", "Lecture Capture", "Modular Desks"],
    "description": "Modern active-learning classroom featuring modular flexible furniture and hybrid broadcasting.",
    "is_active": 1
  },
  {
    "id": "class-202",
    "name": "Standard Lecture Hall 202",
    "type": "classroom",
    "capacity": 80,
    "location": "Academic Block 2 - 2nd Floor (Room A-202)",
    "equipment": ["High-Lumen Overhead Projector", "Retractable Screen", "Amplified Podium Mic", "Dual Chalkboards"],
    "description": "Traditional tiered lecture hall designed for core departmental coursework and examination sessions.",
    "is_active": 1
  },
  {
    "id": "lab-ai",
    "name": "Turing AI & Computing Lab",
    "type": "lab",
    "capacity": 40,
    "location": "Technology Block - 3rd Floor (Room T-310)",
    "equipment": ["40x NVIDIA RTX Workstations", "Gigabit Switch", "Dual Presentation Displays", "Smart Whiteboard"],
    "description": "High-performance computational lab dedicated to machine learning and data science research workshops.",
    "is_active": 1
  }
];

// ─── Routes ───────────────────────────────────────────────────────────────────
const resourceRoutes = require('./routes/resources');
const bookingRoutes = require('./routes/bookings');

app.use('/api/resources', resourceRoutes);
app.use('/api/bookings', bookingRoutes);

// ─── Start ────────────────────────────────────────────────────────────────────
// Ensure db.json exists on startup
loadDB();
console.log('Persistent file store ready at db.json');

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
