import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { checkHealth } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/layout/Navbar.jsx';

export default function Landing() {
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [serverStatus, setServerStatus] = useState('checking');

  useEffect(() => {
    checkHealth()
      .then(() => setServerStatus('ok'))
      .catch(() => setServerStatus('offline'));
  }, []);

  const features = [
    {
      icon: '⚖️',
      title: language === 'hi' ? 'सत्यापित कानूनी नोटिस' : 'Formal Legal Notices',
      desc:
        language === 'hi'
          ? 'सत्यापित भारतीय कानूनों के आधार पर तैयार किया गया औपचारिक कानूनी मसौदा।'
          : 'Ready-to-use formal legal notice citing verified statutes without hallucination.',
    },
    {
      icon: '📖',
      title: language === 'hi' ? 'सरल आम बोलचाल में व्याख्या' : 'Plain Language Explanation',
      desc:
        language === 'hi'
          ? 'कठिन कानूनी धाराओं का आसान हिंदी में मतलब ताकि आप अपने अधिकार समझ सकें।'
          : 'Zero legal jargon. Understand what your rights actually mean in everyday terms.',
    },
    {
      icon: '🔜',
      title: language === 'hi' ? 'स्पष्ट अगले कदम' : 'Actionable Next Steps',
      desc:
        language === 'hi'
          ? 'शिकायत कहां दर्ज करें, क्या प्रमाण जुटाएं और वकील से कब मिलें — 3-5 व्यावहारिक कदम।'
          : '3-5 practical steps on what evidence to collect, which forum to approach, and when to consult an advocate.',
    },
  ];

  const legalAreas = [
    { name: 'BNS, BNSS & BSA', label: 'भारतीय न्याय संहिता (Criminal Law)' },
    { name: 'UP Rent Control & Tenancy', label: 'उत्तर प्रदेश किरायेदारी अधिनियम' },
    { name: 'Consumer Protection Act, 2019', label: 'उपभोक्ता संरक्षण कानून' },
    { name: 'Right to Information (RTI)', label: 'सूचना का अधिकार अधिनियम, 2005' },
    { name: 'UP Revenue Code', label: 'UP भू-राजस्व एवं भूमि अधिकार' },
    { name: 'General Civil Rights', label: 'सामान्य नागरिक एवं सेवा अधिकार' },
  ];

  return (
    <div className="min-h-screen bg-nyaya-light flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-nyaya-navy to-nyaya-blue text-white py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#c9a227_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-amber-300 mb-6 backdrop-blur-sm shadow-sm">
            <span>✨</span>
            <span>{t('brandTagline')}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight max-w-4xl mx-auto">
            {t('heroTitle')}
          </h1>

          <p className="text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            {t('heroSubtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={isAuthenticated ? '/grievance' : '/register'}
              className="w-full sm:w-auto px-8 py-3.5 bg-nyaya-gold hover:bg-amber-400 text-nyaya-navy font-bold rounded-xl shadow-lg hover:shadow-xl transition-all text-center transform hover:-translate-y-0.5"
            >
              {t('heroCtaPrimary')} →
            </Link>
            <Link
              to={isAuthenticated ? '/chat' : '/login'}
              className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl backdrop-blur-sm transition-all text-center"
            >
              {t('heroCtaSecondary')} 💬
            </Link>
          </div>

          {/* Quick status pill */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-300">
            <span
              className={`w-2 h-2 rounded-full ${
                serverStatus === 'ok' ? 'bg-green-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span>{serverStatus === 'ok' ? t('serverOnline') : 'Connecting to API Gateway...'}</span>
          </div>
        </div>
      </section>

      {/* Core Philosophy Banner */}
      <section className="bg-white border-y border-gray-200 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <blockquote className="text-lg sm:text-xl font-semibold text-nyaya-navy italic">
            "{language === 'hi'
              ? 'उपयोगकर्ता को पहले कभी भी कठिन कानूनी भाषा समझने के लिए मजबूर न करें।'
              : 'Never make the user understand complicated legal language first.'}"
          </blockquote>
          <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest font-bold">
            NYAYA Core Design Principle
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-nyaya-navy tracking-tight">
            {language === 'hi' ? 'NYAYA कैसे मदद करता है' : 'How NYAYA Empowers You'}
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            {language === 'hi'
              ? 'RAG तकनीक द्वारा संचालित, आपके केस के लिए सटीक कानून और तुरंत नोटिस तैयार।'
              : 'AI-assisted legal retrieval tailored for ordinary citizens and tenants.'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-nyaya-light flex items-center justify-center text-2xl mb-4 border border-gray-100 shadow-xs">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-nyaya-navy mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Supported Laws */}
      <section className="bg-nyaya-light/80 border-t border-gray-200 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-nyaya-navy">
              {language === 'hi' ? 'शामिल कानूनी क्षेत्र' : 'Supported Legal Frameworks'}
            </h2>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">
              Uttar Pradesh & Pan-India Statutes
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {legalAreas.map((area, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex items-center gap-3"
              >
                <span className="text-nyaya-gold font-bold text-lg">§</span>
                <div>
                  <div className="text-sm font-bold text-nyaya-navy">{area.name}</div>
                  <div className="text-xs text-gray-500">{area.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-nyaya-navy text-gray-300 py-10 mt-auto border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl font-bold text-white tracking-tight">NYAYA</span>
            <span className="text-nyaya-gold font-semibold text-sm">न्याय</span>
          </div>
          <p className="text-xs text-gray-400 max-w-xl mx-auto leading-relaxed">
            {t('disclaimerFull')}
          </p>
          <div className="text-xs text-gray-500 pt-4 border-t border-white/10">
            © {new Date().getFullYear()} NYAYA AI Legal Empowerment Platform. Built for Indian Citizens.
          </div>
        </div>
      </footer>
    </div>
  );
}
