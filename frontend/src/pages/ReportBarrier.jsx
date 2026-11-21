import { useEffect, useRef, useState } from 'react';
import AppHeader from '../components/AppHeader';
import {
  BARRIER_TYPES,
  DESCRIPTION_LIMIT,
  REPORTER_ROLES,
  buildBarrierReport,
  validatePhoto,
} from '../lib/barriers';
import { routeGroups } from '../lib/routes';
import './RequestHelp.css';
import './ReportBarrier.css';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

// Names of campus places, offered as suggestions while typing the location.
const PLACE_SUGGESTIONS = routeGroups().flatMap((group) =>
  group.places.map(({ name, floor }) => `${name} (Floor ${floor})`),
);

export default function ReportBarrier({ onBack, onReported, reportCount = 0 }) {
  const [role, setRole] = useState('campus-user');
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoError, setPhotoError] = useState('');
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const summary = useRef(null);
  const faculty = role === 'faculty-staff';
  const fileInput = useRef(null);

  // A preview of the chosen photo, released when it changes or the screen closes.
  const [preview, setPreview] = useState('');
  useEffect(() => {
    if (!photo) {
      setPreview('');
      return undefined;
    }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const choosePhoto = (event) => {
    const file = event.target.files?.[0] ?? null;
    const check = validatePhoto(file);
    if (!check.ok) {
      setPhoto(null);
      setPhotoError(check.error);
      event.target.value = '';
      return;
    }
    setPhotoError('');
    setPhoto(file);
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoError('');
    if (fileInput.current) fileInput.current.value = '';
  };

  const submit = async (event) => {
    event.preventDefault();

  if (submitting) return;

  const result = buildBarrierReport(
    { role, type, location, description },
    reportCount,
    photo?.name ?? ''
  );

    if (!result.ok) {
      setErrors(result.errors);
      setSubmitError('');
      // Move to the problem list so a screen reader announces it.
      setTimeout(() => summary.current?.focus(), 0);
      return;
    }

    setErrors({});
    setSubmitError('');
    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/api/barrier-reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role,
          type,
          location: location.trim(),
          description: description.trim(),
          photoName: photo?.name ?? ''
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.report?._id) {
        throw new Error(
          data.message || 'Unable to submit the barrier report.'
        );
      }

      // The backend has successfully saved the report.
      const savedReport = {
        ...result.report,
        number: result.report.id,
        id: String(data.report._id),
        status: data.report.status,
        location: data.report.location,
        description: data.report.description,
        photoName: data.report.photoName
      };

      setSent(savedReport);
      onReported?.(savedReport);

    } catch (err) {
      setSubmitError(
        err.message || 'Could not connect to the server. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const reportAnother = () => {
    setRole('campus-user');
    setType('');
    setLocation('');
    setDescription('');
    removePhoto();
    setSent(null);
    setSubmitError('');
  };

  if (sent) {
    return (
      <div className="screen">
        <AppHeader subtitle="Report Barrier" onBack={onBack} />
        <main className="content success">
          <div className="success__check" aria-hidden="true">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
          </div>
          <h2>Report sent</h2>
          <p>
            Your barrier report was saved successfully and is
            <strong> Pending review</strong>. An administrator will
            review it before any routes change.
          </p>
          <dl className="request-details barrier__summary">
            <div><dt>Reported by</dt><dd>{sent.roleLabel}</dd></div>
            <div><dt>Type</dt><dd>{sent.typeLabel}</dd></div>
            <div><dt>{faculty ? 'Classroom' : 'Location'}</dt><dd>{sent.location}</dd></div>
            {sent.description && <div><dt>Details</dt><dd>{sent.description}</dd></div>}
            {sent.photoName && <div><dt>Photo</dt><dd>{sent.photoName}</dd></div>}
          </dl>
          <button className="btn btn--primary" onClick={reportAnother}>
            Report another barrier
          </button>
          <button className="btn btn--secondary" onClick={onBack}>
            Back to home
          </button>
        </main>
      </div>
    );
  }

  const problems = Object.entries(errors);

  return (
    <div className="screen">
      <AppHeader subtitle="Report Barrier" onBack={onBack} />

      <form className="content" onSubmit={submit} noValidate>
        <h2 className="page-title">Report a Barrier</h2>
        <p className="barrier__intro">
          Tell us about a broken elevator or another obstacle and where it is, so other people can
          avoid it.
        </p>

        {problems.length > 0 && (
          <div className="notice notice--error barrier__problems" role="alert" tabIndex={-1} ref={summary}>
            <span className="notice__icon" aria-hidden="true">!</span>
            <div>
              <strong>Please fix {problems.length === 1 ? 'this' : 'these'} before sending:</strong>
              <ul>
                {problems.map(([field, message]) => (
                  <li key={field}>{message}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <fieldset className="field">
          <legend>Who is reporting?</legend>
          <div className="options options--row">
            {REPORTER_ROLES.map((option) => (
              <label key={option.value} className={`option ${role === option.value ? 'option--selected' : ''}`}>
                <input
                  type="radio"
                  name="reporter-role"
                  value={option.value}
                  checked={role === option.value}
                  onChange={() => {
                    setRole(option.value);
                    setErrors({});
                  }}
                />
                <span className="option__radio" aria-hidden="true" />
                <span className="option__text">
                  <strong>{option.label}</strong>
                  <small>{option.hint}</small>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="field" aria-describedby={errors.type ? 'type-error' : undefined}>
          <legend>Barrier type <span className="barrier__required">(required)</span></legend>
          <div className="options">
            {BARRIER_TYPES.map((option) => (
              <label key={option.value} className={`option ${type === option.value ? 'option--selected' : ''}`}>
                <input
                  type="radio"
                  name="barrier-type"
                  value={option.value}
                  checked={type === option.value}
                  onChange={() => setType(option.value)}
                />
                <span className="option__radio" aria-hidden="true" />
                <span className="option__text">
                  <strong>{option.label}</strong>
                  <small>{option.hint}</small>
                </span>
              </label>
            ))}
          </div>
          {errors.type && <p id="type-error" className="barrier__error">{errors.type}</p>}
        </fieldset>

        <div className="field">
          <label htmlFor="barrier-location">
            {faculty ? 'Classroom' : 'Location'} <span className="barrier__required">(required)</span>
          </label>
          <input
            id="barrier-location"
            type="text"
            list="barrier-places"
            value={location}
            placeholder={faculty ? 'e.g. B230, or the hallway outside B230' : 'e.g. Near room B230, Block B'}
            autoComplete="off"
            onChange={(e) => setLocation(e.target.value)}
            aria-invalid={Boolean(errors.location)}
            aria-describedby={errors.location ? 'location-error location-help' : 'location-help'}
          />
          <datalist id="barrier-places">
            {PLACE_SUGGESTIONS.map((place) => (
              <option key={place} value={place} />
            ))}
          </datalist>
          <small id="location-help" className="barrier__help">
            {faculty
              ? 'Enter the classroom the barrier is near, or pick a suggestion as you type.'
              : 'Type a place, or pick a suggestion as you type.'}
          </small>
          {errors.location && <p id="location-error" className="barrier__error">{errors.location}</p>}
        </div>

        <div className="field">
          <label htmlFor="barrier-description">Describe what is blocked (optional)</label>
          <textarea
            id="barrier-description"
            rows={4}
            value={description}
            placeholder="e.g. The elevator doors do not open on Floor 2"
            onChange={(e) => setDescription(e.target.value)}
            aria-invalid={Boolean(errors.description)}
            aria-describedby="description-count"
          />
          <small
            id="description-count"
            className={`barrier__help ${description.length > DESCRIPTION_LIMIT ? 'barrier__help--over' : ''}`}
          >
            {description.length} of {DESCRIPTION_LIMIT} characters
          </small>
          {errors.description && <p className="barrier__error">{errors.description}</p>}
        </div>

        <div className="field">
          <label htmlFor="barrier-photo">Add a photo (optional)</label>
          <input
            id="barrier-photo"
            ref={fileInput}
            className="barrier__file"
            type="file"
            accept="image/*"
            onChange={choosePhoto}
            aria-describedby={photoError ? 'photo-error' : undefined}
          />
          {photoError && <p id="photo-error" className="barrier__error" role="alert">{photoError}</p>}
          {photo && (
            <div className="barrier__photo">
              {preview && <img src={preview} alt="Preview of the photo you added" />}
              <span>{photo.name}</span>
              <button type="button" className="barrier__remove" onClick={removePhoto}>
                Remove photo
              </button>
            </div>
          )}
        </div>

        {submitError && (
          <div className="notice notice--error" role="alert">
            {submitError}
          </div>
        )}

        <button
          type="submit"
          className="btn btn--primary"
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit for review'}
        </button>
      </form>
    </div>
  );
}
