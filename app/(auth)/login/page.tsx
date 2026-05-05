'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Login failed'); return; }
      toast.success('Welcome back! 🍕');
      if (data.user.isAdmin) router.push('/admin');
      else router.push('/dashboard');
      router.refresh();
    } catch { toast.error('Something went wrong'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🍕</div>
          </Link>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 32, letterSpacing: '-0.02em', marginBottom: 8 }}>Welcome back</h1>
          <p style={{ fontFamily: 'Space Mono', fontSize: 12, color: 'var(--text-muted)' }}>sign in to your account</p>
        </div>

        <div className="glass-card" style={{ padding: 36 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label className="input-label">Email</label>
              <input className="input-field" type="email" placeholder="you@college.edu" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <label className="input-label">Password</label>
              <input className="input-field" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            </div>
            <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              {loading ? '⏳ Signing in...' : '→ Sign In'}
            </button>
          </form>

          {/* Google OAuth Button */}
          <div style={{ marginTop: 20 }}>
            <button
              type="button"
              onClick={handleGoogleLogin}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                padding: '12px 16px',
                background: '#fff',
                border: '1px solid #e5e5e5',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                color: '#333',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseOver={e => e.currentTarget.style.background = '#f5f5f5'}
              onMouseOut={e => e.currentTarget.style.background = '#fff'}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.802 5.956-2.18l-2.908-2.259c-.802.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.711A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.616.392 3.14 1.057 4.477l3.907-2.766z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.518.456 3.455 1.35l2.814-2.814A8.88 8.88 0 009 0 8.996 8.996 0 00.957 4.958L3.964 7.71C4.672 5.583 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </div>

          <div style={{ marginTop: 24, padding: '16px', background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.15)', borderRadius: 10 }}>
            <p style={{ fontFamily: 'Space Mono', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Admin credentials</p>
            <p style={{ fontFamily: 'Space Mono', fontSize: 12, color: 'var(--purple)' }}>admin@midnightpizza.com / admin123</p>
          </div>

          <p style={{ textAlign: 'center', marginTop: 24, fontFamily: 'Inter', fontSize: 14, color: 'var(--text-muted)' }}>
            No account? <Link href="/register" style={{ color: 'var(--purple)', textDecoration: 'none', fontWeight: 600 }}>Register your team →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
