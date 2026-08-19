import { useLanguage } from '../../context/LanguageContext.jsx';

export default function DisclaimerBanner({ compact = false }) {
  const { t } = useLanguage();

  return (
    <div
      className={`bg-amber-50 border border-amber-200/80 rounded-xl ${
        compact ? 'p-3 text-xs' : 'p-4 text-sm'
      } text-amber-900 flex items-start gap-3 shadow-sm`}
    >
      <span className="text-lg leading-none mt-0.5">⚠️</span>
      <div className="leading-relaxed">
        <strong className="font-semibold">{compact ? 'Legal Notice: ' : 'Legal Disclaimer: '}</strong>
        {compact ? t('disclaimerShort') : t('disclaimerFull')}
      </div>
    </div>
  );
}
