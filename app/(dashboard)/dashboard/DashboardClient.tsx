'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import Countdown from '@/components/ui/Countdown';
import Navbar from '@/components/ui/Navbar';

interface TeamData { id: string; teamName: string; collegeName: string; leaderName: string; members: Array<{name:string;email:string;role:string}>; paymentStatus: string; submissionStatus: string; zipUrl?: string; pdfUrl?: string; videoLink?: string; registeredAt: string; }
interface Settings { problemRevealEnabled: boolean; problemStatement: string; problemRevealDate: string; submissionDeadline: string; registrationFee: number; }

export default function DashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<{email:string;isAdmin:boolean;teamId?:string}|null>(null);
  const [team, setTeam] = useState<TeamData|null>(null);
  const [settings, setSettings] = useState<Settings|null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState({ videoLink: '', zipUrl: '', pdfUrl: '' });
  const [paymentScreenshot, setPaymentScreenshot] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch('/api/settings').then(r => r.json()),
    ]).then(([auth, sets]) => {
      if (!auth.user) { router.push('/login'); return; }
      if (auth.user.isAdmin) { router.push('/admin'); return; }
      setUser(auth.user); setTeam(auth.team); setSettings(sets); setLoading(false);
    });
  }, []);

  const handlePayment = async () => {
    if (!paymentScreenshot) { toast.error('Please enter payment screenshot URL or transaction ID'); return; }
    setPaymentLoading(true);
    const res = await fetch('/api/payment', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ paymentId: 'upi_' + Date.now(), paymentScreenshot }) 
    });
    if (res.ok) { 
      toast.success('Payment details submitted! We will verify and confirm.'); 
      const auth = await fetch('/api/auth/me').then(r => r.json()); 
      setTeam(auth.team); 
    }
    else toast.error('Submission failed');
    setPaymentLoading(false);
  };

  const handleSubmit = async () => {
    if (!submission.videoLink) { toast.error('Demo video link is required'); return; }
    setSubmitting(true);
    const res = await fetch('/api/submissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(submission) });
    if (res.ok) { toast.success('Submission received! 🚀'); const auth = await fetch('/api/auth/me').then(r => r.json()); setTeam(auth.team); }
    else { const d = await res.json(); toast.error(d.error || 'Submission failed'); }
    setSubmitting(false);
  };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ textAlign: 'center' }}><div style={{ fontSize: 48, marginBottom: 16 }}>🍕</div><p style={{ fontFamily: 'Space Mono', color: 'var(--text-muted)', fontSize: 13 }}>Loading your dashboard...</p></div></div>;

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '100px 24px 60px' }}>
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Team Dashboard</p>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 36, letterSpacing: '-0.02em' }}>{team?.teamName || 'Your Team'} 🍕</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>{team?.collegeName}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Payment', value: team?.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending', color: team?.paymentStatus === 'paid' ? 'var(--success)' : 'var(--warning)' },
            { label: 'Submission', value: team?.submissionStatus === 'submitted' ? '✅ Submitted' : '⏳ Pending', color: team?.submissionStatus === 'submitted' ? 'var(--success)' : 'var(--text-muted)' },
            { label: 'Members', value: `${team?.members?.length || 0} / 4`, color: 'var(--purple)' },
          ].map(card => (
            <div key={card.label} className="glass-card" style={{ padding: '20px 24px' }}>
              <p style={{ fontFamily: 'Space Mono', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{card.label}</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: card.color }}>{card.value}</p>
            </div>
          ))}
        </div>

        {team?.paymentStatus !== 'paid' && (
          <div className="glass-card" style={{ padding: 32, marginBottom: 24, border: '1px solid rgba(245,158,11,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
              <div>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Complete Registration</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>Pay the registration fee to lock in your spot.</p>
                <p style={{ fontFamily: 'Space Mono', fontSize: 20, color: 'var(--orange)', marginTop: 12, fontWeight: 700 }}>₹200</p>
              </div>
            </div>
            
            {/* UPI Payment Info */}
            <div style={{ marginTop: 24, padding: 20, background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12 }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 16, marginBottom: 16, color: 'var(--success)' }}>📲 Pay via UPI / GPay</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                <div>
                  <p style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>UPI ID</p>
                  <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>nscientist777@oksbi</p>
                </div>
                <div>
                  <p style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Amount</p>
                  <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>₹200</p>
                </div>
              </div>
              <div style={{ marginTop: 16, padding: 16, background: '#fff', borderRadius: 8, textAlign: 'center' }}>
                <p style={{ fontFamily: 'Space Mono', fontSize: 11, color: '#666', marginBottom: 8 }}>Scan with any UPI app</p>
                <div style={{ width: 150, height: 150, background: '#f0f0f0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: 48 }}>💳</div>
              </div>
            </div>

            {/* Screenshot Upload */}
            <div style={{ marginTop: 20 }}>
              <label className="input-label">Payment Screenshot / Transaction ID</label>
              <input 
                className="input-field" 
                placeholder="Paste payment screenshot URL or transaction ID"
                value={paymentScreenshot}
                onChange={e => setPaymentScreenshot(e.target.value)}
              />
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>After payment, upload screenshot to Google Drive and paste the link here, or enter your transaction ID</p>
            </div>

            <button 
              className="btn-orange" 
              onClick={handlePayment} 
              disabled={paymentLoading || !paymentScreenshot}
              style={{ marginTop: 16, opacity: !paymentScreenshot ? 0.5 : 1 }}
            >
              {paymentLoading ? '⏳ Submitting...' : '✅ Submit Payment Details'}
            </button>
          </div>
        )}

        <div className="glass-card" style={{ padding: 32, marginBottom: 24 }}>
          {settings?.problemRevealEnabled ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }} />
                <p style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Problem Statement Revealed</p>
              </div>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 22, marginBottom: 16 }}>🌙 The Challenge</h2>
              <div style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.15)', borderRadius: 12, padding: 24 }}>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.9, fontSize: 15, whiteSpace: 'pre-line' }}>{settings.problemStatement}</p>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Problem Statement Locked</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>The problem statement will be revealed when the hackathon begins.</p>
              {settings?.problemRevealDate && <Countdown deadline={settings.problemRevealDate} label="Reveals in" />}
            </div>
          )}
        </div>

        {settings?.problemRevealEnabled && team?.paymentStatus === 'paid' && (
          <div className="glass-card" style={{ padding: 32, marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 22, marginBottom: 6 }}>
              {team.submissionStatus === 'submitted' ? '✅ Submission Received' : '📦 Submit Your Project'}
            </h2>
            {team.submissionStatus === 'submitted' ? (
              <div style={{ marginTop: 16 }}>
                <p style={{ color: 'var(--success)', fontSize: 14, marginBottom: 16 }}>Your submission has been recorded. Good luck! 🤞</p>
                {team.videoLink && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>🎥 Video: <a href={team.videoLink} target="_blank" rel="noreferrer" style={{ color: 'var(--purple)' }}>{team.videoLink}</a></p>}
              </div>
            ) : (
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Upload your project files and paste your demo video link.</p>
                <div><label className="input-label">Demo Video Link *</label><input className="input-field" placeholder="https://youtube.com/watch?v=..." value={submission.videoLink} onChange={e => setSubmission(s => ({ ...s, videoLink: e.target.value }))} /></div>
                <div><label className="input-label">ZIP / GitHub Repo URL</label><input className="input-field" placeholder="https://github.com/your-repo" value={submission.zipUrl} onChange={e => setSubmission(s => ({ ...s, zipUrl: e.target.value }))} /></div>
                <div><label className="input-label">PDF Report URL</label><input className="input-field" placeholder="https://drive.google.com/..." value={submission.pdfUrl} onChange={e => setSubmission(s => ({ ...s, pdfUrl: e.target.value }))} /></div>
                {settings?.submissionDeadline && <div style={{ padding: '12px 16px', background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 8 }}><p style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--orange)', marginBottom: 8 }}>⏰ SUBMISSION DEADLINE</p><Countdown deadline={settings.submissionDeadline} /></div>}
                <button className="btn-primary" onClick={handleSubmit} disabled={submitting} style={{ justifyContent: 'center' }}>{submitting ? '⏳ Submitting...' : '🚀 Submit Project'}</button>
              </div>
            )}
          </div>
        )}

        <div className="glass-card" style={{ padding: 32 }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Team Members</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {team?.members?.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: i < (team.members.length - 1) ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(249,115,22,0.3))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14, fontWeight: 700, fontFamily: 'Syne' }}>{m.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{m.name}</p>
                  <p style={{ fontFamily: 'Inter', fontSize: 12, color: 'var(--text-muted)' }}>{m.email}</p>
                </div>
                <span className={`badge ${m.role === 'leader' ? 'badge-submitted' : 'badge-not-submitted'}`}>{m.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
