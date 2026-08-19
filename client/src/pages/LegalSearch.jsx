import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { legalApi } from '../services/api.js';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

export default function LegalSearch() {
  const { t, language } = useLanguage();

  const [query, setQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [actFilter, setActFilter] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim() || query.trim().length < 3) {
      setError('Please enter at least 3 characters.');
      return;
    }

    setError('');
    setLoading(true);
    setResults(null);

    const filters = {};
    if (stateFilter) filters.state = stateFilter;
    if (actFilter) filters.act = actFilter;

    try {
      const res = await legalApi.search({
        query: query.trim(),
        language,
        filters,
      });
      setResults(res.data);
    } catch (err) {
      setError(err.message || 'Legal search failed. Ensure AI service is running.');
    } finally {
      setLoading(false);
    }
  };

  const sampleSearches = [
    'Rights of tenant regarding security deposit refund under UP Rent Control',
    'Right to Information response deadline Section 7 RTI Act',
    'Consumer rights for defective goods replacement within warranty',
    'Cheating and dishonest inducement under Bharatiya Nyaya Sanhita (BNS)',
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🔍</span>
            <h1 className="text-2xl font-extrabold text-nyaya-navy">{t('searchTitle')}</h1>
          </div>
          <p className="text-sm text-gray-500">{t('searchSubtitle')}</p>

          {/* Sample quick queries */}
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="font-bold text-gray-600">Quick queries:</span>
            {sampleSearches.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setQuery(s)}
                className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-nyaya-navy hover:text-white transition-colors"
              >
                {s.split(' ')[0]} {s.split(' ')[1]}...
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* Search Form */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <input
                type="text"
                required
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-nyaya-navy text-sm shadow-xs"
              />
            </div>

            {/* Optional filters */}
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  {t('searchFilterState')}
                </label>
                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white focus:outline-none"
                >
                  <option value="">All States / All India</option>
                  <option value="UP">Uttar Pradesh (UP)</option>
                  <option value="India">Pan-India Central Acts</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  {t('searchFilterAct')}
                </label>
                <select
                  value={actFilter}
                  onChange={(e) => setActFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white focus:outline-none"
                >
                  <option value="">All Acts</option>
                  <option value="BNS">Bharatiya Nyaya Sanhita (BNS)</option>
                  <option value="BNSS">Bharatiya Nagarik Suraksha Sanhita (BNSS)</option>
                  <option value="BSA">Bharatiya Sakshya Adhiniyam (BSA)</option>
                  <option value="UP Rent Control Act">UP Rent Control Act</option>
                  <option value="Consumer Protection Act">Consumer Protection Act, 2019</option>
                  <option value="RTI Act">Right to Information Act, 2005</option>
                  <option value="UP Revenue Code">UP Revenue Code</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-nyaya-navy hover:bg-nyaya-blue text-white font-bold rounded-xl shadow text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? t('searchSearching') : `🔍 ${t('searchButton')}`}
            </button>
          </form>
        </div>

        {/* Results */}
        {loading && (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm text-center">
            <LoadingSpinner size="lg" text="Searching ChromaDB Vector Embeddings..." />
          </div>
        )}

        {results && !loading && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-base font-bold text-nyaya-navy">
                {results.results?.length || 0} {t('searchResultsFound')}
              </h2>
              <span className="text-xs text-gray-500 font-medium">
                Query: "{results.query}"
              </span>
            </div>

            {results.results?.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                {t('searchNoResults')}
              </div>
            ) : (
              <div className="space-y-4">
                {results.results.map((r, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-xl border border-gray-200 bg-gray-50/70 hover:bg-white hover:border-nyaya-gold transition-all shadow-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="font-bold text-nyaya-navy text-sm">
                        {r.act} {r.section && `— Section ${r.section}`}
                      </div>
                      <div className="flex items-center gap-2">
                        {r.score > 0 && (
                          <span className="text-[11px] font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded">
                            Match: {(r.score * 100).toFixed(0)}%
                          </span>
                        )}
                        <span className="text-[10px] font-bold uppercase text-gray-400 bg-white px-2 py-0.5 rounded border">
                          {r.source || 'Statute'}
                        </span>
                      </div>
                    </div>
                    {r.title && <div className="text-xs font-semibold text-gray-700 mb-2">{r.title}</div>}
                    <p className="text-xs text-gray-600 leading-relaxed font-sans bg-white p-3 rounded-lg border border-gray-100">
                      {r.content || r.relevance}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
