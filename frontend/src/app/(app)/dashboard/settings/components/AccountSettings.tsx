import { Input } from '@/components/ui/input';
import {
  getProfileRequest,
  setUserGoogleAuth,
} from '@/redux/reducers/authReducer';
import { RootState } from '@/redux/rootReducer';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import apiInstance from '@/services/api';

const NEXT_PUBLIC_API_URL = 'http://127.0.0.1:8080';

const GoogleLoginButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogin = () => {
    setIsLoading(true);
    window.location.href = `${NEXT_PUBLIC_API_URL}/api/v1/user/auth/google/${user._id}`;

    setTimeout(() => setIsLoading(false), 5000);
  };

  return (
    <Button onClick={handleLogin} disabled={isLoading}>
      {isLoading ? 'Connecting...' : 'Connect Google'}
    </Button>
  );
};

export const AccountSetting = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  console.log('user', user);

  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle OAuth callback parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');

    if (success === 'google_connected') {
      setStatusMessage(
        'Google account successfully connected! You can now send emails from your original email address.',
      );
      setIsError(false);

      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);

      // Refresh user data to get the updated googleAuth status
      dispatch(getProfileRequest()); // <--- UNCOMMENT THIS LINE
    }

    if (error) {
      let errorMessage = 'Failed to connect Google account';
      if (error === 'user_not_found') {
        errorMessage = 'User not found. Please try again.';
      } else if (error === 'auth_failed') {
        errorMessage = 'Authentication fai  led. Please try again.';
      }

      setStatusMessage(errorMessage);
      setIsError(true);

      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [dispatch]);

  // Handle sending test email
  const handleSendTestEmail = async () => {
    try {
      setIsLoading(true);
      setStatusMessage('Sending email...');
      setIsError(false);

      const response = await apiInstance.post('/user/send-test-email', {});

      const data = await response.data;

      if (response.status === 200) {
        setStatusMessage(data.message || 'Email sent successfully!');
        setIsError(false);
      } else {
        setStatusMessage(data.message || 'Failed to send email');
        setIsError(true);
      }
    } catch (err) {
      setStatusMessage('Network error. Please try again.');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle disconnecting Google account
  const handleDisconnectGoogle = async () => {
    try {
      setIsLoading(true);
      setStatusMessage('Disconnecting Google account...');
      setIsError(false);

      const response = await apiInstance.post('/user/google/disconnect');

      const data = await response.data;

      if (response.status === 200) {
        setStatusMessage(
          data.message || 'Google account disconnected successfully!',
        );
        setIsError(false);
        // Update local state
        dispatch(setUserGoogleAuth(null));
      } else {
        setStatusMessage(data.message || 'Failed to disconnect Google account');
        setIsError(true);
      }
    } catch (err) {
      setStatusMessage('Network error. Please try again.');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Message */}
      {statusMessage && (
        <div
          className={`p-4 rounded-lg ${
            isError
              ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
              : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
          }`}
        >
          {statusMessage}
        </div>
      )}

      <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Profile Information
        </h4>
        <div className="grid gap-4">
          <div className="group">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <Input
              type="text"
              defaultValue={user?.fullName || ''}
              className="bg-gray-50 dark:bg-gray-700 cursor-not-allowed "
              readOnly
            />
          </div>
          <div className="group">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <Input
              type="email"
              defaultValue={user?.email || ''}
              readOnly
              className="bg-gray-50 dark:bg-gray-700 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              This is your primary email address that will be used for sending
              emails.
            </p>
          </div>
          <Button asChild>
            <a href="/dashboard/profile">Edit Full Profile</a>
          </Button>
        </div>
      </div>

      <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Gmail Permissions
        </h4>

        <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Gmail Integration
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.googleAuth?.refreshToken
                  ? 'Connected to send emails from your account'
                  : 'Connect your Google account to send emails'}
              </p>
            </div>
            {user?.googleAuth?.refreshToken ? (
              <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full dark:bg-green-900 dark:text-green-200">
                Connected
              </span>
            ) : (
              <GoogleLoginButton />
            )}
          </div>

          {user?.googleAuth?.refreshToken && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Note:</strong> Emails will be sent from your original
                email address ({user.email}) using Gmail's sending capabilities.
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSendTestEmail}
              disabled={!user?.googleAuth?.refreshToken || isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Test Email'}
            </Button>
            {user?.googleAuth?.refreshToken && (
              <Button
                variant="destructive"
                onClick={handleDisconnectGoogle}
                disabled={isLoading}
              >
                {isLoading ? 'Disconnecting...' : 'Disconnect Google'}
              </Button>
            )}
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {user?.googleAuth?.refreshToken
              ? 'This will send a test email to verify your Gmail permissions are working correctly.'
              : 'Connect your Google account to enable sending emails through our platform using your Gmail account.'}
          </p>
        </div>
      </div>
    </div>
  );
};
