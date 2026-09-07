import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiScissors, FiMenu, FiX, FiUser, FiLogOut, FiCalendar, FiBell, FiCheck, FiCpu } from 'react-icons/fi';
import { MdDashboard } from 'react-icons/md';
import api from '../../api/axios';
import { formatDistanceToNow } from 'date-fns';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkOneRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return null;
    const links = { customer: '/customer', barber: '/barber', admin: '/admin' };
    return links[user.role];
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 border-b border-slate-200"
      style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md group-hover:bg-blue-600 transition-all duration-300">
              <FiScissors className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Barber<span className="text-blue-600">X</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
            {user?.role === 'customer' && (
              <>
                <Link to="/customer/barbers" className={`nav-link ${location.pathname === '/customer/barbers' ? 'active' : ''}`}>Barbers</Link>
                <Link to="/customer/book" className={`nav-link ${location.pathname === '/customer/book' ? 'active' : ''}`}>Book Cut</Link>
              </>
            )}
            {!user && (
              <>
                <a href="#services" className="nav-link">Services</a>
                <a href="#barbers" className="nav-link">Barbers</a>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    id="notifications-bell-btn"
                    onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                    className="p-2.5 rounded-xl border border-white/5 bg-white/3 hover:bg-white/5 hover:border-gold-500/20 text-gray-400 hover:text-white transition-all duration-200 relative"
                  >
                    <FiBell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-dark-400" />
                    )}
                  </button>

                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 glass-card border border-white/10 py-3 px-4 animate-slide-up space-y-3 z-50 max-h-96 overflow-y-auto"
                      style={{ background: 'rgba(13,13,26,0.98)' }}>
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-white font-bold text-sm">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[11px] text-gold-500 hover:text-gold-400 flex items-center gap-1 font-semibold"
                          >
                            <FiCheck size={12} /> Mark all read
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        {notifications.length === 0 ? (
                          <p className="text-gray-500 text-xs text-center py-6">No notifications yet</p>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif._id}
                              onClick={() => !notif.isRead && handleMarkOneRead(notif._id)}
                              className={`p-2.5 rounded-xl text-left cursor-pointer transition-all duration-200 ${
                                notif.isRead ? 'opacity-50 hover:bg-white/2' : 'bg-gold-500/5 hover:bg-gold-500/10 border border-gold-500/10'
                              }`}
                            >
                              <p className="text-white text-xs leading-normal">{notif.message}</p>
                              <p className="text-[10px] text-gray-500 mt-1">
                                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    id="profile-menu-btn"
                    onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-gold-500/20 hover:border-gold-500/40 transition-all duration-200"
                  >
                    <div className="w-7 h-7 rounded-full bg-gold-gradient flex items-center justify-center text-xs font-bold text-dark-300">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-300 font-medium max-w-[120px] truncate">{user.name}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-gold-500/15 text-gold-500 font-medium capitalize">{user.role}</span>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-52 glass-card border border-white/10 py-2 animate-slide-up"
                      style={{ background: 'rgba(13,13,26,0.98)' }}>
                      <Link
                        to={getDashboardLink()}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-gold-500 hover:bg-white/5 transition-all"
                      >
                        <MdDashboard size={16} /> Dashboard
                      </Link>
                      {user.role === 'customer' && (
                        <>
                          <Link
                            to="/customer/appointments"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-gold-500 hover:bg-white/5 transition-all"
                          >
                            <FiCalendar size={16} /> My Appointments
                          </Link>
                          <Link
                            to="/customer/ai-assistant"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-gold-500 hover:bg-white/5 transition-all"
                          >
                            <FiCpu size={16} /> AI Style Assistant
                          </Link>
                        </>
                      )}
                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-gold-500 hover:bg-white/5 transition-all"
                      >
                        <FiUser size={16} /> Profile
                      </Link>
                      <div className="gold-divider mx-4 my-1" />
                      <button
                        id="logout-btn"
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 transition-all w-full text-left"
                      >
                        <FiLogOut size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">Log In</Link>
                <Link to="/register" className="btn-gold text-sm px-5 py-2.5">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            id="mobile-menu-btn"
            className="md:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/5 py-4 px-4"
          style={{ background: 'rgba(10,10,15,0.98)' }}>
          {user ? (
            <div className="space-y-1">
              <div className="px-3 py-2 mb-3">
                <p className="text-white font-medium">{user.name}</p>
                <p className="text-gold-500 text-sm capitalize">{user.role}</p>
              </div>
              <Link to={getDashboardLink()} onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-300 hover:text-gold-500 hover:bg-white/5">
                <MdDashboard size={16} /> Dashboard
              </Link>
              {user.role === 'customer' && (
                <>
                  <Link to="/customer/barbers" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-300 hover:text-gold-500 hover:bg-white/5">
                    <FiScissors size={16} /> Barbers
                  </Link>
                  <Link to="/customer/book" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-300 hover:text-gold-500 hover:bg-white/5">
                    <FiCalendar size={16} /> Book Cut
                  </Link>
                </>
              )}
              <button onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 w-full">
                <FiLogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link to="/login" className="btn-outline w-full justify-center" onClick={() => setMenuOpen(false)}>Log In</Link>
              <Link to="/register" className="btn-gold w-full justify-center" onClick={() => setMenuOpen(false)}>Get Started</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
