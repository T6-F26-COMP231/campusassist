import { useState } from 'react';
import AppHeader from './components/AppHeader';
import RequestHelp from './pages/RequestHelp';
import './pages/RequestHelp.css';

function Home({ onRequestHelp }) {
  return (
    <div className="screen">
      <AppHeader subtitle="Centennial College Navigation & Support" />
      <main className="content home">
        <h2 className="page-title">Welcome</h2>
        <p>Find your way around campus and request in-person assistance when needed.</p>
        <button className="btn btn--primary" onClick={onRequestHelp}>Request In-Person Help</button>
        <button className="btn btn--secondary" disabled>Search Location (coming soon)</button>
        <button className="btn btn--secondary" disabled>Report Barrier (coming soon)</button>
      </main>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState('home');
  return page === 'help'
    ? <RequestHelp onBack={() => setPage('home')} />
    : <Home onRequestHelp={() => setPage('help')} />;
}
