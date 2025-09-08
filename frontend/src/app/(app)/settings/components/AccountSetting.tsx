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
import { useSelector, useDispatch } from 'react-redux';
import {
  setUserGoogleAuth,
  getProfileRequest,
} from '@/redux/reducers/authReducer';
import apiInstance from '@/services/api';
import { RootState } from '@/redux/rootReducer';

export const SecuritySetting = ({
  showPassword,
  setCurrentPassword,
  setShowPassword,
  newPassword,
  setNewPassword,
  passwordStrength,
  setConfirmNewPassword,
  handleChangePassword,
}: any) => (
  <div className="space-y-6">
    <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Change Password
      </h4>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Current Password
          </label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter current password"
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
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
            <div className="mt-2">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Strength:
                </span>
                <span
                  className={`text-sm font-medium ${
                    passwordStrength < 50
                      ? 'text-red-500'
                      : passwordStrength < 75
                      ? 'text-yellow-500'
                      : 'text-green-500'
                  }`}
                >
                  {passwordStrength < 50
                    ? 'Weak'
                    : passwordStrength < 75
                    ? 'Medium'
                    : 'Strong'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    passwordStrength < 50
                      ? 'bg-red-500'
                      : passwordStrength < 75
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${passwordStrength}%` }}
                />
              </div>
            </div>
          )}
        </div>
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
        <Button
          onClick={handleChangePassword}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
        >
          Update Password
        </Button>
      </div>
    </div>
  </div>
);

const NotificationToggle = ({
  id,
  title,
  description,
  icon: Icon,
  value,
  handleNotificationChange,
}: any) => (
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

const ThemeButton = ({ isActive, onClick, gradient, label }: any) => (
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

export const NotificationSettings = ({
  notifications,
  handleNotificationChange,
}: any) => (
  <div className="grid gap-4">
    <NotificationToggle
      id="jobAlerts"
      title="Job Alerts"
      description="Get notified about new job opportunities"
      icon={Zap}
      value={notifications.jobAlerts}
      handleNotificationChange={handleNotificationChange}
    />
    <NotificationToggle
      id="applicationUpdates"
      title="Application Updates"
      description="Track your application status changes"
      icon={Bell}
      value={notifications.applicationUpdates}
      handleNotificationChange={handleNotificationChange}
    />
    <NotificationToggle
      id="promotionalEmails"
      title="Platform News & Offers"
      description="Updates on new features and special offers"
      icon={Sparkles}
      value={notifications.promotionalEmails}
      handleNotificationChange={handleNotificationChange}
    />
    <NotificationToggle
      id="pushNotifications"
      title="Push Notifications"
      description="Instant alerts on your device"
      icon={Smartphone}
      value={notifications.pushNotifications}
      handleNotificationChange={handleNotificationChange}
    />
    <NotificationToggle
      id="emailDigest"
      title="Weekly Digest"
      description="Summary of your activity and opportunities"
      icon={Mail}
      value={notifications.emailDigest}
      handleNotificationChange={handleNotificationChange}
    />
    <NotificationToggle
      id="smsAlerts"
      title="SMS Alerts"
      description="Critical updates via text message"
      icon={Smartphone}
      value={notifications.smsAlerts}
      handleNotificationChange={handleNotificationChange}
    />
  </div>
);

export const AppearanceSettings = ({ mounted, theme, setTheme }: any) => (
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
          isActive={theme === 'light'}
          onClick={() => setTheme('light')}
          gradient="bg-gradient-to-br from-white to-gray-100 border border-gray-200"
        />
        <ThemeButton
          label="Dark"
          isActive={theme === 'dark'}
          onClick={() => setTheme('dark')}
          gradient="bg-gradient-to-br from-gray-800 to-gray-900"
        />
        <ThemeButton
          label="System"
          isActive={theme === 'system'}
          onClick={() => setTheme('system')}
          gradient="bg-gradient-to-br from-gray-500 to-gray-900"
        />
      </div>
    )}
  </div>
);

export const DangerSettings = ({ handleDeleteAccount }: any) => (
  <div className="p-6 rounded-xl border-2 border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
    <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
      Delete Account
    </h4>
    <p className="text-red-700 dark:text-red-300 text-sm mb-4">
      Permanently delete your CareerPilot account and all associated data. This
      action cannot be undone.
    </p>
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete Account</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action is permanent and cannot be undone. This will permanently
            delete your account and remove all of your data from our servers.
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
