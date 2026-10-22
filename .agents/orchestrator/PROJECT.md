# Project: Academic Event and Resource Booking Portal

## Architecture
- **Backend Service**: Multi-threaded Python server (`http.server.ThreadingHTTPServer` + `sqlite3`), serving static files from `public/` and handling REST API endpoints.
- **Data Persistence**: SQLite 3 database (`booking.db`) with `BEGIN IMMEDIATE` atomic locking and compound B-tree indexes (`idx_bookings_resource_window`).
- **Frontend Web UI**: Modern responsive HTML5/CSS3/JavaScript dashboard in `public/` featuring real-time resource catalog, category filters, interactive `<dialog>` booking modal with live duration calculation, in-modal 409 conflict alerts, floating toast notifications, and active bookings schedule. 100% offline, zero external CDN dependencies.
- **Verification Suite**: Standalone automated test runner (`test_booking.py`) using Python standard library `urllib.request`, auto-detecting `.server_port`.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Exploration & Architecture | Requirements, runtime environment, schema, API contracts | none | DONE |
| 2 | Implementation & UI | Backend API, UI dashboard, seed data, test_booking.py | M1 | DONE |
| 3 | Review & Stress Testing | Code review, edge case challenge, concurrency testing | M2 | DONE |
| 4 | Forensic Audit & Gating | Independent audit against hardcoding/cheating | M3 | DONE |

## Interface Contracts

### GET /api/resources
- **Description**: Returns all institutional resources, optionally filtered by `type`.
- **Response**: Status 200 OK, JSON array of resource objects (`id`, `name`, `type`, `capacity`, `location`, `equipment`, `description`).

### POST /api/bookings
- **Description**: Creates a booking for an identified user and time slot. Rejects conflicts.
- **Request**:
  ```json
  {
    "resource_id": "hall-a",
    "user_id": "prof_smith",
    "user_name": "Prof. Smith",
    "start_time": "2026-09-20T10:00:00",
    "end_time": "2026-09-20T12:00:00",
    "event_title": "AI Department Colloquium"
  }
  ```
- **Responses**:
  - `201 Created`: Booking successful, returns booking object with generated `id`.
  - `409 Conflict`: Rejection due to existing booking overlapping with requested time slot.
  - `400 Bad Request`: Missing fields, unparseable timestamps, or `start_time >= end_time`.
  - `404 Not Found`: Non-existent `resource_id`.

### GET /api/bookings
- **Description**: List active bookings, optionally filtered by `resource_id`, `user_id`, or `date`.

### DELETE /api/bookings/{id}
- **Description**: Cancels a booking, freeing up the time slot.

## Code Layout
- `server.py`: Backend server and API handlers
- `public/index.html`: Responsive academic portal layout
- `public/styles.css`: 100% offline styling and components
- `public/app.js`: Client-side logic, API calls, modal & toast feedback
- `test_booking.py`: Standalone automated verification script
- `booking.db`: SQLite database
- `README.md`: System documentation, run instructions, API docs
