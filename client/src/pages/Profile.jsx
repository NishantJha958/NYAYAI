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
  
  // New Demographic Fields
  const [state, setState] = useState(user?.state || '');
  const [city, setCity] = useState(user?.city || '');
  const [age, setAge] = useState(user?.age || '');
  const [gender, setGender] = useState(user?.gender || 'Prefer not to say');
  const [profession, setProfession] = useState(user?.profession || '');
  const [incomeBracket, setIncomeBracket] = useState(user?.incomeBracket || 'Prefer not to say');
  const [socialCategory, setSocialCategory] = useState(user?.socialCategory || 'Prefer not to say');

  const [savedMessage, setSavedMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSavedMessage('');
    setLoading(true);

    try {
      await authApi.updateProfile?.({ 
        name, 
        preferredLang: prefLang,
        state,
        city,
        age,
        gender,
        profession,
        incomeBracket,
        socialCategory
      });
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

            <div className="pt-4 mt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-nyaya-navy mb-4">Legal Context (Optional)</h3>
              <p className="text-xs text-gray-500 mb-4">Adding this information helps NYAYA provide state-specific and demographic-specific legal advice automatically.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">State of Residence</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Maharashtra"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-nyaya-navy text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-nyaya-navy text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 45"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-nyaya-navy text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-nyaya-navy text-sm bg-white"
                  >
                    <option value="Prefer not to say">Prefer not to say</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Annual Income</label>
                  <select
                    value={incomeBracket}
                    onChange={(e) => setIncomeBracket(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-nyaya-navy text-sm bg-white"
                  >
                    <option value="Prefer not to say">Prefer not to say</option>
                    <option value="Below ₹1 Lakh (BPL / EWS)">Below ₹1 Lakh (BPL / EWS)</option>
                    <option value="₹1 Lakh - ₹3 Lakhs">₹1 Lakh - ₹3 Lakhs</option>
                    <option value="₹3 Lakhs - ₹8 Lakhs">₹3 Lakhs - ₹8 Lakhs</option>
                    <option value="Above ₹8 Lakhs">Above ₹8 Lakhs</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Social Category</label>
                  <select
                    value={socialCategory}
                    onChange={(e) => setSocialCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-nyaya-navy text-sm bg-white"
                  >
                    <option value="Prefer not to say">Prefer not to say</option>
                    <option value="General">General</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="OBC">OBC</option>
                    <option value="Women / Child">Women / Child</option>
                    <option value="Person with Disability (PwD)">Person with Disability (PwD)</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Profession</label>
                  <input
                    type="text"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    placeholder="e.g. Farmer, IT Professional, Small Business Owner"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-nyaya-navy text-sm"
                  />
                </div>
              </div>
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
