import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productoApi } from '../lib/api';
import useCartStore from '../store/cartStore';

export default function DetalleProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);

  const [selectedAlm, setSelectedAlm] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [added, setAdded] = useState(false);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['producto', id],
    queryFn: () => productoApi.getById(id).then((r) => r.data),
    enabled: !!id,
  });

  if (isLoading) return <div style={{ padding: '2rem', color: 'var(--text-muted-color)' }}>Cargando...</div>;
  if (isError || !product) return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p style={{ color: 'var(--text-muted-color)' }}>Producto no encontrado.</p>
      <button onClick={() => navigate('/tienda')} style={btnStyle}>← Volver a Tienda</button>
    </div>
  );

  const marca = product.Marca || product.marca || '';
  const modelo = product.Modelo || product.modelo || '';
  const imgBase64 = product.Img || product.img;
  const img = imgBase64 ? `data:image/webp;base64,${imgBase64}` : '/img/LOGO+CIRCULO.webp';
  const variantes = product.Variantes || product.variantes || [];

  const almOptions = [...new Set(variantes.map((v) => v.Almacenamiento || v.almacenamiento).filter(Boolean))];
  const colorOptions = [...new Set(
    variantes
      .filter((v) => !selectedAlm || (v.Almacenamiento || v.almacenamiento) === selectedAlm)
      .map((v) => v.Color || v.color)
      .filter(Boolean)
  )];

  const varianteSeleccionada = variantes.find((v) =>
    (v.Almacenamiento || v.almacenamiento) === selectedAlm &&
    (v.Color || v.color) === selectedColor
  );

  const handleAddCart = () => {
    if (!varianteSeleccionada) return;
    addItem(product, varianteSeleccionada);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    document.dispatchEvent(new CustomEvent('toggle-cart'));
  };

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: 900, margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} style={{ ...btnStyle, marginBottom: '1.5rem', fontSize: '0.9rem' }}>← Volver</button>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <figure style={{ flex: '0 0 300px', margin: 0 }}>
          <img src={img} alt={`${marca} ${modelo}`} style={{ width: '100%', borderRadius: 'var(--medium-radius)', objectFit: 'contain', maxHeight: 300 }} />
        </figure>

        <div style={{ flex: 1, minWidth: 260 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 0.25rem' }}>{marca}</h1>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 400, color: 'var(--text-muted-color)', margin: '0 0 1.5rem' }}>{modelo}</h2>

          {almOptions.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ marginBottom: '0.5rem', color: 'var(--text-muted-color)', fontSize: '0.9rem' }}>Almacenamiento</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {almOptions.map((a) => (
                  <button key={a} onClick={() => { setSelectedAlm(a); setSelectedColor(''); }} style={chipStyle(selectedAlm === a)}>{a}</button>
                ))}
              </div>
            </div>
          )}

          {colorOptions.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ marginBottom: '0.5rem', color: 'var(--text-muted-color)', fontSize: '0.9rem' }}>Color</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {colorOptions.map((c) => (
                  <button key={c} onClick={() => setSelectedColor(c)} style={chipStyle(selectedColor === c)}>{c}</button>
                ))}
              </div>
            </div>
          )}

          {varianteSeleccionada && (
            <p style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-color)', marginBottom: '1rem' }}>
              ${(varianteSeleccionada.Precio || varianteSeleccionada.precio || 0).toLocaleString()}
            </p>
          )}

          <button
            onClick={handleAddCart}
            disabled={!varianteSeleccionada}
            style={{
              padding: '0.75rem 2rem', background: varianteSeleccionada ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)',
              color: '#fff', border: 'none', borderRadius: 8, cursor: varianteSeleccionada ? 'pointer' : 'not-allowed',
              fontWeight: 600, fontSize: '1rem',
            }}
          >
            {added ? '✓ Agregado' : 'Agregar al carrito'}
          </button>
          {!varianteSeleccionada && <p style={{ color: 'var(--text-muted-color)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Seleccioná almacenamiento y color</p>}
        </div>
      </div>
    </div>
  );
}

const btnStyle = { background: 'rgba(255,255,255,0.07)', border: '1px solid var(--glass-border)', color: 'var(--text-color)', padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer' };
const chipStyle = (active) => ({
  padding: '0.4rem 1rem', borderRadius: 20,
  background: active ? 'var(--accent-color)' : 'rgba(255,255,255,0.07)',
  border: `1px solid ${active ? 'var(--accent-color)' : 'var(--glass-border)'}`,
  color: '#fff', cursor: 'pointer', fontSize: '0.9rem',
});
