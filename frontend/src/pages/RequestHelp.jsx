import { useState } from 'react';
import AppHeader from '../components/AppHeader';
import './RequestHelp.css';

const ASSISTANCE_TYPES = [
  { value: 'standard', label: 'Standard Guiding', hint: 'A volunteer walks with you to your destination' },
  { value: 'mobility', label: 'Mobility Assistance', hint: 'Accessible routes and physical support' },
  { value: 'other', label: 'Other', hint: 'Describe what you need above' },
];

export default function RequestHelp({ onBack }) {
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('standard');
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState(false);

  const missingLocation = location.trim() === '';

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (missingLocation) return;
    // TODO: send to backend when the API is available
    setSent(true);
  };

  if (sent) {
    return (
      <div className="screen">
        <AppHeader subtitle="Request Help" onBack={onBack} />
        <main className="content success">
          <div className="success__check" aria-hidden="true">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
          </div>
          <h2>Help is on the way</h2>
          <p>
            Your request from <strong>{location}</strong> has been sent. Stay where you
            are and a campus volunteer will find you shortly.
          </p>
          <button className="btn btn--primary" onClick={onBack}>Back to home</button>
        </main>
      </div>
    );
  }

  return (
    <div className="screen">
      <AppHeader subtitle="Request Help" onBack={onBack} />

      <form className="content" onSubmit={handleSubmit} noValidate>
        <h2 className="page-title">Request In-Person Help</h2>

        <div className="field">
          <label htmlFor="location">Your Location</label>
          <input
            id="location"
            type="text"
            value={location}
            placeholder="e.g. A Block, First Floor (A1)"
            onChange={(e) => setLocation(e.target.value)}
            onBlur={() => setTouched(true)}
            aria-invalid={touched && missingLocation}
            aria-describedby="location-note"
          />
        </div>

        <div className="field">
          <label htmlFor="description">Destination / Description</label>
          <textarea
            id="description"
            rows={4}
            value={description}
            placeholder="e.g. Lost near room B101, need help walking to Block C"
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <fieldset className="field">
          <legend>Select Assistance Type</legend>
          <div className="options">
            {ASSISTANCE_TYPES.map((opt) => (
              <label key={opt.value} className={`option ${type === opt.value ? 'option--selected' : ''}`}>
                <input
                  type="radio"
                  name="assistance"
                  value={opt.value}
                  checked={type === opt.value}
                  onChange={() => setType(opt.value)}
                />
                <span className="option__radio" aria-hidden="true" />
                <span className="option__text">
                  <strong>{opt.label}</strong>
                  <small>{opt.hint}</small>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div
          id="location-note"
          className={`notice ${touched && missingLocation ? 'notice--error' : ''}`}
        >
          <span className="notice__icon" aria-hidden="true">!</span>
          A request without a location cannot be sent.
        </div>

        <button type="submit" className="btn btn--primary" disabled={missingLocation}>
          Send Help Request
        </button>
      </form>
    </div>
  );
}
