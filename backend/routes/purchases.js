const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, (req, res) => {
  const { event_id, quantity } = req.body;

  if (!event_id || !quantity || quantity < 1) {
    return res.status(400).json({ error: 'event_id and quantity (>=1) are required' });
  }

  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(event_id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  if (event.tickets_remaining < quantity) {
    return res.status(409).json({ error: 'Not enough tickets available' });
  }

  const buyTickets = db.transaction(() => {
    const total_price = event.price * quantity;

    const purchase = db
      .prepare(
        'INSERT INTO purchases (user_id, event_id, quantity, total_price) VALUES (?, ?, ?, ?)'
      )
      .run(req.user.id, event_id, quantity, total_price);

    db.prepare('UPDATE events SET tickets_remaining = tickets_remaining - ? WHERE id = ?').run(
      quantity,
      event_id
    );

    const insertTicket = db.prepare(
      'INSERT INTO tickets (purchase_id, event_id, user_id, unique_code) VALUES (?, ?, ?, ?)'
    );

    const tickets = [];
    for (let i = 0; i < quantity; i++) {
      const code = uuidv4().toUpperCase().replace(/-/g, '').slice(0, 12);
      insertTicket.run(purchase.lastInsertRowid, event_id, req.user.id, code);
      tickets.push(code);
    }

    return { purchase_id: purchase.lastInsertRowid, tickets, total_price };
  });

  const result = buyTickets();
  res.status(201).json(result);
});

router.get('/my', requireAuth, (req, res) => {
  const purchases = db
    .prepare(
      `SELECT p.id, p.quantity, p.total_price, p.created_at,
              e.id AS event_id, e.title, e.date, e.location, e.category, e.image_url,
              e.price AS ticket_price
       FROM purchases p
       JOIN events e ON e.id = p.event_id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC`
    )
    .all(req.user.id);

  const result = purchases.map((p) => {
    const tickets = db
      .prepare('SELECT unique_code FROM tickets WHERE purchase_id = ?')
      .all(p.id);
    return { ...p, tickets: tickets.map((t) => t.unique_code) };
  });

  res.json(result);
});

router.get('/verify/:code', (req, res) => {
  const ticket = db
    .prepare(
      `SELECT t.unique_code, t.created_at,
              u.name AS holder_name,
              e.title AS event_title, e.date AS event_date, e.location
       FROM tickets t
       JOIN users u ON u.id = t.user_id
       JOIN events e ON e.id = t.event_id
       WHERE t.unique_code = ?`
    )
    .get(req.params.code.toUpperCase());

  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json(ticket);
});

module.exports = router;
