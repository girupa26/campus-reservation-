const express = require('express');
const router = express.Router();

// GET /api/resources
router.get('/', (req, res) => {
  try {
    const { loadDB } = req.app.locals;
    const db = loadDB();
    const { type, min_capacity } = req.query;

    let resources = db.resources.filter(r => r.is_active);

    if (type) {
      resources = resources.filter(r => r.type === type);
    }
    if (min_capacity) {
      resources = resources.filter(r => r.capacity >= parseInt(min_capacity, 10));
    }

    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/resources/:id
router.get('/:id', (req, res) => {
  try {
    const { loadDB } = req.app.locals;
    const db = loadDB();
    const resource = db.resources.find(r => r.id === req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Not Found' });
    }
    res.json(resource);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
