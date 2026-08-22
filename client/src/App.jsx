import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';

import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Grievance from './pages/Grievance.jsx';
import GrievanceResult from './pages/GrievanceResult.jsx';
import Chatbot from './pages/Chatbot.jsx';
import LegalSearch from './pages/LegalSearch.jsx';
import Profile from './pages/Profile.jsx';
import IntegrationDemo from './pages/IntegrationDemo.jsx';

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          {/* Global Hologram Overlay */}
          <div 
            className="fixed inset-0 z-[100] pointer-events-none opacity-[0.15] mix-blend-screen"
            style={{
              backgroundImage: "url('/lady_justice_hologram.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center 20%',
              backgroundRepeat: 'no-repeat'
            }}
          />
          <div className="relative z-10">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/grievance" element={<Grievance />} />
              <Route path="/grievance/:id" element={<GrievanceResult />} />
              <Route path="/chat" element={<Chatbot />} />
              <Route path="/search" element={<LegalSearch />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/demo" element={<IntegrationDemo />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
