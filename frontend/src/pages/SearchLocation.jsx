import { useState } from 'react';
import AppHeader from '../components/AppHeader';
import { searchLocations } from '../lib/locations';
import './RequestHelp.css';
import './SearchLocation.css';

export default function SearchLocation({ onBack }) {
  const [query, setQuery] = useState('');
  const [outcome, setOutcome] = useState(null);

  const search = (event) => {
    event.preventDefault();
    setOutcome(searchLocations(query));
  };

  const results = outcome?.ok ? outcome.results : [];

  return (
    <div className="screen">
      <AppHeader subtitle="Search Location" onBack={onBack} />

      <main className="content">
        <h2 className="page-title">Search Location</h2>
        <p className="search__intro">Enter a place name, such as Bookstore.</p>

        <form className="search__form" onSubmit={search}>
          <label htmlFor="location-search">Location name</label>
          <input
            id="location-search"
            type="text"
            value={query}
            placeholder="Bookstore"
            onChange={(event) => setQuery(event.target.value)}
          />
          <button className="btn btn--primary" type="submit">
            Search
          </button>
        </form>

        {outcome?.ok && (
          <ul className="search__results">
            {results.map((place) => (
              <li key={place.id}>
                <article className="search__place">
                  <h3>{place.name}</h3>
                  <p>{place.where}</p>
                </article>
              </li>
            ))}
          </ul>
        )}

        {outcome && !outcome.ok && (
          <p className="search__empty" role="status">
            {outcome.error}
          </p>
        )}
      </main>
    </div>
  );
}
