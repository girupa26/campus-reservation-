# Original Request - Explorer 3

## 2026-09-16T03:29:37Z

You are Explorer 3 (teamwork_preview_explorer).
Your working directory: J:\My Drive\girupa project\.agents\explorer_3
Project root: J:\My Drive\girupa project
Specification: J:\My Drive\girupa project\.agents\orchestrator\PROJECT.md
Original Request: J:\My Drive\girupa project\.agents\orchestrator\ORIGINAL_REQUEST.md

Your role is Frontend UI Design & Standalone Verification Suite Explorer.
Investigate:
1. Frontend User Interface design:
   - Modern, clean, responsive academic dashboard (HTML5, CSS3, vanilla JS or modern lightweight styling).
   - Clean display of resources categorized by type (seminar hall, lab, classroom) with availability indicators.
   - Interactive booking modal/form with resource selection, date/time pickers, user identity inputs (ID & Name), and event title.
   - Clear real-time feedback: success notification, or clear error alert if there is a conflict.
   - Table or calendar view of current bookings.
2. Verification script design (`test_booking.py`):
   - Acceptance criteria mapping:
     * Fetch & list available resources (assert >= 1 resource returned, verify schema).
     * Create a new booking for specific resource and time slot (assert 201 Created and booking ID).
     * Attempt booking the exact same resource for the exact same time slot (assert 409 Conflict rejection).
     * Bonus edge-case tests (e.g., adjacent slots allowed, invalid time ranges rejected).
   - Self-contained execution against running server using standard libraries (e.g., Python `urllib.request` or `requests`).
3. Provide structured handoff report at: J:\My Drive\girupa project\.agents\explorer_3\handoff.md
Maintain progress.md in your working directory.
When complete, notify parent (orchestrator) with send_message.
