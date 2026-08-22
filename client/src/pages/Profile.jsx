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
        <div className="bg-[#111] rounded-2xl p-6 sm:p-8 border border-white/5 shadow-sm">
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/5">
            <div className="w-14 h-14 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-400 flex items-center justify-center font-bold text-xl shadow-[0_0_15px_rgba(20,184,166,0.1)]">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{t('profileTitle')}</h1>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>

          {savedMessage && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-semibold">
              ✓ {savedMessage}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 text-red-400 rounded-xl text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">{t('profileName')}</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 text-sm shadow-inner transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">{t('profileEmail')}</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/5 bg-white/5 text-gray-500 text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">
                {t('profileLanguagePref')}
              </label>
              <select
                value={prefLang}
                onChange={(e) => setPrefLang(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-gray-300 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 text-sm shadow-inner transition-colors"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi / Devanagari)</option>
              </select>
            </div>

            <div className="pt-4 mt-4 border-t border-white/5">
              <h3 className="text-sm font-bold text-white mb-4">Legal Context (Optional)</h3>
              <p className="text-xs text-gray-500 mb-4">Adding this information helps NYAYA provide state-specific and demographic-specific legal advice automatically.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">State of Residence</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Maharashtra"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 text-sm shadow-inner transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 text-sm shadow-inner transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 45"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 text-sm shadow-inner transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-gray-300 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 text-sm shadow-inner transition-colors"
                  >
                    <option value="Prefer not to say">Prefer not to say</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Annual Income</label>
                  <select
                    value={incomeBracket}
                    onChange={(e) => setIncomeBracket(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-gray-300 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 text-sm shadow-inner transition-colors"
                  >
                    <option value="Prefer not to say">Prefer not to say</option>
                    <option value="Below ₹1 Lakh (BPL / EWS)">Below ₹1 Lakh (BPL / EWS)</option>
                    <option value="₹1 Lakh - ₹3 Lakhs">₹1 Lakh - ₹3 Lakhs</option>
                    <option value="₹3 Lakhs - ₹8 Lakhs">₹3 Lakhs - ₹8 Lakhs</option>
                    <option value="Above ₹8 Lakhs">Above ₹8 Lakhs</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Social Category</label>
                  <select
                    value={socialCategory}
                    onChange={(e) => setSocialCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-gray-300 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 text-sm shadow-inner transition-colors"
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
                  <label className="block text-xs font-bold text-gray-400 mb-1">Profession</label>
                  <input
                    type="text"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    placeholder="e.g. Farmer, IT Professional, Small Business Owner"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 text-sm shadow-inner transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 font-bold rounded-xl shadow-[0_0_15px_rgba(20,184,166,0.15)] transition-all text-sm disabled:opacity-50"
              >
                {loading ? t('loading') : t('profileSave')}
              </button>

              <button
                type="button"
                onClick={logout}
                className="text-xs text-red-400 hover:text-red-300 font-bold px-3 py-2 transition-colors"
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
