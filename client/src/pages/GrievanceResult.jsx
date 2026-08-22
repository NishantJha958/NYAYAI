import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import { grievanceApi } from '../services/api.js';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import DualPanelResult from '../components/grievance/DualPanelResult.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

export default function GrievanceResult() {
  const { id } = useParams();
  const { t } = useLanguage();

  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    grievanceApi
      .get(id)
      .then((res) => {
        setGrievance(res.data?.grievance);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load grievance details.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to="/dashboard"
            className="text-xs font-bold text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            ← Back to Dashboard
          </Link>
          <Link
            to="/grievance"
            className="text-xs font-bold bg-teal-500/20 text-teal-300 px-3 py-1.5 rounded-lg border border-teal-500/40 hover:bg-teal-500/30 transition-colors shadow-sm"
          >
            + New Grievance
          </Link>
        </div>

        {loading ? (
          <div className="bg-[#111] rounded-2xl p-12 border border-white/5 shadow-sm text-center">
            <LoadingSpinner size="lg" text="Loading legal notice and analysis..." />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-900/20 border border-red-500/30 text-red-400 rounded-xl text-sm">
            {error}
          </div>
        ) : grievance ? (
          <DualPanelResult
            grievance={grievance}
            labels={{
              legalDraft: t('legalDraft'),
              simpleExplanation: t('simpleExplanation'),
              statutes: t('statutes'),
            }}
          />
        ) : null}
      </div>
    </DashboardLayout>
  );
}
