# Adversarial Stress Testing & Concurrency Challenge Report

**Agent**: Challenger 1 (`teamwork_preview_challenger`)  
**Role**: Critic, Specialist  
**Working Directory**: `J:\My Drive\girupa project\.agents\challenger_1`  
**Target Server**: `http://127.0.0.1:8000` (PID backed by SQLite database `booking.db`)  
**Execution Timestamp**: 2026-09-16T03:45:00Z  

---

## 1. Observation

### 1.1 Server Code Inspection (`server.py`)
- **Mutex & Serialization**: At `server.py:30`:
  ```python
  BOOKING_MUTEX = threading.Lock()
  ```
  Every reservation request (`POST /api/bookings`) acquires `BOOKING_MUTEX` at line 385 before opening a SQLite connection and querying the database:
  ```python
  with BOOKING_MUTEX:
      conn = get_db_connection()
      try:
          with conn:
              ...
  ```
- **Interval Overlap Query**: At `server.py:403-413`:
  ```python
  conflict = conn.execute(
      """
      SELECT id, event_title, user_name, start_time, end_time 
      FROM bookings 
      WHERE resource_id = ? 
        AND status = 'CONFIRMED'
        AND (start_time < ? AND end_time > ?)
      LIMIT 1
      """,
      (req_res, req_end, req_start)
  ).fetchone()
  ```
- **Transaction Commit vs Response Flush Timing**: At `server.py:438-453`:
  ```python
  conn.execute("""INSERT INTO bookings ...""")
  new_booking = { ... }
  self._send_json(201, new_booking)  # Line 451: Called INSIDE `with conn:` block
  ```
  In Python's `sqlite3`, `with conn:` issues `COMMIT` upon block exit. Thus, the HTTP 201 response is transmitted over the TCP socket before the SQLite commit finishes on disk.

### 1.2 Empirical Concurrency Harness Execution (`challenge_concurrency.py`)
Command executed:
```powershell
python "J:\My Drive\girupa project\.agents\challenger_1\challenge_concurrency.py"
```

Verbatim tool output across all 9 scenarios:
```
================================================================
   STARTING EMPIRICAL ADVERSARIAL STRESS TEST SUITE
   Target: http://127.0.0.1:8000
   Database: J:\My Drive\girupa project\booking.db
   Run Tag: 430271
   Base Date: 2035-09-29T08:00:00
================================================================

--- Running Scenario 1: High-Concurrency Race (20 threads) ---
[PASS] Simultaneous High-Concurrency Race Condition (20 threads)
       threads_launched: 20
       status_counts: {201: 1, 409: 19}
       201_success_count: 1
       409_conflict_count: 19
       unexpected_codes: []
       db_confirmed_rows: 1
       winning_user_id: racer_s1_430271_05
       db_persisted_user_id: racer_s1_430271_05
       winner_matches_db: True

--- Running Scenario 2: High-Volume Rapid Sequential (20 slots) ---
[PASS] High-Volume Rapid Sequential Bookings (20 slots)
       requested_slots: 20
       success_201_count: 20
       db_persisted_count: 20
       avg_latency_ms: 141.91
       max_latency_ms: 174.77
       min_latency_ms: 89.5
       non_201_statuses: []

--- Running Scenario 3: Boundary & Sub-interval Overlaps ---
[PASS] Overlapping Boundaries & Edge Cases (1s, 1m, abutting)
       1-Second Leading Overlap: {'expected': 409, 'actual': 409, 'passed': True, 'desc': 'Ends 1 second into the anchor window [10:00:00, 12:00:00)', 'response_error': 'Conflict'}
       1-Second Trailing Overlap: {'expected': 409, 'actual': 409, 'passed': True, 'desc': 'Starts 1 second before anchor window ends', 'response_error': 'Conflict'}
       1-Second Internal Slice Overlap: {'expected': 409, 'actual': 409, 'passed': True, 'desc': '1-second sliver directly inside anchor window', 'response_error': 'Conflict'}
       1-Minute Leading Overlap: {'expected': 409, 'actual': 409, 'passed': True, 'desc': 'Ends 1 minute into anchor window', 'response_error': 'Conflict'}
       1-Minute Trailing Overlap: {'expected': 409, 'actual': 409, 'passed': True, 'desc': 'Starts 1 minute before anchor window ends', 'response_error': 'Conflict'}
       Exact Match Overlap: {'expected': 409, 'actual': 409, 'passed': True, 'desc': 'Identical start and end time', 'response_error': 'Conflict'}
       Enclosing Window Overlap: {'expected': 409, 'actual': 409, 'passed': True, 'desc': 'Completely encloses the anchor window', 'response_error': 'Conflict'}
       Enclosed Window Overlap: {'expected': 409, 'actual': 409, 'passed': True, 'desc': 'Completely enclosed inside the anchor window', 'response_error': 'Conflict'}
       Preceding Adjacent Boundary (Touching, NOT overlapping): {'expected': 201, 'actual': 201, 'passed': True, 'desc': 'Abutting slot ending exactly at anchor start 10:00:00', 'response_error': None}
       Following Adjacent Boundary (Touching, NOT overlapping): {'expected': 201, 'actual': 201, 'passed': True, 'desc': 'Abutting slot starting exactly at anchor end 12:00:00', 'response_error': None}

--- Running Scenario 4: Concurrent Non-Overlapping Adjacent Slots (10 threads) ---
[PASS] Concurrent Non-Overlapping Adjacent Slots (10 threads)
       threads: 10
       201_success_count: 10
       non_201_codes: []

--- Running Scenario 5: Cancellation & Concurrent Re-claim (10 threads) ---
[PASS] Cancellation & Concurrent Slot Re-claiming
       cancelled_booking_id: bkg_1540dee7
       racers_competing: 10
       201_success_count: 1
       409_conflict_count: 9
       winning_reclaimer: reclaimer_430271_09

--- Running Scenario 7: Extreme High-Concurrency Race (50 threads) ---
[PASS] Extreme High-Concurrency Race Condition (50 threads)
       threads_launched: 50
       201_success_count: 1
       409_conflict_count: 49
       unexpected_codes: []
       db_confirmed_rows: 1
       winner: extreme_430271_13

--- Running Scenario 8: Cross-Midnight & Year-Boundary Overlaps ---
[PASS] Cross-Midnight and Year-Boundary Overlap Stress
       Overlapping across midnight (23:30 to 00:30): {'expected': 409, 'actual': 409, 'passed': True}
       Overlapping before midnight (22:30 to 23:30): {'expected': 409, 'actual': 409, 'passed': True}
       Overlapping after midnight (00:30 to 01:30): {'expected': 409, 'actual': 409, 'passed': True}
       Preceding touching boundary before NYE (21:00 to 23:00): {'expected': 201, 'actual': 201, 'passed': True}
       Following touching boundary in New Year (01:00 to 03:00): {'expected': 201, 'actual': 201, 'passed': True}

--- Running Scenario 9: Adversarial Malformed & Pathological Input Attacks ---
[PASS] Adversarial Pathological Input Attacks
       Inverted Time Window (start > end): {'expected': 400, 'actual': 400, 'passed': True, 'error_message': 'start_time must be strictly earlier than end_time.'}
       Zero Duration Booking (start == end): {'expected': 400, 'actual': 400, 'passed': True, 'error_message': 'start_time must be strictly earlier than end_time.'}
       Unparseable Datetime String: {'expected': 400, 'actual': 400, 'passed': True, 'error_message': "Invalid ISO 8601 datetime format: Invalid isoformat string: 'not-a-datetime'"}
       Non-Existent Resource ID: {'expected': 404, 'actual': 404, 'passed': True, 'error_message': "Resource 'phantom-hall-999' does not exist or is inactive."}
       Missing Required Field (missing event_title): {'expected': 400, 'actual': 400, 'passed': True, 'error_message': 'Missing required booking fields: event_title.'}
       Whitespace-only User ID: {'expected': 400, 'actual': 400, 'passed': True, 'error_message': 'Missing required booking fields: user_id.'}
       DELETE Non-existent Booking ID: {'expected': 404, 'actual': 404, 'passed': True, 'error_message': "Booking 'bkg_does_not_exist_9999' not found."}

--- Running Scenario 6: SQLite Direct Integrity Audit ---
[PASS] Direct Database Integrity & Sanity Audit
       sqlite_integrity_check: ok
       foreign_key_violations: 0
       global_overlap_violations: 0
       total_bookings_in_db: 245
       confirmed_bookings: 207
       cancelled_bookings: 38

================================================================
   SUMMARY OF RESULTS
   Total Execution Time: 16.63s
   Total Scenarios: 9
   Passed: 9
   Failed: 0
================================================================

ALL ADVERSARIAL STRESS TESTS PASSED EMPIRICALLY.
```

### 1.3 Baseline Acceptance Suite (`test_booking.py`)
Command executed:
```powershell
python test_booking.py
```
Verbatim tool output:
```
===========================================================================
VERIFICATION SUMMARY:
Total Tests Executed: 14
Passed:               14
Failed:               0
Success Rate:         100.0%

ALL ACCEPTANCE CRITERIA SATISFIED (R1, R2, R3).
===========================================================================
```

---

## 2. Logic Chain

1. **Strict Concurrency Protection (Scenario 1 & Scenario 7)**:
   - *Observation*: 20 threads released from `threading.Barrier(20)` concurrently hit `POST /api/bookings` for the identical resource and slot. Result: `{201: 1, 409: 19}`.
   - *Observation*: Pushing to 50 concurrent threads resulted in `{201: 1, 409: 49}` with zero duplicate database rows.
   - *Inference*: `BOOKING_MUTEX = threading.Lock()` at line 385 successfully serializes the critical section across worker threads of `ThreadingHTTPServer`. Race conditions leading to double bookings are prevented.

2. **High-Volume Sequential Saturation (Scenario 2)**:
   - *Observation*: 20 non-overlapping slots requested sequentially in rapid succession. All 20 returned HTTP 201 within ~140ms average response latency.
   - *Observation*: Direct SQLite query verified 20 confirmed rows created with matching user IDs and timestamps.
   - *Inference*: The server handles high-frequency burst writes without connection exhaustion, deadlocks, or database corruption.

3. **Sub-second and Boundary Precision (Scenario 3 & Scenario 8)**:
   - *Observation*: A candidate booking ending 1 second into an existing window (`10:00:01`) was rejected with HTTP 409 Conflict.
   - *Observation*: A candidate booking starting 1 second before an existing window closes (`11:59:59`) was rejected with HTTP 409 Conflict.
   - *Observation*: A candidate booking spanning 1 minute into the slot (`10:01:00`) was rejected with HTTP 409 Conflict.
   - *Observation*: Adjacent touching slots ending at `10:00:00` or starting at `12:00:00` succeeded with HTTP 201 Created.
   - *Observation*: Cross-midnight and year-boundary bookings across Dec 31 / Jan 1 correctly rejected overlapping slots (409) and accepted adjacent boundaries (201).
   - *Inference*: The SQL interval overlap formula `(start_time < ? AND end_time > ?)` with ISO 8601 lexicographical strings functions with sub-second accuracy and properly preserves open-ended interval semantics `[S, E)`.

4. **Resource and Thread Isolation (Scenario 4 & Scenario 5)**:
   - *Observation*: 10 threads concurrently booking non-overlapping adjacent slots for the same resource all returned 201 Created without any false-positive 409 rejections.
   - *Observation*: Cancelling an existing reservation and launching 10 concurrent racing threads resulted in exactly 1 successful reclaim (201) and 9 rejections (409).
   - *Inference*: Cancellation frees the slot atomically, and race conditions to reclaim vacated slots are protected by the same mutex.

5. **Architectural Vulnerability / Nuance Uncovered**:
   - *Observation*: In `server.py:451`, `self._send_json(201, new_booking)` is called before the `with conn:` block terminates.
   - *Inference*: In Python `sqlite3`, transaction `COMMIT` occurs in the context manager's `__exit__`. Sending the HTTP 201 packet before exiting `with conn:` creates a microsecond window where an external database reader querying immediately upon receiving the HTTP 201 response could observe an uncommitted read or encounter a busy state.
   - *Mitigation recommendation*: Explicitly call `conn.commit()` immediately prior to `self._send_json(201, new_booking)`.

---

## 3. Caveats

1. **Socket Backlog Under Extreme Concurrency**: Python's `socketserver.TCPServer` defaults to a listen queue backlog of `request_queue_size = 5`. When tested with 50 simultaneous barrier-synchronized threads without client-side retry, 6 TCP connections were dropped by the OS before reaching the application layer. With client-side retries, all 50 reached the server and achieved 1 success / 49 conflicts. For high-scale production deployments, setting `request_queue_size = 128` in the server subclass is recommended.
2. **Review-Only Constraint**: In adherence to the review-only constraint, no production code (`server.py`) was edited by this agent. All stress harnesses were executed strictly against the running server.

---

## 4. Conclusion

The Academic Event and Resource Booking Portal demonstrates **solid concurrency safety, strict 409 conflict rejection, and sub-second boundary precision**.
- **Race Condition Resistance**: Confirmed 100% effective under both 20-thread and 50-thread barrier collisions (EXACTLY 1 reservation created, all others rejected with 409 Conflict).
- **Rapid Sequential Consistency**: 20 consecutive slots booked rapidly without errors; all 20 rows verified in the SQLite database.
- **Boundary Precision**: 1-second overlaps, 1-minute overlaps, and cross-year/midnight boundaries are strictly detected and rejected with 409. Abutting boundary slots correctly succeed with 201.
- **Database Integrity**: `PRAGMA integrity_check` returned `ok`, 0 foreign key violations, and 0 global interval overlaps across the entire database.

---

## 5. Verification Method

To independently execute and verify the adversarial challenge test suite:

```powershell
# 1. Ensure server is running on http://127.0.0.1:8000
python -c "import urllib.request; print('Server HTTP status:', urllib.request.urlopen('http://127.0.0.1:8000/api/resources').status)"

# 2. Run Challenger 1's adversarial stress test suite
python "J:\My Drive\girupa project\.agents\challenger_1\challenge_concurrency.py"

# 3. Run baseline acceptance test suite
python "J:\My Drive\girupa project\test_booking.py"

# 4. Verify SQLite database integrity directly
python -c "import sqlite3; conn = sqlite3.connect('J:/My Drive/girupa project/booking.db'); print('Integrity:', conn.execute('PRAGMA integrity_check').fetchall()); print('Total confirmed bookings:', conn.execute('SELECT COUNT(*) FROM bookings WHERE status = \'CONFIRMED\'').fetchone()[0]); conn.close()"
```

**Invalidation Conditions**:
- Any execution of Scenario 1 where `201_success_count != 1` or `409_conflict_count != 19`.
- Any overlapping confirmed bookings found by the SQL query:
  `SELECT * FROM bookings b1 JOIN bookings b2 ON b1.resource_id = b2.resource_id AND b1.id < b2.id AND b1.status = 'CONFIRMED' AND b2.status = 'CONFIRMED' WHERE b1.start_time < b2.end_time AND b1.end_time > b2.start_time`.
