// ThemePreference.tsx
import { useEffect } from 'react';
import { useCookieConsent } from '../hooks/useCookieConsent';

export default function ThemePreference() {
  const { consent } = useCookieConsent();

  useEffect(() => {
    if (consent) {
      document.cookie = "prefersDarkMode=true; path=/";
    } else {
      document.cookie = "prefersDarkMode=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  }, [consent]);

  return null;
}
// This component sets a cookie based on the user's consent for dark mode.
// It uses the `useEffect` hook to update the cookie whenever the consent state changes.
// The cookie is set to expire when the user revokes consent, effectively removing it.