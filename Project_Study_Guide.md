# 🎓 Campus Reserve: Institutional Facility Reservation System
**Comprehensive Study & Presentation Guide**

---

## 1. Project Overview
**What is it?**
A centralized MERN-stack web application designed to streamline the booking of institutional facilities (seminar halls, labs, board rooms, etc.). 
**Why was it built? (Problem Statement)**
To replace manual, paper-based ledgers and fragmented spreadsheets that cause double-bookings, lack of visibility, and administrative overhead.
**What does it solve?**
It provides real-time availability tracking, role-based access, and automated conflict resolution to prevent double-booking.

---

## 2. Technology Stack (MERN)
Be prepared to explain why you chose these technologies:
*   **MongoDB (Data Layer):** A NoSQL database. Chosen because it handles unstructured data well and stores data in JSON-like documents, which pairs perfectly with JavaScript/Node.js.
*   **Express.js (Backend Framework):** A lightweight web application framework for Node.js. Used to build our RESTful API routes.
*   **React.js (Frontend Library):** Used for building a fast, interactive User Interface using functional components and hooks. Allows for a single-page application (SPA) experience without reloading the browser.
*   **Node.js (Runtime):** Executes JavaScript on the server-side.

---

## 3. Core Features & How They Work

### A. Real-Time Conflict Detection
*   **How it works:** When a user submits a booking, the backend `POST /api/bookings` route queries the database to see if any *existing* 'CONFIRMED' booking for the *same facility* overlaps with the requested start and end times.
*   **The Logic:** `Existing_Start < Requested_End` AND `Existing_End > Requested_Start`. If this is true, the server rejects the booking with a 409 Conflict status.

### B. Time-Window Restrictions
*   **How it works:** College working hours are strictly 8:00 AM to 4:00 PM.
*   **Implementation:** 
    *   *Frontend:* A custom AM/PM picker ensures users easily select valid times. It converts the input to ISO date strings.
    *   *Backend:* The server calculates total minutes from midnight (`hours * 60 + minutes`). It strictly rejects any request where `startMins < 480` (8 AM) or `endMins > 960` (4 PM).

### C. Persistent Storage & State Management
*   **Data Storage:** While developing, we transitioned from an in-memory database to a persistent file-based JSON store (and eventually MongoDB Atlas) so data survives server restarts.
*   **Daily Reset:** The frontend automatically refreshes at midnight to show only the *current* day's reservations.

---

## 4. Database Schema (Collections)

**1. Resources (Facilities) Collection**
*   `id`: String (e.g., "amphi-central")
*   `name`: String (e.g., "Central Open-Air Amphitheater")
*   `type`: String (lab, classroom, seminar_hall, etc.)
*   `capacity`: Number
*   `location`: String
*   `equipment`: Array of Strings (e.g., ["Projector", "Whiteboard"])

**2. Bookings Collection**
*   `id`: String (Unique booking ID)
*   `resource_id`: String (Foreign key linking to the Resource)
*   `department`: String (e.g., "Computer Science")
*   `user_name`: String (Name of the faculty/staff)
*   `event_title`: String
*   `start_time`: ISODate String
*   `end_time`: ISODate String
*   `status`: String ("CONFIRMED" or "CANCELLED")

---

## 5. API Endpoints (RESTful Architecture)
*   `GET /api/resources` - Fetches all campus facilities. Supports query filters (e.g., `?type=lab`).
*   `GET /api/bookings?date=YYYY-MM-DD` - Fetches active bookings, filtered by the current day.
*   `POST /api/bookings` - Submits a new booking. Contains validation and conflict checking.
*   `DELETE /api/bookings/:id` - Cancels an existing booking.

---

## 6. Challenges Faced & Solutions

If the reviewer asks: *"What was the hardest part of building this?"*

1.  **Challenge: The Browser's 24-Hour Time Format**
    *   *Problem:* The default HTML `datetime-local` input uses a 24-hour clock. Users were typing "1:00" meaning 1 PM, but the system logged it as 1 AM, causing validation errors.
    *   *Solution:* Removed the native input and built a custom React time-picker with separate dropdowns for Date, Hour, Minute, and AM/PM. We wrote a helper function to convert this custom input into a standard ISO Date format before sending it to the backend.
2.  **Challenge: Data Disappearing on Restart**
    *   *Problem:* Initially used `mongodb-memory-server` for rapid prototyping, but all bookings vanished every time the server restarted.
    *   *Solution:* Migrated the backend to use a persistent storage layer so bookings are permanently saved.
3.  **Challenge: Preventing Double Bookings**
    *   *Problem:* Two people trying to book the same hall at the same time.
    *   *Solution:* Implemented strict backend time-overlap algorithms. The backend acts as the single source of truth and will reject conflicting reservations even if the frontend allows it through.

---

## 7. Likely Questions from Evaluators (Q&A)

**Q: Why use MERN stack instead of PHP/MySQL or Java?**
*A: MERN uses JavaScript end-to-end. This means we use the same language on the frontend and backend, which speeds up development. React provides a highly responsive, app-like feel without page reloads, and MongoDB handles JSON data natively, which maps perfectly to our JavaScript objects.*

**Q: How do you handle security?**
*A: We plan to use JWT (JSON Web Tokens) for authentication. When a user logs in, they receive a secure token. That token must be sent in the header of every API request to prove the user has permission to book or cancel a facility.*

**Q: What happens if a user bypasses the frontend validation?**
*A: The frontend validation is just for a good User Experience. The real security is on the backend. Even if someone bypasses the UI and uses Postman to send a booking outside of 8 AM - 4 PM, the Express API routes independently validate the data and will reject it.*

**Q: How is this better than Google Calendar?**
*A: Google Calendar is a generic scheduling tool. Our system is specifically tailored to institutional infrastructure. It tracks specific room capacities, available equipment (like projectors or lab computers), and enforces institutional rules (like department-specific access and college working hours).*

---
**💡 Presentation Tips for Tomorrow:**
*   **Speak confidently about the backend.** Reviewers love it when you know how the data flows (Frontend Form -> Axios -> Express POST Route -> Conflict Check -> Database Save -> React State Update).
*   **Demo the validation.** Show them what happens when you try to book a room at 5:00 PM (it fails). Show them what happens if you try to book a room that is already taken (it fails). This proves your logic works.
*   **Breathe and take your time.** You built this, you know how it works!
