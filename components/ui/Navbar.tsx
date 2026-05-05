'use client';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { useEffect } from 'react';

export default function Navbar() {
  const { user, setUser, setTeam, setLoading, logout } = useAuthStore();

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(({ user, team }) => {
      setUser(user); setTeam(team); setLoading(false);
    });
  }, []);

  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(8,8,16,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 22 }}>🍕</span>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>MPH</span>
        <span style={{ fontFamily: 'Space Mono', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginLeft: 2 }}>Hack</span>
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        <Link href="/#about" className="nav-link" style={{ display: 'none' }}>About</Link>
        <Link href="/#prizes" className="nav-link">Prizes</Link>
        <Link href="/#faq" className="nav-link">FAQ</Link>
        {user ? (
          <>
            <Link href={user.isAdmin ? '/admin' : '/dashboard'} style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--purple)', textDecoration: 'none' }}>
              {user.isAdmin ? '⚡ Admin' : '🚀 Dashboard'}
            </Link>
            <button onClick={logout} style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Logout</button>
          </>
        ) : (
          <>
            <Link href="/login" className="nav-link">Login</Link>
            <Link href="/register" style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)', color: 'white', padding: '8px 20px', borderRadius: 8, fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
