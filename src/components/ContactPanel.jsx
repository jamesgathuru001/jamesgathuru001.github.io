import { Phone, Clock, MapPin } from 'lucide-react';
import SocialIcon from './SocialIcon';
import ContactForm from './ContactForm';
import useLocalTime from '../hooks/useLocalTime';
import { site } from '../data/site';

/**
 * The contact block: the form, and the aside beside it.
 *
 * The aside carries what someone weighing up whether to write actually wants to
 * know — roughly when they'll hear back, and what hour it currently is where I
 * am. It sits in the landing page's Contact section rather
 * than on a route of its own: most visitors never leave the landing page, and
 * making them navigate to reach the form is a click that costs replies.
 */
export default function ContactPanel() {
  const time = useLocalTime();

  return (
    <div className="cgrid">
      <aside className="caside">
        <ul className="cfacts">
          <li>
            <Clock size={15} aria-hidden="true" />
            <span className="cfacts__label">Reply time</span>
            <span className="cfacts__value">Usually within a day</span>
          </li>
          <li>
            <MapPin size={15} aria-hidden="true" />
            <span className="cfacts__label">Based in</span>
            <span className="cfacts__value">
              {site.location} — {time} local
            </span>
          </li>
        </ul>

        <ul className="ccards ccards--stack">
          <li>
            <a href={site.phoneHref} className="ccard">
              <span className="ccard__icon" aria-hidden="true">
                <Phone size={15} />
              </span>
              <span className="ccard__label">Phone</span>
              <span className="ccard__value">{site.phone}</span>
            </a>
          </li>
          <li>
            <a href={site.linkedin} target="_blank" rel="noreferrer noopener" className="ccard">
              <span className="ccard__icon" aria-hidden="true">
                <SocialIcon name="linkedin" size={15} />
              </span>
              <span className="ccard__label">LinkedIn</span>
              <span className="ccard__value">in/james-gathuru</span>
            </a>
          </li>
        </ul>
      </aside>

      <div className="cpanel">
        <ContactForm />
      </div>
    </div>
  );
}
