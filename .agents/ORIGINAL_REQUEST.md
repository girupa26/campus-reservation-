# Original User Request

## 2026-09-16T03:27:34Z

# Teamwork Project Prompt

> Status: Launched
> Goal: Build the Academic Event and Resource Booking Portal autonomously.

Build an Academic Event and Resource Booking Portal. The system should provide a centralized platform to reserve seminar halls, laboratories, classrooms, and institutional resources while preventing scheduling conflicts.

Working directory: J:\My Drive\girupa project
Integrity mode: development

## Requirements

### R1. Resource Management & Display
The system must display available institutional resources (e.g., seminar halls, labs, classrooms) so that users can view what is available for booking.

### R2. Booking & Conflict Prevention
Users must be able to book a specific resource for a specific time slot. The system must enforce conflict prevention, strictly rejecting any booking attempt for a resource that is already reserved for that exact time slot.

### R3. Simple Identification
Users must be able to identify themselves (e.g., by providing a name, ID, or simple login) when making a booking so that reservations are tracked to an individual.

## Acceptance Criteria

### Verification Script
- [ ] A standalone test script (e.g., `test_booking.js` or `test_booking.py`) must be provided that interacts with the running system (via API or UI automation) to verify the core requirements.

### Core Functionality
- [ ] The test script can successfully fetch and list the available resources.
- [ ] The test script can successfully create a new booking for a specific resource and time.
- [ ] The test script attempts to book the exact same resource for the exact same time, and correctly receives an error or rejection, proving conflict prevention works.
