import { useCookieConsent } from '../hooks/useCookieConsent';
import { Button } from './ui/Button';

export default function CookieBanner() {
  const { consent, giveConsent } = useCookieConsent();

  if (consent) return null;

  return (
    <div className="fixed bottom-0 w-full bg-gray-800 text-white p-4 z-50">
      <div className="flex justify-between items-center max-w-4xl mx-auto">
        <p className="text-sm">
          We use cookies to improve your experience. By continuing, you agree to our cookie policy.
        </p>
        <Button className="ml-4 bg-green-600 text-white hover:bg-green-700" onClick={giveConsent}>
          Accept
        </Button>
      </div>
    </div>
  );
}
