'use client';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
      <div style={{ fontSize: 80, marginBottom: 16 }}>🍕</div>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 64, letterSpacing: '-0.04em', marginBottom: 8 }}>
        <span className="gradient-text">404</span>
      </h1>
      <p style={{ fontFamily: 'Space Mono', fontSize: 13, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 32 }}>
        This slice doesn't exist
      </p>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <button className="btn-primary">← Back to Home</button>
      </Link>
    </div>
  );
}
