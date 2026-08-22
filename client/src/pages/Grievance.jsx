import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { grievanceApi } from '../services/api.js';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import DualPanelResult from '../components/grievance/DualPanelResult.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

const CATEGORIES = [
  'Property / Rent',
  'Consumer',
  'Police / Criminal',
  'RTI',
  'Employment',
  'Government Services',
  'Family',
  'Other',
];

const SAMPLE_HINDI =
  'मेरे मकान मालिक ने 6 महीने से सिक्योरिटी डिपॉजिट वापस नहीं किया है, 50,000 रुपये थे। मैंने 3 बार नोटिस दिया पर कोई जवाब नहीं मिला।';

const SAMPLE_ENGLISH =
  'I purchased a smartphone from an online seller which stopped working within 15 days. The company is refusing to replace or repair under warranty.';

export default function Grievance() {
  const { t, language } = useLanguage();

  const [category, setCategory] = useState('Property / Rent');
  const [plainText, setPlainText] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [grievanceLang, setGrievanceLang] = useState(language || 'en');
  const [files, setFiles] = useState([]);

  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUseSample = (sampleText, sampleCategory, sampleLang) => {
    setPlainText(sampleText);
    setCategory(sampleCategory);
    setGrievanceLang(sampleLang);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!plainText.trim() || plainText.trim().length < 10) {
      setError(language === 'hi' ? 'कृपया कम से कम 10 अक्षरों में समस्या का विवरण लिखें।' : 'Please enter at least 10 characters describing your issue.');
      return;
    }

    setError('');
    setLoading(true);
    setGrievance(null);

    try {
      let payload;
      if (files.length > 0) {
        payload = new FormData();
        payload.append('plainText', plainText.trim());
        payload.append('category', category);
        payload.append('language', grievanceLang);
        payload.append('additionalDetails', additionalDetails.trim());
        files.forEach(f => payload.append('files', f));
      } else {
        payload = {
          plainText: plainText.trim(),
          category,
          language: grievanceLang,
          additionalDetails: additionalDetails.trim(),
        };
      }

      const res = await grievanceApi.create(payload);
      setGrievance(res.data?.grievance);
    } catch (err) {
      setError(err.message || 'Failed to analyze grievance and generate draft.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-[#111] rounded-2xl p-6 border border-white/5 shadow-sm">
          <h1 className="text-2xl font-extrabold text-white">{t('grievanceTitle')}</h1>
          <p className="text-sm text-gray-400 mt-1">{t('grievanceSubtitle')}</p>

          {/* Sample Grievance Helpers */}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
            <span className="font-bold text-gray-400">Try sample:</span>
            <button
              type="button"
              onClick={() => handleUseSample(SAMPLE_HINDI, 'Property / Rent', 'hi')}
              className="px-3 py-1.5 bg-[#0a0a0a] text-gray-300 border border-white/10 rounded-lg hover:bg-teal-500/10 hover:border-teal-500/30 hover:text-teal-300 hover:shadow-[0_0_10px_rgba(20,184,166,0.15)] font-medium transition-all duration-300 shadow-sm"
            >
              🇮🇳 Security Deposit (Hindi)
            </button>
            <button
              type="button"
              onClick={() => handleUseSample(SAMPLE_ENGLISH, 'Consumer', 'en')}
              className="px-3 py-1.5 bg-[#0a0a0a] text-gray-300 border border-white/10 rounded-lg hover:bg-teal-500/10 hover:border-teal-500/30 hover:text-teal-300 hover:shadow-[0_0_10px_rgba(20,184,166,0.15)] font-medium transition-all duration-300 shadow-sm"
            >
              📱 Defective Product (Consumer)
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/30 text-red-400 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* Form Card */}
        <div className="bg-[#111] rounded-2xl p-6 sm:p-8 border border-white/5 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">
                  {t('grievanceCategory')} *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-gray-300 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 text-sm shadow-inner transition-colors"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Draft Language *</label>
                <select
                  value={grievanceLang}
                  onChange={(e) => setGrievanceLang(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-gray-300 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 text-sm shadow-inner transition-colors"
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी (Hindi / Devanagari)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">
                {t('grievanceDescription')} *
              </label>
              <textarea
                required
                rows={4}
                value={plainText}
                onChange={(e) => setPlainText(e.target.value)}
                placeholder={t('grievancePlaceholder')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 text-sm shadow-inner transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">
                {t('grievanceDetails')}
              </label>
              <input
                type="text"
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                placeholder={t('grievanceDetailsPlaceholder')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 text-sm shadow-inner transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">
                Attach Documents (Optional, up to 5)
              </label>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                onChange={(e) => setFiles(Array.from(e.target.files).slice(0, 5))}
                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border file:border-teal-500/30 file:text-sm file:font-semibold file:bg-teal-500/20 file:text-teal-300 hover:file:bg-teal-500/30 transition-colors cursor-pointer"
              />
              {files.length > 0 && (
                <div className="mt-2 text-xs text-gray-300 bg-[#0a0a0a] p-3 rounded-lg border border-white/10 shadow-inner">
                  <div className="font-bold mb-1 text-teal-400">Selected Files:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {files.map((f, i) => (
                      <li key={i}>{f.name} <span className="text-gray-500">({(f.size / 1024).toFixed(1)} KB)</span></li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 font-bold rounded-xl shadow-[0_0_15px_rgba(20,184,166,0.15)] hover:shadow-[0_0_20px_rgba(20,184,166,0.25)] transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-teal-500/30 border-t-teal-300 rounded-full animate-spin" />
                  <span>{t('grievanceProcessing')}</span>
                </>
              ) : (
                <>
                  <span className="group-hover:scale-110 transition-transform">⚡</span>
                  <span>{t('grievanceSubmit')}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Loading Progress State */}
        {loading && (
          <div className="bg-[#111] rounded-2xl p-8 border border-white/5 shadow-sm text-center">
            <LoadingSpinner size="lg" text="Searching Indian Legal Corpus & Generating Notice..." />
          </div>
        )}

        {/* Dual Panel Result */}
        {grievance && !loading && (
          <DualPanelResult
            grievance={grievance}
            labels={{
              legalDraft: t('legalDraft'),
              simpleExplanation: t('simpleExplanation'),
              statutes: t('statutes'),
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
