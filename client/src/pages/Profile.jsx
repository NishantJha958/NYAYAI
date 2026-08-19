import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { authApi } from '../services/api.js';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';

export default function Profile() {
  const { user, logout } = useAuth();
  const { t, setLanguage } = useLanguage();

  const [name, setName] = useState(user?.name || '');
  const [prefLang, setPrefLang] = useState(user?.preferredLang || 'en');
  const [savedMessage, setSavedMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSavedMessage('');
    setLoading(true);

    try {
      await authApi.updateProfile?.({ name, preferredLang: prefLang });
      setLanguage(prefLang);
      setSavedMessage(t('profileSaved'));
      setTimeout(() => setSavedMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
            <div className="w-14 h-14 rounded-full bg-nyaya-navy text-nyaya-gold flex items-center justify-center font-bold text-xl shadow">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-nyaya-navy">{t('profileTitle')}</h1>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>

          {savedMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs font-semibold">
              ✓ {savedMessage}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">{t('profileName')}</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-nyaya-navy text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">{t('profileEmail')}</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('profileLanguagePref')}
              </label>
              <select
                value={prefLang}
                onChange={(e) => setPrefLang(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-nyaya-navy text-sm bg-white"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi / Devanagari)</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-nyaya-navy hover:bg-nyaya-blue text-white font-bold rounded-xl shadow text-sm transition-colors disabled:opacity-50"
              >
                {loading ? t('loading') : t('profileSave')}
              </button>

              <button
                type="button"
                onClick={logout}
                className="text-xs text-red-600 hover:text-red-800 font-bold px-3 py-2"
              >
                {t('navLogout')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
