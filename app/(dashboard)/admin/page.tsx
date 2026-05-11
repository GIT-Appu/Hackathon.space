'use client';
import { useEffect, useState, useCallback } from 'react';
import EmailTab from '@/components/admin/EmailTab';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Navbar from '@/components/ui/Navbar';

interface Team { id: string; teamName: string; collegeName: string; leaderName: string; leaderEmail: string; members: Array<{name:string;email:string;role:string}>; paymentStatus: string; submissionStatus: string; zipUrl?: string; pdfUrl?: string; videoLink?: string; submittedAt?: string; registeredAt: string; scores?: {innovation:number;relevance:number;technical:number;uiux:number;total:number}; rank?: number; }
interface Settings { problemRevealEnabled: boolean; problemStatement: string; problemRevealDate: string; submissionDeadline: string; registrationDeadline: string; registrationFee: number; resultsRevealEnabled: boolean; }

type Tab = 'overview' | 'teams' | 'submissions' | 'scores' | 'control' | 'email';

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [teams, setTeams] = useState<Team[]>([]);
  const [settings, setSettings] = useState<Settings|null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all'|'paid'|'pending'|'submitted'>('all');
  const [emailForm, setEmailForm] = useState({ subject: '', message: '', recipientFilter: 'all' });
  const [emailSending, setEmailSending] = useState(false);
  const [scoreForm, setScoreForm] = useState<{[teamId:string]:{innovation:number;relevance:number;technical:number;uiux:number;rank:number}}>({});
  const [savingSettings, setSavingSettings] = useState(false);
  const [editableSettings, setEditableSettings] = useState<Partial<Settings>>({});

  const loadData = useCallback(async () => {
    const [auth, teamsRes, settingsRes] = await Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch('/api/admin/teams').then(r => r.json()),
      fetch('/api/admin/settings').then(r => r.json()),
    ]);
    if (!auth.user?.isAdmin) { router.push('/login'); return; }
    setTeams(Array.isArray(teamsRes) ? teamsRes : []);
    setSettings(settingsRes);
    setEditableSettings(settingsRes);
    setLoading(false);
  }, [router]);

  useEffect(() => { loadData(); }, [loadData]);

  const saveSettings = async () => {
    setSavingSettings(true);
    const res = await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editableSettings) });
    if (res.ok) { toast.success('Settings saved!'); const s = await res.json(); setSettings(s); }
    else toast.error('Failed to save settings');
    setSavingSettings(false);
  };

  const saveScore = async (teamId: string) => {
    const s = scoreForm[teamId];
    if (!s) return;
    const res = await fetch('/api/admin/scores', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ teamId, scores: s, rank: s.rank || undefined }) });
    if (res.ok) { toast.success('Score saved!'); loadData(); }
    else toast.error('Failed to save score');
  };

  const deleteTeam = async (teamId: string, teamName: string) => {
    if (!confirm(`Are you sure you want to delete team "${teamName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/teams?id=${teamId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Team deleted');
        loadData();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete team');
      }
    } catch {
      toast.error('Failed to delete team');
    }
  };

  const verifyPayment = async (teamId: string, teamName: string, verify: boolean) => {
    try {
      const res = await fetch('/api/admin/teams/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, verified: verify }),
      });
      if (res.ok) {
        toast.success(verify ? `✅ ${teamName} payment verified!` : `❌ ${teamName} payment rejected`);
        loadData();
      } else {
        toast.error('Failed to update payment status');
      }
    } catch {
      toast.error('Failed to update payment status');
    }
  };

  const filteredTeams = teams.filter(t => {
    if (filter === 'paid') return t.paymentStatus === 'paid';
    if (filter === 'pending') return t.paymentStatus === 'pending_verification';
    if (filter === 'submitted') return t.submissionStatus === 'submitted';
    return true;
  });

  const stats = { total: teams.length, paid: teams.filter(t => t.paymentStatus === 'paid').length, pending: teams.filter(t => t.paymentStatus === 'pending_verification').length, submitted: teams.filter(t => t.submissionStatus === 'submitted').length };

  const TABS: {id: Tab; label: string; icon: string}[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'control', label: 'Control Panel', icon: '⚙️' },
    { id: 'teams', label: 'Teams', icon: '👥' },
    { id: 'submissions', label: 'Submissions', icon: '📦' },
    { id: 'scores', label: 'Evaluation', icon: '🏆' },
    { id: 'email', label: 'Email', icon: '📧' },
  ];

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ textAlign: 'center' }}><div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div><p style={{ fontFamily: 'Space Mono', color: 'var(--text-muted)', fontSize: 13 }}>Loading admin panel...</p></div></div>;

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px 60px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>⚡ Admin Panel</p>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 36, letterSpacing: '-0.02em' }}>Midnight Pizza Hack</h1>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 32, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 12, padding: 4, overflowX: 'auto' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 13, transition: 'all 0.2s', whiteSpace: 'nowrap', background: tab === t.id ? 'rgba(168,85,247,0.2)' : 'transparent', color: tab === t.id ? 'var(--purple)' : 'var(--text-muted)', boxShadow: tab === t.id ? '0 0 20px rgba(168,85,247,0.1)' : 'none' }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Total Teams', val: stats.total, color: 'var(--purple)', icon: '👥' },
                { label: 'Paid', val: stats.paid, color: 'var(--success)', icon: '💳' },
                { label: 'Submitted', val: stats.submitted, color: 'var(--orange)', icon: '📦' },
                { label: 'Reveal Status', val: settings?.problemRevealEnabled ? 'ON' : 'OFF', color: settings?.problemRevealEnabled ? 'var(--success)' : 'var(--text-muted)', icon: '🔓' },
              ].map(s => (
                <div key={s.label} className="glass-card" style={{ padding: '24px' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                  <p style={{ fontFamily: 'Space Mono', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{s.label}</p>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 36, color: s.color }}>{s.val}</p>
                </div>
              ))}
            </div>
            <div className="glass-card" style={{ padding: 28 }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Recent Registrations</h3>
              <table className="data-table">
                <thead><tr><th>Team</th><th>College</th><th>Payment</th><th>Submission</th><th>Registered</th></tr></thead>
                <tbody>
                  {[...teams].sort((a,b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()).slice(0,5).map(t => (
                    <tr key={t.id}>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{t.teamName}</td>
                      <td>{t.collegeName}</td>
                      <td><span className={`badge badge-${t.paymentStatus}`}>{t.paymentStatus}</span></td>
                      <td><span className={`badge badge-${t.submissionStatus === 'submitted' ? 'submitted' : 'not-submitted'}`}>{t.submissionStatus}</span></td>
                      <td style={{ fontFamily: 'Space Mono', fontSize: 11 }}>{new Date(t.registeredAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CONTROL PANEL */}
        {tab === 'control' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="glass-card" style={{ padding: 32, border: settings?.problemRevealEnabled ? '1px solid rgba(34,197,94,0.3)' : '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
                <div>
                  <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, marginBottom: 6 }}>Problem Statement Reveal</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Toggle to reveal/hide the problem statement to all participants.</p>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={editableSettings.problemRevealEnabled || false} onChange={e => setEditableSettings(s => ({ ...s, problemRevealEnabled: e.target.checked }))} />
                  <span className="toggle-slider" />
                </label>
              </div>
              <div style={{ marginTop: 20, padding: '10px 16px', borderRadius: 8, background: editableSettings.problemRevealEnabled ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${editableSettings.problemRevealEnabled ? 'rgba(34,197,94,0.2)' : 'var(--border)'}` }}>
                <p style={{ fontFamily: 'Space Mono', fontSize: 12, color: editableSettings.problemRevealEnabled ? 'var(--success)' : 'var(--text-muted)' }}>
                  {editableSettings.problemRevealEnabled ? '🟢 Problem statement is VISIBLE to participants' : '🔴 Problem statement is HIDDEN from participants'}
                </p>
              </div>
            </div>

            <div className="glass-card" style={{ padding: 32, border: settings?.resultsRevealEnabled ? '1px solid rgba(245,158,11,0.3)' : '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
                <div>
                  <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, marginBottom: 6 }}>Results Reveal</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Toggle to reveal/hide final results and rankings to all participants.</p>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={editableSettings.resultsRevealEnabled || false} onChange={e => setEditableSettings(s => ({ ...s, resultsRevealEnabled: e.target.checked }))} />
                  <span className="toggle-slider" />
                </label>
              </div>
              <div style={{ marginTop: 20, padding: '10px 16px', borderRadius: 8, background: editableSettings.resultsRevealEnabled ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${editableSettings.resultsRevealEnabled ? 'rgba(245,158,11,0.2)' : 'var(--border)'}` }}>
                <p style={{ fontFamily: 'Space Mono', fontSize: 12, color: editableSettings.resultsRevealEnabled ? 'var(--orange)' : 'var(--text-muted)' }}>
                  {editableSettings.resultsRevealEnabled ? '🏆 Results and rankings are VISIBLE to all participants' : '🔒 Results and rankings are HIDDEN from participants'}
                </p>
              </div>
            </div>

            <div className="glass-card" style={{ padding: 32 }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Problem Statement</h2>
              <textarea className="input-field" rows={8} value={editableSettings.problemStatement || ''} onChange={e => setEditableSettings(s => ({ ...s, problemStatement: e.target.value }))} style={{ resize: 'vertical', lineHeight: 1.7 }} />
            </div>

            <div className="glass-card" style={{ padding: 32 }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Deadlines</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div><label className="input-label">Registration Deadline</label><input type="datetime-local" className="input-field" value={editableSettings.registrationDeadline?.slice(0,16) || ''} onChange={e => setEditableSettings(s => ({ ...s, registrationDeadline: new Date(e.target.value).toISOString() }))} /></div>
                <div><label className="input-label">Problem Reveal Date</label><input type="datetime-local" className="input-field" value={editableSettings.problemRevealDate?.slice(0,16) || ''} onChange={e => setEditableSettings(s => ({ ...s, problemRevealDate: new Date(e.target.value).toISOString() }))} /></div>
                <div><label className="input-label">Submission Deadline</label><input type="datetime-local" className="input-field" value={editableSettings.submissionDeadline?.slice(0,16) || ''} onChange={e => setEditableSettings(s => ({ ...s, submissionDeadline: new Date(e.target.value).toISOString() }))} /></div>
              </div>
            </div>

            <button className="btn-primary" onClick={saveSettings} disabled={savingSettings} style={{ alignSelf: 'flex-start', justifyContent: 'center' }}>
              {savingSettings ? '⏳ Saving...' : '💾 Save All Settings'}
            </button>
          </div>
        )}

        {/* TEAMS */}
        {tab === 'teams' && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {(['all', 'paid', 'pending', 'submitted'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 20px', borderRadius: 8, border: `1px solid ${filter === f ? 'var(--purple)' : 'var(--border)'}`, background: filter === f ? 'rgba(168,85,247,0.15)' : 'transparent', color: filter === f ? 'var(--purple)' : 'var(--text-muted)', fontFamily: 'Space Mono', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer' }}>{f} {f === 'all' ? `(${stats.total})` : f === 'paid' ? `(${stats.paid})` : f === 'pending' ? `(${stats.pending})` : `(${stats.submitted})`}</button>
              ))}
            </div>
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="data-table">
                <thead><tr><th>Team</th><th>Leader</th><th>College</th><th>Members</th><th>Payment</th><th>Submission</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredTeams.map(t => (
                    <tr key={t.id}>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'Syne', fontSize: 14 }}>{t.teamName}</td>
                      <td>
                        <p style={{ fontSize: 13, color: 'var(--text-primary)' }}>{t.leaderName}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Space Mono' }}>{t.leaderEmail}</p>
                      </td>
                      <td style={{ fontSize: 12 }}>{t.collegeName}</td>
                      <td style={{ fontFamily: 'Space Mono', fontSize: 12 }}>{t.members?.length}/4</td>
                      <td>
                        {t.paymentStatus === 'pending_verification' ? (
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              onClick={() => verifyPayment(t.id, t.teamName, true)}
                              style={{
                                padding: '4px 8px',
                                background: 'rgba(34,197,94,0.1)',
                                border: '1px solid rgba(34,197,94,0.3)',
                                borderRadius: 4,
                                color: '#22c55e',
                                fontSize: 11,
                                cursor: 'pointer',
                              }}
                            >
                              ✅
                            </button>
                            <button
                              onClick={() => verifyPayment(t.id, t.teamName, false)}
                              style={{
                                padding: '4px 8px',
                                background: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: 4,
                                color: '#ef4444',
                                fontSize: 11,
                                cursor: 'pointer',
                              }}
                            >
                              ❌
                            </button>
                          </div>
                        ) : (
                          <span className={`badge badge-${t.paymentStatus}`}>{t.paymentStatus}</span>
                        )}
                        {/* {t.paymentScreenshot && t.paymentStatus !== 'pending_verification' && (
                          <a href={t.paymentScreenshot} target="_blank" rel="noreferrer" style={{ display: 'block', fontSize: 10, color: 'var(--purple)', marginTop: 4 }}>📎 View Screenshot</a>
                        )} */}
                      </td>
                      <td><span className={`badge badge-${t.submissionStatus === 'submitted' ? 'submitted' : 'not-submitted'}`}>{t.submissionStatus === 'submitted' ? 'submitted' : 'pending'}</span></td>
                      <td>
                        <button
                          onClick={() => deleteTeam(t.id, t.teamName)}
                          style={{
                            padding: '6px 12px',
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: 6,
                            color: '#ef4444',
                            fontSize: 12,
                            cursor: 'pointer',
                            fontFamily: 'Space Mono',
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredTeams.length === 0 && <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'Space Mono', fontSize: 13 }}>No teams found</div>}
            </div>
          </div>
        )}

        {/* SUBMISSIONS */}
        {tab === 'submissions' && (
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead><tr><th>Team</th><th>Video</th><th>ZIP</th><th>PDF</th><th>Submitted At</th></tr></thead>
              <tbody>
                {teams.filter(t => t.submissionStatus === 'submitted').map(t => (
                  <tr key={t.id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{t.teamName}</td>
                    <td>{t.videoLink ? <a href={t.videoLink} target="_blank" rel="noreferrer" style={{ color: 'var(--purple)', fontSize: 12 }}>🎥 View</a> : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>}</td>
                    <td>{t.zipUrl ? <a href={t.zipUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--orange)', fontSize: 12 }}>📦 Download</a> : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>}</td>
                    <td>{t.pdfUrl ? <a href={t.pdfUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--success)', fontSize: 12 }}>📄 View</a> : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>}</td>
                    <td style={{ fontFamily: 'Space Mono', fontSize: 11 }}>{t.submittedAt ? new Date(t.submittedAt).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {teams.filter(t => t.submissionStatus === 'submitted').length === 0 && <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'Space Mono', fontSize: 13 }}>No submissions yet</div>}
          </div>
        )}

        {/* SCORES */}
        {tab === 'scores' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {teams.filter(t => t.submissionStatus === 'submitted').map(t => {
              const sf = scoreForm[t.id] || { innovation: t.scores?.innovation || 0, relevance: t.scores?.relevance || 0, technical: t.scores?.technical || 0, uiux: t.scores?.uiux || 0, rank: t.rank || 0 };
              const total = sf.innovation + sf.relevance + sf.technical + sf.uiux;
              return (
                <div key={t.id} className="glass-card" style={{ padding: 28 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18 }}>{t.teamName}</h3>
                      <p style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{t.collegeName}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Total Score</div>
                      <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 32, color: total > 0 ? 'var(--purple)' : 'var(--text-muted)' }}>{total}/40</div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 16 }}>
                    {(['innovation','relevance','technical','uiux'] as const).map(key => (
                      <div key={key}>
                        <label className="input-label">{key} (0-10)</label>
                        <input type="number" min={0} max={10} className="input-field" value={sf[key]} onChange={e => setScoreForm(prev => ({ ...prev, [t.id]: { ...sf, [key]: parseInt(e.target.value) || 0 } }))} />
                      </div>
                    ))}
                    <div>
                      <label className="input-label">Rank (1/2/3 or 0)</label>
                      <input type="number" min={0} max={3} className="input-field" value={sf.rank} onChange={e => setScoreForm(prev => ({ ...prev, [t.id]: { ...sf, rank: parseInt(e.target.value) || 0 } }))} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <button className="btn-primary" onClick={() => saveScore(t.id)} style={{ fontSize: 13, padding: '10px 20px' }}>💾 Save Score</button>
                    {t.rank && t.rank > 0 && <span style={{ fontFamily: 'Space Mono', fontSize: 12, color: 'var(--orange)' }}>{t.rank === 1 ? '🥇 Winner' : t.rank === 2 ? '🥈 Runner-up' : '🥉 3rd Place'}</span>}
                  </div>
                </div>
              );
            })}
            {teams.filter(t => t.submissionStatus === 'submitted').length === 0 && <div className="glass-card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'Space Mono', fontSize: 13 }}>No submissions to evaluate yet</div>}
          </div>
        )}


        {/* EMAIL */}
        {tab === 'email' && <EmailTab teams={teams} />}

      </div>
    </div>
  );
}
