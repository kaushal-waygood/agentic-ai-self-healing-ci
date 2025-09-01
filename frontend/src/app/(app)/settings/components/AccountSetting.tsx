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
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { KeyRound, Lock, UserCircle } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import GoogleLoginButton from '../GoogleLoginButton';

const AccountSetting = ({
  isLinked,
  setCrntPassword,
  setNewPassword,
  setConfirmPassword,
  showNotImplementedToast,
  handleDisconnectAccount,
  handleSendEmail,
  provider,
}: any) => {
  return (
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
                  In a real application, you would enter your current and new
                  password here.
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
          <h4 className="font-medium mb-1">Two-Factor Authentication (2FA)</h4>
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
                  asked for a verification code from your authenticator app when
                  you log in. This feature is not implemented in the demo.
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
            Add an extra layer of security to your account for peace of mind.
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
                <span className="text-primary font-semibold">{provider}</span>
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
  );
};

export default AccountSetting;
