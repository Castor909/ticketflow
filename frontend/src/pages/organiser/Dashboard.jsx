import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function OrgDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = () => {
    api.get('/organiser/events')
      .then((r) => setEvents(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(fetchEvents, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return;
    await api.delete(`/events/${id}`);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  if (!user || user.role !== 'organiser') return <Navigate to="/" replace />;

  const totalTicketsSold = events.reduce((s, e) => s + e.tickets_sold, 0);
  const totalRevenue = events.reduce((s, e) => s + e.tickets_sold * e.price, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organiser Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome, {user.name}</p>
        </div>
        <Link
          to="/organiser/events/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
        >
          + New Event
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total events', value: events.length },
          { label: 'Tickets sold', value: totalTicketsSold },
          { label: 'Revenue', value: `€${totalRevenue.toFixed(2)}` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading…</div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="mb-3">No events yet.</p>
          <Link to="/organiser/events/new" className="text-indigo-600 hover:underline text-sm">
            Create your first event →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-left">
                <th className="px-5 py-3 font-medium">Event</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium text-right">Sold / Total</th>
                <th className="px-5 py-3 font-medium text-right">Price</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-5 py-3">
                    <Link to={`/events/${e.id}`} className="font-medium text-gray-900 hover:text-indigo-600">
                      {e.title}
                    </Link>
                    <p className="text-xs text-gray-400">{e.category} · {e.location}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {new Date(e.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3 text-right text-gray-700">
                    {e.tickets_sold} / {e.total_tickets}
                  </td>
                  <td className="px-5 py-3 text-right text-gray-700">
                    {e.price === 0 ? 'Free' : `€${e.price.toFixed(2)}`}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/organiser/events/${e.id}/edit`}
                        className="text-indigo-600 hover:underline text-xs"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="text-red-400 hover:text-red-600 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
