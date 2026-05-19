import { Link } from 'react-router-dom';

const CATEGORY_COLORS = {
  Music: 'bg-purple-100 text-purple-700',
  Sports: 'bg-green-100 text-green-700',
  Theatre: 'bg-red-100 text-red-700',
  Festival: 'bg-yellow-100 text-yellow-700',
  Conference: 'bg-blue-100 text-blue-700',
  Other: 'bg-gray-100 text-gray-600',
};

export default function EventCard({ event }) {
  const dateStr = new Date(event.date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const colorClass = CATEGORY_COLORS[event.category] ?? CATEGORY_COLORS.Other;
  const sold_out = event.tickets_remaining === 0;

  return (
    <Link to={`/events/${event.id}`} className="group block rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100 hover:shadow-md transition">
      <div className="h-40 bg-gradient-to-br from-indigo-400 to-purple-500 relative overflow-hidden">
        {event.image_url ? (
          <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-5xl opacity-30 select-none">🎫</span>
          </div>
        )}
        {sold_out && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-lg tracking-widest">SOLD OUT</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition line-clamp-2 leading-snug">
            {event.title}
          </h3>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${colorClass}`}>
            {event.category}
          </span>
        </div>

        <p className="text-sm text-gray-500 mb-3">{dateStr} &middot; {event.location}</p>

        <div className="flex items-center justify-between">
          <span className="text-indigo-600 font-bold">
            {event.price === 0 ? 'Free' : `€${event.price.toFixed(2)}`}
          </span>
          <span className="text-xs text-gray-400">
            {sold_out ? '0' : event.tickets_remaining} left
          </span>
        </div>
      </div>
    </Link>
  );
}
