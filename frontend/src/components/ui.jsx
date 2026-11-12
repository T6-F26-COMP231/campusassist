import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const ICONS = {
  back: 'M15 18l-6-6 6-6',
  menu: 'M4 6h16|M4 12h16|M4 18h16',
  search: 'M11 4a7 7 0 100 14 7 7 0 000-14z|M20 20l-4-4',
  pin: 'M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z|M12 7.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z',
  person: 'M12 12a4 4 0 100-8 4 4 0 000 8z|M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6',
  alert: 'M12 3l10 18H2L12 3z|M12 10v5|M12 18h.01',
  calendar: 'M4 6h16v14H4z|M4 10h16|M8 3v4|M16 3v4',
  book: 'M5 4h12a2 2 0 012 2v14H7a2 2 0 01-2-2V4z|M5 18a2 2 0 012-2h12',
  check: 'M5 12l5 5 9-10',
  x: 'M6 6l12 12|M18 6L6 18',
  qr: 'M4 4h6v6H4z|M14 4h6v6h-6z|M4 14h6v6H4z|M14 14h2v2h-2z|M18 14h2v6h-4|M14 18h2',
  send: 'M4 12l16-8-6 16-3-7-7-1z',
  arrow: 'M5 12h14|M13 6l6 6-6 6',
  home: 'M4 11l8-7 8 7v9H4z|M10 20v-6h4v6',
  elevator: 'M5 3h14v18H5z|M12 8l-2.5 3h5L12 8z|M12 16l-2.5-3h5L12 16z',
  ramp: 'M3 19l16-9v9H3z',
  washroom: 'M9 4a2 2 0 100 4 2 2 0 000-4z|M9 10v5h5l3 5|M6.5 13.5a4.5 4.5 0 106.5 5',
  door: 'M6 3h12v18H6z|M14 12h.01',
  stairs: 'M3 20h5v-5h5v-5h5V5h3',
  logout: 'M9 4H5v16h4|M16 8l4 4-4 4|M20 12H9',
  swap: 'M7 4v16|M3 8l4-4 4 4|M17 20V4|M13 16l4 4 4-4',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z|M12 9a3 3 0 100 6 3 3 0 000-6z',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z',
  users: 'M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7z|M2.5 20c0-3 2.8-5 6.5-5s6.5 2 6.5 5|M16 4.5a3.5 3.5 0 010 6.5|M18 15c2 .6 3.5 2 3.5 5',
  clock: 'M12 3a9 9 0 100 18 9 9 0 000-18z|M12 7v5l3 2',
  image: 'M4 5h16v14H4z|M4 16l5-5 4 4 3-3 4 4|M9 9h.01',
};

export function Icon({ name, size = 20, className = '' }) {
  const d = ICONS[name];
  return (
    <svg className={`icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d?.split('|').map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}

export function Button({ variant = 'primary', icon, children, className = '', ...p }) {
  return (
    <button type="button" className={`btn btn-${variant} ${className}`} {...p}>
      {icon && <Icon name={icon} size={18} />}{children}
    </button>
  );
}

export function LinkButton({ variant = 'primary', icon, children, className = '', ...p }) {
  return (
    <Link className={`btn btn-${variant} ${className}`} {...p}>
      {icon && <Icon name={icon} size={18} />}{children}
    </Link>
  );
}

export function Field({ label, hint, error, children }) {
  return (
    <label className="field">
      <span className="label">{label}</span>
      {children}
      {hint && !error && <span className="hint">{hint}</span>}
      {error && <span className="err-text" role="alert">{error}</span>}
    </label>
  );
}

export function Notice({ kind = 'info', children, action }) {
  const icon = { info: 'alert', error: 'alert', success: 'check', warn: 'alert' }[kind];
  return (
    <div className={`notice ${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      <Icon name={icon} size={18} />
      <div className="grow">{children}</div>
      {action}
    </div>
  );
}

export function Badge({ tone = 'neutral', children }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Card({ children, className = '', ...p }) {
  return <section className={`card ${className}`} {...p}>{children}</section>;
}

export function Dialog({ title, children, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    ref.current?.querySelector('button, input')?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); prev?.focus?.(); };
  }, [onClose]);
  return (
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-label={title} ref={ref}>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function Empty({ children }) {
  return <p className="empty">{children}</p>;
}

export const fmtTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
export const fmtDateTime = (iso) => new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
