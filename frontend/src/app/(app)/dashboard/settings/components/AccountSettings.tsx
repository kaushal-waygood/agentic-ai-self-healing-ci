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

import { API_BASE_URL } from '@/services/api';
import { Loader2 } from 'lucide-react';

interface OtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  otp: string;
  setOtp: (otp: string) => void;
  onVerify: () => void;
  isLoading: boolean;
}

export const OtpModal: React.FC<OtpModalProps> = ({
  // isOpen,
  onClose,
  email,
  otp,
  setOtp,
  onVerify,
  isLoading,
}) => {
  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      {/* Modal Panel */}
      <div className="relative w-full max-w-md p-6 bg-white rounded-xl shadow-2xl dark:bg-gray-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          &times;
        </button>

        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Verify Your New Email
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            We've sent a 6-digit code to{' '}
            <strong className="text-gray-700 dark:text-gray-300">
              {email}
            </strong>
            . Please enter it below.
          </p>
        </div>

        <div className="my-6">
          <Input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            placeholder="Enter 6-digit OTP"
            className="h-14 text-center text-2xl tracking-[0.5em] font-mono bg-gray-50 dark:bg-gray-700"
          />
        </div>

        <Button
          onClick={onVerify}
          disabled={isLoading || otp.length < 6}
          className="w-full h-12 text-base"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Verify & Update Email'
          )}
        </Button>
      </div>
    </div>
  );
};

const GoogleLoginButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogin = () => {
    setIsLoading(true);
    window.location.href = `${API_BASE_URL}/api/v1/user/auth/google/${user._id}`;

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
  // --- START: NEW STATE FOR EMAIL CHANGE ---
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState('');
  // --- END: NEW STATE ---
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    // ...

    if (success === 'google_connected') {
      setStatusMessage(
        'Google account successfully connected! You can now send emails from your original email address.',
      );
      setIsError(false);

      window.history.replaceState({}, document.title, window.location.pathname);

      // --- THIS IS THE FIX ---
      // Add a small delay to ensure the database has time to update
      // before we re-fetch the profile.
      setTimeout(() => {
        dispatch(getProfileRequest());
      }, 1000); // 500ms delay
      // -----------------------
    }

    // ...
  }, [dispatch]);

  const handleSendOtp = async () => {
    if (newEmail === user?.email) {
      setStatusMessage('Please enter a new email address to verify.');
      setIsError(true);
      return;
    }

    setIsLoading(true);
    setStatusMessage(`Sending OTP to ${newEmail}...`);
    setIsError(false);
    localStorage.setItem('newEmail', newEmail);
    try {
      await apiInstance.post('/user/change-email', {
        email: newEmail,
      });
      setStatusMessage(`An OTP has been sent to ${newEmail}.`);
      setIsError(false);
      setIsOtpModalOpen(true); // Open the modal on success
    } catch (err: any) {
      setStatusMessage(
        err.response?.data?.message || 'Failed to send OTP. Please try again.',
      );
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    setStatusMessage('Verifying OTP...');
    setIsError(false);
    try {
      const response = await apiInstance.patch('/user/verify-email-otp', {
        email: newEmail,
        otp,
      });
      if (response.status === 200) {
        localStorage.removeItem('newEmail');
      }
      setStatusMessage(response.data.message || 'Email successfully updated!');
      setIsError(false);
      setIsOtpModalOpen(false);
      setOtp('');

      dispatch(getProfileRequest());
    } catch (err: any) {
      // Don't close the modal on error, show the message
      setStatusMessage(
        err.response?.data?.message || 'Invalid OTP. Please try again.',
      );
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

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
          <div>
            <label className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="email"
                value={newEmail} // Use controlled component
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter your email"
              />
              <Button
                onClick={handleSendOtp}
                disabled={isLoading || newEmail === user?.email}
              >
                {isLoading ? 'Sending...' : 'Verify'}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              To change your email, enter a new one and click "Verify".
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

      {localStorage.getItem('newEmail') && (
        <OtpModal
          // isOpen={isOtpModalOpen}
          onClose={() => setIsOtpModalOpen(false)}
          email={newEmail}
          otp={otp}
          setOtp={setOtp}
          onVerify={handleVerifyOtp}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};
