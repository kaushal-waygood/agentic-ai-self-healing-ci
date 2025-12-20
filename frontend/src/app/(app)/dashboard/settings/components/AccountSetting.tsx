'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Eye,
  EyeOff,
  Zap,
  Bell,
  Sparkles,
  Smartphone,
  Mail,
  Check,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
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
import { useTheme } from 'next-themes';
import { useDispatch, useSelector } from 'react-redux';
import { changePasswordRequest } from '@/redux/reducers/authReducer';
import { RootState } from '@/redux/rootReducer';
import { useToast } from '@/hooks/use-toast';

/* ===========================
   SECURITY SETTINGS (self-contained)
   =========================== */

export const SecuritySetting = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { message, error } = useSelector((state: RootState) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

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

  useEffect(() => {
    if (message) {
      toast({ title: 'Success', description: message });
    }
    if (error) {
      toast({
        title: 'Error',
        description: String(error),
        variant: 'destructive',
      });
    }
  }, [message, error, toast]);

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast({
        title: 'Error',
        description: 'Please fill all password fields.',
        variant: 'destructive',
      });
      return;
    }
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

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-950 dark:to-emerald-950/20 p-[1px]">
        <div className="relative z-10 rounded-2xl bg-white/90 dark:bg-slate-900/90 p-6 md:p-7">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  Change Password
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Use a strong, unique password to keep your account secure.
                </p>
              </div>
            </div>
            <span className="hidden md:inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-900/30 dark:text-emerald-200">
              <Sparkles className="h-3 w-3" /> Security check
            </span>
          </div>

          <div className="space-y-4">
            {/* Current password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter current password"
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <Input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              {newPassword && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600 dark:text-gray-300 font-medium">
                        Strength:
                      </span>
                      <span
                        className={`font-semibold ${
                          passwordStrength < 50
                            ? 'text-red-500'
                            : passwordStrength < 75
                            ? 'text-amber-500'
                            : 'text-emerald-500'
                        }`}
                      >
                        {passwordStrength < 50
                          ? 'Weak'
                          : passwordStrength < 75
                          ? 'Medium'
                          : 'Strong'}
                      </span>
                    </div>
                    <span className="text-gray-400 dark:text-gray-500">
                      Use at least 8 characters, mix of letters & symbols
                    </span>
                  </div>
                  <div className="w-full rounded-full bg-gray-200/70 dark:bg-gray-700 h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        passwordStrength < 50
                          ? 'bg-red-500'
                          : passwordStrength < 75
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(passwordStrength, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password
              </label>
              <Input
                type="password"
                placeholder="Confirm new password"
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
            </div>

            {/* Helper tips */}
            <div className="flex flex-wrap gap-2 text-[11px] text-gray-500 dark:text-gray-400">
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-1">
                <Check className="h-3 w-3 text-emerald-500" /> At least 8
                characters
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-1">
                <Check className="h-3 w-3 text-emerald-500" /> Use numbers &
                symbols
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-1">
                <Check className="h-3 w-3 text-emerald-500" /> Avoid reused
                passwords
              </span>
            </div>

            <Button
              onClick={handleChangePassword}
              className="w-full mt-2 hover:from-emerald-600 hover:to-teal-700 shadow-md shadow-emerald-500/20"
            >
              Update Password
            </Button>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-20">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="absolute -left-16 bottom-0 h-32 w-32 rounded-full bg-teal-200/40 blur-3xl" />
        </div>
      </div>
    </div>
  );
};

/* ===========================
   NOTIFICATION SETTINGS (self-contained)
   =========================== */

const NotificationToggle = ({
  id,
  title,
  description,
  icon: Icon,
  value,
  onToggle,
}: any) => (
  <div className="group flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-md bg-white dark:bg-gray-800/90">
    <div className="flex items-center space-x-3">
      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
        <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
          {title}
          {value && (
            <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-900/40 px-2 py-[2px] text-[10px] font-semibold text-emerald-600 dark:text-emerald-300">
              <Check className="h-3 w-3 mr-1" />
              Active
            </span>
          )}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
    <button
      type="button"
      onClick={onToggle}
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

export const NotificationSettings = () => {
  const [notifications, setNotifications] = useState({
    jobAlerts: true,
    applicationUpdates: true,
    promotionalEmails: false,
    pushNotifications: true,
    emailDigest: false,
    smsAlerts: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('zobsai_notifications');
    if (saved) {
      try {
        setNotifications((prev) => ({ ...prev, ...JSON.parse(saved) }));
      } catch {
        // ignore broken data
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      'zobsai_notifications',
      JSON.stringify(notifications),
    );
  }, [notifications]);

  const handleNotificationChange = (id: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          Notification Preferences
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Choose how you want to stay updated. You can change this anytime.
        </p>
      </div>
      <div className="grid gap-4">
        <NotificationToggle
          id="jobAlerts"
          title="Job Alerts"
          description="Get notified about new job opportunities"
          icon={Zap}
          value={notifications.jobAlerts}
          onToggle={() => handleNotificationChange('jobAlerts')}
        />
        <NotificationToggle
          id="applicationUpdates"
          title="Application Updates"
          description="Track your application status changes"
          icon={Bell}
          value={notifications.applicationUpdates}
          onToggle={() => handleNotificationChange('applicationUpdates')}
        />
        <NotificationToggle
          id="promotionalEmails"
          title="Platform News & Offers"
          description="Updates on new features and special offers"
          icon={Sparkles}
          value={notifications.promotionalEmails}
          onToggle={() => handleNotificationChange('promotionalEmails')}
        />
        <NotificationToggle
          id="pushNotifications"
          title="Push Notifications"
          description="Instant alerts on your device"
          icon={Smartphone}
          value={notifications.pushNotifications}
          onToggle={() => handleNotificationChange('pushNotifications')}
        />
        <NotificationToggle
          id="emailDigest"
          title="Weekly Digest"
          description="Summary of your activity and opportunities"
          icon={Mail}
          value={notifications.emailDigest}
          onToggle={() => handleNotificationChange('emailDigest')}
        />
        <NotificationToggle
          id="smsAlerts"
          title="SMS Alerts"
          description="Critical updates via text message"
          icon={Smartphone}
          value={notifications.smsAlerts}
          onToggle={() => handleNotificationChange('smsAlerts')}
        />
      </div>
    </div>
  );
};

/* ===========================
   APPEARANCE SETTINGS (self-contained)
   =========================== */

const ThemeButton = ({ isActive, onClick, gradient, label }: any) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative p-4 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] ${
      isActive
        ? 'border-blue-500 shadow-lg shadow-blue-500/25 bg-blue-50/40 dark:bg-slate-900/60'
        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-slate-900/80'
    }`}
  >
    <div className={`w-full h-16 rounded-lg ${gradient} mb-3`} />
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
      <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-1 shadow-md shadow-blue-500/40">
        <Check className="h-3 w-3 text-white" />
      </div>
    )}
  </button>
);

export const AppearanceSettings = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/90">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Theme Selection
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Switch between light, dark or follow your system preference.
          </p>
        </div>
        <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-[11px] text-gray-600 dark:text-gray-300">
          Personalization
        </span>
      </div>
      {!mounted ? (
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ThemeButton
            label="Light"
            isActive={theme === 'light'}
            onClick={() => setTheme('light')}
            gradient="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-200"
          />
          <ThemeButton
            label="Dark"
            isActive={theme === 'dark'}
            onClick={() => setTheme('dark')}
            gradient="bg-gradient-to-br from-gray-800 via-gray-900 to-black"
          />
          <ThemeButton
            label="System"
            isActive={theme === 'system'}
            onClick={() => setTheme('system')}
            gradient="bg-gradient-to-br from-gray-500 via-gray-700 to-gray-900"
          />
        </div>
      )}
    </div>
  );
};

/* ===========================
   DANGER SETTINGS (self-contained)
   =========================== */

export const DangerSettings = () => {
  const { toast } = useToast();

  const handleDeleteAccount = () => {
    // For now, just scream into the void
    toast({
      title: 'Feature In Development',
      description: 'Account deletion is not yet implemented.',
    });
  };

  return (
    <div className="p-6 rounded-xl border-2 border-red-200 dark:border-red-800 bg-red-50/60 dark:bg-red-950/30">
      <div className="flex items-start gap-3 mb-3">
        <div className="mt-1">
          <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/60 flex items-center justify-center">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-300" />
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">
            Delete Account
          </h4>
          <p className="text-red-700 dark:text-red-300 text-sm">
            Permanently delete your zobsai account and all associated data. This
            action cannot be undone.
          </p>
        </div>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            className="mt-2 hover:scale-[1.01] transition-transform"
          >
            Delete Account
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Are you absolutely sure?
            </AlertDialogTitle>
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
};
