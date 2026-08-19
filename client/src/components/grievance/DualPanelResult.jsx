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
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-nyaya-navy/10 text-nyaya-navy font-bold text-xs rounded-md">
            {grievance.category}
          </span>
          <span className="text-xs text-gray-500 font-medium">
            Language: <strong className="text-gray-800">{grievance.language === 'hi' ? 'हिंदी (Devanagari)' : 'English'}</strong>
          </span>
        </div>
        <button
          type="button"
          onClick={handleDownloadPdf}
          className="inline-flex items-center gap-2 px-4 py-2 bg-nyaya-navy text-white text-xs font-semibold rounded-lg hover:bg-nyaya-blue shadow transition-colors"
        >
          <span>📥</span>
          <span>{t('downloadPdf')}</span>
        </button>
      </div>

      {/* Dual Panel Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Panel 1: Formal Legal Notice */}
        <div className="bg-white rounded-2xl border-2 border-nyaya-navy/20 p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-nyaya-navy flex items-center gap-2">
                <span>⚖️</span>
                <span>{labels?.legalDraft || t('legalDraft')}</span>
              </h3>
              <button
                type="button"
                onClick={handleCopyDraft}
                className="text-xs font-semibold text-nyaya-navy hover:text-nyaya-blue bg-nyaya-light hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors"
              >
                {copiedDraft ? `✓ ${t('copiedDraft')}` : `📋 ${t('copyDraft')}`}
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed bg-gray-50/70 p-4 rounded-xl border border-gray-100 max-h-[500px] overflow-y-auto">
              {grievance.legalDraft || 'No legal draft generated.'}
            </pre>
          </div>
        </div>

        {/* Panel 2: Simplified Plain Explanation */}
        <div className="bg-white rounded-2xl border-2 border-nyaya-gold/40 p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-amber-900 flex items-center gap-2">
                <span>📖</span>
                <span>{labels?.simpleExplanation || t('simpleExplanation')}</span>
              </h3>
              <button
                type="button"
                onClick={handleCopySimple}
                className="text-xs font-semibold text-amber-900 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-md transition-colors"
              >
                {copiedSimple ? `✓ ${t('copiedDraft')}` : '📋 Copy Simple Text'}
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed bg-amber-50/40 p-4 rounded-xl border border-amber-100/70 max-h-[500px] overflow-y-auto">
              {grievance.simplifiedExplanation || 'No simple explanation available.'}
            </pre>
          </div>
        </div>
      </div>

      {/* Referenced Statutes */}
      {grievance.statutes && grievance.statutes.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <h3 className="font-bold text-nyaya-navy flex items-center gap-2 text-base">
              <span>📚</span>
              <span>{labels?.statutes || t('statutes')}</span>
            </h3>
            <span className="text-xs font-semibold bg-nyaya-gold/20 text-nyaya-navy px-2.5 py-1 rounded-full">
              {grievance.statutes.length} Verified Sources
            </span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {grievance.statutes.map((s, i) => (
              <div
                key={i}
                className="text-sm bg-gray-50/90 rounded-xl p-4 border-l-4 border-nyaya-gold border-gray-200/80 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold text-nyaya-navy">
                    {s.act} {s.section && `— Section ${s.section}`}
                  </div>
                  {s.source && (
                    <span className="text-[10px] uppercase font-bold text-gray-400 bg-white px-2 py-0.5 rounded border">
                      {s.source}
                    </span>
                  )}
                </div>
                {s.title && <div className="text-xs font-semibold text-gray-600 mt-1">{s.title}</div>}
                {s.relevance && (
                  <p className="text-xs text-gray-600 mt-2 leading-normal line-clamp-3 hover:line-clamp-none transition-all">
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
