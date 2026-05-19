const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new Database(path.join(__dirname, 'db/ticketflow.db'));
db.pragma('foreign_keys = ON');

const email = 'demo@ticketflow.com';
let organiser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

if (!organiser) {
  const result = db.prepare(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
  ).run('TicketFlow Demo', email, bcrypt.hashSync('demo1234', 10), 'organiser');
  organiser = { id: result.lastInsertRowid };
  console.log('Created demo organiser: demo@ticketflow.com / demo1234');
} else {
  console.log('Using existing organiser:', email);
}

const events = [
  {
    title: 'Summer Jazz Festival 2026',
    description: 'Three days of world-class jazz under the open sky at Parc de la Mar. Featuring international soloists, jazz quartets, and local Mallorcan ensembles. Food stalls, craft beer, and sunset sessions included.',
    category: 'Music',
    location: 'Palma de Mallorca',
    date: '2026-07-18 19:00',
    price: 35.00,
    total_tickets: 500,
  },
  {
    title: 'La Liga: Mallorca vs Valencia CF',
    description: 'Top-flight Spanish football at Visit Mallorca Estadi. Come support RCD Mallorca in this crucial home clash. Family section available. Gates open 90 minutes before kickoff.',
    category: 'Sports',
    location: 'Palma de Mallorca',
    date: '2026-06-07 18:30',
    price: 28.00,
    total_tickets: 1200,
  },
  {
    title: 'Hamlet — Gran Teatre del Liceu',
    description: 'Shakespeare\'s masterpiece performed in English with Spanish and Catalan subtitles. Directed by Luca Bononi. A stunning modern reinterpretation set in a near-future corporate dystopia.',
    category: 'Theatre',
    location: 'Barcelona',
    date: '2026-06-20 20:00',
    price: 48.50,
    total_tickets: 200,
  },
  {
    title: 'WebDev Summit España 2026',
    description: 'Two-day conference covering the latest in web development: AI-assisted coding, edge computing, modern CSS, and full-stack frameworks. Talks by engineers from Google, Vercel, and Cloudflare.',
    category: 'Conference',
    location: 'Valencia',
    date: '2026-09-10 09:00',
    price: 120.00,
    total_tickets: 300,
  },
  {
    title: 'Mallorca Electronic Music Festival',
    description: 'A night of techno, house, and ambient music in the iconic caves of Coves del Drac. International DJs and live electronic acts. Doors open at 22:00.',
    category: 'Festival',
    location: 'Porto Cristo, Mallorca',
    date: '2026-08-01 22:00',
    price: 55.00,
    total_tickets: 400,
  },
  {
    title: 'Stand-up Comedy Night',
    description: 'An evening of laughs with five of Spain\'s hottest stand-up comedians performing in Spanish and English. Bar available before and after the show. 18+ only.',
    category: 'Theatre',
    location: 'Madrid',
    date: '2026-06-13 21:00',
    price: 18.00,
    total_tickets: 120,
  },
  {
    title: 'Startup Weekend Mallorca',
    description: 'Build a startup in 54 hours. Pitch on Friday, prototype on Saturday, present on Sunday. Mentors from the local tech ecosystem. Includes meals and workshops. All skill levels welcome.',
    category: 'Conference',
    location: 'Palma de Mallorca',
    date: '2026-06-27 18:00',
    price: 40.00,
    total_tickets: 80,
  },
  {
    title: 'Noche de Flamenco — Tablao Sevilla',
    description: 'An authentic flamenco experience in the heart of Seville. Performed by the acclaimed Compañía de Baile Andaluz. Dinner included. Show duration: 90 minutes.',
    category: 'Music',
    location: 'Seville',
    date: '2026-07-05 20:30',
    price: 65.00,
    total_tickets: 60,
  },
  {
    title: 'Palma Half Marathon 2026',
    description: 'Run through the historic streets of Palma de Mallorca in this scenic 21km course. Chip timing, finisher medal, and post-race refreshments included. All fitness levels welcome.',
    category: 'Sports',
    location: 'Palma de Mallorca',
    date: '2026-10-04 08:00',
    price: 0,
    total_tickets: 2000,
  },
  {
    title: 'Open Air Cinema: Classics Under the Stars',
    description: 'Free outdoor cinema at Parc de la Ciutadella. This week: Casablanca (1942). Bring your own blanket or rent a deckchair on site. Screening begins at dusk (~21:15). No tickets needed — first come, first seated.',
    category: 'Other',
    location: 'Barcelona',
    date: '2026-06-26 21:00',
    price: 0,
    total_tickets: 350,
  },
];

const insert = db.prepare(`
  INSERT INTO events (organiser_id, title, description, category, location, date, price, total_tickets, tickets_remaining)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertMany = db.transaction((evts) => {
  for (const e of evts) {
    insert.run(organiser.id, e.title, e.description, e.category, e.location, e.date, e.price, e.total_tickets, e.total_tickets);
  }
});

insertMany(events);
console.log(`Inserted ${events.length} events.`);
