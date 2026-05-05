'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Countdown from '@/components/ui/Countdown';

const PRIZES = [
  { rank: '🥇', title: '1st Place', amount: '₹2,500', perks: ['Swag Kit', 'Internship Referrals', 'Certificate'] },
  { rank: '🥈', title: '2nd Place', amount: '₹1,000', perks: ['Swag Kit', 'Cloud Credits', 'Certificate'] },
  { rank: '🥉', title: '3rd Place', amount: '₹500', perks: ['Swag Kit', 'Community Access', 'Certificate'] },
];

const FAQS = [
  { q: 'Who can participate?', a: 'Any undergraduate or postgraduate student with a valid college ID. Teams of 2-4 members.' },
  { q: 'Is it free to participate?', a: 'There\'s a registration fee of ₹200 per team to cover logistics and prizes.' },
  { q: 'What tech stack can I use?', a: 'Any! Web, mobile, ML, IoT — as long as it solves the problem statement.' },
  { q: 'When is the problem statement revealed?', a: 'The problem statement will be revealed at the start of the hackathon window. Stay glued to your dashboard.' },
  { q: 'How are submissions evaluated?', a: 'Judges score on Innovation, Relevance to theme, and Technical depth.' },
];

const RULES = [
  'Teams of 2–4 members. Solo participation not allowed.',
  'All code must be written during the hackathon window.',
  'Using open-source libraries and public APIs is allowed.',
  'Plagiarism or pre-built projects will result in disqualification.',
  'Each team submits one ZIP (code), one PDF (report), and a demo video link.',
  'Judges\' decision is final. No re-evaluation requests.',
];

export default function Home() {
  const [deadline] = useState(() => new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString());
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px 80px', position: 'relative' }}>
        <div style={{ marginBottom: 20, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 100, padding: '6px 16px' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }} />
          <span style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--purple)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Registrations Open</span>
        </div>

        <div style={{ fontSize: 80, marginBottom: 16, lineHeight: 1 }}>🍕</div>

        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(42px, 8vw, 96px)', lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: 20, maxWidth: 900 }}>
          <span className="gradient-text">Midnight</span><br />
          <span style={{ color: 'var(--text-primary)' }}>Pizza Hack</span>
        </h1>

        <p style={{ fontFamily: 'Space Mono', fontSize: 'clamp(14px, 2vw, 18px)', color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 48 }}>
          Code. Eat. Repeat.
        </p>

        <div style={{ marginBottom: 56 }}>
          <Countdown deadline={deadline} label="Registration closes in" />
        </div>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/register">
            <button className="btn-primary" style={{ fontSize: 16, padding: '14px 36px' }}>🚀 Register Now</button>
          </Link>
          <Link href="#about">
            <button className="btn-ghost" style={{ fontSize: 16, padding: '14px 36px' }}>Learn More</button>
          </Link>
        </div>

        <div style={{ marginTop: 80, display: 'flex', gap: 48, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[{ val: '500+', label: 'Participants' }, { val: '₹5K', label: 'Prize Pool' }, { val: '24hrs', label: 'Hack Window' }, { val: '🌐', label: 'Online' }].map(item => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 32, color: 'var(--text-primary)' }}>{item.val}</div>
              <div style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          <div className="glass-card" style={{ padding: 40 }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>🌙</div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 28, marginBottom: 16, letterSpacing: '-0.02em' }}>What is MPH?</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 15 }}>
              Midnight Pizza Hack is a 24-hour hackathon for students who thrive when the world sleeps. Fueled by caffeine, pizza, and passion — we build things that matter at midnight.
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 15, marginTop: 16 }}>
              Think late-night delivery apps, insomnia trackers, night-shift tools, or anything that makes 3 AM less lonely. The theme is midnight. The rest is up to you. This is an <strong>online hackathon</strong> — participate from anywhere!
            </p>
          </div>
          <div className="glass-card" style={{ padding: 40 }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>📋</div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 28, marginBottom: 16, letterSpacing: '-0.02em' }}>Rules</h2>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {RULES.map((rule, i) => (
                <li key={i} style={{ display: 'flex', gap: 12, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
                  <span style={{ color: 'var(--purple)', fontFamily: 'Space Mono', fontSize: 12, marginTop: 2, flexShrink: 0 }}>{String(i+1).padStart(2,'0')}.</span>
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* PRIZES */}
      <section id="prizes" style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12 }}>What you win</p>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 48, letterSpacing: '-0.03em' }}>Prize Pool</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {PRIZES.map((prize, i) => (
            <div key={i} className="glass-card" style={{ padding: 36, textAlign: 'center', border: i === 0 ? '1px solid rgba(168,85,247,0.4)' : undefined, boxShadow: i === 0 ? '0 0 40px rgba(168,85,247,0.1)' : undefined }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>{prize.rank}</div>
              <div style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{prize.title}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 42, letterSpacing: '-0.02em', marginBottom: 20 }} className={i === 0 ? 'gradient-text' : ''}>{prize.amount}</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {prize.perks.map((perk, j) => (
                  <li key={j} style={{ fontFamily: 'Inter', fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span style={{ color: 'var(--success)', fontSize: 12 }}>✓</span> {perk}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding: '80px 24px', maxWidth: 760, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12 }}>Got questions?</p>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 48, letterSpacing: '-0.03em' }}>FAQ</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQS.map((faq, i) => (
            <div key={i} className="glass-card" style={{ padding: '20px 24px', cursor: 'pointer' }} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 16, color: 'var(--text-primary)' }}>{faq.q}</span>
                <span style={{ color: 'var(--purple)', fontSize: 20, lineHeight: 1, transition: 'transform 0.3s', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
              </div>
              {openFaq === i && (
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.8, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div className="glass-card glow-border" style={{ maxWidth: 640, margin: '0 auto', padding: '60px 40px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🍕</div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 40, letterSpacing: '-0.03em', marginBottom: 16 }}>Ready to hack midnight?</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>Form your squad. Register your team. Show up hungry.</p>
          <Link href="/register"><button className="btn-primary" style={{ fontSize: 16, padding: '14px 40px' }}>🚀 Register Your Team</button></Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 24px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
          🍕 MIDNIGHT PIZZA HACK — CODE. EAT. REPEAT.
        </p>
      </footer>
    </div>
  );
}
