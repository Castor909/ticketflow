const express = require('express');
const db = require('../db/database');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/events', requireRole('organiser'), (req, res) => {
  const events = db
    .prepare(
      `SELECT e.*,
              (SELECT COUNT(*) FROM purchases WHERE event_id = e.id) AS purchase_count,
              (e.total_tickets - e.tickets_remaining) AS tickets_sold
       FROM events e
       WHERE e.organiser_id = ?
       ORDER BY e.date DESC`
    )
    .all(req.user.id);

  res.json(events);
});

router.get('/events/:id/attendees', requireRole('organiser'), (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  if (event.organiser_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  const attendees = db
    .prepare(
      `SELECT u.name, u.email, p.quantity, p.total_price, p.created_at,
              GROUP_CONCAT(t.unique_code, ', ') AS ticket_codes
       FROM purchases p
       JOIN users u ON u.id = p.user_id
       JOIN tickets t ON t.purchase_id = p.id
       WHERE p.event_id = ?
       GROUP BY p.id
       ORDER BY p.created_at DESC`
    )
    .all(req.params.id);

  res.json(attendees);
});

module.exports = router;
