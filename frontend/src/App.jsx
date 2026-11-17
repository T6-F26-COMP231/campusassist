import { useState } from 'react';
import AppHeader from './components/AppHeader';
import RequestHelp from './pages/RequestHelp';
import OpenRequests from './pages/OpenRequests';
import './pages/RequestHelp.css';

function Home({ onRequestHelp, onOpenRequests }) {
  return (
    <div className="screen">
      <AppHeader subtitle="Centennial College Navigation & Support" />
      <main className="content home">
        <h2 className="page-title">Welcome</h2>
        <p>Find your way around campus and request in-person assistance when needed.</p>
        <button className="btn btn--primary" onClick={onRequestHelp}>Request In-Person Help</button>
        <button className="btn btn--secondary" onClick={onOpenRequests}>View Open Requests (Volunteer)</button>
        <button className="btn btn--secondary" disabled>Search Location (coming soon)</button>
        <button className="btn btn--secondary" disabled>Report Barrier (coming soon)</button>
      </main>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState('home');
  const goHome = () => setPage('home');
  if (page === 'help') return <RequestHelp onBack={goHome} />;
  if (page === 'open') return <OpenRequests onBack={goHome} />;
  return <Home onRequestHelp={() => setPage('help')} onOpenRequests={() => setPage('open')} />;
}
