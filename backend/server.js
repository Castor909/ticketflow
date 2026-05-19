const express = require('express');
const cors = require('cors');
const { PORT } = require('./config');

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/purchases', require('./routes/purchases'));
app.use('/api/organiser', require('./routes/organiser'));

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`TicketFlow API running on http://localhost:${PORT}`);
});
