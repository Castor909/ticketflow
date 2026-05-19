import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/events/${id}`)
      .then((r) => setEvent(r.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handlePurchase = async () => {
    if (!user) return navigate('/login');
    setError('');
    setPurchasing(true);
    try {
      const { data } = await api.post('/purchases', { event_id: Number(id), quantity });
      setSuccess(data);
      setEvent((e) => ({ ...e, tickets_remaining: e.tickets_remaining - quantity }));
    } catch (err) {
      setError(err.response?.data?.error ?? 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Loading…</div>;
  if (!event) return null;

  const dateStr = new Date(event.date).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const timeStr = new Date(event.date).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit',
  });
  const soldOut = event.tickets_remaining === 0;
  const maxQty = Math.min(10, event.tickets_remaining);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/" className="text-sm text-indigo-600 hover:underline mb-4 inline-block">&larr; Back to events</Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-56 bg-gradient-to-br from-indigo-400 to-purple-500">
          {event.image_url && (
            <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
          )}
        </div>

        <div className="p-6 md:p-8 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
              {event.category}
            </span>
            <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>

            <div className="space-y-1 text-sm text-gray-500">
              <p>📅 {dateStr} at {timeStr}</p>
              <p>📍 {event.location}</p>
              <p>🎟 Organised by <span className="font-medium text-gray-700">{event.organiser_name}</span></p>
            </div>

            {event.description && (
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{event.description}</p>
            )}
          </div>

          <div>
            {success ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center space-y-3">
                <p className="text-green-700 font-semibold text-lg">Purchase confirmed!</p>
                <p className="text-sm text-green-600">Your tickets:</p>
                {success.tickets.map((code) => (
                  <div key={code} className="bg-white border border-green-200 rounded-lg px-3 py-2 font-mono text-sm font-bold tracking-widest text-gray-800">
                    {code}
                  </div>
                ))}
                <Link to="/my-tickets" className="mt-2 block text-sm text-indigo-600 hover:underline">
                  View all my tickets →
                </Link>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">
                    {event.price === 0 ? 'Free' : `€${event.price.toFixed(2)}`}
                  </p>
                  <p className="text-sm text-gray-500">per ticket</p>
                </div>

                <div className="text-sm text-gray-500 text-center">
                  {soldOut ? (
                    <span className="text-red-500 font-medium">Sold out</span>
                  ) : (
                    <span>{event.tickets_remaining} tickets remaining</span>
                  )}
                </div>

                {!soldOut && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <select
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      >
                        {Array.from({ length: maxQty }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>

                    {event.price > 0 && (
                      <p className="text-sm text-gray-500 text-center">
                        Total: <span className="font-semibold text-gray-800">€{(event.price * quantity).toFixed(2)}</span>
                      </p>
                    )}

                    {error && (
                      <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
                    )}

                    <button
                      onClick={handlePurchase}
                      disabled={purchasing}
                      className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
                    >
                      {purchasing ? 'Processing…' : user ? 'Buy tickets' : 'Log in to buy'}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
