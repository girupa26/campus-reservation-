# Academic Event and Resource Booking Portal (Campus Reserve)

A lightweight, production-grade, centralized institutional facility reservation system for universities, colleges, and research institutes. The portal enables faculty, staff, and students to discover institutional facilities (seminar halls, research laboratories, smart classrooms, amphitheaters, and board rooms), schedule events, and enforce rigorous atomic conflict prevention to guarantee zero double-bookings.

---

## Key Features

1. **R1: Institutional Resource Catalog & Directory**
   - Rich taxonomy of academic resources with metadata: capacity, building location, equipment specifications, descriptions, and real-time availability status.
   - One-click category filtering (Seminar Halls, Laboratories, Classrooms, Amphitheaters, Board Rooms) and instant client-side text search.

2. **R2: Conflict-Free Reservation Engine**
   - Strict half-open interval collision prevention:
     $$\text{Conflict} \iff (S_{\text{new}} < E_{\text{existing}}) \;\land\; (E_{\text{new}} > S_{\text{existing}})$$
   - Rejects exact duplicates, partial overlaps (head and tail), enclosing windows, and enclosed sub-intervals with HTTP `409 Conflict`.
   - Back-to-back consecutive adjacent bookings (e.g. 10:00–12:00 followed immediately by 12:00–14:00) are cleanly permitted without false positives.
   - In-modal conflict alert preserves user form inputs, enabling instant time adjustment without retyping.

3. **R3: Individual User & Organizer Identification**
   - Every reservation requires explicit user identification (`user_id` and `user_name`), linking each confirmed slot to an accountable individual.
   - Filterable schedule view tracks reservations by organizer ID, resource, or date.

4. **Zero-Dependency & 100% Offline Architecture**
   - **Backend**: Python Standard Library (`http.server.ThreadingHTTPServer`, `sqlite3`, `json`, `urllib`). Zero pip packages needed.
   - **Frontend**: Pure HTML5 (`<dialog>`, semantic elements), modern CSS3 custom properties, responsive flex/grid design, and vanilla ES6+ JavaScript. Zero external CDNs, Google Fonts, or external scripts.
   - Fully compliant with air-gapped and `CODE_ONLY` environments.

5. **Dynamic Port Discovery & Clash Avoidance**
   - Automatically probes and binds to port 8000, or scans sequentially (8000–8050) if occupied.
   - Records the active port to `.server_port` for automated test suites and tooling.

---

## Directory Layout

```
.
├── server.py              # Multi-threaded HTTP/REST server & SQLite backend
├── test_booking.py        # Standalone verification suite (14 automated tests)
├── README.md              # System documentation & usage instructions
├── .server_port           # Created on boot; contains current bound TCP port
├── booking.db             # SQLite database (auto-initialized on first run)
└── public/                # Static frontend assets
    ├── index.html         # Responsive academic portal dashboard
    ├── styles.css         # 100% offline CSS design system
    └── app.js             # Vanilla JS client logic, modal & conflict handler
```

---

## REST API Specification

### 1. `GET /api/resources`
Returns catalog of institutional facilities.

- **Query Parameters (Optional)**:
  - `type`: Filter by facility type (`seminar_hall`, `lab`, `classroom`, `amphitheater`, `board_room`).
  - `min_capacity`: Minimum required capacity (integer).
- **Response `200 OK`**:
  ```json
  [
    {
      "id": "hall-a",
      "name": "Seminar Hall A",
      "type": "seminar_hall",
      "capacity": 200,
      "location": "Academic Block 1 - Ground Floor (Room G-01)",
      "equipment": ["Dual Laser Projectors", "Surround Sound Audio", "Wireless Lapel Mics", "PTZ Video Camera"],
      "description": "Premier institutional hall with acoustic wall paneling and professional A/V recording.",
      "is_active": 1
    }
  ]
  ```

### 2. `GET /api/resources/{id}`
Returns details for a single resource.
- **Response `200 OK`**: Resource object.
- **Response `404 Not Found`**: If resource ID does not exist.

### 3. `GET /api/bookings`
Returns confirmed reservations.

- **Query Parameters (Optional)**:
  - `resource_id`: Filter reservations for a specific facility.
  - `user_id`: Filter reservations created by a specific user.
  - `date`: Filter reservations starting on a specific date (`YYYY-MM-DD`).
- **Response `200 OK`**:
  ```json
  [
    {
      "id": "bkg_a1b2c3d4",
      "resource_id": "hall-a",
      "user_id": "prof_smith",
      "user_name": "Prof. Smith",
      "start_time": "2026-10-15T10:00:00",
      "end_time": "2026-10-15T12:00:00",
      "event_title": "AI Department Colloquium",
      "status": "CONFIRMED",
      "created_at": "2026-09-16T03:30:00Z"
    }
  ]
  ```

### 4. `POST /api/bookings`
Reserves a resource for an identified organizer and time slot.

- **Request Body**:
  ```json
  {
    "resource_id": "hall-a",
    "user_id": "prof_smith",
    "user_name": "Prof. Smith",
    "start_time": "2026-10-15T10:00:00",
    "end_time": "2026-10-15T12:00:00",
    "event_title": "AI Department Colloquium"
  }
  ```

- **Responses**:
  - **`201 Created`**: Reservation successfully placed. Returns the created booking object with assigned `id`.
  - **`409 Conflict`**: Target resource is already reserved for an overlapping time interval:
    ```json
    {
      "error": "Conflict",
      "message": "Resource hall-a is already reserved for the requested time slot.",
      "conflict_with": {
        "id": "bkg_a1b2c3d4",
        "event_title": "AI Department Colloquium",
        "user_name": "Prof. Smith",
        "start_time": "2026-10-15T10:00:00",
        "end_time": "2026-10-15T12:00:00"
      }
    }
    ```
  - **`400 Bad Request`**: Missing required fields, inverted time window (`start_time >= end_time`), or unparseable ISO 8601 strings.
  - **`404 Not Found`**: The specified `resource_id` does not exist in the institutional catalog.

### 5. `DELETE /api/bookings/{id}`
Cancels an active reservation, freeing up the time slot for future bookings.
- **Response `200 OK`**: `{"status": "CANCELLED", "id": "bkg_a1b2c3d4"}`.

---

## Quick Start Guide

### Prerequisites
- Python 3.10+ (Standard library only; no pip dependencies required).
- Any modern web browser (Chrome, Edge, Firefox, Safari).

### Running the Server
From the project root directory, launch the server:

```bash
python server.py
```

To run on a custom port:
```bash
python server.py 8080
# or
python server.py --port 8080
```

The server will display:
```
SERVER_RUNNING: http://127.0.0.1:8000
Web Dashboard:  http://127.0.0.1:8000/
REST API Root:  http://127.0.0.1:8000/api/resources
Database Path: J:\My Drive\girupa project\booking.db
Press Ctrl+C to stop the server.
```

Open `http://127.0.0.1:8000/` in any web browser to access the interactive web portal.

---

## Running the Automated Verification Suite

While `server.py` is running, open a terminal and execute:

```bash
python test_booking.py
```

The test runner will auto-discover the active port via `.server_port`, or you can specify a target URL directly:
```bash
python test_booking.py --url http://127.0.0.1:8000
```

### Acceptance Criteria Verified (14 Tests):
1. **Server Reachability**: Confirms HTTP 200 health check on `/api/resources`.
2. **R1 Resource Listing**: Confirms institutional schema, positive capacity, and taxonomy types (`seminar_hall`, `lab`, `classroom`).
3. **R2 & R3 Booking Creation**: Confirms 201 Created response and validated user identity persistence.
4. **R2 Exact Conflict Rejection**: Verifies duplicate reservation attempt on identical slot triggers HTTP 409 Conflict.
5. **Conflict Edge Case A (Starts Before, Ends Inside)**: Overlap triggers HTTP 409 Conflict.
6. **Conflict Edge Case B (Starts Inside, Ends After)**: Overlap triggers HTTP 409 Conflict.
7. **Conflict Edge Case C (Enclosing Window)**: Overlap triggers HTTP 409 Conflict.
8. **Conflict Edge Case D (Enclosed Window)**: Overlap triggers HTTP 409 Conflict.
9. **Boundary Condition (Adjacent Consecutive Slots)**: Back-to-back preceding and succeeding slots are accepted (HTTP 201).
10. **Resource Isolation**: Different resources scheduled at identical times are allowed (HTTP 201).
11. **Input Validation (Inverted Time)**: End time prior to start time rejected with HTTP 400 Bad Request.
12. **Input Validation (Missing Identity)**: Missing user name or ID rejected with HTTP 400 Bad Request.
13. **Query API**: Verifies listing and resource-based filtering via `/api/bookings`.
14. **Referential Integrity**: Non-existent resource ID rejected with HTTP 404/400.

All tests complete with green pass indicators and return exit code 0.
