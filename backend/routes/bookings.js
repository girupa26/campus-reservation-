const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// GET /api/bookings?date=YYYY-MM-DD
router.get('/', (req, res) => {
  try {
    const { loadDB } = req.app.locals;
    const { date } = req.query;
    const db = loadDB();

    let bookings = db.bookings.filter(b => b.status === 'CONFIRMED');

    if (date) {
      // Filter: bookings whose start_time falls on the given date (local date string YYYY-MM-DD)
      bookings = bookings.filter(b => {
        const d = new Date(b.start_time);
        const bookingDate = d.toISOString().slice(0, 10);
        return bookingDate === date;
      });
    }

    // Sort by start_time ascending
    bookings.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/bookings
router.post('/', (req, res) => {
  try {
    const { loadDB, saveDB } = req.app.locals;
    const { resource_id, department, user_name, start_time, end_time, event_title } = req.body;

    if (!resource_id || !department || !user_name || !start_time || !end_time || !event_title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const st = new Date(start_time);
    const et = new Date(end_time);

    if (isNaN(st.getTime()) || isNaN(et.getTime()) || et <= st) {
      return res.status(400).json({ error: 'Invalid time window' });
    }

    const startMins = st.getHours() * 60 + st.getMinutes();
    const endMins = et.getHours() * 60 + et.getMinutes();
    if (startMins < 8 * 60 || endMins > 16 * 60) {
      return res.status(400).json({ error: 'Bookings are only allowed during college hours (8:00 AM to 4:00 PM).' });
    }

    const db = loadDB();

    // Check resource exists
    const resource = db.resources.find(r => r.id === resource_id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource Not Found' });
    }

    // Conflict check
    const conflict = db.bookings.find(b =>
      b.resource_id === resource_id &&
      b.status === 'CONFIRMED' &&
      new Date(b.start_time) < et &&
      new Date(b.end_time) > st
    );

    if (conflict) {
      return res.status(409).json({
        error: 'Conflict',
        message: `This facility is already reserved for the requested time slot.`,
        conflict_with: conflict
      });
    }

    const newBooking = {
      id: 'bkg_' + crypto.randomBytes(4).toString('hex'),
      resource_id,
      department,
      user_name,
      start_time: st.toISOString(),
      end_time: et.toISOString(),
      event_title,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    };

    db.bookings.push(newBooking);
    saveDB(db);

    res.status(201).json(newBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/bookings/:id  (cancel)
router.delete('/:id', (req, res) => {
  try {
    const { loadDB, saveDB } = req.app.locals;
    const db = loadDB();
    const booking = db.bookings.find(b => b.id === req.params.id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    booking.status = 'CANCELLED';
    saveDB(db);

    res.json({ status: 'CANCELLED', id: booking.id });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
