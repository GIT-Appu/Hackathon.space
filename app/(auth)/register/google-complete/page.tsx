'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const EMPTY_MEMBER = { name: '', email: '', phone: '' };

export default function GoogleRegisterCompletePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    teamName: '',
    collegeName: '',
    leaderPhone: '',
    members: [{ ...EMPTY_MEMBER }],
  });

  const addMember = () => {
    if (form.members.length < 3) {
      setForm(f => ({ ...f, members: [...f.members, { ...EMPTY_MEMBER }] }));
    }
  };

  const removeMember = (i: number) => {
    setForm(f => ({ ...f, members: f.members.filter((_, idx) => idx !== i) }));
  };

  const updateMember = (i: number, field: string, val: string) => {
    setForm(f => ({
      ...f,
      members: f.members.map((m, idx) => idx === i ? { ...m, [field]: val } : m),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.teamName || !form.collegeName) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'google-user', // Will be overridden by session
          password: 'google-oauth',
          teamName: form.teamName,
          collegeName: form.collegeName,
          leaderName: 'Google User',
          leaderPhone: form.leaderPhone,
          members: form.members.filter(m => m.name && m.email),
          googleComplete: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Registration failed');
        return;
      }
      toast.success('Team registered! 🍕');
      router.push('/dashboard?payment=1');
      router.refresh();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { display: 'flex', flexDirection: 'column' as const, gap: 6 };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '80px 24px 40px' }}>
      <div style={{ width: '100%', maxWidth: 560 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🍕</div>
          </Link>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, letterSpacing: '-0.02em', marginBottom: 6 }}>Complete Your Registration</h1>
          <p style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--text-muted)' }}>Step 2 of 2 — Add your team details</p>
        </div>

        <div className="glass-card" style={{ padding: 36 }}>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24, textAlign: 'center' }}>
            Welcome! Your Google account is connected. Now complete your team details to finish registration.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={inputStyle}>
              <label className="input-label">Team Name *</label>
              <input
                className="input-field"
                placeholder="e.g. Null Pointers"
                value={form.teamName}
                onChange={e => setForm(f => ({ ...f, teamName: e.target.value }))}
                required
              />
            </div>

            <div style={inputStyle}>
              <label className="input-label">College / University *</label>
              <input
                className="input-field"
                placeholder="e.g. Model Engineering College"
                value={form.collegeName}
                onChange={e => setForm(f => ({ ...f, collegeName: e.target.value }))}
                required
              />
            </div>

            <div style={inputStyle}>
              <label className="input-label">Phone Number *</label>
              <input
                className="input-field"
                placeholder="+91 98765..."
                value={form.leaderPhone}
                onChange={e => setForm(f => ({ ...f, leaderPhone: e.target.value }))}
                required
              />
            </div>

            <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 16, color: 'var(--text-secondary)' }}>Team Members (Optional)</h3>
              <span style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--text-muted)' }}>{form.members.length + 1}/4 members</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: -8 }}>Add up to 3 more members.</p>

            {form.members.map((m, i) => (
              <div key={i} className="glass-card" style={{ padding: 20, border: '1px solid rgba(168,85,247,0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Member {i + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeMember(i)}
                    style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={inputStyle}>
                    <label className="input-label">Name</label>
                    <input
                      className="input-field"
                      placeholder="Full name"
                      value={m.name}
                      onChange={e => updateMember(i, 'name', e.target.value)}
                    />
                  </div>
                  <div style={inputStyle}>
                    <label className="input-label">Email</label>
                    <input
                      className="input-field"
                      type="email"
                      placeholder="member@college.edu"
                      value={m.email}
                      onChange={e => updateMember(i, 'email', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            {form.members.length < 3 && (
              <button
                type="button"
                onClick={addMember}
                style={{
                  padding: '12px 16px',
                  background: 'rgba(168,85,247,0.1)',
                  border: '1px dashed rgba(168,85,247,0.3)',
                  borderRadius: 8,
                  color: 'var(--purple)',
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                + Add Member
              </button>
            )}

            <button className="btn-primary" type="submit" disabled={loading} style={{ justifyContent: 'center', marginTop: 8 }}>
              {loading ? '⏳ Registering...' : 'Complete Registration →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}