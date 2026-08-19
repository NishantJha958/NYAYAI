import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-nyaya-navy text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="w-8 h-8 rounded-lg bg-nyaya-gold flex items-center justify-center font-bold text-nyaya-navy text-lg shadow">
              ⚖
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-amber-300 transition-colors">
                NYAYA
              </span>
              <span className="text-nyaya-gold text-xs font-semibold tracking-wider">न्याय</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                isActive('/') ? 'bg-white/10 text-white' : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {t('navHome')}
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-white/10 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {t('navDashboard')}
                </Link>
                <Link
                  to="/grievance"
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    isActive('/grievance')
                      ? 'bg-white/10 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {t('navGrievance')}
                </Link>
                <Link
                  to="/chat"
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    isActive('/chat')
                      ? 'bg-white/10 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {t('navChatbot')}
                </Link>
                <Link
                  to="/search"
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    isActive('/search')
                      ? 'bg-white/10 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {t('navSearch')}
                </Link>
              </>
            )}
          </nav>

          {/* Actions & Language Switcher */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switch */}
            <div className="flex items-center bg-nyaya-blue/60 border border-white/10 rounded-lg p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  language === 'en'
                    ? 'bg-nyaya-gold text-nyaya-navy shadow-sm'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  language === 'hi'
                    ? 'bg-nyaya-gold text-nyaya-navy shadow-sm'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                हिंदी
              </button>
            </div>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-200 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
                >
                  <span className="w-5 h-5 rounded-full bg-nyaya-gold text-nyaya-navy flex items-center justify-center font-bold text-[10px]">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </span>
                  <span>{user?.name || user?.email?.split('@')[0]}</span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="text-xs text-red-300 hover:text-red-100 hover:bg-red-900/30 px-2.5 py-1.5 rounded-lg transition-colors border border-red-800/40"
                >
                  {t('navLogout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-gray-200 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  {t('navLogin')}
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold bg-nyaya-gold text-nyaya-navy px-3.5 py-1.5 rounded-lg hover:bg-amber-400 shadow transition-colors"
                >
                  {t('navRegister')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="text-xs font-bold bg-nyaya-gold text-nyaya-navy px-2 py-1 rounded"
            >
              {language === 'en' ? 'हिं' : 'EN'}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-300 hover:text-white p-2"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-nyaya-blue border-t border-white/10 px-4 pt-3 pb-5 space-y-2 text-sm">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-gray-200 hover:bg-white/10"
          >
            {t('navHome')}
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded text-gray-200 hover:bg-white/10"
              >
                {t('navDashboard')}
              </Link>
              <Link
                to="/grievance"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded text-gray-200 hover:bg-white/10"
              >
                {t('navGrievance')}
              </Link>
              <Link
                to="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded text-gray-200 hover:bg-white/10"
              >
                {t('navChatbot')}
              </Link>
              <Link
                to="/search"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded text-gray-200 hover:bg-white/10"
              >
                {t('navSearch')}
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded text-gray-200 hover:bg-white/10"
              >
                {t('navProfile')}
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded text-red-300 hover:bg-white/10"
              >
                {t('navLogout')}
              </button>
            </>
          ) : (
            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-3 py-2 rounded bg-white/10 text-white font-semibold"
              >
                {t('navLogin')}
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-3 py-2 rounded bg-nyaya-gold text-nyaya-navy font-semibold"
              >
                {t('navRegister')}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
