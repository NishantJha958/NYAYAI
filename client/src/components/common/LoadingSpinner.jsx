export default function LoadingSpinner({ text = 'Loading...', size = 'md' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-6">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} border-nyaya-navy/20 border-t-nyaya-navy rounded-full animate-spin`}
      />
      {text && <p className="text-xs text-gray-500 font-medium tracking-wide">{text}</p>}
    </div>
  );
}
