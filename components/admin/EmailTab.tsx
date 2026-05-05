'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface Team { leaderEmail: string; paymentStatus: string; submissionStatus: string; }

export default function EmailTab({ teams }: { teams: Team[] }) {
  const [form, setForm] = useState({ subject: '', message: '', recipientFilter: 'all' });
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<{ sent: number; recipients: string[] } | null>(null);

  const recipientCount = teams.filter(t => {
    if (form.recipientFilter === 'paid') return t.paymentStatus === 'paid';
    if (form.recipientFilter === 'unpaid') return t.paymentStatus !== 'paid';
    if (form.recipientFilter === 'submitted') return t.submissionStatus === 'submitted';
    return true;
  }).length;

  const send = async () => {
    if (!form.subject.trim() || !form.message.trim()) { toast.error('Subject and message required'); return; }
    if (recipientCount === 0) { toast.error('No recipients match the filter'); return; }
    setSending(true);
    try {
      const res = await fetch('/api/admin/email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Email sent to ${data.sent} teams! 📧`);
        setLastResult(data);
        setForm(f => ({ ...f, subject: '', message: '' }));
      } else toast.error(data.error || 'Failed to send');
    } catch { toast.error('Network error'); }
    finally { setSending(false); }
  };

  const TEMPLATES = [
    { label: '🔔 Deadline Reminder', subject: 'Reminder: Submission deadline approaching!', message: `Hi team!\n\nThis is a friendly reminder that the submission deadline for Midnight Pizza Hack is approaching fast.\n\nMake sure to submit your:\n• Demo video link\n• GitHub repo / ZIP\n• PDF report\n\nLog in to your dashboard to submit: ${process.env.NEXT_PUBLIC_APP_URL || 'https://midnightpizzahack.dev'}/dashboard\n\nGood luck! 🍕\n— MPH Team` },
    { label: '🌙 Problem Revealed', subject: '🔓 Problem Statement is now LIVE!', message: `The moment you\'ve been waiting for...\n\nThe Midnight Pizza Hack problem statement is now LIVE on your dashboard!\n\nLog in now and start building: ${process.env.NEXT_PUBLIC_APP_URL || 'https://midnightpizzahack.dev'}/dashboard\n\nYou have 24 hours. Code. Eat. Repeat. 🍕\n— MPH Team` },
    { label: '🎉 Winners Announced', subject: '🏆 Midnight Pizza Hack — Winners Announced!', message: `The results are in!\n\nThank you to every team that participated in Midnight Pizza Hack. The energy was incredible.\n\nWinner announcements are live on our platform. Check your dashboard for scores and rankings.\n\nSee you at the next one! 🍕\n— MPH Team` },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Templates */}
      <div className="glass-card" style={{ padding: 28 }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Quick Templates</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {TEMPLATES.map(t => (
            <button key={t.label} onClick={() => setForm(f => ({ ...f, subject: t.subject, message: t.message }))}
              style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(168,85,247,0.3)', background: 'rgba(168,85,247,0.08)', color: 'var(--purple)', fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 12, cursor: 'pointer', transition: 'all 0.2s' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Compose */}
      <div className="glass-card" style={{ padding: 28 }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Compose Email</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="input-label">Recipients</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { val: 'all', label: `All Teams (${teams.length})` },
                { val: 'paid', label: `Paid (${teams.filter(t => t.paymentStatus === 'paid').length})` },
                { val: 'unpaid', label: `Unpaid (${teams.filter(t => t.paymentStatus !== 'paid').length})` },
                { val: 'submitted', label: `Submitted (${teams.filter(t => t.submissionStatus === 'submitted').length})` },
              ].map(opt => (
                <button key={opt.val} onClick={() => setForm(f => ({ ...f, recipientFilter: opt.val }))}
                  style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${form.recipientFilter === opt.val ? 'var(--orange)' : 'var(--border)'}`, background: form.recipientFilter === opt.val ? 'rgba(249,115,22,0.12)' : 'transparent', color: form.recipientFilter === opt.val ? 'var(--orange)' : 'var(--text-muted)', fontFamily: 'Space Mono', fontSize: 11, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'all 0.2s' }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="input-label">Subject</label>
            <input className="input-field" placeholder="Email subject..." value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
          </div>

          <div>
            <label className="input-label">Message</label>
            <textarea className="input-field" rows={10} placeholder="Write your message here..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} style={{ resize: 'vertical', lineHeight: 1.7, fontFamily: 'Inter, sans-serif' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 8 }}>
              <p style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--text-muted)' }}>
                📬 Will send to <span style={{ color: 'var(--orange)', fontWeight: 700 }}>{recipientCount}</span> team{recipientCount !== 1 ? 's' : ''}
              </p>
            </div>
            <button className="btn-primary" onClick={send} disabled={sending} style={{ justifyContent: 'center' }}>
              {sending ? '⏳ Sending...' : `📧 Send to ${recipientCount} Teams`}
            </button>
          </div>
        </div>
      </div>

      {/* Last send result */}
      {lastResult && (
        <div className="glass-card" style={{ padding: 24, border: '1px solid rgba(34,197,94,0.3)' }}>
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 16, color: 'var(--success)', marginBottom: 12 }}>✅ Last send: {lastResult.sent} emails dispatched</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {lastResult.recipients.map(r => (
              <span key={r} style={{ fontFamily: 'Space Mono', fontSize: 10, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', padding: '3px 8px', borderRadius: 6 }}>{r}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
