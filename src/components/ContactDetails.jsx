import { Phone } from 'lucide-react';
import SocialIcon from './SocialIcon';
import { site } from '../data/site';

/**
 * The direct channels in the footer — phone and LinkedIn.
 *
 * No email address here on purpose: /contact takes messages through a form that
 * reaches the same inbox, so printing the address only gives scrapers a target
 * and gives visitors a second, worse path to the same place.
 */
export default function ContactDetails() {
  return (
    <ul className="ccards fcontact">
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
  );
}
