import { Input } from '@/components/ui/input';
import {
  getProfileRequest,
  setUserGoogleAuth,
} from '@/redux/reducers/authReducer';
import { RootState } from '@/redux/rootReducer';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useDispatch, useSelector } from 'react-redux';
import apiInstance, { API_BASE_URL } from '@/services/api';
import { Loader2, Mail, User2, CheckCircle2, AlertCircle } from 'lucide-react';

import { X, ShieldCheck } from 'lucide-react';
import React from 'react';
import Link from 'next/link';

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
  isOpen,
  onClose,
  email,
  otp,
  setOtp,
  onVerify,
  isLoading,
}) => {
  if (!isOpen) return null;

  const maskedEmail =
    email && email.includes('@')
      ? email.replace(/(.{2}).+(@.+)/, '$1••••••$2')
      : email;

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* Modal Panel */}
      <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white/95 p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900/95">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center justify-center mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/30">
            <ShieldCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Verify Your New Email
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            We’ve sent a 6-digit code to
          </p>
          <p className="flex items-center justify-center gap-1 text-sm font-medium text-gray-800 dark:text-gray-200">
            <Mail className="h-4 w-4 text-blue-500" />
            <span>{maskedEmail}</span>
          </p>
        </div>

        <div className="my-6 space-y-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">
            One-Time Password (OTP)
          </label>
          <Input
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
            }
            maxLength={6}
            placeholder="••••••"
            className="h-14 text-center text-2xl tracking-[0.5em] font-mono bg-gray-50 dark:bg-gray-800"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            This code expires in a few minutes. Do not share it with anyone.
          </p>
        </div>

        <Button
          onClick={onVerify}
          disabled={isLoading || otp.length < 6}
          className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying...
            </span>
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
    if (!user?._id) return;
    setIsLoading(true);
    window.location.href = `${API_BASE_URL}/api/v1/user/auth/google/${user._id}`;
    setTimeout(() => setIsLoading(false), 5000);
  };

  return (
    <Button
      onClick={handleLogin}
      disabled={isLoading}
      variant="outline"
      className="flex items-center gap-2 border-gray-300 bg-white dark:border-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700"
    >
      <div className="flex h-5 w-5 items-center justify-center rounded-[4px] bg-white">
        <span className="text-lg leading-none">G</span>
      </div>
      {isLoading ? 'Connecting...' : 'Connect Google'}
    </Button>
  );
};

/** Google is connected if accessToken or refreshToken exists. refreshToken has select:false in DB so API returns accessToken/expiryDate only. */
const isGoogleConnected = (user: { googleAuth?: { accessToken?: string; refreshToken?: string; expiryDate?: number } } | null) =>
  !!(user?.googleAuth && (user.googleAuth.accessToken || user.googleAuth.refreshToken || user.googleAuth.expiryDate));

export const AccountSetting = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const googleConnected = isGoogleConnected(user);

  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const studentWrapper = useSelector(
    (state: RootState) => state.student.students?.[0],
  );
  // on mount, check if we were redirected from Google OAuth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');

    if (success === 'google_connected') {
      setStatusMessage(
        'Google account successfully connected! You can now send emails from your original email address.',
      );
      setIsError(false);

      window.history.replaceState({}, document.title, window.location.pathname);

      setTimeout(() => {
        dispatch(getProfileRequest());
      }, 1000);
    } else if (error) {
      const messages: Record<string, string> = {
        auth_failed_param: 'Invalid OAuth response. Please try again.',
        user_not_found: 'User not found. Please sign in again.',
        invalid_grant:
          'Google authorization expired or was revoked. Please try connecting again.',
        auth_failed_internal:
          'Google connection failed. Check that redirect URI in Google Cloud Console matches your backend URL.',
      };
      setStatusMessage(messages[error] || 'Failed to connect Google account.');
      setIsError(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [dispatch]);

  const handleSendOtp = async () => {
    if (!newEmail || newEmail === user?.email) {
      setStatusMessage('Please enter a new email address to verify.');
      setIsError(true);
      return;
    }

    setIsLoading(true);
    setStatusMessage(`Sending OTP to ${newEmail}...`);
    setIsError(false);
    localStorage.setItem('newEmail', newEmail);

    try {
      await apiInstance.post('/user/change-email', { email: newEmail });
      setStatusMessage(`An OTP has been sent to ${newEmail}.`);
      setIsError(false);
      setIsOtpModalOpen(true);
    } catch (err: any) {
      setStatusMessage(
        err?.response?.data?.message || 'Failed to send OTP. Please try again.',
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

      setStatusMessage(response.data?.message || 'Email successfully updated!');
      setIsError(false);
      setIsOtpModalOpen(false);
      setOtp('');
      dispatch(getProfileRequest());
    } catch (err: any) {
      setStatusMessage(
        err?.response?.data?.message || 'Invalid OTP. Please try again.',
      );
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    try {
      setIsLoading(true);
      setStatusMessage('Sending email...');
      setIsError(false);

      const response = await apiInstance.post('/user/send-test-email', {});
      const data = response.data;

      if (response.status === 200) {
        setStatusMessage(data?.message || 'Email sent successfully!');
        setIsError(false);
      } else {
        setStatusMessage(data?.message || 'Failed to send email');
        setIsError(true);
      }
    } catch {
      setStatusMessage('Network error. Please try again.');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    try {
      setIsLoading(true);
      setStatusMessage('Disconnecting Google account...');
      setIsError(false);

      const response = await apiInstance.post('/user/google/disconnect');
      const data = response.data;

      if (response.status === 200) {
        setStatusMessage(
          data?.message || 'Google account disconnected successfully!',
        );
        setIsError(false);
        dispatch(setUserGoogleAuth(null));
      } else {
        setStatusMessage(
          data?.message || 'Failed to disconnect Google account',
        );
        setIsError(true);
      }
    } catch {
      setStatusMessage('Network error. Please try again.');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const initials =
    user?.fullName
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';

  return (
    <div className="space-y-6">
      {/* Status Message */}
      {statusMessage && (
        <div
          className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${
            isError
              ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
          }`}
        >
          {isError ? (
            <AlertCircle className="mt-[2px] h-4 w-4 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="mt-[2px] h-4 w-4 flex-shrink-0" />
          )}
          <p>{statusMessage}</p>
        </div>
      )}

      {/* Profile Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white">
              {initials}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                Profile Information
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                These details are linked to your account identity.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/profile" prefetch={false}>
              Edit Full Profile
            </Link>
          </Button>
        </div>

        <div className="grid gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <Input
              type="text"
              // defaultValue={user?.fullName || ''}
              defaultValue={studentWrapper?.student.fullName || ''}
              className="bg-gray-50 dark:bg-gray-700 cursor-not-allowed"
              readOnly
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            {/* <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="email"
                  value={newEmail}
                  required
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-9"
                />
              </div>
              <Button
                type="submit"
                onClick={handleSendOtp}
                disabled={isLoading || newEmail === user?.email}
                className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                {isLoading ? 'Sending...' : 'Verify'}
              </Button>
            </div> */}
            <form
              onSubmit={(e) => {
                e.preventDefault(); // Prevents page reload
                handleSendOtp();
              }}
              className="flex flex-col gap-2 sm:flex-row sm:items-center"
            >
              <div className="relative flex-1">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="email"
                  required // <--- This is key
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-9"
                />
              </div>
              <Button
                type="submit" // <--- Change this to submit
                disabled={isLoading || newEmail === user?.email}
              >
                {isLoading ? 'Sending...' : 'Verify'}
              </Button>
            </form>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              To change your email, enter a new address and verify it with OTP.
            </p>
          </div>
        </div>
      </div>

      {/* Gmail Permissions */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              Gmail Permissions
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Connect your Google account to send emails directly from the
              platform.
            </p>
          </div>
        </div>

        <div className="mt-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/40">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-gray-900 shadow-sm dark:bg-gray-800">
                <User2 className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  Gmail Integration
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {googleConnected
                    ? 'Connected: emails will be sent using your Gmail account.'
                    : 'Connect your Google account to enable sending emails.'}
                </p>
              </div>
            </div>

            {googleConnected ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                <CheckCircle2 className="h-3 w-3" />
                Connected
              </span>
            ) : (
              <GoogleLoginButton />
            )}
          </div>

          {googleConnected && (
            <div className="mb-4 rounded-md bg-blue-50 p-3 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
              Emails will be sent from your primary address (
              <span className="font-medium">{user?.email}</span>) using Gmail’s
              sending capabilities.
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={handleSendTestEmail}
              disabled={!googleConnected || isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </span>
              ) : (
                'Send Test Email'
              )}
            </Button>

            {googleConnected && (
              <Button
                variant="destructive"
                onClick={handleDisconnectGoogle}
                disabled={isLoading}
              >
                {isLoading ? 'Disconnecting...' : 'Disconnect Google'}
              </Button>
            )}
          </div>

          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {googleConnected
              ? 'Use the test email to verify that Gmail permissions are working correctly.'
              : 'We only request the minimum access needed to send emails on your behalf.'}
          </p>
        </div>
      </div>

      {/* OTP Modal */}
      <OtpModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        email={localStorage.getItem('newEmail') || newEmail}
        otp={otp}
        setOtp={setOtp}
        onVerify={handleVerifyOtp}
        isLoading={isLoading}
      />
    </div>
  );
};
