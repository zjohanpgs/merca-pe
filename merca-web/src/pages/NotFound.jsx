import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <p className="text-6xl font-extrabold text-slate-700 mb-4">404</p>
      <p className="text-slate-400 mb-6">Esta pagina no existe.</p>
      <Link to="/" className="px-5 py-2.5 rounded-lg bg-merca-400 text-slate-900 font-semibold hover:bg-merca-300 transition-colors">
        Volver al inicio
      </Link>
    </div>
  );
}
