# Context & Requirements Analysis

## Project Overview
The Academic Event and Resource Booking Portal provides a centralized web application to reserve seminar halls, laboratories, classrooms, and institutional resources while strictly preventing scheduling conflicts.

## User Requirements
- **R1. Resource Management & Display**: The system must display available institutional resources (seminar halls, labs, classrooms) so that users can view what is available for booking.
- **R2. Booking & Conflict Prevention**: Users must be able to book a specific resource for a specific time slot. The system must enforce conflict prevention, strictly rejecting any booking attempt for a resource that is already reserved for that exact time slot.
- **R3. Simple Identification**: Users must be able to identify themselves (e.g. name, ID, or simple login) when making a booking so reservations are tracked to an individual.

## Acceptance Criteria
- **Verification Script**: Standalone test script (`test_booking.py` or `test_booking.js`) interacting with the running system (via API or UI automation) to verify core requirements.
- **Core Functionality**:
  1. Fetch and list available resources.
  2. Create a new booking for a specific resource and time slot.
  3. Attempt to book the exact same resource for the exact same time slot, correctly receiving an error or rejection confirming conflict prevention.

## Environmental Context
- OS: Windows (PowerShell)
- Working directory: `J:\My Drive\girupa project`
- Integrity Mode: development
