import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { legalApi } from '../services/api.js';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

export default function LegalSearch() {
  const { t, language } = useLanguage();

  const [query, setQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('India');
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
        <div className="bg-[#111] rounded-2xl p-6 border border-white/5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🔍</span>
            <h1 className="text-2xl font-extrabold text-white">{t('searchTitle')}</h1>
          </div>
          <p className="text-sm text-gray-500">{t('searchSubtitle')}</p>

          {/* Sample quick queries */}
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="font-bold text-gray-400">Quick queries:</span>
            {sampleSearches.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setQuery(s)}
                className="px-2.5 py-1 bg-white/5 border border-white/5 text-gray-400 rounded-lg hover:bg-teal-500/20 hover:border-teal-500/30 hover:text-teal-300 transition-colors"
              >
                {s.split(' ')[0]} {s.split(' ')[1]}...
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/30 text-red-400 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* Search Form */}
        <div className="bg-[#111] rounded-2xl p-6 border border-white/5 shadow-sm">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <input
                type="text"
                required
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 text-sm shadow-inner transition-colors"
              />
            </div>

            {/* Optional filters */}
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">
                  {t('searchFilterState')}
                </label>
                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0a0a0a] border border-white/10 text-gray-300 text-xs focus:outline-none focus:border-teal-500/50"
                >
                  <option value="">All States / All India</option>
                  <option value="UP">Uttar Pradesh (UP)</option>
                  <option value="India">Pan-India Central Acts</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">
                  {t('searchFilterAct')}
                </label>
                <select
                  value={actFilter}
                  onChange={(e) => setActFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0a0a0a] border border-white/10 text-gray-300 text-xs focus:outline-none focus:border-teal-500/50"
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
              className="px-6 py-2.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 font-bold rounded-xl shadow-[0_0_15px_rgba(20,184,166,0.15)] hover:shadow-[0_0_20px_rgba(20,184,166,0.2)] text-sm transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? t('searchSearching') : `🔍 ${t('searchButton')}`}
            </button>
          </form>
        </div>

        {/* Results */}
        {loading && (
          <div className="bg-[#111] rounded-2xl p-8 border border-white/5 shadow-sm text-center">
            <LoadingSpinner size="lg" text="Searching ChromaDB Vector Embeddings..." />
          </div>
        )}

        {results && !loading && (
          <div className="bg-[#111] rounded-2xl p-6 border border-white/5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h2 className="text-base font-bold text-white">
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
                    className="p-5 rounded-xl border border-white/5 bg-[#0a0a0a] hover:bg-[#151515] hover:border-teal-500/30 transition-all shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="font-bold text-teal-400 text-sm">
                        {r.act} {r.section && `— Section ${r.section}`}
                      </div>
                      <div className="flex items-center gap-2">
                        {r.score > 0 && (
                          <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                            Match: {(r.score * 100).toFixed(0)}%
                          </span>
                        )}
                        <span className="text-[10px] font-bold uppercase text-gray-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                          {r.source || 'Statute'}
                        </span>
                      </div>
                    </div>
                    {r.title && <div className="text-xs font-semibold text-gray-200 mb-2">{r.title}</div>}
                    <p className="text-xs text-gray-400 leading-relaxed font-sans bg-[#111] p-3 rounded-lg border border-white/5">
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
