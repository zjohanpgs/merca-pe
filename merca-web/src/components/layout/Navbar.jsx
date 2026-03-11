import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCanasta } from '../../hooks/useCanasta';

export default function Navbar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { items } = useCanasta();
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  function handleSearch(e) {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      navigate(`/buscar?q=${encodeURIComponent(q)}`);
      setQuery('');
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl font-extrabold text-white">
            Merca<span className="text-merca-400">.pe</span>
          </span>
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-lg hidden sm:flex">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar producto..."
            className="w-full px-4 py-2 rounded-l-lg bg-slate-800 border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-merca-400 text-sm"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-r-lg bg-merca-400 text-slate-900 font-semibold text-sm hover:bg-merca-300 transition-colors"
          >
            Buscar
          </button>
        </form>

        <div className="flex items-center gap-3 ml-auto">
          <Link
            to="/canasta"
            className="relative p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
            title="Mi Canasta"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-merca-400 text-slate-900 text-xs font-bold flex items-center justify-center">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
