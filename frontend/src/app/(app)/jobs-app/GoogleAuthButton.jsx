import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const GoogleAuthButton = ({ onSuccess }) => {
  const handleSuccess = async (response) => {
    try {
      const res = await axios.post(
        'http://localhost:5000/api/user/google',
        { code: response.code },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('idToken')}`,
          },
        },
      );
      onSuccess(res.data.accessToken);
    } catch (error) {
      console.error('Google OAuth error:', error);
      alert('Failed to authenticate with Google');
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={(error) => console.error('Google login failed:', error)}
        responseType="code"
        accessType="offline"
        scope="https://www.googleapis.com/auth/gmail.send"
        prompt="consent"
      />
    </GoogleOAuthProvider>
  );
};

export default GoogleAuthButton;
