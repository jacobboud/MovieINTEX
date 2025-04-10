import { useCookieConsent } from '../hooks/useCookieConsent';
import { Button } from './ui/Button';
import './CookieBanner.css';

export default function CookieBanner() {
  const { consent, giveConsent } = useCookieConsent();

  if (consent) return null;

  return (
    <div className="cookie-banner">
      <br></br>
      <h1>Cookies</h1>
      <p className="cookie-banner-p">
        We use cookies to improve your experience. By continuing, you agree to
        our cookie policy.
      </p>
      <Button className="accept-btn" onClick={giveConsent}>
        Accept
      </Button>
    </div>
  );
}
