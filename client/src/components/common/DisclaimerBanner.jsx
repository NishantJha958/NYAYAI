import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function DisclaimerBanner({ compact = false }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="w-full mb-2">
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#111] hover:bg-[#151515] border border-white/5 hover:border-teal-500/30 rounded-full text-xs text-gray-400 hover:text-teal-300 transition-all shadow-sm"
        >
          <span>⚠️</span>
          <span className="font-semibold tracking-wide">Legal Notice (Click to read)</span>
        </button>
      ) : (
        <div
          className={`bg-[#0a0a0a] border border-teal-500/20 rounded-xl p-4 text-sm text-gray-300 flex items-start gap-3 shadow-[0_0_15px_rgba(20,184,166,0.05)] relative animate-fade-in-down`}
        >
          <span className="text-lg leading-none mt-0.5">⚠️</span>
          <div className="leading-relaxed pr-6">
            <strong className="font-semibold text-teal-400">Legal Disclaimer: </strong>
            {compact ? t('disclaimerShort') : t('disclaimerFull')}
          </div>
          <button
            onClick={() => setExpanded(false)}
            className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
