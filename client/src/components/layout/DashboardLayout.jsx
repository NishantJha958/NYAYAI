import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';
import DisclaimerBanner from '../common/DisclaimerBanner.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';

export default function DashboardLayout({ children, requireAuth = true }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-nyaya-light flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading NYAYA Platform..." />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-nyaya-light flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">
          <DisclaimerBanner compact />
          {children}
        </main>
      </div>
    </div>
  );
}
