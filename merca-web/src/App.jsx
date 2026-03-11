import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Search from './pages/Search';
import Product from './pages/Product';
import Canasta from './pages/Canasta';
import Category from './pages/Category';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/buscar" element={<Search />} />
          <Route path="/producto/:id" element={<Product />} />
          <Route path="/canasta" element={<Canasta />} />
          <Route path="/categoria/:slug" element={<Category />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
