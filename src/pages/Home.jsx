import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productoApi } from '../lib/api';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';

export default function Home() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['productos-home'],
    queryFn: async () => {
      const res = await productoApi.getPaged(1, 30, false);
      const data = res.data;
      return Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : [];
    },
  });

  const iphones = data?.filter((p) => (p.Marca || p.marca || '').toLowerCase() === 'apple').slice(0, 3) ?? [];
  const todos = data?.slice(0, 3) ?? [];

  return (
    <div style={{ padding: '2rem 1.5rem' }}>
      <Section title="Últimos iPhone" products={iphones} isLoading={isLoading} isError={isError} />
      <Section title="Nuestros Equipos" products={todos} isLoading={isLoading} isError={isError} />

      <section style={{ textAlign: 'center', padding: '3rem 1rem', marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>SOMOS ORIGAMI</h2>
        <p style={{ color: 'var(--text-muted-color)', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto' }}>
          Emprendimiento enfocado en la importación y venta de productos tecnológicos,
          insumos electrónicos y dispositivos móviles. Atención personalizada, productos
          originales y precios accesibles.
        </p>
      </section>
    </div>
  );
}

function Section({ title, products, isLoading, isError }) {
  return (
    <section style={{ marginBottom: '3rem' }}>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>{title}</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
        {isLoading && Array.from({ length: 3 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        {isError && <p style={{ color: 'var(--text-muted-color)' }}>No pudimos cargar los productos.</p>}
        {!isLoading && !isError && products.length === 0 && (
          <p style={{ color: 'var(--text-muted-color)' }}>No hay productos disponibles.</p>
        )}
        {products.map((p) => <ProductCard key={p.Id ?? p.id} product={p} />)}
      </div>
      {!isLoading && !isError && products.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/tienda" style={{
            display: 'inline-block', padding: '0.6rem 1.5rem',
            color: 'var(--text-color)', textDecoration: 'none',
            border: '1px solid var(--glass-border)', borderRadius: 8,
            transition: 'background 0.2s',
          }}>Ver más →</Link>
        </div>
      )}
    </section>
  );
}
