import { useCallback, useEffect, useState } from 'react';
import { NO_USER_MESSAGES, fetchRequestMessages } from '../lib/messages';
import './MessageHelper.css';

const API_BASE = (import.meta.env?.VITE_API_URL || '').replace(/\/$/, '');

const timeOf = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

// Helper side: the messages the Campus User has written on this request.
export default function UserMessages({ requestId }) {
  const [state, setState] = useState({ loading: true, messages: [], error: '' });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    const result = await fetchRequestMessages(requestId, fetch, API_BASE);
    setState(
      result.ok
        ? { loading: false, messages: result.messages, error: '' }
        : { loading: false, messages: [], error: result.error }
    );
  }, [requestId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className="msg" aria-labelledby="user-msg-title">
      <h3 id="user-msg-title" className="msg__title">Messages from the user</h3>

      {state.loading && <p className="msg__empty" role="status">Loading messages...</p>}
      {!state.loading && state.error && <p className="msg__error" role="alert">{state.error}</p>}
      {!state.loading && !state.error && state.messages.length === 0 && (
        <p className="msg__empty">{NO_USER_MESSAGES}</p>
      )}
      {!state.loading && state.messages.length > 0 && (
        <ol className="msg__thread" aria-label="Messages from the user" tabIndex={0}>
          {state.messages.map((message) => (
            <li key={message.id} className="msg__bubble msg__bubble--user">
              <p>{message.text}</p>
              <small>User &middot; {timeOf(message.sentAt)}</small>
            </li>
          ))}
        </ol>
      )}

      <button type="button" className="btn btn--secondary msg__refresh" onClick={load} disabled={state.loading}>
        Refresh messages
      </button>
    </section>
  );
}
