import { useState } from 'react';
import { useLocation, useNavigate, useParams, Link, Navigate } from 'react-router-dom';
import { signIn, setSession, signOut, homePath, ROLE_LABEL, resetDemo } from '../lib/store.js';
import { DEMO_ACCOUNTS } from '../lib/data.js';
import { Screen, useAuth } from '../components/Screen.jsx';
import { Button, Card, Field, Icon, Notice } from '../components/ui.jsx';

const ROLES = [
  { id: 'user', icon: 'person', title: 'Campus User', desc: 'Students: find places, navigate, request help' },
  { id: 'visitor', icon: 'eye', title: 'Visitor', desc: 'No account needed: events, entrances, quick help' },
  { id: 'helper', icon: 'users', title: 'Authorized Helper', desc: 'Accept requests and guide people in person' },
  { id: 'staff', icon: 'book', title: 'Faculty Staff', desc: 'Directory and barrier reports' },
  { id: 'admin', icon: 'shield', title: 'Administrator', desc: 'Verify barriers, manage helpers and directory' },
];

export function Landing() {
  const nav = useNavigate();
  const loc = useLocation();
  const { role } = useAuth();
  return (
    <div className="shell landing">
      <div className="hero">
        <img src="/logo.png" alt="CampusAssist: Centennial College navigation and support" width="220" height="220" />
      </div>
      <main className="page">
        <h1 className="page-title">Who is using CampusAssist?</h1>
        {loc.state?.deactivated && <Notice kind="error">Your account is no longer active, so you were signed out.</Notice>}
        {role && <Notice action={<Link className="btn btn-secondary" to={homePath(role)}>Continue</Link>}>You are signed in as {ROLE_LABEL[role]}.</Notice>}
        <div className="stack">
          {ROLES.map((r) => (
            <button
              key={r.id}
              className="role-card"
              onClick={() => {
                if (r.id === 'visitor') { signOut(); setSession({ role: 'visitor', name: 'Visitor' }); nav('/visitor'); } else nav(`/signin/${r.id}`);
              }}
            >
              <span className="role-ico"><Icon name={r.icon} size={22} /></span>
              <span className="grow"><strong>{r.title}</strong><small>{r.desc}</small></span>
              <Icon name="arrow" size={18} />
            </button>
          ))}
        </div>
        <p className="muted small center">Prototype with demo data stored in this browser. <button className="link" onClick={() => { resetDemo(); nav(0); }}>Reset demo data</button></p>
      </main>
    </div>
  );
}

export function SignIn() {
  const { role } = useParams();
  const nav = useNavigate();
  const demo = DEMO_ACCOUNTS.find((a) => a.role === role);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  if (!ROLE_LABEL[role] || role === 'visitor') return <Navigate to="/" replace />;

  const submit = (e) => {
    e.preventDefault();
    const r = signIn(email, password, role);
    if (!r.ok) return setError(r.error);
    nav(homePath(role), { replace: true });
  };
  const adminLike = role === 'admin';
  return (
    <Screen title={role === 'helper' ? 'Helper Sign In' : adminLike ? 'Administrator Sign In' : `${ROLE_LABEL[role]} Sign In`} sub={role === 'helper' ? 'Helper Portal' : adminLike ? 'Administrator' : 'Sign in'} tabs={false}>
      <form className="stack" onSubmit={submit} noValidate>
        <p className="muted">{adminLike ? 'Staff only. Sign in to manage campus data.' : role === 'helper' ? 'Please sign in to your helper account.' : 'Sign in to your CampusAssist account.'}</p>
        <Field label="Email"><input type="email" autoComplete="username" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} placeholder={`${role}@campus.test`} /></Field>
        <Field label="Password"><input type="password" autoComplete="current-password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} placeholder="••••••••" /></Field>
        {error && <Notice kind="error">{error}</Notice>}
        <Button type="submit">Sign In</Button>
        <Card className="demo">
          <strong>Demo account</strong>
          <code>{demo.email} / {demo.password}</code>
          <Button variant="secondary" onClick={() => { setEmail(demo.email); setPassword(demo.password); setError(''); }}>Fill in demo account</Button>
        </Card>
      </form>
    </Screen>
  );
}
