export default function Footer() {
  return (
    <footer className="glass-effect" style={{
      textAlign: 'center', padding: '1.5rem',
      marginTop: '4rem', color: 'var(--text-muted-color)',
      fontSize: '0.9rem', borderTop: '1px solid var(--glass-border)',
    }}>
      <p>© {new Date().getFullYear()} Origami Importados. Todos los derechos reservados.</p>
    </footer>
  );
}
