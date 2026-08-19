import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { grievanceApi } from '../services/api.js';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    grievanceApi
      .list()
      .then((res) => {
        setGrievances(res.data?.grievances || []);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch grievances');
      })
      .finally(() => setLoading(false));
  }, []);

  const totalStatutes = grievances.reduce((acc, g) => acc + (g.statutes?.length || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-nyaya-navy">
              {t('dashWelcome')}, {user?.name || 'Citizen'}!
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {language === 'hi'
                ? 'अपने कानूनी अधिकार जानें और AI द्वारा सत्यापित नोटिस तैयार करें।'
                : 'Empowering Indian citizens with verified AI legal drafting and simplification.'}
            </p>
          </div>
          <Link
            to="/grievance"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-nyaya-navy hover:bg-nyaya-blue text-white font-bold rounded-xl shadow-md transition-all text-sm self-start md:self-auto"
          >
            <span>✍️</span>
            <span>{t('dashNewDraftBtn')}</span>
          </Link>
        </div>

        {/* Metric Cards */}
        <div className="grid sm:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-nyaya-blue flex items-center justify-center text-2xl font-bold">
              📝
            </div>
            <div>
              <div className="text-2xl font-black text-nyaya-navy">{grievances.length}</div>
              <div className="text-xs font-semibold text-gray-500">{t('dashTotalGrievances')}</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl font-bold">
              ⚖️
            </div>
            <div>
              <div className="text-2xl font-black text-nyaya-navy">
                {grievances.filter((g) => g.status === 'completed').length}
              </div>
              <div className="text-xs font-semibold text-gray-500">{t('dashActiveDrafts')}</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl font-bold">
              📚
            </div>
            <div>
              <div className="text-2xl font-black text-nyaya-navy">{totalStatutes}</div>
              <div className="text-xs font-semibold text-gray-500">{t('dashStatutesReferenced')}</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-bold text-nyaya-navy mb-4">{t('dashQuickActions')}</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link
              to="/grievance"
              className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-nyaya-navy/40 shadow-xs hover:shadow-md transition-all group"
            >
              <div className="text-2xl mb-2">📄</div>
              <div className="font-bold text-nyaya-navy group-hover:text-nyaya-blue transition-colors text-sm">
                {t('dashNewDraftBtn')}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {language === 'hi'
                  ? 'किरायेदारी, उपभोक्ता या पुलिस शिकायत पर ड्राफ्ट नोटिस बनाएं।'
                  : 'Generate a verified legal notice from plain text grievance.'}
              </div>
            </Link>

            <Link
              to="/chat"
              className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-nyaya-navy/40 shadow-xs hover:shadow-md transition-all group"
            >
              <div className="text-2xl mb-2">💬</div>
              <div className="font-bold text-nyaya-navy group-hover:text-nyaya-blue transition-colors text-sm">
                {t('dashStartChatBtn')}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {language === 'hi'
                  ? '3-भाग संरचना (कानून + आसान व्याख्या + कदम) में प्रश्न पूछें।'
                  : 'Structured answers with Legal rule, Plain terms, and Next Steps.'}
              </div>
            </Link>

            <Link
              to="/search"
              className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-nyaya-navy/40 shadow-xs hover:shadow-md transition-all group"
            >
              <div className="text-2xl mb-2">🔍</div>
              <div className="font-bold text-nyaya-navy group-hover:text-nyaya-blue transition-colors text-sm">
                {t('dashSearchLawsBtn')}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {language === 'hi'
                  ? 'BNS, BNSS, BSA, RTI और UP कानून वेक्टर डेटाबेस में खोजें।'
                  : 'Semantic search across Indian penal & state civil laws.'}
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Grievances */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-nyaya-navy">{t('dashRecentGrievances')}</h2>
            <Link to="/grievance" className="text-xs font-bold text-nyaya-blue hover:underline">
              + {t('navGrievance')}
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner text="Fetching your legal history..." />
          ) : error ? (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs">{error}</div>
          ) : grievances.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="text-3xl mb-2">📭</div>
              <p className="text-sm font-semibold text-gray-600">{t('dashNoGrievances')}</p>
              <Link
                to="/grievance"
                className="mt-4 inline-block px-4 py-2 bg-nyaya-gold text-nyaya-navy font-bold rounded-lg text-xs hover:bg-amber-400"
              >
                {t('dashNewDraftBtn')}
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {grievances.map((g) => (
                <div
                  key={g._id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/50 p-2 rounded-xl transition-colors"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-nyaya-navy/10 text-nyaya-navy text-[11px] font-bold rounded">
                        {g.category}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(g.createdAt).toLocaleDateString()}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          g.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : g.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {g.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 line-clamp-1 font-medium">{g.plainText}</p>
                  </div>
                  <Link
                    to={`/grievance/${g._id}`}
                    className="text-xs font-bold text-nyaya-navy hover:text-nyaya-blue bg-gray-100 hover:bg-gray-200 px-3.5 py-1.5 rounded-lg self-start sm:self-auto transition-colors"
                  >
                    View Draft →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
