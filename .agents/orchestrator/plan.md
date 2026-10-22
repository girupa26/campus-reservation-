# Orchestration Plan: Academic Event and Resource Booking Portal

## Execution Pattern: Project Pattern (2B Direct Iteration Loop)

### Milestone 1: Exploration & Architecture (Step a)
- Target: Spawn 3 parallel Explorers (`teamwork_preview_explorer`).
  - Explorer 1: Codebase environment audit & runtime capabilities (Python vs Node.js, dependencies, port availability, structure).
  - Explorer 2: System architecture & API specification (Data model: Resource, Booking, User; Endpoints: GET /api/resources, POST /api/bookings, GET /api/bookings; Conflict detection algorithm).
  - Explorer 3: Web UI design & Test/Verification strategy (Modern responsive UI for booking/viewing, standalone `test_booking.py` implementation strategy).
- Exit Criteria: All 3 Explorers report back and recommendations synthesized.

### Milestone 2: Implementation (Step b)
- Target: Spawn 1 Worker (`teamwork_preview_worker`) armed with synthesized Explorer plan.
  - Implement full backend (clean Python or Node.js server with persistent or structured in-memory/SQLite storage).
  - Implement frontend interface (intuitive, attractive web dashboard for browsing resources, selecting time slots, inputting user ID, and viewing active reservations).
  - Seed initial institutional resources (Seminar Hall A, Turing Computer Lab, Science Lecture Hall 101, Conference Room).
  - Implement standalone verification script `test_booking.py` exercising listing, booking, and conflict rejection.
  - Start server and execute verification test.
- Exit Criteria: Worker reports successful build, running server, passing test run.

### Milestone 3: Review & Adversarial Stress Testing (Steps c & d)
- Target:
  - Step c: Spawn 2 independent Reviewers (`teamwork_preview_reviewer`) to verify code quality, API compliance, and run tests.
  - Step d: Spawn 2 Challengers (`teamwork_preview_challenger`) to stress-test conflict prevention (exact overlap, boundary overlap, concurrency, bad inputs, missing fields).
- Exit Criteria: Clean reviewer reports, challenger confirming correctness.

### Milestone 4: Forensic Audit & Victory Verification (Steps e & f)
- Target: Spawn 1 Forensic Auditor (`teamwork_preview_auditor`) to verify genuine implementation (no mocked/hardcoded test responses, genuine conflict checking, genuine data persistence).
- Exit Criteria: Forensic Auditor verdict is CLEAN. Gate passes. Report victory to Sentinel.
