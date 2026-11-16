
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>CampusAssist</h1>
        <p>Centennial College - Progress Campus</p>
      </header>

      <main className="main">
        <h2>Welcome to CampusAssist</h2>

        <p>
          Find your way around campus and request
          in-person assistance when needed.
        </p>

        <div className="features">
          <button disabled>Search Location</button>
          <button disabled>Request In-Person Assistance</button>
          <button disabled>Report Barrier</button>
          <button disabled>Plan Arrival</button>
          <button disabled>Campus Directory</button>
        </div>

        <p className="notice">
          Features coming soon.
        </p>
      </main>

      <footer className="footer">
        <p>CampusAssist | Team 6</p>
      </footer>
    </div>
  );
}

export default App;
