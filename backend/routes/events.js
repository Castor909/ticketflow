const express = require('express');
const db = require('../db/database');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const { q, category, location, date_from, date_to } = req.query;

  let sql = `
    SELECT e.*, u.name AS organiser_name
    FROM events e
    JOIN users u ON u.id = e.organiser_id
    WHERE 1=1
  `;
  const params = [];

  if (q) {
    sql += ' AND (e.title LIKE ? OR e.description LIKE ? OR e.location LIKE ?)';
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  if (category) {
    sql += ' AND e.category = ?';
    params.push(category);
  }
  if (location) {
    sql += ' AND e.location LIKE ?';
    params.push(`%${location}%`);
  }
  if (date_from) {
    sql += ' AND e.date >= ?';
    params.push(date_from);
  }
  if (date_to) {
    sql += ' AND e.date <= ?';
    params.push(date_to);
  }

  sql += ' ORDER BY e.date ASC';

  const events = db.prepare(sql).all(...params);
  res.json(events);
});

router.get('/categories', (req, res) => {
  const rows = db.prepare('SELECT DISTINCT category FROM events ORDER BY category').all();
  res.json(rows.map((r) => r.category));
});

router.get('/:id', (req, res) => {
  const event = db
    .prepare(
      `SELECT e.*, u.name AS organiser_name
       FROM events e JOIN users u ON u.id = e.organiser_id
       WHERE e.id = ?`
    )
    .get(req.params.id);

  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
});

router.post('/', requireRole('organiser'), (req, res) => {
  const { title, description, category, location, date, price, total_tickets, image_url } =
    req.body;

  if (!title || !category || !location || !date || total_tickets == null) {
    return res.status(400).json({ error: 'title, category, location, date, total_tickets are required' });
  }

  const result = db
    .prepare(
      `INSERT INTO events (organiser_id, title, description, category, location, date, price, total_tickets, tickets_remaining, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      req.user.id,
      title,
      description || null,
      category,
      location,
      date,
      price ?? 0,
      total_tickets,
      total_tickets,
      image_url || null
    );

  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/:id', requireRole('organiser'), (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  if (event.organiser_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  const { title, description, category, location, date, price, image_url } = req.body;

  db.prepare(
    `UPDATE events SET title=?, description=?, category=?, location=?, date=?, price=?, image_url=?
     WHERE id=?`
  ).run(
    title ?? event.title,
    description ?? event.description,
    category ?? event.category,
    location ?? event.location,
    date ?? event.date,
    price ?? event.price,
    image_url ?? event.image_url,
    req.params.id
  );

  res.json({ success: true });
});

router.delete('/:id', requireRole('organiser'), (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  if (event.organiser_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  db.transaction(() => {
    db.prepare('DELETE FROM tickets WHERE event_id = ?').run(req.params.id);
    db.prepare('DELETE FROM purchases WHERE event_id = ?').run(req.params.id);
    db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  })();

  res.json({ success: true });
});

module.exports = router;
