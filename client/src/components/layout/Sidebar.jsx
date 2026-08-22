import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Sidebar() {
  const location = useLocation();
  const { t } = useLanguage();
  const { user } = useAuth();

  const links = [
    { to: '/dashboard', label: t('navDashboard'), icon: '📊' },
    { to: '/grievance', label: t('navGrievance'), icon: '✍️' },
    { to: '/chat', label: t('navChatbot'), icon: '💬' },
    { to: '/search', label: t('navSearch'), icon: '🔍' },
    { to: '/profile', label: t('navProfile'), icon: '👤' },
  ];

  return (
    <aside className="w-64 bg-[#0a0a0a] border-r border-white/5 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        {/* User Card */}
        <div className="p-3.5 bg-[#111] rounded-xl border border-white/5 flex items-center gap-3 shadow-inner">
          <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center justify-center font-bold text-base shadow-[0_0_10px_rgba(20,184,166,0.2)]">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-bold text-gray-200 truncate">
              {user?.name || 'NYAYA Citizen'}
            </div>
            <div className="text-xs text-gray-500 truncate">{user?.email}</div>
          </div>
        </div>

        {/* Nav list */}
        <nav className="space-y-1">
          {links.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-[0_0_15px_rgba(20,184,166,0.15)]'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer info */}
      <div className="p-3 bg-white/5 rounded-xl text-xs text-gray-500 space-y-1 border border-white/5">
        <div className="font-semibold text-teal-500/80">NYAYA v1.0 (MVP)</div>
        <div>Indian Law AI Empowerment</div>
      </div>
    </aside>
  );
}
