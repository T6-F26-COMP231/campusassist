export default function AppHeader({ subtitle, onBack }) {
  return (
    <header className="app-header">
      {onBack ? (
        <button className="icon-btn" onClick={onBack} aria-label="Go back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
      ) : (
        <span className="icon-btn-spacer" />
      )}
      <div className="app-header__title">
        <h1>
          Campus<span>Assist</span>
        </h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <button className="icon-btn" aria-label="Open menu">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
      </button>
    </header>
  );
}
