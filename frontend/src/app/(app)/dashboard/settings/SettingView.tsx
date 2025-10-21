'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';

import { RootState } from '@/redux/rootReducer';
import { changePasswordRequest } from '@/redux/reducers/authReducer';

import { sendEmailPermit } from '@/services/api/auth';

import { Bell, Palette, Trash2, UserCircle, Shield } from 'lucide-react';
import { AccountSetting } from './components/AccountSettings';
import {
  AppearanceSettings,
  DangerSettings,
  NotificationSettings,
  SecuritySetting,
} from './components/AccountSetting';

export default function SettingsView() {
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
    router.push(`/dashboard/settings?tab=${section}`);
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
    if (!user?.email) {
      toast({
        title: 'Error',
        description: 'User email not found.',
        variant: 'destructive',
      });
      return;
    }
    try {
      await sendEmailPermit({
        email: user.email,
        recieverEmail: 'thesiddiqui7@gmail.com', // Example receiver
      });
      toast({
        title: 'Email Sent',
        description: 'A permission email has been sent successfully.',
      });
    } catch (e) {
      toast({
        title: 'Email Failed',
        description: 'Could not send the email.',
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

  // Render Functions for Sections
  const renderAccountSection = () => (
    <AccountSetting user={user} handleSendEmail={handleSendEmail} />
  );

  const renderSecuritySection = () => (
    <SecuritySetting
      showPassword={showPassword}
      setCurrentPassword={setCurrentPassword}
      setShowPassword={setShowPassword}
      newPassword={newPassword}
      setNewPassword={setNewPassword}
      passwordStrength={passwordStrength}
      setConfirmNewPassword={setConfirmNewPassword}
      handleChangePassword={handleChangePassword}
    />
  );

  const renderNotificationsSection = () => (
    <NotificationSettings
      notifications={notifications}
      handleNotificationChange={handleNotificationChange}
    />
  );

  const renderAppearanceSection = () => (
    <AppearanceSettings mounted={mounted} theme={theme} setTheme={setTheme} />
  );

  const renderDangerSection = () => (
    <DangerSettings handleDeleteAccount={handleDeleteAccount} />
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
