import { useState } from 'react';
import { auth, googleProvider } from '@/lib/firebase-client';
import { signInWithPopup } from 'firebase/auth';
import axios from 'axios';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import apiInstance from '@/services/api';

export function GoogleSignInButton({ form }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);

    try {
      // 1. Sign in with Google
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // 2. Get ID token
      const idToken = await user.getIdToken();

      // 3. Verify with backend
      const response = await apiInstance.post('/user/google/auth', { idToken });

      console.log(response.data);
      localStorage.setItem('accessToken', response.data.accessToken);

      // 4. Handle success (redirect or update state)
      window.location.href = '/dashboard'; // Example redirect
    } catch (error) {
      console.error('Google login error:', error);

      if (error.code === 'auth/popup-closed-by-user') {
        // User closed the popup - no action needed
      } else {
        alert(`Login failed: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGoogleLogin}
      variant="outline"
      className="w-full"
      disabled={isLoading || form?.formState?.isSubmitting}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Signing in with Google...
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.784-1.664-4.153-2.675-6.735-2.675-5.522 0-10 4.477-10 10s4.478 10 10 10c8.396 0 10-7.496 10-10 0-0.671-0.068-1.325-0.182-1.977h-9.818z" />
          </svg>
          Continue with Google
        </div>
      )}
    </Button>
  );
}
