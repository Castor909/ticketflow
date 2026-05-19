import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-indigo-700 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-tight hover:text-indigo-200 transition">
          TicketFlow
        </Link>

        <div className="flex items-center gap-4 text-sm font-medium">
          <Link to="/" className="hover:text-indigo-200 transition">Events</Link>

          {user ? (
            <>
              {user.role === 'organiser' ? (
                <Link to="/organiser" className="hover:text-indigo-200 transition">Dashboard</Link>
              ) : (
                <Link to="/my-tickets" className="hover:text-indigo-200 transition">My Tickets</Link>
              )}
              <span className="text-indigo-300">|</span>
              <span className="text-indigo-200">{user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-white text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-50 transition text-xs font-semibold"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-indigo-200 transition">Log in</Link>
              <Link
                to="/register"
                className="bg-white text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-50 transition text-xs font-semibold"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
