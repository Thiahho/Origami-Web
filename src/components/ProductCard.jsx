import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const marca = product.Marca || product.marca || '';
  const modelo = product.Modelo || product.modelo || '';
  const categoria = product.Categoria || product.categoria || '';
  const imgBase64 = product.Img || product.img;
  const img = imgBase64 ? `data:image/webp;base64,${imgBase64}` : '/img/LOGO+CIRCULO.webp';
  const id = product.Id ?? product.id;
  const variantes = product.Variantes || product.variantes || [];
  const basePrice = variantes.length
    ? Math.min(...variantes.map((v) => v.Precio ?? v.precio ?? 0))
    : null;

  return (
    <article
      className="glass-effect card"
      onClick={() => navigate(`/producto/${id}`)}
      style={{
        flex: '0 0 260px', padding: '1.5rem', borderRadius: 'var(--medium-radius)',
        cursor: 'pointer', transition: 'transform 0.2s, border-color 0.2s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0, color: 'var(--text-color)' }}>{marca}</h3>
        <p style={{ fontSize: '0.95rem', margin: 0, color: 'var(--text-muted-color)' }}>{modelo}</p>
      </div>
      <figure style={{ margin: '0 0 1rem', textAlign: 'center' }}>
        <img src={img} alt={`${marca} ${modelo}`} loading="lazy" width={200} height={200}
          style={{ objectFit: 'contain', maxHeight: 200, width: '100%' }} />
      </figure>
      <p style={{ color: 'var(--text-muted-color)', fontSize: '0.85rem', textAlign: 'center', marginBottom: '0.5rem' }}>
        {categoria}
      </p>
      {basePrice != null && (
        <p style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-color)' }}>
          ${basePrice.toLocaleString()}
        </p>
      )}
    </article>
  );
}

export function ProductCardSkeleton() {
  const shimmer = { background: 'rgba(255,255,255,0.08)', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite' };
  return (
    <div className="glass-effect" style={{ flex: '0 0 260px', padding: '1.5rem', borderRadius: 'var(--medium-radius)' }}>
      <div style={{ ...shimmer, height: 20, width: '60%', margin: '0 auto 8px' }} />
      <div style={{ ...shimmer, height: 14, width: '80%', margin: '0 auto 16px' }} />
      <div style={{ ...shimmer, height: 200, width: '100%', marginBottom: 16 }} />
      <div style={{ ...shimmer, height: 14, width: '40%', margin: '0 auto 8px' }} />
      <div style={{ ...shimmer, height: 20, width: '30%', margin: '0 auto' }} />
    </div>
  );
}
