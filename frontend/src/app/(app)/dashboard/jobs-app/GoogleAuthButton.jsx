/** @format */

import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { ArrowRight } from 'lucide-react'; // For a nice hover effect icon

// A self-contained SVG for the Google icon to avoid external dependencies
const GoogleIcon = (props) => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" {...props}>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export const InteractiveGoogleButton = ({ onSuccess, onError }) => {
  // The core logic remains the same, but it's now inside the useGoogleLogin hook
  const login = useGoogleLogin({
    // This is the OAuth flow that gives you a one-time code for your backend
    flow: 'auth-code',
    scope: 'https://www.googleapis.com/auth/gmail.send', // Keep your required scopes
    onSuccess: async (codeResponse) => {
      try {
        // Send the authorization code to your backend
        const res = await axios.post('http://localhost:5000/api/user/google', {
          code: codeResponse.code,
        });
        // Call the parent component's success handler with the final token
        onSuccess(res.data.accessToken);
      } catch (error) {
        console.error('Google token exchange error:', error);
        if (onError) onError();
        alert('Failed to authenticate with Google. Please try again.');
      }
    },
    onError: (error) => {
      console.error('Google login hook failed:', error);
      if (onError) onError();
    },
  });

  return (
    <button
      onClick={() => login()}
      className="
        w-full group relative flex items-center justify-center px-4 py-3 
        bg-slate-900/50 border border-slate-100/10 rounded-xl text-slate-200 font-medium 
        transition-all duration-300 ease-in-out
        hover:bg-slate-800/60 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/10
      "
    >
      <GoogleIcon className="mr-3 transition-transform duration-300 group-hover:rotate-12" />
      <span>Continue with Google</span>
      <ArrowRight className="ml-auto h-5 w-5 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
    </button>
  );
};
