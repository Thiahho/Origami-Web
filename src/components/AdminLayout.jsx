import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { adminApi } from '../lib/api';

const links = [
  { to: 'dashboard', label: 'Dashboard' },
  { to: 'products', label: 'Productos' },
  { to: 'variants', label: 'Variantes' },
  { to: 'categories', label: 'Categorías' },
  { to: 'marcas', label: 'Marcas' },
  { to: 'condiciones', label: 'Condiciones' },
  { to: 'orders', label: 'Pedidos' },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await adminApi.logout().catch(() => {});
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside className="glass-effect" style={{ width: 220, flexShrink: 0, padding: '1.5rem', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Panel Admin</h2>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} style={({ isActive }) => ({
              padding: '0.5rem 0.75rem', borderRadius: 8, textDecoration: 'none',
              color: isActive ? 'var(--accent-color)' : 'var(--text-muted-color)',
              background: isActive ? 'rgba(124,106,247,0.1)' : 'transparent',
              fontWeight: isActive ? 600 : 400,
            })}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <button onClick={handleLogout} style={{ background: 'none', border: '1px solid var(--glass-border)', color: 'var(--text-muted-color)', padding: '0.5rem', borderRadius: 8, cursor: 'pointer' }}>
          Salir
        </button>
      </aside>
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
