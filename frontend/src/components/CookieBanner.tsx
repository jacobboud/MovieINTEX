import { useCookieConsent } from '../hooks/useCookieConsent';
import { Button } from './ui/Button';

export default function CookieBanner() {
  const { consent, giveConsent, revokeConsent } = useCookieConsent();

  if (consent) return null;

  return (
    <div className="fixed bottom-0 w-full bg-gray-800 text-white p-4 z-50">
      <div className="flex justify-between items-center max-w-4xl mx-auto">
        <p className="text-sm">
          We use cookies to improve your experience. Please accept or decline.
        </p>
        <div className="flex gap-2">
          <Button className="bg-green-600 text-white" onClick={giveConsent}>
            Accept
          </Button>
          <Button className="bg-red-600 text-white" onClick={revokeConsent}>
            Decline
          </Button>
        </div>
      </div>
    </div>
  );
}
