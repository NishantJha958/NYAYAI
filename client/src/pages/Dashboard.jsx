import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { grievanceApi, chatApi } from '../services/api.js';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chatSessions, setChatSessions] = useState([]);
  const [chatLoading, setChatLoading] = useState(true);

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

    chatApi
      .listSessions()
      .then((res) => setChatSessions(res.data?.sessions || []))
      .catch(() => {})
      .finally(() => setChatLoading(false));
  }, []);

  const totalStatutes = grievances.reduce((acc, g) => acc + (g.statutes?.length || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-[#111] rounded-2xl p-6 sm:p-8 border border-white/5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-900/20 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {t('dashWelcome')}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">{user?.name || 'Citizen'}</span>!
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {language === 'hi'
                ? 'अपने कानूनी अधिकार जानें और AI द्वारा सत्यापित नोटिस तैयार करें।'
                : 'Empowering Indian citizens with verified AI legal drafting and simplification.'}
            </p>
          </div>
          <Link
            to="/grievance"
            className="relative z-10 inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:border-teal-400/50 font-bold rounded-xl shadow-[0_0_15px_rgba(20,184,166,0.15)] hover:shadow-[0_0_25px_rgba(20,184,166,0.3)] hover:-translate-y-0.5 transition-all duration-300 text-sm self-start md:self-auto group"
          >
            <span className="group-hover:scale-110 transition-transform">✍️</span>
            <span>{t('dashNewDraftBtn')}</span>
          </Link>
        </div>

        {/* Metric Cards */}
        <div className="grid sm:grid-cols-4 gap-5">
          <div className="bg-[#111] p-5 rounded-2xl border border-white/5 shadow-sm flex items-center gap-4 hover:bg-[#151515] transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center text-2xl font-bold group-hover:bg-teal-500/20 group-hover:scale-110 transition-all duration-300">
              📝
            </div>
            <div>
              <div className="text-2xl font-black text-white">{grievances.length}</div>
              <div className="text-xs font-semibold text-gray-400">{t('dashTotalGrievances')}</div>
            </div>
          </div>

          <div className="bg-[#111] p-5 rounded-2xl border border-white/5 shadow-sm flex items-center gap-4 hover:bg-[#151515] transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center text-2xl font-bold group-hover:bg-teal-500/20 group-hover:scale-110 transition-all duration-300">
              ⚖️
            </div>
            <div>
              <div className="text-2xl font-black text-white">
                {grievances.filter((g) => g.status === 'completed').length}
              </div>
              <div className="text-xs font-semibold text-gray-400">{t('dashActiveDrafts')}</div>
            </div>
          </div>

          <div className="bg-[#111] p-5 rounded-2xl border border-white/5 shadow-sm flex items-center gap-4 hover:bg-[#151515] transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center text-2xl font-bold group-hover:bg-teal-500/20 group-hover:scale-110 transition-all duration-300">
              📚
            </div>
            <div>
              <div className="text-2xl font-black text-white">{totalStatutes}</div>
              <div className="text-xs font-semibold text-gray-400">{t('dashStatutesReferenced')}</div>
            </div>
          </div>

          <div className="bg-[#111] p-5 rounded-2xl border border-white/5 shadow-sm flex items-center gap-4 hover:bg-[#151515] transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center text-2xl font-bold group-hover:bg-teal-500/20 group-hover:scale-110 transition-all duration-300">
              💬
            </div>
            <div>
              <div className="text-2xl font-black text-white">{chatSessions.length}</div>
              <div className="text-xs font-semibold text-gray-400">AI Conversations</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            {t('dashQuickActions')}
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link
              to="/grievance"
              className="bg-[#111] p-6 rounded-2xl border border-white/5 hover:border-teal-500/50 shadow-sm hover:shadow-[0_0_20px_rgba(20,184,166,0.15)] hover:bg-[#151515] transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#222] border border-white/10 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 group-hover:bg-teal-500/20 group-hover:border-teal-500/40 transition-all duration-300 shadow-inner">📄</div>
              <div className="font-bold text-gray-200 group-hover:text-teal-400 transition-colors text-sm mb-2">
                {t('dashNewDraftBtn')}
              </div>
              <div className="text-xs text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors">
                {language === 'hi'
                  ? 'किरायेदारी, उपभोक्ता या पुलिस शिकायत पर ड्राफ्ट नोटिस बनाएं।'
                  : 'Generate a verified legal notice from plain text grievance.'}
              </div>
            </Link>

            <Link
              to="/chat"
              className="bg-[#111] p-6 rounded-2xl border border-white/5 hover:border-teal-500/50 shadow-sm hover:shadow-[0_0_20px_rgba(20,184,166,0.15)] hover:bg-[#151515] transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#222] border border-white/10 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 group-hover:bg-teal-500/20 group-hover:border-teal-500/40 transition-all duration-300 shadow-inner">💬</div>
              <div className="font-bold text-gray-200 group-hover:text-teal-400 transition-colors text-sm mb-2">
                {t('dashStartChatBtn')}
              </div>
              <div className="text-xs text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors">
                {language === 'hi'
                  ? '3-भाग संरचना (कानून + आसान व्याख्या + कदम) में प्रश्न पूछें।'
                  : 'Structured answers with Legal rule, Plain terms, and Next Steps.'}
              </div>
            </Link>

            <Link
              to="/search"
              className="bg-[#111] p-6 rounded-2xl border border-white/5 hover:border-teal-500/50 shadow-sm hover:shadow-[0_0_20px_rgba(20,184,166,0.15)] hover:bg-[#151515] transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#222] border border-white/10 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 group-hover:bg-teal-500/20 group-hover:border-teal-500/40 transition-all duration-300 shadow-inner">🔍</div>
              <div className="font-bold text-gray-200 group-hover:text-teal-400 transition-colors text-sm mb-2">
                {t('dashSearchLawsBtn')}
              </div>
              <div className="text-xs text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors">
                {language === 'hi'
                  ? 'BNS, BNSS, BSA, RTI और UP कानून वेक्टर डेटाबेस में खोजें।'
                  : 'Semantic search across Indian penal & state civil laws.'}
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Grievances */}
        <div className="bg-[#111] rounded-2xl p-6 border border-white/5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">{t('dashRecentGrievances')}</h2>
            <Link to="/grievance" className="text-xs font-bold text-teal-400 hover:text-teal-300 hover:underline">
              + {t('navGrievance')}
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner text="Fetching your legal history..." />
          ) : error ? (
            <div className="p-3 bg-red-900/20 border border-red-500/30 text-red-400 rounded-xl text-xs">{error}</div>
          ) : grievances.length === 0 ? (
            <div className="text-center py-10 px-4 border border-dashed border-white/10 rounded-xl bg-white/5 mt-4">
              <div className="text-3xl mb-2">📭</div>
              <p className="text-sm font-semibold text-gray-400">{t('dashNoGrievances')}</p>
              <Link
                to="/grievance"
                className="mt-4 inline-block px-4 py-2 bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold rounded-lg text-xs hover:bg-teal-500/30 transition-colors"
              >
                {t('dashNewDraftBtn')}
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/5 mt-2">
              {grievances.map((g) => (
                <div
                  key={g._id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/5 px-3 rounded-xl transition-colors group"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 bg-teal-500/20 text-teal-400 text-[11px] font-bold rounded border border-teal-500/30">
                        {g.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(g.createdAt).toLocaleDateString()}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          g.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : g.status === 'failed'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                        }`}
                      >
                        {g.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-1 font-medium group-hover:text-white transition-colors">{g.plainText}</p>
                  </div>
                  <Link
                    to={`/grievance/${g._id}`}
                    className="text-xs font-bold text-teal-400 hover:text-teal-200 bg-white/5 border border-white/10 hover:border-teal-500/40 hover:bg-teal-500/10 px-4 py-2 rounded-lg self-start sm:self-auto transition-all duration-300 shadow-sm"
                  >
                    View Draft →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Chat Sessions */}
        <div className="bg-[#111] rounded-2xl p-6 border border-white/5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">💬 Recent AI Conversations</h2>
            <Link to="/chat" className="text-xs font-bold text-teal-400 hover:text-teal-300 hover:underline">
              + New Chat
            </Link>
          </div>

          {chatLoading ? (
            <LoadingSpinner text="Loading chat history..." />
          ) : chatSessions.length === 0 ? (
            <div className="text-center py-8 px-4 border border-dashed border-white/10 rounded-xl bg-white/5 mt-4">
              <div className="text-3xl mb-2">💬</div>
              <p className="text-sm font-semibold text-gray-400">No conversations yet.</p>
              <Link
                to="/chat"
                className="mt-4 inline-block px-4 py-2 bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold rounded-lg text-xs hover:bg-teal-500/30 transition-colors"
              >
                Start a Conversation
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/5 mt-2">
              {chatSessions.slice(0, 5).map((session) => (
                <div
                  key={session.sessionId}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/5 px-3 rounded-xl transition-colors group"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 bg-teal-500/20 text-teal-400 border border-teal-500/30 text-[11px] font-bold rounded">
                        {session.messageCount} messages
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(session.updatedAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-1 font-medium group-hover:text-white transition-colors">
                      {session.lastMessage || 'No preview available'}
                    </p>
                  </div>
                  <Link
                    to={`/chat?session=${session.sessionId}`}
                    className="text-xs font-bold text-teal-400 hover:text-teal-200 bg-white/5 border border-white/10 hover:border-teal-500/40 hover:bg-teal-500/10 px-4 py-2 rounded-lg self-start sm:self-auto transition-all duration-300 shadow-sm whitespace-nowrap"
                  >
                    Continue →
                  </Link>
                </div>
              ))}
              {chatSessions.length > 5 && (
                <div className="pt-4 text-center border-t border-white/5 mt-2">
                  <Link to="/chat" className="text-xs font-bold text-teal-400 hover:text-teal-300 hover:underline">
                    View all {chatSessions.length} conversations →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
