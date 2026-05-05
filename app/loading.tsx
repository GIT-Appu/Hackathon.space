export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16, display: 'inline-block', animation: 'spin 1s linear infinite' }}>🍕</div>
        <p style={{ fontFamily: 'Space Mono', color: 'var(--text-muted)', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Loading...</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
