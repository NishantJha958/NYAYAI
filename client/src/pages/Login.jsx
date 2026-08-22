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
    <div className="min-h-screen bg-[#050505] flex flex-col font-sans relative overflow-hidden">
      {/* Background Holographic Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none" />

      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="bg-[#0a0a0a] max-w-md w-full p-8 rounded-2xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="text-center mb-6 relative z-10">
            <span className="w-14 h-14 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center font-bold text-2xl mx-auto mb-4 shadow-[0_0_15px_rgba(20,184,166,0.2)]">
              <svg className="w-6 h-6 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </span>
            <h1 className="text-3xl font-extrabold text-white mb-2">{t('authSignInTitle')}</h1>
            <p className="text-sm text-gray-400">Access your saved legal drafts and AI chat</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">{t('authEmail')}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#111] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all text-sm placeholder:text-gray-600"
                placeholder="citizen@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">{t('authPassword')}</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#111] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all text-sm placeholder:text-gray-600"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 font-bold rounded-xl shadow-[0_0_15px_rgba(20,184,166,0.15)] hover:shadow-[0_0_25px_rgba(20,184,166,0.3)] transition-all duration-300 disabled:opacity-60 disabled:hover:shadow-none text-sm mt-4 hover:-translate-y-0.5"
            >
              {loading ? t('loading') : t('authSignInBtn')}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500 border-t border-white/10 pt-6 relative z-10">
            <span>{t('authNoAccount')} </span>
            <Link to="/register" className="text-teal-400 font-bold hover:text-teal-300 hover:underline transition-colors">
              {t('authSignUpBtn')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
