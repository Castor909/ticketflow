import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import EventDetail from './pages/EventDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import MyTickets from './pages/MyTickets';
import OrgDashboard from './pages/organiser/Dashboard';
import EventForm from './pages/organiser/EventForm';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/my-tickets" element={<MyTickets />} />
              <Route path="/organiser" element={<OrgDashboard />} />
              <Route path="/organiser/events/new" element={<EventForm />} />
              <Route path="/organiser/events/:id/edit" element={<EventForm />} />
            </Routes>
          </main>
          <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-100">
            TicketFlow &copy; 2026
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
