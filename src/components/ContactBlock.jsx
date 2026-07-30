import { useEffect, useState } from 'react';
import { Mail, Phone, ArrowUpRight, Copy, Check } from 'lucide-react';
import SocialIcon from './SocialIcon';
import useLocalTime from '../hooks/useLocalTime';
import { site } from '../data/site';

/**
 * The contact channels — email row, secondary cards, local time.
 *
 * Shared by the landing page's Contact section and the /work page's closing
 * CTA. Both used to be different: /work had a lone email pill, which is the
 * weaker of the two, and keeping them in sync by hand would not have lasted.
 */
export default function ContactBlock() {
  const time = useLocalTime();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const t = setTimeout(() => setCopied(false), 2200);
    return () => clearTimeout(t);
  }, [copied]);

  const copyEmail = async () => {
    // Needs a secure context. If it isn't available the mailto link beside this
    // button still works, so failing quietly is the right behaviour.
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <div className="cmail">
        <a href={`mailto:${site.email}`} className="cmail__link">
          <span className="cmail__icon" aria-hidden="true">
            <Mail size={18} />
          </span>
          <span className="cmail__text">
            <span className="cmail__label">Email</span>
            <span className="cmail__value">{site.email}</span>
          </span>
          <ArrowUpRight className="cmail__go" size={18} aria-hidden="true" />
        </a>
        {/* Sibling, not nested: a button inside an anchor is invalid, and
            nesting it would make the whole row copy instead of open mail. */}
        <button type="button" className="cmail__copy" onClick={copyEmail}>
          {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? 'Email address copied to clipboard' : ''}
      </span>

      <ul className="ccards">
        <li>
          <a href={site.phoneHref} className="ccard">
            <span className="ccard__icon" aria-hidden="true">
              <Phone size={16} />
            </span>
            <span className="ccard__label">Phone</span>
            <span className="ccard__value">{site.phone}</span>
            <ArrowUpRight className="ccard__go" size={14} aria-hidden="true" />
          </a>
        </li>
        <li>
          <a href={site.linkedin} target="_blank" rel="noreferrer noopener" className="ccard">
            <span className="ccard__icon" aria-hidden="true">
              <SocialIcon name="linkedin" size={16} />
            </span>
            <span className="ccard__label">LinkedIn</span>
            <span className="ccard__value">in/james-gathuru</span>
            <ArrowUpRight className="ccard__go" size={14} aria-hidden="true" />
          </a>
        </li>
      </ul>

      <p className="contact__meta">
        {site.location} — {time} local
      </p>
    </>
  );
}
