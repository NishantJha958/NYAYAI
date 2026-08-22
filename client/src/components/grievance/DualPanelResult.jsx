import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { exportLegalDraftPdf } from '../../utils/pdfExport.js';

export default function DualPanelResult({ grievance, labels }) {
  const { t, language } = useLanguage();
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [copiedSimple, setCopiedSimple] = useState(false);

  if (!grievance) return null;

  const handleCopyDraft = () => {
    if (!grievance.legalDraft) return;
    navigator.clipboard.writeText(grievance.legalDraft);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  const handleCopySimple = () => {
    if (!grievance.simplifiedExplanation) return;
    navigator.clipboard.writeText(grievance.simplifiedExplanation);
    setCopiedSimple(true);
    setTimeout(() => setCopiedSimple(false), 2000);
  };

  const handleDownloadPdf = () => {
    exportLegalDraftPdf({
      category: grievance.category,
      legalDraft: grievance.legalDraft,
      simplifiedExplanation: grievance.simplifiedExplanation,
      statutes: grievance.statutes,
      language: grievance.language || language,
      date: new Date(grievance.createdAt || Date.now()).toLocaleDateString(),
    });
  };

  return (
    <div className="space-y-6 mt-6">
      {/* Top action toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111] p-4 rounded-xl border border-white/5 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-teal-500/20 border border-teal-500/30 text-teal-400 font-bold text-xs rounded-md">
            {grievance.category}
          </span>
          <span className="text-xs text-gray-500 font-medium">
            Language: <strong className="text-gray-300">{grievance.language === 'hi' ? 'हिंदी (Devanagari)' : 'English'}</strong>
          </span>
        </div>
        <button
          type="button"
          onClick={handleDownloadPdf}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-semibold rounded-lg shadow-[0_0_15px_rgba(20,184,166,0.15)] transition-colors"
        >
          <span>📥</span>
          <span>{t('downloadPdf')}</span>
        </button>
      </div>

      {/* Dual Panel Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Panel 1: Formal Legal Notice */}
        <div className="bg-[#111] rounded-2xl border-2 border-teal-500/30 p-6 shadow-md flex flex-col justify-between hover:shadow-[0_0_20px_rgba(20,184,166,0.1)] transition-shadow">
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>⚖️</span>
                <span>{labels?.legalDraft || t('legalDraft')}</span>
              </h3>
              <button
                type="button"
                onClick={handleCopyDraft}
                className="text-xs font-semibold text-gray-300 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 px-3 py-1.5 rounded-md transition-colors"
              >
                {copiedDraft ? `✓ ${t('copiedDraft')}` : `📋 ${t('copyDraft')}`}
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-gray-300 font-sans leading-relaxed bg-[#0a0a0a] p-4 rounded-xl border border-white/5 shadow-inner max-h-[500px] overflow-y-auto">
              {grievance.legalDraft || 'No legal draft generated.'}
            </pre>
          </div>
        </div>

        {/* Panel 2: Simplified Plain Explanation */}
        <div className="bg-[#111] rounded-2xl border-2 border-cyan-500/30 p-6 shadow-md flex flex-col justify-between hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-shadow">
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <h3 className="text-base font-bold text-cyan-400 flex items-center gap-2">
                <span>📖</span>
                <span>{labels?.simpleExplanation || t('simpleExplanation')}</span>
              </h3>
              <button
                type="button"
                onClick={handleCopySimple}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 px-3 py-1.5 rounded-md transition-colors"
              >
                {copiedSimple ? `✓ ${t('copiedDraft')}` : '📋 Copy Simple Text'}
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-gray-300 font-sans leading-relaxed bg-[#0a0a0a] p-4 rounded-xl border border-cyan-500/10 shadow-inner max-h-[500px] overflow-y-auto">
              {grievance.simplifiedExplanation || 'No simple explanation available.'}
            </pre>
          </div>
        </div>
      </div>

      {/* Referenced Statutes */}
      {grievance.statutes && grievance.statutes.length > 0 && (
        <div className="bg-[#111] rounded-2xl border border-white/5 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
            <h3 className="font-bold text-white flex items-center gap-2 text-base">
              <span>📚</span>
              <span>{labels?.statutes || t('statutes')}</span>
            </h3>
            <span className="text-xs font-semibold bg-teal-500/20 border border-teal-500/30 text-teal-400 px-2.5 py-1 rounded-full">
              {grievance.statutes.length} Verified Sources
            </span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {grievance.statutes.map((s, i) => (
              <div
                key={i}
                className="text-sm bg-[#0a0a0a] rounded-xl p-4 border border-white/5 border-l-4 border-l-teal-500 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold text-teal-400">
                    {s.act} {s.section && `— Section ${s.section}`}
                  </div>
                  {s.source && (
                    <span className="text-[10px] uppercase font-bold text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                      {s.source}
                    </span>
                  )}
                </div>
                {s.title && <div className="text-xs font-semibold text-gray-400 mt-1">{s.title}</div>}
                {s.relevance && (
                  <p className="text-xs text-gray-500 mt-2 leading-normal line-clamp-3 hover:line-clamp-none transition-all">
                    {s.relevance}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
