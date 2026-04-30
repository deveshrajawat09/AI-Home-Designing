import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  Home, LayoutDashboard, Grid3X3, Paintbrush, Building2, User,
  Moon, Sun, Bell, Search, Plus, ChevronDown, Sparkles, Menu, X
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';

const navLinks = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/floor-planner', label: 'Floor Planner', icon: Grid3X3 },
  { path: '/interior', label: 'Interior Design', icon: Paintbrush },
  { path: '/exterior', label: 'Exterior Design', icon: Building2 },
];

export function Navbar() {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isLanding = location.pathname === '/';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${
      isDark
        ? 'bg-gray-950/80 border-gray-800/60'
        : 'bg-white/80 border-gray-200/60'
    } border-b backdrop-blur-xl`}>
      <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Home className="w-4 h-4 text-white" />
          </div>
          <span className={`font-bold text-base tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            HomeAI
          </span>
          <span className="text-xs bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full border border-indigo-500/30">
            Pro
          </span>
        </Link>

        {/* Desktop Nav */}
        {!isLanding && (
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ path, label, icon: Icon }) => {
              const active = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                    active
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      : isDark
                        ? 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2">
          {!isLanding && (
            <button
              onClick={() => navigate('/floor-planner')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-3.5 h-3.5" />
              New Project
            </button>
          )}

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {!isLanding && (
            <button className={`p-2 rounded-lg transition-colors relative ${
              isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}>
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
            </button>
          )}

          {!isLanding && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                  {user.avatar}
                </div>
                <span className="hidden sm:block text-sm">{user.name.split(' ')[0]}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    className={`absolute right-0 top-full mt-2 w-48 rounded-xl border shadow-xl overflow-hidden ${
                      isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className={`px-3 py-2 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                      <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.name}</div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</div>
                    </div>
                    {[
                      { label: 'Profile', path: '/profile', icon: User },
                      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
                    ].map(({ label, path, icon: Icon }) => (
                      <button
                        key={path}
                        onClick={() => { navigate(path); setShowUserMenu(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                          isDark ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {isLanding && (
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Get Started
            </button>
          )}

          {/* Mobile menu toggle */}
          {!isLanding && (
            <button
              className={`md:hidden p-2 rounded-lg ${isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && !isLanding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`md:hidden border-t ${isDark ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'}`}
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                    location.pathname === path
                      ? 'bg-indigo-500/20 text-indigo-400'
                      : isDark ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
