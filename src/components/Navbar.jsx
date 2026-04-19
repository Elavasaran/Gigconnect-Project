import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  MessageSquare, 
  Bell, 
  User, 
  LogOut, 
  Search, 
  Menu, 
  X,
  CheckCircle,
  LayoutDashboard,
  Sun,
  Moon
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout, notifications, markNotificationRead, theme, toggleTheme } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Browse Gigs', path: '/jobs' },
    { name: 'Freelancers', path: '/freelancers' },
  ];

  const dashboardPath = user?.role === 'client' ? '/client-dashboard' : '/freelancer-dashboard';

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-brand-500/30">
              <Briefcase className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black text-gray-900 tracking-tight">Gig<span className="text-brand-600">Connect</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-semibold transition-colors ${
                  location.pathname === link.path ? 'text-brand-600' : 'text-gray-500 hover:text-brand-600'
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className={`flex items-center gap-4 ${user ? 'pl-8 border-l border-gray-100' : ''}`}>
              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <Moon size={22} /> : <Sun size={22} className="text-amber-400" />}
              </button>

              {user ? (
                <>
                {/* Notifications */}
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all relative"
                  >
                    <Bell size={22} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden ring-1 ring-black/5 animate-in fade-in zoom-in duration-200">
                      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <span className="font-bold text-gray-900">Notifications</span>
                        <span className="text-[10px] bg-brand-100 text-brand-600 px-2 py-0.5 rounded-full font-bold uppercase">{unreadCount} New</span>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-400 text-sm italic">Nothing new here</div>
                        ) : (
                          notifications.map(n => (
                            <div 
                              key={n.id} 
                              onClick={() => markNotificationRead(n.id)}
                              className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? 'bg-brand-50/30' : ''}`}
                            >
                              <div className="flex gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!n.read ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-400'}`}>
                                  {n.type === 'message' ? <MessageSquare size={14} /> : <CheckCircle size={14} />}
                                </div>
                                <div>
                                  <p className={`text-xs leading-relaxed ${!n.read ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>{n.message}</p>
                                  <span className="text-[10px] text-gray-400 mt-1 block">{new Date(n.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-3 text-center bg-gray-50 border-t border-gray-100">
                         <button className="text-xs font-bold text-brand-600 hover:underline">View All Notifications</button>
                      </div>
                    </div>
                  )}
                </div>

                <Link to="/chat" className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all">
                  <MessageSquare size={22} />
                </Link>

                <Link 
                  to={dashboardPath}
                  className="flex items-center gap-2 group px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} className="w-8 h-8 rounded-full border-2 border-brand-100" alt="" />
                  <span className="text-sm font-semibold text-gray-700 md:block hidden">{user.name}</span>
                </Link>
                <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <LogOut size={20} />
                </button>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/login" className="text-gray-600 hover:text-brand-600 font-medium">Log in</Link>
                  <Link to="/signup">
                    <Button size="sm">Sign up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-4">
             {user && (
                 <Link to="/chat" className="p-2 text-gray-500">
                    <MessageSquare size={20} />
                </Link>
             )}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600 focus:outline-none">
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 overflow-hidden">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="block px-3 py-4 text-base font-medium text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-xl"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {!user ? (
              <div className="pt-4 flex flex-col gap-2">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full">Log in</Button>
                </Link>
                <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full">Sign up</Button>
                </Link>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-100 space-y-1">
                <Link
                  to={dashboardPath}
                  className="block px-3 py-4 text-base font-medium text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-xl"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-4 text-base font-medium text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2"
                >
                  <LogOut size={18} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
