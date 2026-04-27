import { useState, useEffect } from 'react';
import useCartStore from '../store/cartStore';

export default function Cart() {
  const [open, setOpen] = useState(false);
  const { items, removeItem, updateQty, total } = useCartStore();

  useEffect(() => {
    const handler = () => setOpen((o) => !o);
    document.addEventListener('toggle-cart', handler);
    return () => document.removeEventListener('toggle-cart', handler);
  }, []);

  const sendWhatsApp = () => {
    if (!items.length) return;
    const lines = items.map((i) => `• ${i.marca} ${i.modelo} ${i.almacenamiento} ${i.color} x${i.qty} - $${i.precio * i.qty}`);
    const msg = `Hola Origami, me interesa cotizar:\n${lines.join('\n')}\nTotal: $${total}`;
    window.open(`https://wa.me/5491100000000?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999 }}>
      <div onClick={() => setOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
      <aside className="glass-effect" style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: 360,
        display: 'flex', flexDirection: 'column', padding: '1.5rem',
        borderLeft: '1px solid var(--glass-border)',
      }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>Tu carrito</h3>
          <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-color)', fontSize: '1.4rem', cursor: 'pointer' }}>×</button>
        </header>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {items.length === 0 ? (
            <p style={{ color: 'var(--text-muted-color)', textAlign: 'center', marginTop: '2rem' }}>El carrito está vacío</p>
          ) : items.map((item) => (
            <div key={item.key} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', padding: '0.75rem', borderRadius: 8, background: 'rgba(255,255,255,0.05)' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, margin: 0 }}>{item.marca} {item.modelo}</p>
                <p style={{ color: 'var(--text-muted-color)', fontSize: '0.85rem', margin: '2px 0' }}>{item.almacenamiento} · {item.color}</p>
                <p style={{ color: 'var(--accent-color)', fontWeight: 700, margin: 0 }}>${item.precio}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <button onClick={() => updateQty(item.key, item.qty + 1)} style={qtyBtn}>+</button>
                <span>{item.qty}</span>
                <button onClick={() => updateQty(item.key, item.qty - 1)} style={qtyBtn}>−</button>
              </div>
              <button onClick={() => removeItem(item.key)} style={{ background: 'none', border: 'none', color: 'rgba(255,80,80,0.8)', cursor: 'pointer', alignSelf: 'flex-start' }}>✕</button>
            </div>
          ))}
        </div>

        <footer style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span>Total</span>
            <strong>${total.toLocaleString()}</strong>
          </div>
          <button onClick={sendWhatsApp} style={{
            width: '100%', padding: '0.75rem', background: 'var(--accent-color)',
            color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer',
            fontWeight: 600, fontSize: '1rem',
          }}>
            Cotizar por WhatsApp
          </button>
        </footer>
      </aside>
    </div>
  );
}

const qtyBtn = {
  background: 'rgba(255,255,255,0.1)', border: 'none', color: 'var(--text-color)',
  borderRadius: 4, width: 24, height: 24, cursor: 'pointer', fontSize: '1rem',
};
