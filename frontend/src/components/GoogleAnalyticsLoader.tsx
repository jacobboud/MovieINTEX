// GoogleAnalyticsLoader.tsx
import { useEffect } from 'react';
import { useCookieConsent } from '../hooks/useCookieConsent';

declare global {
    interface Window {
      dataLayer: any[];
    }
  }

export default function GoogleAnalyticsLoader() {
  const { consent } = useCookieConsent();

  useEffect(() => {
    if (consent) {
      const script = document.createElement('script');
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX'; // Replace with real ID
      script.async = true;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        window.dataLayer.push(args);
      }
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXXXXX'); // Replace with real ID
    }
  }, [consent]);

  return null;
}
