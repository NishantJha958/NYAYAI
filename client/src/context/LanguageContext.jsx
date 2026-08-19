import { createContext, useContext, useMemo, useState } from 'react';

const LanguageContext = createContext(null);

const LABELS = {
  en: {
    brandName: 'NYAYA',
    brandTagline: 'AI Legal Empowerment Platform for Indian Citizens',
    heroTitle: 'Understand Your Legal Rights Without The Jargon',
    heroSubtitle:
      'Describe your problem naturally in simple Hindi or English. NYAYA retrieves verified laws, creates structured legal notices, and explains everything in clear everyday language.',
    heroCtaPrimary: 'Understand Your Rights',
    heroCtaSecondary: 'Ask NYAYA AI',
    disclaimerShort:
      'NYAYA provides AI-assisted legal information and drafting support. It is not a substitute for advice from a qualified advocate.',
    disclaimerFull:
      'NYAYA provides AI-assisted legal information and drafting support. It is not a substitute for advice from a qualified advocate. Legal rules and procedures may change, so verify important matters with official sources or a qualified legal professional.',
    navHome: 'Home',
    navDashboard: 'Dashboard',
    navGrievance: 'New Grievance',
    navMyGrievances: 'My Grievances',
    navChatbot: 'AI Legal Assistant',
    navSearch: 'Legal Search',
    navProfile: 'Profile',
    navLogin: 'Sign In',
    navRegister: 'Create Account',
    navLogout: 'Sign Out',
    authSignInTitle: 'Sign In to NYAYA',
    authSignUpTitle: 'Create your NYAYA Account',
    authEmail: 'Email Address',
    authPassword: 'Password',
    authName: 'Full Name',
    authPreferredLang: 'Preferred Language',
    authNoAccount: "Don't have an account?",
    authHaveAccount: 'Already have an account?',
    authSignInBtn: 'Sign In',
    authSignUpBtn: 'Create Account',
    dashOverview: 'Overview',
    dashWelcome: 'Welcome back',
    dashRecentGrievances: 'Recent Grievances',
    dashNoGrievances: 'No grievances filed yet. Create your first legal draft today.',
    dashTotalGrievances: 'Total Grievances',
    dashActiveDrafts: 'Legal Notices',
    dashStatutesReferenced: 'Statutes Queried',
    dashQuickActions: 'Quick Actions',
    dashNewDraftBtn: 'File New Grievance',
    dashStartChatBtn: 'Ask Legal AI',
    dashSearchLawsBtn: 'Explore Indian Laws',
    grievanceTitle: 'Describe Your Legal Issue',
    grievanceSubtitle:
      'Write your problem in plain language. NYAYA will search verified Indian statutes and generate both a formal legal notice and a simple explanation.',
    grievanceCategory: 'Category',
    grievanceDescription: 'Problem Description',
    grievancePlaceholder:
      'e.g. My landlord has not returned my security deposit of ₹50,000 for 6 months after vacating the apartment...',
    grievanceDetails: 'Additional Details (Optional dates, amounts, notices sent)',
    grievanceDetailsPlaceholder: 'e.g. Agreement signed in Jan 2024, vacated June 2024...',
    grievanceSubmit: 'Analyze & Generate Draft',
    grievanceProcessing: 'Retrieving Verified Laws & Drafting...',
    grievanceStatus: 'Status',
    grievanceDate: 'Created Date',
    legalDraft: 'Formal Legal Notice',
    simpleExplanation: 'Simple Explanation',
    statutes: 'Referenced Indian Statutes',
    nextSteps: 'What To Do Next',
    copyDraft: 'Copy Legal Notice',
    copiedDraft: 'Copied!',
    downloadPdf: 'Download PDF',
    chatTitle: 'AI Legal Assistant',
    chatSubtitle: 'Ask questions about Indian law, procedures, consumer complaints, or tenancy rules.',
    chatPlaceholder: 'Ask a legal question in Hindi or English...',
    chatSend: 'Send Query',
    chatSending: 'Searching statutes & answering...',
    chatClear: 'New Session',
    chatDisclaimer:
      'Answers are generated strictly from verified legal context. Always verify with an advocate before taking court action.',
    searchTitle: 'Semantic Legal Knowledge Search',
    searchSubtitle: 'Search BNS, BNSS, BSA, RTI, Consumer Protection, and UP state laws.',
    searchPlaceholder: 'e.g. Rights of tenant regarding security deposit refund...',
    searchFilterState: 'Filter by State / Jurisdiction',
    searchFilterAct: 'Filter by Act / Law',
    searchButton: 'Search Statutes',
    searchSearching: 'Searching Vector Database...',
    searchResultsFound: 'Statutes & Sections Found',
    searchNoResults: 'No statutes found matching your criteria.',
    profileTitle: 'User Profile & Settings',
    profileName: 'Name',
    profileEmail: 'Email',
    profileLanguagePref: 'Default Language Preference',
    profileSave: 'Save Changes',
    profileSaved: 'Profile updated successfully',
    serverOnline: 'Gateway Online',
    serverOffline: 'Gateway Offline',
    loading: 'Loading...',
  },
  hi: {
    brandName: 'NYAYA (न्याय)',
    brandTagline: 'भारतीय नागरिकों के लिए AI कानूनी सशक्तिकरण मंच',
    heroTitle: 'कठिन कानूनी भाषा समझे बिना अपने अधिकार जानें',
    heroSubtitle:
      'अपनी समस्या सामान्य हिंदी या अंग्रेज़ी में लिखें। NYAYA सत्यापित कानूनों की खोज करेगा, औपचारिक कानूनी नोटिस तैयार करेगा और आसान भाषा में समझाएगा।',
    heroCtaPrimary: 'अपने अधिकार जानें',
    heroCtaSecondary: 'AI से कानूनी सलाह पूछें',
    disclaimerShort:
      'NYAYA AI-सहायता प्राप्त कानूनी जानकारी और मसौदा प्रदान करता है। यह योग्य अधिवक्ता की सलाह का विकल्प नहीं है।',
    disclaimerFull:
      'NYAYA AI-सहायता प्राप्त कानूनी जानकारी और प्रारूपण सहायता प्रदान करता है। यह किसी योग्य वकील की सलाह का विकल्प नहीं है। कानूनी नियम और प्रक्रियाएं बदल सकती हैं, इसलिए महत्वपूर्ण मामलों की पुष्टि आधिकारिक स्रोतों या किसी योग्य वकील से करें।',
    navHome: 'होम',
    navDashboard: 'डैशबोर्ड',
    navGrievance: 'नई शिकायत दर्ज करें',
    navMyGrievances: 'मेरी शिकायतें',
    navChatbot: 'AI कानूनी सहायक',
    navSearch: 'कानूनी खोज',
    navProfile: 'प्रोफ़ाइल',
    navLogin: 'लॉग इन करें',
    navRegister: 'खाता बनाएं',
    navLogout: 'लॉग आउट',
    authSignInTitle: 'NYAYA में लॉग इन करें',
    authSignUpTitle: 'नया NYAYA खाता बनाएं',
    authEmail: 'ईमेल पता',
    authPassword: 'पासवर्ड',
    authName: 'पूरा नाम',
    authPreferredLang: 'पसंदीदा भाषा',
    authNoAccount: 'खाता नहीं है?',
    authHaveAccount: 'पहले से खाता है?',
    authSignInBtn: 'लॉग इन करें',
    authSignUpBtn: 'खाता बनाएं',
    dashOverview: 'अवलोकन',
    dashWelcome: 'स्वागत है',
    dashRecentGrievances: 'हाल की शिकायतें',
    dashNoGrievances: 'अभी तक कोई शिकायत दर्ज नहीं है। आज ही अपना पहला कानूनी मसौदा बनाएं।',
    dashTotalGrievances: 'कुल शिकायतें',
    dashActiveDrafts: 'कानूनी नोटिस',
    dashStatutesReferenced: 'खोजे गए कानून',
    dashQuickActions: 'त्वरित कार्रवाई',
    dashNewDraftBtn: 'नई शिकायत दर्ज करें',
    dashStartChatBtn: 'कानूनी AI से पूछें',
    dashSearchLawsBtn: 'भारतीय कानून खोजें',
    grievanceTitle: 'अपनी कानूनी समस्या बताएं',
    grievanceSubtitle:
      'अपनी समस्या सामान्य बोलचाल में लिखें। NYAYA सत्यापित भारतीय धाराओं की खोज करके औपचारिक नोटिस और आसान व्याख्या दोनों तैयार करेगा।',
    grievanceCategory: 'श्रेणी',
    grievanceDescription: 'समस्या का विवरण',
    grievancePlaceholder:
      'उदा. मेरे मकान मालिक ने 6 महीने से सिक्योरिटी डिपॉजिट (50,000 रुपये) वापस नहीं किया है...',
    grievanceDetails: 'अतिरिक्त विवरण (तारीख, राशि, भेजी गई सूचना आदि)',
    grievanceDetailsPlaceholder: 'उदा. जनवरी 2024 में अनुबंध हुआ, जून 2024 में कमरा खाली किया...',
    grievanceSubmit: 'विश्लेषण करें और मसौदा बनाएं',
    grievanceProcessing: 'सत्यापित कानून खोजे जा रहे हैं और मसौदा तैयार हो रहा है...',
    grievanceStatus: 'स्थिति',
    grievanceDate: 'तारीख',
    legalDraft: '⚖️ औपचारिक कानूनी नोटिस',
    simpleExplanation: '📖 आसान भाषा में व्याख्या',
    statutes: '📚 संदर्भित भारतीय धाराएँ एवं कानून',
    nextSteps: '🔜 आगे क्या करें (कदम)',
    copyDraft: 'नोटिस कॉपी करें',
    copiedDraft: 'कॉपी हो गया!',
    downloadPdf: 'PDF डाउनलोड करें',
    chatTitle: 'AI कानूनी सहायक',
    chatSubtitle: 'भारतीय कानून, पुलिस शिकायत, उपभोक्ता फोरम या किरायेदारी नियमों पर सवाल पूछें।',
    chatPlaceholder: 'हिंदी या अंग्रेज़ी में अपना कानूनी सवाल पूछें...',
    chatSend: 'पूछें',
    chatSending: 'धाराएं खोजी जा रही हैं...',
    chatClear: 'नया सत्र',
    chatDisclaimer:
      'सभी उत्तर केवल सत्यापित कानूनी संदर्भ के आधार पर दिए जाते हैं। कोर्ट कार्रवाई से पहले वकील से पुष्टि करें।',
    searchTitle: 'भारतीय कानून खोज (Semantic Legal Search)',
    searchSubtitle: 'BNS, BNSS, BSA, RTI, उपभोक्ता संरक्षण और UP राज्य कानून खोजें।',
    searchPlaceholder: 'उदा. सिक्योरिटी डिपॉजिट वापसी पर किरायेदार के कानूनी अधिकार...',
    searchFilterState: 'राज्य / क्षेत्राधिकार चुनें',
    searchFilterAct: 'कानून / अधिनियम चुनें',
    searchButton: 'कानून खोजें',
    searchSearching: 'खोज जारी है...',
    searchResultsFound: 'प्रासंगिक धाराएँ और प्रावधान मिले',
    searchNoResults: 'कोई प्रासंगिक धारा नहीं मिली।',
    profileTitle: 'उपयोगकर्ता प्रोफ़ाइल और सेटिंग्स',
    profileName: 'नाम',
    profileEmail: 'ईमेल',
    profileLanguagePref: 'डिफ़ॉल्ट भाषा प्राथमिकता',
    profileSave: 'सेव करें',
    profileSaved: 'प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई',
    serverOnline: 'सर्वर चालू है',
    serverOffline: 'सर्वर बंद है',
    loading: 'लोड हो रहा है...',
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('nyaya_lang') || 'en';
  });

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('nyaya_lang', lang);
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage: changeLanguage,
      t: (key) => LABELS[language]?.[key] || LABELS.en[key] || key,
      labels: LABELS[language] || LABELS.en,
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
