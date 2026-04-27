import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await adminApi.login(form);
      navigate('/admin/dashboard');
    } catch {
      setError('Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <form className="glass-effect" onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 380, padding: '2rem', borderRadius: 'var(--medium-radius)' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Admin</h2>
        {error && <p style={{ color: '#ff6b6b', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required style={inputStyle} />
        <input type="password" placeholder="Contraseña" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required style={inputStyle} />
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.75rem', background: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '0.6rem 0.9rem', marginBottom: '0.75rem', background: 'rgba(255,255,255,0.07)', border: '1px solid var(--glass-border)', borderRadius: 8, color: 'var(--text-color)', fontSize: '0.95rem', display: 'block' };
