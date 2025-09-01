'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';

// UI Components from ShadCN
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Redux
import { RootState } from '@/redux/rootReducer';
import { changePasswordRequest } from '@/redux/reducers/authReducer';

// Services & Other Components
import { sendEmailPermit } from '@/services/api/auth';
import GoogleLoginButton from './GoogleLoginButton'; // Assuming this component exists

// Icons from Lucide React
import {
  Settings,
  Bell,
  Palette,
  Trash2,
  UserCircle,
  Lock,
  Eye,
  EyeOff,
  Check,
  ChevronRight,
  Sparkles,
  Shield,
  Mail,
  Smartphone,
  Zap,
} from 'lucide-react';

// Main Component
export default function SettingsPage() {
  // Hooks
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redux State
  const { user, message, error } = useSelector(
    (state: RootState) => state.auth,
  );

  // Component State
  const [mounted, setMounted] = useState(false);
  const activeSection = searchParams.get('tab') || 'account';

  // Security State
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Notifications State
  const [notifications, setNotifications] = useState({
    jobAlerts: true,
    applicationUpdates: true,
    promotionalEmails: false,
    pushNotifications: true, // from generated code
    emailDigest: false, // from generated code
    smsAlerts: false, // from generated code
  });

  // Effects
  useEffect(() => {
    setMounted(true);
  }, []);

  // Effect to handle password change feedback
  useEffect(() => {
    if (message) {
      toast({
        title: 'Success',
        description: message,
      });
    }
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [message, error, toast]);

  // Effect to calculate password strength
  useEffect(() => {
    const calculateStrength = (password: string) => {
      let strength = 0;
      if (password.length >= 8) strength += 25;
      if (/[A-Z]/.test(password)) strength += 25;
      if (/[0-9]/.test(password)) strength += 25;
      if (/[^A-Za-z0-9]/.test(password)) strength += 25;
      return strength;
    };
    setPasswordStrength(calculateStrength(newPassword));
  }, [newPassword]);

  // Handlers
  const handleSectionChange = (section: string) => {
    router.push(`/settings?tab=${section}`);
  };

  const handleNotificationChange = (id: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmNewPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match.',
        variant: 'destructive',
      });
      return;
    }
    dispatch(
      changePasswordRequest({
        currentPassword,
        newPassword,
        confirmNewPassword,
      }),
    );
  };

  const handleSendEmail = async () => {
    try {
      // Replace with your actual API call setup (e.g., using axios or fetch)
      // This assumes you have an API client that sends the auth token/cookie.
      const response = await fetch('/api/v1/user/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${your_auth_token}` // If using JWT
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send email.');
      }

      toast({
        title: 'Email Sent!',
        description: result.message,
      });
    } catch (e) {
      toast({
        title: 'Error Sending Email',
        description: e.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAccount = () => {
    toast({
      title: 'Feature In Development',
      description: 'Account deletion is not yet implemented.',
    });
  };

  // UI Sub-components
  const sections = [
    { id: 'account', label: 'Account', icon: UserCircle },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'danger', label: 'Danger Zone', icon: Trash2 },
  ];

  const NotificationToggle = ({
    id,
    title,
    description,
    icon: Icon,
    value,
  }: {
    id: keyof typeof notifications;
    title: string;
    description: string;
    icon: React.ElementType;
    value: boolean;
  }) => (
    <div className="group flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-md bg-white dark:bg-gray-800">
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
          <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100">
            {title}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
      <button
        onClick={() => handleNotificationChange(id)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 cursor-pointer ${
          value
            ? 'bg-gradient-to-r from-blue-500 to-purple-600'
            : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-lg ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const ThemeButton = ({
    themeName,
    isActive,
    onClick,
    gradient,
    label,
  }: {
    themeName: 'light' | 'dark' | 'system';
    isActive: boolean;
    onClick: () => void;
    gradient: string;
    label: string;
  }) => (
    <button
      onClick={onClick}
      className={`relative p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
        isActive
          ? 'border-blue-500 shadow-lg shadow-blue-500/25'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      <div className={`w-full h-16 rounded-lg ${gradient} mb-2`} />
      <span
        className={`text-sm font-medium ${
          isActive
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-gray-600 dark:text-gray-300'
        }`}
      >
        {label}
      </span>
      {isActive && (
        <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-1">
          <Check className="h-3 w-3 text-white" />
        </div>
      )}
    </button>
  );

  // Render Functions for Sections
  const renderAccountSection = () => (
    <div className="space-y-6">
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
              defaultValue={user?.name || ''}
              className="bg-gray-50 dark:bg-gray-700"
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
          </div>
          <Button variant="outline" asChild>
            <a href="/profile">Edit Full Profile</a>
          </Button>
        </div>
      </div>
      <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Linked Accounts & Permissions
        </h4>
        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              Sign-in Provider
            </p>
            {user?.provider ? (
              <p className="text-sm text-green-600 dark:text-green-400">
                Connected via {user.provider}
              </p>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Not connected to a provider.
              </p>
            )}
          </div>
          {!user?.provider && <GoogleLoginButton />}
        </div>
        <Button variant="outline" className="mt-4" onClick={handleSendEmail}>
          Send Email Permission
        </Button>
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8 bg-gray-50 dark:bg-gray-900">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        Account Settings
      </h2>
      <div className="space-y-6">
        {/* Profile Information Section */}
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
                defaultValue={user?.name || ''}
                className="bg-gray-50 dark:bg-gray-700"
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
            </div>
          </div>
        </div>

        {/* Linked Accounts & Permissions Section */}
        <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Email Permissions
          </h4>
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Google Mail
              </p>
              {user?.isGoogleConnected ? (
                <p className="text-sm text-green-600 dark:text-green-400">
                  Permission Granted
                </p>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Connect your Google account to send emails.
                </p>
              )}
            </div>
            {!user?.isGoogleConnected && <GoogleLoginButton />}
          </div>

          {user?.isGoogleConnected && (
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={handleSendEmail}
            >
              Send a Test Email
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="grid gap-4">
      <NotificationToggle
        id="jobAlerts"
        title="Job Alerts"
        description="Get notified about new job opportunities"
        icon={Zap}
        value={notifications.jobAlerts}
      />
      <NotificationToggle
        id="applicationUpdates"
        title="Application Updates"
        description="Track your application status changes"
        icon={Bell}
        value={notifications.applicationUpdates}
      />
      <NotificationToggle
        id="promotionalEmails"
        title="Platform News & Offers"
        description="Updates on new features and special offers"
        icon={Sparkles}
        value={notifications.promotionalEmails}
      />
      <NotificationToggle
        id="pushNotifications"
        title="Push Notifications"
        description="Instant alerts on your device"
        icon={Smartphone}
        value={notifications.pushNotifications}
      />
      <NotificationToggle
        id="emailDigest"
        title="Weekly Digest"
        description="Summary of your activity and opportunities"
        icon={Mail}
        value={notifications.emailDigest}
      />
      <NotificationToggle
        id="smsAlerts"
        title="SMS Alerts"
        description="Critical updates via text message"
        icon={Smartphone}
        value={notifications.smsAlerts}
      />
    </div>
  );

  const renderAppearanceSection = () => (
    <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-6">
        Theme Selection
      </h4>
      {!mounted ? (
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ThemeButton
            label="Light"
            themeName="light"
            isActive={theme === 'light'}
            onClick={() => setTheme('light')}
            gradient="bg-gradient-to-br from-white to-gray-100 border border-gray-200"
          />
          <ThemeButton
            label="Dark"
            themeName="dark"
            isActive={theme === 'dark'}
            onClick={() => setTheme('dark')}
            gradient="bg-gradient-to-br from-gray-800 to-gray-900"
          />
          <ThemeButton
            label="System"
            themeName="system"
            isActive={theme === 'system'}
            onClick={() => setTheme('system')}
            gradient="bg-gradient-to-br from-gray-500 to-gray-900"
          />
        </div>
      )}
    </div>
  );

  const renderDangerSection = () => (
    <div className="p-6 rounded-xl border-2 border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
        Delete Account
      </h4>
      <p className="text-red-700 dark:text-red-300 text-sm mb-4">
        Permanently delete your CareerPilot account and all associated data.
        This action cannot be undone.
      </p>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Delete Account</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action is permanent and cannot be undone. This will
              permanently delete your account and remove all of your data from
              our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDeleteAccount}
            >
              Yes, delete my account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'account':
        return renderAccountSection();
      case 'security':
        return renderSecuritySection();
      case 'notifications':
        return renderNotificationsSection();
      case 'appearance':
        return renderAppearanceSection();
      case 'danger':
        return renderDangerSection();
      default:
        return renderAccountSection();
    }
  };

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto p-6 animate-pulse">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-8" />
        <div className="grid gap-8 lg:grid-cols-4">
          <div className="lg:col-span-1 h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="lg:col-span-3 h-96 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account and application preferences.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          <aside className="lg:col-span-1">
            <nav className="sticky top-6 space-y-2 p-2 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-200 dark:border-gray-700">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => handleSectionChange(section.id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 group ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        isActive
                          ? 'text-white'
                          : 'text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                      }`}
                    />
                    <span className="font-medium">{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="lg:col-span-3">
            <div key={activeSection} className="animate-fade-in">
              {renderSectionContent()}
            </div>
          </main>
        </div>
      </div>
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
