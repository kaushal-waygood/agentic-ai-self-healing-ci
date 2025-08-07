'use client';

import { PageHeader } from '@/components/common/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Settings,
  Bell,
  Lock,
  Link as LinkIcon,
  Trash2,
  UserCircle,
  Palette,
  KeyRound,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import * as React from 'react';
import { useTheme } from 'next-themes';
import { Skeleton } from '@/components/ui/skeleton';
import { mockUserProfile } from '@/lib/data/user';
import { useToast } from '@/hooks/use-toast';
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
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/rootReducer';
import { changePasswordRequest } from '@/redux/reducers/authReducer';
import GoogleLoginButton from './GoogleLoginButton';
import apiInstance from '@/services/api';
import { sendEmailPermit } from '@/services/api/auth';

export default function SettingsPage() {
  const [notifications, setNotifications] = React.useState({
    jobAlerts: true,
    applicationUpdates: true,
    promotionalEmails: false,
  });

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const { toast } = useToast();

  const [crntPassword, setCrntPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error, message } = useSelector(
    (state: RootState) => state.auth,
  );

  // State to manage the linked account UI reactively
  const [isLinked, setIsLinked] = React.useState(mockUserProfile.isEmailLinked);
  const [provider, setProvider] = React.useState(
    mockUserProfile.linkedEmailProvider,
  );

  React.useEffect(() => {
    setMounted(true);
    // Sync state if mockUserProfile changes from another action (like login)
    setIsLinked(mockUserProfile.isEmailLinked);
    setProvider(mockUserProfile.linkedEmailProvider);
  }, []);

  const handleNotificationChange = (id: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLinkAccount = () => {
    // In a real app, this would initiate an OAuth flow.
    // Here, we'll simulate linking a Google account.
    mockUserProfile.isEmailLinked = true;
    mockUserProfile.linkedEmailProvider = 'Google';
    setIsLinked(true);
    setProvider('Google');
    toast({
      title: 'Account Linked',
      description: 'Your Google account has been successfully linked.',
    });
  };
  console.log(user);

  const handleSendEmail = () => {
    console.log('user?.email');
    const respones = sendEmailPermit({
      email: user?.email,
      recieverEmail: 'thesiddiqui7@gmail.com',
    });

    console.log(respones);
    toast({
      title: 'Email Sent',
      description: 'An email has been sent to your linked account.',
    });
  };

  const handleDisconnectAccount = () => {
    mockUserProfile.isEmailLinked = false;
    mockUserProfile.linkedEmailProvider = '';
    setIsLinked(false);
    setProvider('');
    toast({
      title: 'Account Disconnected',
      description: 'Your email account has been unlinked.',
    });
  };

  const showNotImplementedToast = (featureName: string) => {
    if (featureName === 'Change Password') {
      dispatch(
        changePasswordRequest({
          currentPassword: crntPassword,
          newPassword: newPassword,
          confirmNewPassword: confirmPassword,
        }),
      );
      if (error) {
        toast({
          title: 'Password Not Changed',
          description: `Your password has not been changed`,
        });
      }

      toast({
        title: 'Password Change Successfully',
        description: `Your password has been successfully changed`,
      });
    }
  };

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your account preferences and application settings."
        icon={Settings}
      />
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-primary" />
              Account Settings
            </CardTitle>
            <CardDescription>
              Manage your login, security, and personal data options.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-1">Profile Information</h4>
              <Button variant="outline" asChild>
                <Link href="/profile">Edit Profile Details</Link>
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                Update your name, job preferences, CV, and narratives.
              </p>
            </div>
            <Separator />
            <div>
              <h4 className="font-medium mb-1">Change Password</h4>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">
                    <KeyRound className="mr-2 h-4 w-4" />
                    Set New Password
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Change Your Password</AlertDialogTitle>
                    <AlertDialogDescription>
                      In a real application, you would enter your current and
                      new password here.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-4 py-4">
                    <Input
                      type="password"
                      placeholder="Current Password"
                      onChange={(e) => setCrntPassword(e.target.value)}
                    />
                    <Input
                      type="password"
                      placeholder="New Password"
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <Input
                      type="password"
                      placeholder="Confirm New Password"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button
                      type="submit"
                      onClick={() => showNotImplementedToast('Change Password')}
                    >
                      Change Password
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <p className="text-xs text-muted-foreground mt-1">
                It's a good idea to use a strong password that you're not using
                elsewhere.
              </p>
            </div>
            <Separator />
            <div>
              <h4 className="font-medium mb-1">
                Two-Factor Authentication (2FA)
              </h4>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">
                    <Lock className="mr-2 h-4 w-4" />
                    Enable 2FA
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Enable Two-Factor Authentication
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Add an extra layer of security to your account. You'll be
                      asked for a verification code from your authenticator app
                      when you log in. This feature is not implemented in the
                      demo.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => showNotImplementedToast('Enable 2FA')}
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <p className="text-xs text-muted-foreground mt-1">
                Add an extra layer of security to your account for peace of
                mind.
              </p>
            </div>
            <Separator />
            <div>
              <Button variant="outline" onClick={handleSendEmail}>
                Send Email
              </Button>
              <h4 className="font-medium mb-1">Linked Email Accounts</h4>
              {isLinked ? (
                <div className="flex items-center gap-4">
                  <p className="text-sm font-medium">
                    Connected to:{' '}
                    <span className="text-primary font-semibold">
                      {provider}
                    </span>
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDisconnectAccount}
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <GoogleLoginButton />
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Connect your Gmail or Outlook to send applications directly from
                CareerPilot.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Control how you receive updates from CareerPilot.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2 p-3 rounded-md border hover:bg-muted/50 transition-colors">
              <Label
                htmlFor="job-alerts"
                className="flex flex-col space-y-1 cursor-pointer"
              >
                <span>New Job Alerts</span>
                <span className="font-normal text-xs leading-snug text-muted-foreground">
                  Emails for jobs matching your preferences.
                </span>
              </Label>
              <Switch
                id="job-alerts"
                checked={notifications.jobAlerts}
                onCheckedChange={() => handleNotificationChange('jobAlerts')}
              />
            </div>
            <div className="flex items-center justify-between space-x-2 p-3 rounded-md border hover:bg-muted/50 transition-colors">
              <Label
                htmlFor="application-updates"
                className="flex flex-col space-y-1 cursor-pointer"
              >
                <span>Application Status Updates</span>
                <span className="font-normal text-xs leading-snug text-muted-foreground">
                  Notifications on your job applications.
                </span>
              </Label>
              <Switch
                id="application-updates"
                checked={notifications.applicationUpdates}
                onCheckedChange={() =>
                  handleNotificationChange('applicationUpdates')
                }
              />
            </div>
            <div className="flex items-center justify-between space-x-2 p-3 rounded-md border hover:bg-muted/50 transition-colors">
              <Label
                htmlFor="promotional-emails"
                className="flex flex-col space-y-1 cursor-pointer"
              >
                <span>Platform News & Offers</span>
                <span className="font-normal text-xs leading-snug text-muted-foreground">
                  Updates on new features and special offers.
                </span>
              </Label>
              <Switch
                id="promotional-emails"
                checked={notifications.promotionalEmails}
                onCheckedChange={() =>
                  handleNotificationChange('promotionalEmails')
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize the look and feel of CareerPilot.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Choose your preferred theme.
            </p>
            <div className="flex items-center space-x-2">
              {!mounted ? (
                <>
                  <Skeleton className="h-10 w-20" />
                  <Skeleton className="h-10 w-20" />
                  <Skeleton className="h-10 w-24" />
                </>
              ) : (
                <>
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    onClick={() => setTheme('light')}
                  >
                    Light
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    onClick={() => setTheme('dark')}
                  >
                    Dark
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
                    onClick={() => setTheme('system')}
                  >
                    System
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action is permanent and cannot be undone. This will
                    permanently delete your account and remove all of your data
                    from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive hover:bg-destructive/90"
                    onClick={() => showNotImplementedToast('Delete Account')}
                  >
                    Yes, delete my account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <p className="text-xs text-muted-foreground mt-2">
              Permanently delete your CareerPilot account and all associated
              data. This action cannot be undone.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
