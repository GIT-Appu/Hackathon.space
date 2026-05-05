import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Midnight Pizza Hack 🍕",
  description: "Code. Eat. Repeat. — The hackathon that fuels your midnight grind.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)', filter: 'blur(80px)', top: -200, left: -200 }} />
          <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 70%)', filter: 'blur(80px)', bottom: -150, right: -150 }} />
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
        <Toaster position="bottom-right" toastOptions={{ style: { background: 'rgba(20,20,35,0.95)', color: '#f1f0ff', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 12, fontFamily: 'Inter, sans-serif', fontSize: 14, backdropFilter: 'blur(20px)' }, success: { iconTheme: { primary: '#22c55e', secondary: '#080810' } }, error: { iconTheme: { primary: '#ef4444', secondary: '#080810' } } }} />
      </body>
    </html>
  );
}
