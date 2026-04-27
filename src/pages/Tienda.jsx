import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productoApi } from '../lib/api';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';

export default function Tienda() {
  const [search, setSearch] = useState('');
  const [marca, setMarca] = useState('');
  const [categoria, setCategoria] = useState('');

  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ['productos-tienda'],
    queryFn: async () => {
      const res = await productoApi.getPaged(1, 100, true);
      const data = res.data;
      return Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : [];
    },
  });

  const marcas = useMemo(() => [...new Set(products.map((p) => p.Marca || p.marca).filter(Boolean))].sort(), [products]);
  const categorias = useMemo(() => [...new Set(products.map((p) => p.Categoria || p.categoria).filter(Boolean))].sort(), [products]);

  const filtered = useMemo(() => products.filter((p) => {
    const modelo = (p.Modelo || p.modelo || '').toLowerCase();
    const pMarca = (p.Marca || p.marca || '').toLowerCase();
    const pCat = (p.Categoria || p.categoria || '').toLowerCase();
    const okSearch = !search || modelo.includes(search.toLowerCase()) || pMarca.includes(search.toLowerCase());
    const okMarca = !marca || pMarca === marca.toLowerCase();
    const okCat = !categoria || pCat === categoria.toLowerCase();
    return okSearch && okMarca && okCat;
  }), [products, search, marca, categoria]);

  // Agrupar por categoría
  const byCat = useMemo(() => {
    const map = new Map();
    filtered.forEach((p) => {
      const cat = p.Categoria || p.categoria || 'Otros';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(p);
    });
    return map;
  }, [filtered]);

  return (
    <div style={{ display: 'flex', gap: '1.5rem', padding: '2rem 1.5rem', alignItems: 'flex-start' }}>
      {/* Sidebar */}
      <aside className="glass-effect" style={{ width: 220, flexShrink: 0, padding: '1.25rem', borderRadius: 'var(--medium-radius)', position: 'sticky', top: 80 }}>
        <h3 style={{ marginBottom: '1rem' }}>Filtros</h3>

        <input
          type="search"
          placeholder="Buscar modelo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={inputStyle}
        />

        <select value={marca} onChange={(e) => setMarca(e.target.value)} style={inputStyle}>
          <option value="">Todas las marcas</option>
          {marcas.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
          <button className={!categoria ? 'chip-active' : ''} onClick={() => setCategoria('')} style={chipStyle(!categoria)}>Todos</button>
          {categorias.map((c) => (
            <button key={c} onClick={() => setCategoria(c === categoria ? '' : c)} style={chipStyle(c === categoria)}>{c}</button>
          ))}
        </div>
      </aside>

      {/* Grilla */}
      <section style={{ flex: 1 }}>
        {isLoading && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {Array.from({ length: 9 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        )}
        {isError && <p style={{ color: 'var(--text-muted-color)' }}>Error al cargar productos.</p>}
        {!isLoading && !isError && filtered.length === 0 && (
          <p style={{ color: 'var(--text-muted-color)' }}>No se encontraron productos.</p>
        )}
        {!isLoading && !isError && [...byCat.entries()].map(([cat, prods]) => (
          <div key={cat} style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>{cat}</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              {prods.map((p) => <ProductCard key={p.Id ?? p.id} product={p} />)}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '0.5rem 0.75rem', marginBottom: '0.75rem',
  background: 'rgba(255,255,255,0.07)', border: '1px solid var(--glass-border)',
  borderRadius: 8, color: 'var(--text-color)', fontSize: '0.9rem',
};

const chipStyle = (active) => ({
  padding: '0.4rem 0.75rem', borderRadius: 20,
  background: active ? 'var(--accent-color)' : 'rgba(255,255,255,0.07)',
  border: '1px solid var(--glass-border)', color: 'var(--text-color)',
  cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left',
});
