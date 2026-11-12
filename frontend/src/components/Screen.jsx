import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useData, useSession, signOut, resetDemo, homePath, ROLE_LABEL } from '../lib/store.js';
import { Icon, Dialog, Button, Badge } from './ui.jsx';

/** Effective signed-in role for this tab (null if signed out or the account was deactivated). */
export function useAuth() {
  const data = useData();
  const s = useSession();
  const account = s.email ? data.users.find((u) => u.email === s.email) : null;
  const valid = s.role === 'visitor' || (account && account.active && account.role === s.role);
  return { role: valid ? s.role : null, email: s.email ?? null, name: s.name ?? (s.role === 'visitor' ? 'Visitor' : ''), deactivated: !!s.role && !valid, session: s };
}

export function Guard({ allow = 'any', children }) {
  const { role, deactivated } = useAuth();
  const loc = useLocation();
  if (!role) return <Navigate to="/" replace state={{ from: loc.pathname, deactivated }} />;
  if (allow !== 'any' && !allow.includes(role)) return <AccessRefused />;
  return children;
}

function AccessRefused() {
  const { role } = useAuth();
  return (
    <Screen title="Access refused" sub="Restricted">
      <div className="stack center">
        <Icon name="shield" size={40} />
        <p>Your <strong>{ROLE_LABEL[role]}</strong> account cannot open this screen.</p>
        <Link className="btn btn-primary" to={homePath(role)}>Back to my home</Link>
      </div>
    </Screen>
  );
}

const TABS = {
  user: [['/home', 'Home', 'home'], ['/search', 'Search', 'search'], ['/help/new', 'Help', 'person'], ['/directory', 'Directory', 'book']],
  visitor: [['/visitor', 'Home', 'home'], ['/search', 'Search', 'search'], ['/help/new', 'Help', 'person']],
};

export function Screen({ title, sub, children, home = false, tabs = true }) {
  const { role, name } = useAuth();
  const nav = useNavigate();
  const [menu, setMenu] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  useEffect(() => { document.title = `${title} · CampusAssist`; }, [title]);
  const tabItems = tabs && TABS[role];

  return (
    <div className="shell">
      <header className="appbar">
        {home ? <span className="appbar-spacer" /> : (
          <button className="icon-btn" onClick={() => nav(-1)} aria-label="Go back"><Icon name="back" /></button>
        )}
        <Link to={homePath(role)} className="brand" aria-label="CampusAssist home">
          <Mark size={28} />
          <span className="brand-text"><strong>CampusAssist</strong><small>{sub ?? title}</small></span>
        </Link>
        <button className="icon-btn" onClick={() => setMenu(true)} aria-label="Open menu"><Icon name="menu" /></button>
      </header>

      <main className={`page ${tabItems ? 'has-tabs' : ''}`}>
        <h1 className="page-title">{title}</h1>
        {children}
      </main>

      {tabItems && (
        <nav className="tabbar" aria-label="Main">
          {tabItems.map(([to, label, icon]) => (
            <NavLink key={to} to={to} end className={({ isActive }) => `tab ${isActive ? 'on' : ''}`}>
              <Icon name={icon} size={22} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
      )}

      {menu && (
        <div className="scrim side" onMouseDown={(e) => e.target === e.currentTarget && setMenu(false)}>
          <aside className="drawer" role="dialog" aria-label="Menu">
            <div className="row between">
              <strong>Menu</strong>
              <button className="icon-btn" onClick={() => setMenu(false)} aria-label="Close menu"><Icon name="x" /></button>
            </div>
            {role ? (
              <div className="who">
                <Badge tone="lime">{ROLE_LABEL[role]}</Badge>
                <span>{name}</span>
              </div>
            ) : <p className="muted">Not signed in</p>}
            <div className="stack">
              {role && <Link className="btn btn-secondary" to={homePath(role)} onClick={() => setMenu(false)}><Icon name="home" size={18} />Home</Link>}
              <Link className="btn btn-secondary" to="/" onClick={() => { signOut(); setMenu(false); }}><Icon name="logout" size={18} />{role === 'visitor' || !role ? 'Switch role / sign in' : 'Sign out'}</Link>
              <Button variant="ghost" onClick={() => { setMenu(false); setConfirmReset(true); }}>Reset demo data</Button>
            </div>
            <p className="muted small">Prototype build. All data is stored in this browser only.</p>
          </aside>
        </div>
      )}

      {confirmReset && (
        <Dialog title="Reset demo data?" onClose={() => setConfirmReset(false)}>
          <p>This restores the original accounts, barrier reports and directory, and removes all help requests.</p>
          <div className="row gap end">
            <Button variant="secondary" onClick={() => setConfirmReset(false)}>Go back</Button>
            <Button onClick={() => { resetDemo(); setConfirmReset(false); nav('/'); }}>Yes, reset</Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

/** Logo mark drawn in the brand colours (lime ring, charcoal arc, route arrow). */
export function Mark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="mark">
      <path d="M48 17A23 23 0 1 0 48 47" fill="none" stroke="var(--lime)" strokeWidth="7" strokeLinecap="round" />
      <path d="M44 38A13 13 0 1 1 35 20" fill="none" stroke="var(--ink-fixed)" strokeWidth="6" strokeLinecap="round" />
      <path d="M24 42L41 24" stroke="var(--lime)" strokeWidth="6" strokeLinecap="round" />
      <path d="M31 21h13v13z" fill="var(--ink-fixed)" />
    </svg>
  );
}
