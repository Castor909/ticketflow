import { useState, useEffect } from 'react';
import api from '../api/client';
import EventCard from '../components/EventCard';

const CATEGORIES = ['Music', 'Sports', 'Theatre', 'Festival', 'Conference', 'Other'];

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ q: '', category: '', location: '' });
  const [applied, setApplied] = useState({});

  useEffect(() => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(applied).filter(([, v]) => v));
    api
      .get('/events', { params })
      .then((r) => setEvents(r.data))
      .finally(() => setLoading(false));
  }, [applied]);

  const handleSearch = (e) => {
    e.preventDefault();
    setApplied({ ...filters });
  };

  const clearFilters = () => {
    setFilters({ q: '', category: '', location: '' });
    setApplied({});
  };

  const hasFilters = Object.values(applied).some(Boolean);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Discover Events</h1>
        <p className="text-gray-500">Find tickets to concerts, sports, theatre, and more.</p>
      </div>

      <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search events, venues…"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            className="flex-1 min-w-48 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Location"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            Search
          </button>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-gray-400 text-sm hover:text-gray-600 transition px-2"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading events…</div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          No events found.{' '}
          {hasFilters && (
            <button onClick={clearFilters} className="text-indigo-500 hover:underline">Clear filters</button>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{events.length} event{events.length !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
