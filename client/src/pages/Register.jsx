import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import Navbar from '../components/layout/Navbar.jsx';

export default function Register() {
  const { register } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [prefLang, setPrefLang] = useState(language || 'en');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({ name, email, password, preferredLang: prefLang });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed.');
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
            <h1 className="text-2xl font-extrabold text-nyaya-navy">{t('authSignUpTitle')}</h1>
            <p className="text-xs text-gray-500 mt-1">Free AI legal empowerment for Indian citizens</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">{t('authName')}</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-nyaya-navy text-sm"
                placeholder="Ramesh Kumar"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">{t('authEmail')}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-nyaya-navy text-sm"
                placeholder="ramesh@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">{t('authPassword')}</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-nyaya-navy text-sm"
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">{t('authPreferredLang')}</label>
              <select
                value={prefLang}
                onChange={(e) => setPrefLang(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-nyaya-navy text-sm bg-white"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-nyaya-gold hover:bg-amber-400 text-nyaya-navy font-bold rounded-xl shadow-md transition-colors disabled:opacity-60 text-sm mt-2"
            >
              {loading ? t('loading') : t('authSignUpBtn')}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-600 border-t border-gray-100 pt-4">
            <span>{t('authHaveAccount')} </span>
            <Link to="/login" className="text-nyaya-blue font-bold hover:underline">
              {t('authSignInBtn')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
