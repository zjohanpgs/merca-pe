import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '../components/shared/SEOHead';
import { websiteJsonLd } from '../utils/seo';

const QUICK_TAGS = ['Arroz', 'Leche Gloria', 'Aceite', 'Azucar', 'Pollo', 'Fideos', 'Atun', 'Huevos'];

export default function Home() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function handleSearch(e) {
    e.preventDefault();
    const q = query.trim();
    if (q) navigate(`/buscar?q=${encodeURIComponent(q)}`);
  }

  function quickSearch(tag) {
    navigate(`/buscar?q=${encodeURIComponent(tag)}`);
  }

  return (
    <div className="flex flex-col items-center pt-16 pb-20 px-4">
      <SEOHead jsonLd={websiteJsonLd()} />

      <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-3">
        Compara precios en{' '}
        <span className="text-merca-400">3 supermercados</span>
      </h1>
      <p className="text-slate-400 text-center text-lg mb-10 max-w-xl">
        Busca cualquier producto y compara precios al instante entre Metro y Plaza Vea.
      </p>

      <form onSubmit={handleSearch} className="w-full max-w-xl flex gap-2 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar producto... ej: arroz, leche, aceite"
          className="flex-1 px-5 py-3.5 rounded-xl bg-slate-800 border-2 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-merca-400 text-base transition-colors"
          autoFocus
        />
        <button
          type="submit"
          className="px-6 py-3.5 rounded-xl bg-merca-400 text-slate-900 font-bold text-base hover:bg-merca-300 transition-colors"
        >
          Buscar
        </button>
      </form>

      <div className="flex flex-wrap justify-center gap-2 max-w-xl">
        {QUICK_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => quickSearch(tag)}
            className="px-4 py-2 rounded-full border border-slate-700 bg-slate-800/50 text-slate-400 text-sm hover:border-merca-400 hover:text-merca-400 transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
