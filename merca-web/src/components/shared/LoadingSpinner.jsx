export default function LoadingSpinner({ text = 'Buscando en 3 supermercados...' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-slate-400">
      <div className="w-5 h-5 border-3 border-slate-600 border-t-merca-400 rounded-full animate-spin" />
      <span>{text}</span>
    </div>
  );
}
