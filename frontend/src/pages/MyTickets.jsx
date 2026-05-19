import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function MyTickets() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/purchases/my')
      .then((r) => setPurchases(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (!user) return <Navigate to="/login" replace />;

  if (loading) return <div className="text-center py-20 text-gray-400">Loading…</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Tickets</h1>

      {purchases.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="mb-3">No tickets yet.</p>
          <Link to="/" className="text-indigo-600 hover:underline text-sm">Browse events →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {purchases.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-start gap-4 p-5">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 shrink-0 overflow-hidden">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-2xl opacity-40">🎫</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <Link to={`/events/${p.event_id}`} className="font-semibold text-gray-900 hover:text-indigo-600 transition line-clamp-1">
                    {p.title}
                  </Link>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {new Date(p.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' · '}{p.location}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Purchased {new Date(p.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' · '}{p.quantity} ticket{p.quantity !== 1 ? 's' : ''}
                    {p.total_price > 0 && ` · €${p.total_price.toFixed(2)}`}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 px-5 py-3 bg-gray-50">
                <p className="text-xs font-medium text-gray-500 mb-2">Ticket codes</p>
                <div className="flex flex-wrap gap-2">
                  {p.tickets.map((code) => (
                    <span
                      key={code}
                      className="font-mono text-xs bg-white border border-gray-200 rounded-lg px-3 py-1 text-gray-700 font-bold tracking-widest"
                    >
                      {code}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
