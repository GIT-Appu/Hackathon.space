'use client';
import { useState, useEffect } from 'react';
import { getTimeRemaining } from '@/lib/utils';

export default function Countdown({ deadline, label }: { deadline: string; label?: string }) {
  const [time, setTime] = useState(getTimeRemaining(deadline));
  useEffect(() => {
    const t = setInterval(() => setTime(getTimeRemaining(deadline)), 1000);
    return () => clearInterval(t);
  }, [deadline]);

  if (time.total <= 0) return <div className="font-mono" style={{ color: 'var(--orange)', fontSize: 18 }}>⏰ Time&apos;s up!</div>;

  return (
    <div>
      {label && <p style={{ fontFamily: 'Space Mono', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 16, textAlign: 'center' }}>{label}</p>}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        {[{ val: time.days, label: 'Days' }, { val: time.hours, label: 'Hours' }, { val: time.minutes, label: 'Mins' }, { val: time.seconds, label: 'Secs' }].map(({ val, label }) => (
          <div key={label} className="countdown-block">
            <div className="countdown-num">{String(val).padStart(2, '0')}</div>
            <div className="countdown-label">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
