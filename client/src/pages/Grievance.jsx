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
      const res = await grievanceApi.create({
        plainText: plainText.trim(),
        category,
        language: grievanceLang,
        additionalDetails: additionalDetails.trim(),
      });
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
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h1 className="text-2xl font-extrabold text-nyaya-navy">{t('grievanceTitle')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('grievanceSubtitle')}</p>

          {/* Sample Grievance Helpers */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-gray-600">Try sample:</span>
            <button
              type="button"
              onClick={() => handleUseSample(SAMPLE_HINDI, 'Property / Rent', 'hi')}
              className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg hover:bg-amber-100 font-medium transition-colors"
            >
              🇮🇳 Security Deposit (Hindi)
            </button>
            <button
              type="button"
              onClick={() => handleUseSample(SAMPLE_ENGLISH, 'Consumer', 'en')}
              className="px-2.5 py-1 bg-blue-50 text-blue-900 border border-blue-200 rounded-lg hover:bg-blue-100 font-medium transition-colors"
            >
              📱 Defective Product (Consumer)
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t('grievanceCategory')} *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-nyaya-navy text-sm bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Draft Language *</label>
                <select
                  value={grievanceLang}
                  onChange={(e) => setGrievanceLang(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-nyaya-navy text-sm bg-white"
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी (Hindi / Devanagari)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('grievanceDescription')} *
              </label>
              <textarea
                required
                rows={4}
                value={plainText}
                onChange={(e) => setPlainText(e.target.value)}
                placeholder={t('grievancePlaceholder')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-nyaya-navy text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('grievanceDetails')}
              </label>
              <input
                type="text"
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                placeholder={t('grievanceDetailsPlaceholder')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-nyaya-navy text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 bg-nyaya-navy hover:bg-nyaya-blue text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-60 text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t('grievanceProcessing')}</span>
                </>
              ) : (
                <>
                  <span>⚡</span>
                  <span>{t('grievanceSubmit')}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Loading Progress State */}
        {loading && (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm text-center">
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
