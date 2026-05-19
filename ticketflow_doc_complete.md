# TicketFlow — Online Ticket Sales Platform

**Author:** Stepan Andreev  
**Institution:** CIFP Francesc de Borja Moll  
**Date:** April 18, 2026

---

## Table of Contents

1. Introduction & Scope
2. Analysis & Design
3. Technology Stack
4. User Testing
5. Conclusions & Future Improvements
6. Bibliography / Resources

---

## 1. Introduction & Scope

*(As defined in the original document — unchanged.)*

---

## 2. Analysis & Design

### 2.1 User Roles

The application defines two distinct user roles:

| Role | Capabilities |
|------|-------------|
| **Attendee** | Browse events, purchase tickets, view purchase history |
| **Organiser** | Create, edit, and delete events; view ticket sales dashboard |

### 2.2 Use Cases

**Attendee:**
- Register / log in to an account
- Browse and filter the event catalogue by keyword, category, and location
- View event detail page with availability and pricing
- Purchase one or more tickets for an event
- Receive unique ticket codes per ticket purchased
- View all past purchases and associated ticket codes

**Organiser:**
- Register / log in to an organiser account
- Create a new event (title, description, category, location, date, price, total tickets, optional image)
- Edit event details (except total ticket count after creation)
- Delete events
- View an overview dashboard: total events, tickets sold, revenue

### 2.3 Database Design

The application uses four tables:

**users**
```
id | name | email | password_hash | role | created_at
```

**events**
```
id | organiser_id (FK) | title | description | category | location
   | date | price | total_tickets | tickets_remaining | image_url | created_at
```

**purchases**
```
id | user_id (FK) | event_id (FK) | quantity | total_price | created_at
```

**tickets**
```
id | purchase_id (FK) | event_id (FK) | user_id (FK) | unique_code | created_at
```

Each ticket receives a randomly generated 12-character alphanumeric code (UUID-derived) stored in the `unique_code` field. The `tickets_remaining` counter on `events` is decremented atomically within a database transaction at the moment of purchase, preventing overselling.

### 2.4 API Design

The REST API is organised around four resource groups:

| Prefix | Description |
|--------|-------------|
| `POST /api/auth/register` | Create a new user account |
| `POST /api/auth/login` | Authenticate and receive a JWT |
| `GET /api/events` | List events (supports ?q, ?category, ?location) |
| `GET /api/events/:id` | Single event detail |
| `POST /api/events` | Create event (organiser only) |
| `PUT /api/events/:id` | Update event (owner only) |
| `DELETE /api/events/:id` | Delete event (owner only) |
| `POST /api/purchases` | Purchase tickets (attendee) |
| `GET /api/purchases/my` | My purchase history with ticket codes |
| `GET /api/purchases/verify/:code` | Verify a ticket code |
| `GET /api/organiser/events` | Organiser's events with sales stats |

All protected endpoints require a `Bearer <token>` header. Tokens are issued as JWTs signed with a server-side secret and expire after 7 days.

### 2.5 Frontend Architecture

The frontend is a single-page application (SPA) with client-side routing. Pages and their routes:

| Route | Component | Access |
|-------|-----------|--------|
| `/` | Home (catalogue) | Public |
| `/events/:id` | EventDetail | Public |
| `/login` | Login | Guest only |
| `/register` | Register | Guest only |
| `/my-tickets` | MyTickets | Attendee |
| `/organiser` | OrgDashboard | Organiser |
| `/organiser/events/new` | EventForm | Organiser |
| `/organiser/events/:id/edit` | EventForm | Organiser |

Authentication state is managed via a React Context (`AuthContext`) that reads/writes a JWT token and serialised user object from `localStorage`. The Axios client instance automatically attaches the token to every request via a request interceptor.

---

## 3. Technology Stack

### 3.1 Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20+ | JavaScript runtime |
| Express | 5.x | HTTP server and routing |
| better-sqlite3 | 12.x | Synchronous SQLite driver |
| bcryptjs | 3.x | Password hashing (bcrypt, 10 rounds) |
| jsonwebtoken | 9.x | JWT issuance and verification |
| uuid | 14.x | Unique ticket code generation |
| cors | 2.x | Cross-Origin Resource Sharing |

**Why SQLite?** The project scope is intentionally limited to a single-server deployment. SQLite eliminates the need to configure a separate database server while still providing full SQL semantics, transactions, and foreign key constraints. It is well-suited for development, testing, and low-to-medium traffic scenarios.

### 3.2 Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI component library |
| Vite | 8.x | Build tool and dev server |
| React Router DOM | 7.x | Client-side routing |
| Axios | 1.x | HTTP client |
| Tailwind CSS | 4.x | Utility-first styling |

**Why Tailwind CSS?** Tailwind was chosen for its design consistency and developer speed: components can be styled inline without maintaining a separate CSS file, and the utility-class system ensures visual coherence across all pages.

### 3.3 Project Structure

```
ticketflow/
├── backend/
│   ├── config.js          # JWT secret, port
│   ├── server.js          # Express entry point
│   ├── db/
│   │   ├── database.js    # DB init + singleton
│   │   └── schema.sql     # Table definitions
│   ├── middleware/
│   │   └── auth.js        # JWT middleware
│   └── routes/
│       ├── auth.js        # /api/auth
│       ├── events.js      # /api/events
│       ├── purchases.js   # /api/purchases
│       └── organiser.js   # /api/organiser
└── frontend/
    ├── vite.config.js
    └── src/
        ├── App.jsx         # Router + layout
        ├── api/client.js   # Axios instance
        ├── context/
        │   └── AuthContext.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   └── EventCard.jsx
        └── pages/
            ├── Home.jsx
            ├── EventDetail.jsx
            ├── Login.jsx
            ├── Register.jsx
            ├── MyTickets.jsx
            └── organiser/
                ├── Dashboard.jsx
                └── EventForm.jsx
```

### 3.4 Running the Application

**Prerequisites:** Node.js 20+

```bash
# Backend
cd backend
npm install
npm run dev       # runs on http://localhost:3001

# Frontend (separate terminal)
cd frontend
npm install
npm run dev       # runs on http://localhost:5173
```

The Vite dev server proxies all `/api` requests to the backend, so no manual CORS configuration is needed in development.

---

## 4. User Testing

### 4.1 Testing Approach

Manual end-to-end testing was performed covering the two primary user flows: attendee ticket purchase and organiser event management. Tests were conducted in a local development environment using a browser (Firefox 127).

### 4.2 Test Scenarios

#### Attendee Flow

| # | Scenario | Expected | Result |
|---|----------|----------|--------|
| A1 | Register as attendee with valid data | Account created, redirected to home | Pass |
| A2 | Register with existing email | Error message shown | Pass |
| A3 | Log in with correct credentials | JWT stored, user greeted in navbar | Pass |
| A4 | Log in with wrong password | Error message shown | Pass |
| A5 | Browse event catalogue (no filters) | All events listed in date order | Pass |
| A6 | Search by keyword | Matching events returned | Pass |
| A7 | Filter by category | Only matching events shown | Pass |
| A8 | View event detail page | All event info displayed, ticket count shown | Pass |
| A9 | Purchase 2 tickets | Confirmation shown with 2 unique codes | Pass |
| A10 | Purchase from sold-out event | "Not enough tickets available" error | Pass |
| A11 | View My Tickets | Purchase history with ticket codes displayed | Pass |
| A12 | Access My Tickets without login | Redirected to login page | Pass |

#### Organiser Flow

| # | Scenario | Expected | Result |
|---|----------|----------|--------|
| O1 | Register as organiser | Redirected to organiser dashboard | Pass |
| O2 | Create event with all fields | Event appears in dashboard and catalogue | Pass |
| O3 | Create event with missing required field | Validation error shown | Pass |
| O4 | Edit event title and location | Changes reflected immediately | Pass |
| O5 | Delete event | Event removed from catalogue | Pass |
| O6 | Dashboard shows correct sold/total counts | Counts match purchases made | Pass |
| O7 | Attempt to edit another organiser's event | 403 Forbidden returned | Pass |

### 4.3 Observations

- Ticket code display after purchase is clear and immediately visible without page refresh.
- The sold-out overlay on event cards provides a good visual cue for unavailable events.
- The quantity selector is capped at 10 per purchase to prevent single-user monopolisation.

---

## 5. Conclusions & Future Improvements

### 5.1 Conclusions

TicketFlow successfully implements the full lifecycle of an online ticketing transaction: from event publication by an organiser, through browsing and discovery by attendees, to purchase and digital ticket issuance. All six features defined in the project scope were implemented and tested:

1. **User registration and login** — with role-based access for attendees and organisers.
2. **Event catalogue with search and filtering** — by keyword, category, and location.
3. **Ticket purchase flow** — with quantity selection and real-time availability tracking.
4. **Digital ticket issuance** — each purchase generates one unique code per ticket.
5. **Organiser dashboard** — create, edit, delete events; view sales statistics.
6. **Purchase history** — attendees can view all past purchases and their ticket codes.

The technology choices (Node.js + Express + SQLite for the backend; React + Vite + Tailwind for the frontend) proved well-suited to the project scope. The synchronous SQLite driver simplified transaction handling for the critical "purchase tickets" operation, and Tailwind CSS significantly accelerated UI development.

### 5.2 Limitations

- **No payment processing.** Purchases are recorded without a real payment gateway. This was explicitly out of scope.
- **No email notifications.** Ticket codes are only visible in the UI; no confirmation emails are sent.
- **No seat selection.** Tickets are general admission only.
- **Single-server architecture.** The SQLite database is not suitable for multi-instance deployments.

### 5.3 Future Improvements

| Priority | Improvement | Notes |
|----------|-------------|-------|
| High | Payment gateway integration | Stripe or PayPal; enables real transactions |
| High | Email confirmation with QR code | Send ticket codes as QR codes via email |
| Medium | QR code scanning for venue check-in | Mobile-friendly verification page |
| Medium | Organiser analytics (charts) | Revenue over time, popular categories |
| Medium | Event image upload | Replace URL input with file upload to server |
| Low | Social features | Share event links, follow organisers |
| Low | Mobile application | React Native app using the existing API |
| Low | Multi-language support | Spanish / English / Catalan |

---

## 6. Bibliography / Resources

1. **Node.js Documentation** — https://nodejs.org/en/docs
2. **Express.js Documentation** — https://expressjs.com
3. **better-sqlite3** — https://github.com/WiseLibs/better-sqlite3
4. **JSON Web Tokens (JWT)** — RFC 7519; https://jwt.io
5. **React Documentation** — https://react.dev
6. **Vite Documentation** — https://vite.dev
7. **React Router Documentation** — https://reactrouter.com
8. **Tailwind CSS Documentation** — https://tailwindcss.com
9. **Axios Documentation** — https://axios-http.com
10. **SQLite Documentation** — https://www.sqlite.org/docs.html
11. Duckett, J. (2011). *HTML and CSS: Design and Build Websites*. Wiley.
12. Haverbeke, M. (2018). *Eloquent JavaScript* (3rd ed.). No Starch Press.
