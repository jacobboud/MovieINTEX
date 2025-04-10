import { useState } from 'react';

export function useCookieConsent() {
  const [consent, setConsent] = useState(() => {
    return localStorage.getItem('cookie-consent') === 'true';
  });

  const giveConsent = () => {
    localStorage.setItem('cookie-consent', 'true');
    setConsent(true);
  };

  const revokeConsent = () => {
    localStorage.removeItem('cookie-consent');
    setConsent(false);
  };

  return { consent, giveConsent, revokeConsent };
}
