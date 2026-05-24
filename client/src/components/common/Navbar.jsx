import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Droplets, Menu, X, Bell, User, LogOut, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

const BloodDropIcon = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7 fill-crimson" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C12 2 4 10.5 4 15a8 8 0 0016 0C20 10.5 12 2 12 2z"/>
  </svg>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: '/campaigns', label: 'Campaigns' },
    { to: '/emergency', label: 'Emergency' },
    { to: '/organizations', label: 'Organizations' },
    { to: '/leaderboard', label: 'Leaderboard' },
    { to: '/how-it-works', label: 'How It Works' },
  ];

  const getDashboardLink = () => {
    if (!user) return null;
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'organization') return '/organization/dashboard';
    return '/donor/dashboard';
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="blood-drop">
              <BloodDropIcon />
            </div>
            <div>
              <span className="font-display font-bold text-xl text-stone-800">Blood<span className="text-crimson">Bridge</span></span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={clsx(
                  'px-3 py-2 rounded-lg text-sm font-sans font-medium transition-colors',
                  isActive(link.to) ? 'text-crimson bg-red-50' : 'text-stone-600 hover:text-crimson hover:bg-red-50'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-crimson/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-crimson" />
                  </div>
                  <span className="text-sm font-medium text-stone-700 font-sans">{user.name?.split(' ')[0]}</span>
                  <ChevronDown className="w-4 h-4 text-stone-400" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-stone-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-stone-50">
                      <p className="text-xs font-sans text-stone-400 uppercase tracking-wide">{user.role}</p>
                      <p className="text-sm font-medium text-stone-700 font-sans truncate">{user.email}</p>
                    </div>
                    <Link to={getDashboardLink()} onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-600 hover:bg-red-50 hover:text-crimson font-sans transition-colors">
                      <User className="w-4 h-4" />
                      Dashboard
                    </Link>
                    {user.role === 'donor' && (
                      <Link to="/donor/notifications" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-600 hover:bg-red-50 hover:text-crimson font-sans transition-colors">
                        <Bell className="w-4 h-4" />
                        Notifications
                      </Link>
                    )}
                    <button onClick={() => { logout(); setProfileOpen(false); navigate('/'); }} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-sans transition-colors">
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">Login</Link>
                <Link to="/register/donor" className="btn-primary text-sm">Become a Donor</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-lg" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-stone-100 px-4 py-4 space-y-1">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
              className={clsx('block px-3 py-2.5 rounded-lg text-sm font-sans', isActive(link.to) ? 'text-crimson bg-red-50' : 'text-stone-600')}>
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-stone-100 mt-3 flex flex-col gap-2">
            {user ? (
              <>
                <Link to={getDashboardLink()} onClick={() => setMobileOpen(false)} className="btn-outline text-sm text-center">Dashboard</Link>
                <button onClick={() => { logout(); setMobileOpen(false); navigate('/'); }} className="btn-primary text-sm">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-outline text-sm text-center">Login</Link>
                <Link to="/register/donor" onClick={() => setMobileOpen(false)} className="btn-primary text-sm text-center">Become a Donor</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
