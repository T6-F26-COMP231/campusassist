import { useEffect, useRef, useState } from 'react';
import {
  MESSAGE_LIMIT,
  SENT_MESSAGE,
  deliverMessage,
  locationMessage,
  messagingState,
  sendMessage,
} from '../lib/messages';
import './MessageHelper.css';

const timeOf = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

// The Campus User writes to the helper who accepted their request. Messages are kept for this
// visit only; `messages` and `onSend` come from the app.
export default function MessageHelper({ request, messages = [], onSend }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const thread = useRef(null);

  const state = messagingState(request);
  const shareText = locationMessage(request);

  // Show the newest message.
  useEffect(() => {
    if (thread.current) thread.current.scrollTop = thread.current.scrollHeight;
  }, [messages.length]);

  const submit = async (event) => {
    event.preventDefault();
    const result = sendMessage(messages, request, text);
    if (!result.ok) {
      setSent(false);
      setError(result.error);
      return;
    }

    const saved = await deliverMessage(request, text);
    if (!saved.ok) {
      setSent(false);
      setError(saved.error);
      return;
    }

    onSend?.([...messages, saved.message]);
    setText('');
    setError('');
    setSent(true);
  };

  const change = (value) => {
    setText(value);
    setError('');
    setSent(false);
  };

  return (
    <section className="msg" aria-labelledby="msg-title">
      <h3 id="msg-title" className="msg__title">Message your helper</h3>

      {!state.allowed && <p className="msg__note" id="msg-reason">{state.reason}</p>}

      {messages.length === 0 ? (
        state.allowed && <p className="msg__empty">No messages yet. Tell your helper where you are.</p>
      ) : (
        <ol className="msg__thread" ref={thread} aria-label="Your messages" tabIndex={0}>
          {messages.map((message) => (
            <li key={message.id} className="msg__bubble">
              <p>{message.text}</p>
              <small>You &middot; {timeOf(message.sentAt)}</small>
            </li>
          ))}
        </ol>
      )}

      <form onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="msg-text">Message to your helper</label>
          <textarea
            id="msg-text"
            rows={3}
            value={text}
            disabled={!state.allowed}
            placeholder="e.g. I am by the main entrance"
            onChange={(event) => change(event.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={`msg-count${error ? ' msg-error' : ''}${state.allowed ? '' : ' msg-reason'}`}
          />
          <small
            id="msg-count"
            className={`msg__count ${text.length > MESSAGE_LIMIT ? 'msg__count--over' : ''}`}
          >
            {text.length} of {MESSAGE_LIMIT} characters
          </small>
        </div>

        {shareText && (
          <button
            type="button"
            className="msg__share"
            disabled={!state.allowed}
            onClick={() => change(shareText)}
          >
            Share my location
          </button>
        )}

        {error && (
          <p id="msg-error" className="msg__error" role="alert">{error}</p>
        )}

        <button type="submit" className="btn btn--primary" disabled={!state.allowed}>
          Send message
        </button>
      </form>

      <p className="msg__status" role="status" aria-live="polite">{sent ? SENT_MESSAGE : ''}</p>
      <small className="msg__hint">Messages are kept on this screen until the app is reloaded.</small>
    </section>
  );
}
