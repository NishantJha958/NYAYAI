import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { checkHealth } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/layout/Navbar.jsx';

// Custom hook for scroll-triggered visibility
function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold: 0.15, ...options }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, inView];
}

// Animated counter hook
function useCounter(target, inView, duration = 1800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);
  return count;
}

function StatCard({ value, suffix, label, delay }) {
  const [ref, inView] = useInView();
  const count = useCounter(value, inView);
  return (
    <div
      ref={ref}
      style={{ animationDelay: delay }}
      className={`text-center transition-all ${inView ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}
    >
      <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400 group-hover:scale-110 transition-transform duration-300">
        {count.toLocaleString('en-IN')}{suffix}
      </div>
      <div className="text-sm text-gray-400 font-medium mt-2 uppercase tracking-widest">{label}</div>
    </div>
  );
}

export default function Landing() {
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [serverStatus, setServerStatus] = useState('checking');

  useEffect(() => {
    checkHealth()
      .then(() => setServerStatus('ok'))
      .catch(() => setServerStatus('offline'));
  }, []);

  const [featRef, featInView] = useInView();
  const [stepsRef, stepsInView] = useInView();
  const [lawsRef, lawsInView] = useInView();
  const [ctaRef, ctaInView] = useInView();

  const features = [
    {
      icon: '⚖️',
      gradient: 'from-blue-600 to-indigo-700',
      title: language === 'hi' ? 'सत्यापित कानूनी नोटिस' : 'Verified Legal Notices',
      desc: language === 'hi'
        ? 'सत्यापित भारतीय कानूनों के आधार पर तैयार किया गया औपचारिक कानूनी मसौदा।'
        : 'Ready-to-use formal legal notices citing verified statutes — zero hallucinations.',
    },
    {
      icon: '📖',
      gradient: 'from-cyan-500 to-blue-600',
      title: language === 'hi' ? 'सरल भाषा में व्याख्या' : 'Plain Language Explanation',
      desc: language === 'hi'
        ? 'कठिन कानूनी धाराओं का आसान हिंदी में मतलब ताकि आप अपने अधिकार समझ सकें।'
        : 'Zero legal jargon. Understand exactly what your rights mean in everyday terms.',
    },
    {
      icon: '🗺️',
      gradient: 'from-emerald-500 to-teal-600',
      title: language === 'hi' ? 'स्पष्ट अगले कदम' : 'Actionable Next Steps',
      desc: language === 'hi'
        ? 'शिकायत कहां दर्ज करें, क्या प्रमाण जुटाएं और वकील से कब मिलें।'
        : '3–5 practical steps: what evidence to collect, which forum to approach, when to consult a lawyer.',
    },
    {
      icon: '🎤',
      gradient: 'from-pink-500 to-rose-600',
      title: language === 'hi' ? 'आवाज़ से पूछें' : 'Voice-to-Text Input',
      desc: language === 'hi'
        ? 'माइक्रोफ़ोन से बोलकर अपना सवाल पूछें — हिंदी और अंग्रेज़ी में।'
        : 'Speak your legal question directly using the microphone — in Hindi or English.',
    },
    {
      icon: '📎',
      gradient: 'from-violet-500 to-purple-700',
      title: language === 'hi' ? 'दस्तावेज़ अपलोड' : 'Document Upload',
      desc: language === 'hi'
        ? 'PDF, छवि या दस्तावेज़ अपलोड करें और AI उससे ड्राफ्ट बनाएगा।'
        : 'Upload a PDF, image, or document — AI extracts context and builds your legal draft.',
    },
    {
      icon: '🔍',
      gradient: 'from-cyan-500 to-sky-600',
      title: language === 'hi' ? 'भारतीय कानून खोजें' : 'Search Indian Laws',
      desc: language === 'hi'
        ? 'BNS, RTI, उपभोक्ता संरक्षण कानून और UP कानूनों में सिमेंटिक सर्च।'
        : 'Semantic search across BNS, BNSS, BSA, RTI, Consumer Protection, and UP state laws.',
    },
  ];

  const steps = [
    { num: '01', icon: '✍️', title: 'Describe Your Problem', desc: 'Type or speak your grievance in plain Hindi or English. No legal knowledge needed.' },
    { num: '02', icon: '🤖', title: 'AI Analyses & Drafts', desc: 'NYAYA identifies applicable laws from our verified vector database and generates a formal notice.' },
    { num: '03', icon: '📄', title: 'Download & Use', desc: 'Download your legally worded notice as a PDF, ready to submit to the relevant authority.' },
  ];

  const legalAreas = [
    { icon: '⚔️', name: 'BNS, BNSS & BSA', label: 'भारतीय न्याय संहिता (Criminal Law)' },
    { icon: '🏠', name: 'UP Rent Control & Tenancy', label: 'उत्तर प्रदेश किरायेदारी अधिनियम' },
    { icon: '🛒', name: 'Consumer Protection Act, 2019', label: 'उपभोक्ता संरक्षण कानून' },
    { icon: '📋', name: 'Right to Information (RTI)', label: 'सूचना का अधिकार अधिनियम, 2005' },
    { icon: '🌾', name: 'UP Revenue Code', label: 'UP भू-राजस्व एवं भूमि अधिकार' },
    { icon: '🤝', name: 'General Civil Rights', label: 'सामान्य नागरिक एवं सेवा अधिकार' },
  ];

  const tickerItems = [
    '⚖️ BNS 2023', '📋 RTI Act 2005', '🏠 UP Rent Control', '🛒 Consumer Protection Act', '🌾 UP Revenue Code',
    '⚔️ BNSS 2023', '📚 BSA 2023', '🤝 Civil Rights', '🏛️ Scheduled Castes Act', '💼 Maternity Benefit Act',
    '⚖️ BNS 2023', '📋 RTI Act 2005', '🏠 UP Rent Control', '🛒 Consumer Protection Act', '🌾 UP Revenue Code',
    '⚔️ BNSS 2023', '📚 BSA 2023', '🤝 Civil Rights', '🏛️ Scheduled Castes Act', '💼 Maternity Benefit Act',
  ];

  return (
    <div className="min-h-screen bg-nyaya-light flex flex-col font-sans overflow-x-hidden">
      <Navbar />

      {/* ═══════════════════════════════════════════════
          HERO SECTION — Dark Theme with Cyan Glow
      ═══════════════════════════════════════════════ */}
      <section className="relative bg-[#050505] text-white py-24 lg:py-40 overflow-hidden">
        {/* Background grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:40px_40px]" />
        
        {/* Glowing orbs matching SatyaSetu aesthetic */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-teal-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-900/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            {/* Badge */}
            <div className="animate-fade-in-down inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-medium text-teal-300 mb-10 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span className="tracking-wide uppercase">India's First AI-Powered Legal Rights Platform</span>
            </div>

            {/* Headline */}
            <h1 className="animate-fade-in-up text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              <span className="block text-white mb-2">{language === 'hi' ? 'अपना अधिकार जानें' : 'Know your legal rights'}</span>
              <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-500 bg-[length:200%_auto] animate-shimmer pt-4 pb-2 leading-relaxed hover:scale-105 transition-transform duration-300 cursor-default drop-shadow-[0_0_15px_rgba(45,212,191,0.4)]">
                {language === 'hi' ? 'AI से समझें' : 'Powered by AI'}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="animate-fade-in-up-delay-1 text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
              {language === 'hi'
                ? 'बिना वकील के, सिर्फ़ AI से — अपनी शिकायत दर्ज करें और तुरंत कानूनी नोटिस पाएं।'
                : 'Describe your problem in plain language. Get a verified legal notice in seconds — no lawyer required.'}
            </p>

            {/* CTA Buttons */}
            <div className="animate-fade-in-up-delay-2 flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
              <Link
                to={isAuthenticated ? '/chat' : '/register'}
                className="group relative w-full sm:w-auto px-8 py-3.5 bg-teal-500/20 text-teal-300 font-semibold rounded-lg border border-teal-500/40 shadow-[0_0_15px_rgba(20,184,166,0.2)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] hover:bg-teal-500/30 transition-all duration-300 backdrop-blur-md overflow-hidden flex items-center justify-center"
              >
                <span className="relative z-10 flex items-center">
                  Ask nyaya AI 
                  <span className="ml-2 group-hover:translate-x-1 transition-transform inline-block">→</span>
                </span>
                <div className="absolute inset-0 bg-teal-400/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out" />
              </Link>
              <Link
                to={isAuthenticated ? '/grievance' : '/login'}
                className="w-full sm:w-auto px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-medium rounded-lg backdrop-blur-sm transition-all duration-300 text-center hover:border-white/30"
              >
                understanding your rights
              </Link>
            </div>

            {/* Floating stats bar */}
            <div className="animate-fade-in-up-delay-3 inline-flex flex-wrap items-center justify-center gap-6 sm:gap-10 px-8 py-5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
              {[
                { val: '6+', label: 'Legal Acts' },
                { val: '100%', label: 'Verified Sources' },
                { val: 'Hindi', label: '+ English' },
                { val: 'Free', label: 'For Citizens' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">{s.val}</div>
                  <div className="text-xs text-gray-400 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          LAW TICKER MARQUEE
      ═══════════════════════════════════════════════ */}
      <div className="bg-[#0a0a0a] py-3 overflow-hidden border-y border-white/5">
        <div className="flex gap-12 animate-ticker whitespace-nowrap">
          {tickerItems.map((item, i) => (
            <span key={i} className="text-xs font-bold text-teal-500/60 flex-shrink-0 tracking-wide uppercase">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          STATS COUNTER SECTION
      ═══════════════════════════════════════════════ */}
      <section className="bg-[#050505] py-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            <div className="group cursor-default p-4 rounded-2xl hover:bg-white/5 transition-colors duration-300 border border-transparent hover:border-white/5"><StatCard value={6} suffix="+" label="Indian Laws Covered" delay="0s" /></div>
            <div className="group cursor-default p-4 rounded-2xl hover:bg-white/5 transition-colors duration-300 border border-transparent hover:border-white/5"><StatCard value={500} suffix="+" label="Legal Q&A Scenarios" delay="0.15s" /></div>
            <div className="group cursor-default p-4 rounded-2xl hover:bg-white/5 transition-colors duration-300 border border-transparent hover:border-white/5"><StatCard value={2} suffix="" label="Languages Supported" delay="0.3s" /></div>
            <div className="group cursor-default p-4 rounded-2xl hover:bg-white/5 transition-colors duration-300 border border-transparent hover:border-white/5"><StatCard value={100} suffix="%" label="Source-Verified AI" delay="0.45s" /></div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          PHILOSOPHY BANNER
      ═══════════════════════════════════════════════ */}
      <section className="bg-[#111] border-y border-white/5 py-12 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-teal-900/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <blockquote className="text-xl sm:text-2xl font-bold text-gray-300 italic leading-relaxed mb-4">
            "{language === 'hi'
              ? 'उपयोगकर्ता को पहले कभी भी कठिन कानूनी भाषा समझने के लिए मजबूर न करें।'
              : 'Never make the user understand complicated legal language first.'}"
          </blockquote>
          <p className="text-xs text-teal-500/80 uppercase tracking-widest font-bold">
            — NYAYA Core Design Principle
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FEATURES GRID — 6 cards, scroll-triggered
      ═══════════════════════════════════════════════ */}
      <section ref={featRef} className="py-24 bg-[#0a0a0a] max-w-none px-4 sm:px-6 lg:px-8 border-y border-white/5 relative">
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-teal-900/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto">
          <div className={`text-center max-w-2xl mx-auto mb-16 transition-all duration-700 ${featInView ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
            <span className="inline-block px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-widest mb-4">
              Platform Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {language === 'hi' ? 'NYAYA कैसे मदद करता है' : 'Everything You Need'}
            </h2>
            <p className="text-base text-gray-400 mt-4 leading-relaxed font-light">
              {language === 'hi'
                ? 'RAG तकनीक द्वारा संचालित, आपके केस के लिए सटीक कानून और तुरंत नोटिस तैयार।'
                : 'AI-assisted legal retrieval tailored for ordinary Indian citizens, tenants, and workers.'}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {features.map((f, i) => (
              <div
                key={i}
                style={{ animationDelay: `${i * 0.1}s` }}
                className={`group bg-[#111] p-8 rounded-2xl border border-white/5 shadow-sm hover:shadow-[0_0_30px_rgba(20,184,166,0.1)] transition-all duration-500 hover:-translate-y-2 cursor-default hover:border-teal-500/30 ${featInView ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#222] border border-white/10 flex items-center justify-center text-3xl mb-6 shadow-inner group-hover:scale-110 group-hover:bg-teal-500/20 group-hover:border-teal-500/40 transition-all duration-300">
                  <span className="group-hover:drop-shadow-[0_0_8px_rgba(20,184,166,0.8)]">{f.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-200 mb-3 group-hover:text-teal-300 transition-colors">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          HOW IT WORKS — 3 steps
      ═══════════════════════════════════════════════ */}
      <section ref={stepsRef} className="bg-[#050505] py-24 overflow-hidden relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className={`text-center mb-20 transition-all duration-700 ${stepsInView ? 'animate-fade-in-down opacity-100' : 'opacity-0'}`}>
            <span className="inline-block px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-widest mb-4">
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {language === 'hi' ? '3 आसान कदम में नोटिस तैयार' : 'Get Your Notice in 3 Steps'}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-14 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-teal-500/0 via-teal-500/30 to-teal-500/0" />

            {steps.map((step, i) => (
              <div
                key={i}
                style={{ animationDelay: `${i * 0.2}s` }}
                className={`relative text-center group ${stepsInView ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}
              >
                <div className="relative inline-flex mb-8">
                  <div className="w-28 h-28 rounded-[2rem] bg-[#111] border border-white/10 flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(0,0,0,0.5)] group-hover:bg-[#151515] group-hover:border-teal-500/40 group-hover:scale-105 transition-all duration-500 backdrop-blur-sm z-10 relative">
                    <span className="group-hover:scale-110 transition-transform duration-300">{step.icon}</span>
                  </div>
                  <span className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full bg-teal-500/20 border border-teal-500/50 text-teal-300 text-sm font-black flex items-center justify-center shadow-lg z-20 backdrop-blur-md">
                    {step.num}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-200 mb-3 group-hover:text-teal-300 transition-colors">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto font-light">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SUPPORTED LAWS GRID
      ═══════════════════════════════════════════════ */}
      <section ref={lawsRef} className="py-24 bg-[#0a0a0a] border-t border-white/5 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className={`text-center max-w-2xl mx-auto mb-16 transition-all duration-700 ${lawsInView ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
            <span className="inline-block px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-widest mb-4">
              Legal Coverage
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {language === 'hi' ? 'शामिल कानूनी क्षेत्र' : 'Supported Legal Frameworks'}
            </h2>
            <p className="text-sm text-gray-500 mt-4 uppercase tracking-widest font-semibold">
              Uttar Pradesh & Pan-India Statutes
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {legalAreas.map((area, i) => (
              <div
                key={i}
                style={{ animationDelay: `${i * 0.08}s` }}
                className={`group bg-[#111] p-6 rounded-2xl border border-white/5 shadow-sm hover:shadow-[0_0_20px_rgba(20,184,166,0.1)] hover:bg-[#151515] hover:border-teal-500/30 transition-all duration-300 hover:-translate-y-1 flex items-center gap-5 ${lawsInView ? 'animate-scale-in opacity-100' : 'opacity-0'}`}
              >
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-2xl group-hover:bg-teal-500/20 transition-colors duration-300">
                  <span className="group-hover:scale-125 transition-transform duration-300">{area.icon}</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-200 group-hover:text-teal-300 transition-colors">{area.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{area.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FINAL CTA SECTION
      ═══════════════════════════════════════════════ */}
      <section ref={ctaRef} className="relative bg-[#050505] py-24 overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:40px_40px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className={`relative z-10 max-w-4xl mx-auto px-4 text-center transition-all duration-1000 ${ctaInView ? 'animate-fade-in-up opacity-100' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Ready to take <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500">Legal Action?</span>
          </h2>
          <p className="text-gray-400 mb-12 text-lg font-light max-w-2xl mx-auto">
            Create a formal notice or search through verified Indian laws instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              to={isAuthenticated ? '/grievance' : '/register'}
              className="group relative w-full sm:w-auto px-8 py-4 bg-teal-500/20 text-teal-300 font-semibold rounded-xl border border-teal-500/40 shadow-[0_0_20px_rgba(20,184,166,0.2)] hover:shadow-[0_0_40px_rgba(20,184,166,0.6)] hover:bg-teal-500/30 transition-all duration-300 backdrop-blur-md overflow-hidden hover:-translate-y-1"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <svg className="w-5 h-5 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                New Legal Draft
              </span>
              <div className="absolute inset-0 bg-teal-400/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </Link>
            
            <Link
              to={isAuthenticated ? '/search' : '/login'}
              className="group relative w-full sm:w-auto px-8 py-4 bg-[#111] hover:bg-[#1a1a1a] border border-gray-800 hover:border-teal-500/50 text-gray-300 font-medium rounded-xl transition-all duration-300 text-center hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(20,184,166,0.15)]"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-teal-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                Search Indian Laws
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════ */}
      <footer className="bg-black text-gray-500 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center shadow-[0_0_10px_rgba(20,184,166,0.3)]">
                <svg className="w-4 h-4 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </span>
              <span className="text-2xl font-black text-white tracking-tight">NYAYA</span>
              <span className="text-teal-500/80 font-bold text-base">न्याय</span>
            </div>
            
            {/* Replaced nav links with NYAYA Info */}
            <div className="text-center md:text-right max-w-md">
              <p className="text-sm font-medium text-gray-400 mb-1">Empowering citizens through AI and Verified Law.</p>
              <p className="text-xs text-gray-500">Delivering instant, tamper-proof legal drafts directly to your device.</p>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 text-center">
            {/* Movie Credits Style Tech Specs */}
            <div className="relative h-28 w-full overflow-hidden mb-8 max-w-xl mx-auto">
              {/* Fade Overlays */}
              <div className="absolute top-0 left-0 w-full h-10 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />
              
              <div className="absolute top-0 w-full animate-credits flex flex-col items-center gap-4 text-[10px] sm:text-xs font-mono text-teal-500/50 uppercase tracking-widest pt-4">
                <p>▶ Advanced RAG Pipeline Active</p>
                <p>▶ 9,000+ Indian Law Documents Ingested</p>
                <p>▶ BNS, BNSS, BSA, RTI & Consumer Acts Indexed</p>
                <p>▶ Vector Database Search by ChromaDB</p>
                <p>▶ Generative AI Drafting Integrated</p>
                <p>▶ High-Dimensional Semantic Search</p>
                <p>▶ Zero-Hallucination Verifiable Citations</p>
                <p>▶ Multi-lingual Processing Engine</p>
                <p>▶ End-to-End Legal Framework</p>
                <p>SYSTEM OPTIMAL.</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 max-w-2xl mx-auto leading-relaxed mb-4">
              {t('disclaimerFull')}
            </p>
            <div className="text-xs text-gray-700 tracking-wide">
              © {new Date().getFullYear()} NYAYA AI Legal Empowerment Platform. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
