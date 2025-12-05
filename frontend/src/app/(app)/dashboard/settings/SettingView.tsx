'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserCircle, Shield, Bell, Palette, Trash2 } from 'lucide-react';
import { AccountSetting } from './components/AccountSettings';
import {
  AppearanceSettings,
  DangerSettings,
  NotificationSettings,
  SecuritySetting,
} from './components/AccountSetting';

export default function SettingsView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeSection = searchParams.get('tab') || 'account';

  const handleSectionChange = (section: string) => {
    router.push(`/dashboard/settings?tab=${section}`);
  };

  const sections = [
    { id: 'account', label: 'Account', icon: UserCircle },
    { id: 'security', label: 'Security', icon: Shield },
    //   { id: 'notifications', label: 'Notifications', icon: Bell },
    //   { id: 'appearance', label: 'Appearance', icon: Palette },
    //   { id: 'danger', label: 'Danger Zone', icon: Trash2 },
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'account':
        return <AccountSetting />;
      case 'security':
        return <SecuritySetting />;
      case 'notifications':
        return <NotificationSettings />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'danger':
        return <DangerSettings />;
      default:
        return <AccountSetting />;
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
