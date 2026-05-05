import { Suspense } from 'react';
import DashboardClient from './DashboardClient';

export default function DashboardPage() {
  return <Suspense fallback={<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{textAlign:'center'}}><div style={{fontSize:48,marginBottom:16}}>🍕</div><p style={{fontFamily:'Space Mono',color:'var(--text-muted)',fontSize:13}}>Loading...</p></div></div>}><DashboardClient /></Suspense>;
}
