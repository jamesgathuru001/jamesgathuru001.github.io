import { useRef, useState } from 'react';
import { ArrowUpRight, Check, RotateCcw, Send } from 'lucide-react';
import { site } from '../data/site';

/**
 * The contact form.
 *
 * The site is static (GitHub Pages), so there is no origin that can send mail —
 * and the domain's email forwarding is inbound only, it routes mail *to* the
 * inbox and cannot post any. Submissions therefore go to Web3Forms, which
 * relays them to `site.email`. That is the one third-party request the site
 * makes, and it only fires on submit, never on load.
 */

const ENDPOINT = 'https://api.web3forms.com/submit';
const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY;

const FIELDS = [
  { name: 'name', label: 'Name', type: 'text', autoComplete: 'name', placeholder: 'Ada Lovelace' },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    autoComplete: 'email',
    placeholder: 'you@company.com',
  },
];

/** Cause + fix, never just "invalid" — an error you can't act on is noise. */
function validate(name, value) {
  const v = value.trim();
  if (name === 'name') return v ? '' : 'Tell me who you are.';
  if (name === 'email') {
    if (!v) return 'I need an address to reply to.';
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'That address is missing an @ or a domain.';
  }
  if (name === 'message') {
    if (!v) return 'A sentence is plenty — what are you building?';
    return v.length >= 10 ? '' : 'A little more detail would help me reply usefully.';
  }
  return '';
}

export default function ContactForm() {
  // idle → sending → sent | error. One value rather than a pile of booleans,
  // because the states are mutually exclusive and the UI reads off exactly one.
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);

  // Without a key every submit would fail silently at the network edge, which is
  // the worst possible outcome for the one form on the site. Degrade to the
  // address itself instead — a missing env var costs polish, not the channel.
  if (!ACCESS_KEY) {
    return (
      <p className="cform__fallback">
        The form needs its access key to run.{' '}
        <a href={`mailto:${site.email}`}>
          Email me directly
          <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </p>
    );
  }

  // Validate on blur, not on keystroke: flagging an address as malformed while
  // someone is still typing it is technically correct and hostile.
  const onBlur = (e) =>
    setErrors((prev) => ({ ...prev, [e.target.name]: validate(e.target.name, e.target.value) }));

  // Once a field is marked bad, correcting it should clear the mark immediately
  // rather than making the visitor tab away to find out they fixed it.
  const onInput = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => (prev[name] && !validate(name, value) ? { ...prev, [name]: '' } : prev));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (status === 'sending') return;

    // Captured before the first await: React nulls `currentTarget` once the
    // event finishes propagating, so reading it later would throw.
    const form = event.currentTarget;
    const data = new FormData(form);

    // Honeypot. Bots fill every field they can find; this one is hidden from
    // people and from assistive tech, so anything in it is not a person.
    if (data.get('botcheck')) return;

    const found = {};
    for (const key of ['name', 'email', 'message']) {
      const msg = validate(key, data.get(key) || '');
      if (msg) found[key] = msg;
    }
    if (Object.keys(found).length) {
      setErrors(found);
      // Send focus to the first problem rather than leaving the visitor to hunt
      // for it — the whole form can be taller than the viewport.
      form.elements[Object.keys(found)[0]]?.focus();
      return;
    }

    data.set('subject', `Portfolio enquiry from ${data.get('name')}`);
    data.set('from_name', site.name);

    setStatus('sending');
    setError('');

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.success) {
        throw new Error(body.message || `The relay refused it (${res.status}).`);
      }
      form.reset();
      setErrors({});
      setStatus('sent');
    } catch (err) {
      // Offline and a rejected submit land here alike. Either way the message is
      // not lost — it is still sitting in the fields, and the address is offered.
      setError(err.message || 'Something went wrong.');
      setStatus('error');
    }
  };

  // The confirmation replaces the form rather than sitting under it. Leaving an
  // empty form on screen after a successful send invites a second one.
  if (status === 'sent') {
    return (
      <div className="cform__done" role="status">
        <span className="cform__donemark" aria-hidden="true">
          <Check size={22} />
        </span>
        <h3 className="cform__donetitle">Message sent</h3>
        <p className="cform__donetext">
          It&rsquo;s in my inbox. I read everything and usually reply within a day.
        </p>
        <button type="button" className="cform__again" onClick={() => setStatus('idle')}>
          <RotateCcw size={14} aria-hidden="true" />
          Send another
        </button>
      </div>
    );
  }

  const sending = status === 'sending';

  return (
    <form className="cform" ref={formRef} onSubmit={onSubmit} noValidate>
      <input type="hidden" name="access_key" value={ACCESS_KEY} />
      {/* Not `display: none` — some bots skip what the page itself hides. It is
          off-screen, unfocusable and unlabelled instead. */}
      <input
        type="checkbox"
        name="botcheck"
        className="cform__honey"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div className="cform__row">
        {FIELDS.map((f) => (
          <p className="cform__field" key={f.name}>
            <label htmlFor={`cf-${f.name}`}>
              {f.label}
              <span className="cform__req" aria-hidden="true">
                *
              </span>
            </label>
            <input
              id={`cf-${f.name}`}
              name={f.name}
              type={f.type}
              placeholder={f.placeholder}
              autoComplete={f.autoComplete}
              required
              aria-invalid={errors[f.name] ? 'true' : undefined}
              aria-describedby={errors[f.name] ? `cf-${f.name}-err` : undefined}
              onBlur={onBlur}
              onInput={onInput}
            />
            {/* Beside the field it describes, not pooled at the top of the form. */}
            <span className="cform__err" id={`cf-${f.name}-err`} role="alert">
              {errors[f.name]}
            </span>
          </p>
        ))}
      </div>

      <p className="cform__field">
        <label htmlFor="cf-message">
          What are you building?
          <span className="cform__req" aria-hidden="true">
            *
          </span>
        </label>
        <textarea
          id="cf-message"
          name="message"
          rows={5}
          placeholder="A rough shape is fine — timeline, stack, what's on fire."
          required
          aria-invalid={errors.message ? 'true' : undefined}
          aria-describedby={errors.message ? 'cf-message-err' : 'cf-message-hint'}
          onBlur={onBlur}
          onInput={onInput}
        />
        <span className="cform__err" id="cf-message-err" role="alert">
          {errors.message}
        </span>
        {!errors.message && (
          <span className="cform__hint" id="cf-message-hint">
            Roles, freelance, or a second opinion on something tricky — all welcome.
          </span>
        )}
      </p>

      <div className="cform__foot">
        <button type="submit" className="btn btn--primary cform__send" disabled={sending}>
          {sending ? (
            <span className="cform__spinner" aria-hidden="true" />
          ) : (
            <Send size={16} aria-hidden="true" />
          )}
          {/* "Sending" is narrower than "Send message". The longest label sits in
              the same grid cell, hidden, so the button is always sized by it and
              cannot resize mid-submit — the failure the Copy button once had. A
              fixed min-width would only be a guess at a rendered string. */}
          <span className="cform__sendlabel">
            <span className="cform__sendsizer" aria-hidden="true">
              Send message
            </span>
            <span>{sending ? 'Sending' : 'Send message'}</span>
          </span>
        </button>

        <p className={`cform__status is-${status}`} role="status" aria-live="polite">
          {status === 'error' && (
            <>
              {error} <a href={`mailto:${site.email}`}>Email me instead</a>
            </>
          )}
        </p>
      </div>
    </form>
  );
}
