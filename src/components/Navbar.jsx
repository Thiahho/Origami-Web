import { Link, NavLink } from 'react-router-dom';
import useCartStore from '../store/cartStore';

export default function Navbar() {
  const count = useCartStore((s) => s.count);

  return (
    <nav className="navbar glass-effect" style={{
      position: 'sticky', top: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--glass-border)',
    }}>
      <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-color)', fontWeight: 700, fontSize: '1.2rem' }}>
        Origami
      </Link>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <NavLink to="/" end style={navStyle}>Home</NavLink>
        <NavLink to="/tienda" style={navStyle}>Tienda</NavLink>
        <NavLink to="/nosotros" style={navStyle}>Nosotros</NavLink>
      </div>

      <button
        onClick={() => document.dispatchEvent(new CustomEvent('toggle-cart'))}
        style={{ background: 'none', border: 'none', color: 'var(--text-color)', cursor: 'pointer', fontSize: '1.2rem', position: 'relative' }}
      >
        🛒 {count > 0 && (
          <span style={{
            position: 'absolute', top: -6, right: -8,
            background: 'var(--accent-color)', color: '#fff',
            borderRadius: '50%', width: 18, height: 18,
            fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{count}</span>
        )}
      </button>
    </nav>
  );
}

const navStyle = ({ isActive }) => ({
  color: isActive ? 'var(--accent-color)' : 'var(--text-muted-color)',
  textDecoration: 'none',
  fontWeight: isActive ? 600 : 400,
  transition: 'color 0.2s',
});
