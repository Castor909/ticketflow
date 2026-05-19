import { useState, useEffect } from 'react';
import { useNavigate, useParams, Navigate, Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = ['Music', 'Sports', 'Theatre', 'Festival', 'Conference', 'Other'];

const EMPTY = {
  title: '', description: '', category: 'Music', location: '',
  date: '', price: '0', total_tickets: '', image_url: '',
};

export default function EventForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/events/${id}`).then((r) => {
      const e = r.data;
      setForm({
        title: e.title,
        description: e.description ?? '',
        category: e.category,
        location: e.location,
        date: e.date.slice(0, 16),
        price: String(e.price),
        total_tickets: String(e.total_tickets),
        image_url: e.image_url ?? '',
      });
    });
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price) || 0,
        total_tickets: parseInt(form.total_tickets),
      };
      if (isEdit) {
        await api.put(`/events/${id}`, payload);
      } else {
        await api.post('/events', payload);
      }
      navigate('/organiser');
    } catch (err) {
      setError(err.response?.data?.error ?? 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'organiser') return <Navigate to="/" replace />;

  const field = (label, name, type = 'text', props = {}) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        {...props}
      />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/organiser" className="text-sm text-indigo-600 hover:underline mb-4 inline-block">
        &larr; Back to dashboard
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Edit Event' : 'Create Event'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>
        )}

        {field('Event title', 'title', 'text', { required: true, placeholder: 'e.g. Summer Jazz Festival' })}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            placeholder="Describe your event…"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        {field('Location', 'location', 'text', { required: true, placeholder: 'e.g. Palma de Mallorca' })}
        {field('Date & time', 'date', 'datetime-local', { required: true })}

        <div className="grid grid-cols-2 gap-4">
          {field('Price (€)', 'price', 'number', { min: '0', step: '0.01', placeholder: '0' })}
          {!isEdit && field('Total tickets', 'total_tickets', 'number', { required: true, min: '1', placeholder: '100' })}
        </div>

        {field('Image URL (optional)', 'image_url', 'url', { placeholder: 'https://…' })}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
        >
          {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Create event'}
        </button>
      </form>
    </div>
  );
}
