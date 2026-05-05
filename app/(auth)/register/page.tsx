'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const EMPTY_MEMBER = { name: '', email: '', phone: '' };

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    teamName: '', collegeName: '',
    leaderName: '', email: '', phone: '', password: '', confirmPassword: '',
    members: [{ ...EMPTY_MEMBER }],
  });

  const addMember = () => { if (form.members.length < 3) setForm(f => ({ ...f, members: [...f.members, { ...EMPTY_MEMBER }] })); };
  const removeMember = (i: number) => setForm(f => ({ ...f, members: f.members.filter((_, idx) => idx !== i) }));
  const updateMember = (i: number, field: string, val: string) => setForm(f => ({ ...f, members: f.members.map((m, idx) => idx === i ? { ...m, [field]: val } : m) }));

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password, teamName: form.teamName, collegeName: form.collegeName, leaderName: form.leaderName, leaderPhone: form.phone, members: form.members.filter(m => m.name && m.email) }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Registration failed'); return; }
      toast.success('Team registered! 🍕 Proceeding to payment...');
      router.push('/dashboard?payment=1');
      router.refresh();
    } catch { toast.error('Something went wrong'); }
    finally { setLoading(false); }
  };

  const handleGoogleRegister = () => {
    window.location.href = '/api/auth/google';
  };

  const inputStyle = { display: 'flex', flexDirection: 'column' as const, gap: 6 };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '80px 24px 40px' }}>
      <div style={{ width: '100%', maxWidth: 560 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link href="/" style={{ textDecoration: 'none' }}><div style={{ fontSize: 40, marginBottom: 10 }}>🍕</div></Link>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, letterSpacing: '-0.02em', marginBottom: 6 }}>Register Your Team</h1>
          <p style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--text-muted)' }}>Step {step} of 2</p>
        </div>

        {/* Google OAuth Option */}
        {step === 1 && (
          <div className="glass-card" style={{ padding: 36, marginBottom: 24 }}>
            <p style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, textAlign: 'center' }}>Quick register with Google</p>
            <button
              type="button"
              onClick={handleGoogleRegister}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                padding: '14px 16px',
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
            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-muted)' }}>
              Or <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--purple)', cursor: 'pointer', fontWeight: 600 }}>register with email →</button>
            </p>
          </div>
        )}

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {[1, 2].map(s => (
            <div key={s} style={{ flex: 1, height: 3, borderRadius: 3, background: s <= step ? 'var(--purple)' : 'rgba(255,255,255,0.08)', transition: 'background 0.3s' }} />
          ))}
        </div>

        <div className="glass-card" style={{ padding: 36 }}>
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, marginBottom: 4 }}>Team Details</h2>
              <div style={inputStyle}><label className="input-label">Team Name</label><input className="input-field" placeholder="e.g. Null Pointers" value={form.teamName} onChange={e => setForm(f => ({ ...f, teamName: e.target.value }))} /></div>
              <div style={inputStyle}><label className="input-label">College / University</label><input className="input-field" placeholder="e.g. Model Engineering College" value={form.collegeName} onChange={e => setForm(f => ({ ...f, collegeName: e.target.value }))} /></div>
              <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 16, color: 'var(--text-secondary)' }}>Team Leader</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={inputStyle}><label className="input-label">Full Name</label><input className="input-field" placeholder="Your name" value={form.leaderName} onChange={e => setForm(f => ({ ...f, leaderName: e.target.value }))} /></div>
                <div style={inputStyle}><label className="input-label">Phone</label><input className="input-field" placeholder="+91 98765..." value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              </div>
              <div style={inputStyle}><label className="input-label">Email</label><input className="input-field" type="email" placeholder="leader@college.edu" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={inputStyle}><label className="input-label">Password</label><input className="input-field" type="password" placeholder="Min. 6 chars" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></div>
                <div style={inputStyle}><label className="input-label">Confirm Password</label><input className="input-field" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} /></div>
              </div>
              <button className="btn-primary" style={{ justifyContent: 'center', marginTop: 8 }} disabled={!form.teamName || !form.leaderName || !form.email || !form.password} onClick={() => setStep(2)}>Continue →</button>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20 }}>Team Members</h2>
                <span style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--text-muted)' }}>{form.members.length + 1}/4 members</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: -8 }}>Leader already included. Add up to 3 more members.</p>

              {form.members.map((m, i) => (
                <div key={i} className="glass-card" style={{ padding: 20, border: '1px solid rgba(168,85,247,0.15)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Member {i + 1}</span>
                    <button onClick={() => removeMember(i)} style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={inputStyle}><label className="input-label">Name</label><input className="input-field" placeholder="Full name" value={m.name} onChange={e => updateMember(i, 'name', e.target.value)} /></div>
                    <div style={inputStyle}><label className="input-label">Email</label><input className="input-field" type="email" placeholder="member@college.edu" value={m.email} onChange={e => updateMember(i, 'email', e.target.value)} /></div>
                  </div>
                </div>
              ))}

              {form.members.length < 3 && (
                <button className="btn-ghost" onClick={addMember} style={{ justifyContent: 'center' }}>+ Add Member</button>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
                <button className="btn-ghost" onClick={() => setStep(1)} style={{ justifyContent: 'center' }}>← Back</button>
                <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ justifyContent: 'center' }}>
                  {loading ? '⏳ Registering...' : '🚀 Register Team'}
                </button>
              </div>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
          Already registered? <Link href="/login" style={{ color: 'var(--purple)', textDecoration: 'none' }}>Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
