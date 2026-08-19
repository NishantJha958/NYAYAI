import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import Navbar from '../components/layout/Navbar.jsx';

export default function Login() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-nyaya-light flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-2xl border border-gray-200 shadow-md">
          <div className="text-center mb-6">
            <span className="w-12 h-12 rounded-xl bg-nyaya-navy text-nyaya-gold flex items-center justify-center font-bold text-2xl mx-auto mb-3 shadow">
              ⚖
            </span>
            <h1 className="text-2xl font-extrabold text-nyaya-navy">{t('authSignInTitle')}</h1>
            <p className="text-xs text-gray-500 mt-1">Access your saved legal drafts and AI chat</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">{t('authEmail')}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-nyaya-navy text-sm"
                placeholder="citizen@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">{t('authPassword')}</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-nyaya-navy text-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-nyaya-navy hover:bg-nyaya-blue text-white font-bold rounded-xl shadow-md transition-colors disabled:opacity-60 text-sm mt-2"
            >
              {loading ? t('loading') : t('authSignInBtn')}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-600 border-t border-gray-100 pt-4">
            <span>{t('authNoAccount')} </span>
            <Link to="/register" className="text-nyaya-blue font-bold hover:underline">
              {t('authSignUpBtn')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
