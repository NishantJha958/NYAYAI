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
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        {/* User Card */}
        <div className="p-3.5 bg-nyaya-light rounded-xl border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-nyaya-navy text-nyaya-gold flex items-center justify-center font-bold text-base shadow-sm">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-bold text-nyaya-navy truncate">
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
                    ? 'bg-nyaya-navy text-white shadow-sm'
                    : 'text-gray-600 hover:text-nyaya-navy hover:bg-gray-100/80'
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
      <div className="p-3 bg-nyaya-navy/5 rounded-xl text-xs text-gray-500 space-y-1">
        <div className="font-semibold text-nyaya-navy">NYAYA v1.0 (MVP)</div>
        <div>Indian Law AI Empowerment</div>
      </div>
    </aside>
  );
}
