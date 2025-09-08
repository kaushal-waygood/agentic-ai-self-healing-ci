'use client';

import React, { useState, useEffect } from 'react';
import {
  Gift,
  Copy,
  Users,
  DollarSign,
  Share2,
  Star,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/rootReducer';
import { getProfileRequest } from '@/redux/reducers/authReducer';

// UI Components (These remain unchanged)
const Card = ({ children, className = '', hover = true }) => (
  <div
    className={`bg-white rounded-2xl border border-slate-200 shadow-lg ${
      hover ? 'hover:shadow-xl hover:-translate-y-1' : ''
    } transition-all duration-300 ${className}`}
  >
    {children}
  </div>
);
const CardHeader = ({ children, className = '' }) => (
  <div className={`p-6 pb-2 ${className}`}>{children}</div>
);
const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 pt-2 ${className}`}>{children}</div>
);
const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);
const CardDescription = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-600 mt-1 ${className}`}>{children}</p>
);
const Button = ({
  children,
  variant = 'default',
  size = 'default',
  className = '',
  onClick,
  disabled = false,
  ...props
}) => {
  const variants = {
    default:
      'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl',
    outline:
      'border-2 border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400',
    success:
      'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg',
    secondary:
      'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg',
  };
  const sizes = {
    default: 'px-6 py-3 text-sm font-medium',
    sm: 'px-4 py-2 text-xs font-medium',
    icon: 'p-3 w-12 h-12 flex items-center justify-center',
  };
  return (
    <button
      className={`rounded-xl transition-all duration-200 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
const Input = ({ className = '', ...props }) => (
  <input
    className={`w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-slate-50 ${className}`}
    {...props}
  />
);
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />
);

export default function ReferralsPage() {
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);
  // NEW: State to check if Web Share API is supported
  const [isShareSupported, setIsShareSupported] = useState(false);

  const dispatch = useDispatch();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(getProfileRequest());
    // NEW: Check for Web Share API support on component mount
    if (navigator.share) {
      setIsShareSupported(true);
    }
  }, [dispatch]);

  useEffect(() => {
    if (user?.referralCode) {
      const link = `${window.location.origin}/signup?ref=${user.referralCode}`;
      setReferralLink(link);
    }
  }, [user]);

  const handleCopyReferralLink = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // NEW: Generic share handler using the Web Share API
  const handleShare = async () => {
    if (!referralLink) return;

    const shareData = {
      title: 'Join me on CareerPilot!',
      text: `🚀 I'm using CareerPilot to supercharge my job search with AI. You should check it out! Use my link to get started:`,
      url: referralLink,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        console.log('Referral link shared successfully!');
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  if (loading || !user) {
    // ... Skeleton loading state remains unchanged ...
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Stats Overview remains unchanged */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                Your Referrals
              </CardTitle>
              <CardDescription>
                Friends you've successfully referred
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4 text-3xl font-bold ">
                {user?.referralCount || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                Credits Earned
              </CardTitle>
              <CardDescription>
                Application credits from referrals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-3xl font-bold ">
                {(user?.referralCount || 0) * 15}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                15 credits per successful referral
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                  <Award className="h-5 w-5 text-white" />
                </div>
                Referral Rank
              </CardTitle>
              <CardDescription>Your current achievement level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold text-purple-600">Gold</div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((star) => (
                    <Star
                      key={star}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                  <Star className="h-4 w-4 text-gray-300" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                2 more referrals to reach Platinum
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Referral Section */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg">
                  <Share2 className="h-5 w-5 text-white" />
                </div>
                Share Your Link
              </CardTitle>
              <CardDescription>
                Spread the word and earn rewards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Your unique referral code:
                  </p>
                  <span className="font-mono p-2 bg-slate-100 rounded-md text-slate-700">
                    {user?.referralCode || '...'}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Your referral link:
                  </p>
                  <div className="flex gap-2">
                    {!referralLink ? (
                      <Skeleton className="h-12 flex-grow" />
                    ) : (
                      <Input
                        type="text"
                        value={referralLink}
                        readOnly
                        className="flex-1 font-mono text-sm"
                      />
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyReferralLink}
                      disabled={!referralLink}
                      className={
                        copied
                          ? 'bg-green-50 border-green-300 text-green-600'
                          : ''
                      }
                      title="Copy link"
                    >
                      {copied ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {copied && (
                    <p className="text-xs text-green-600 mt-1 font-medium">
                      ✨ Link copied to clipboard!
                    </p>
                  )}
                </div>
              </div>

              {/* MODIFIED: Updated Quick Share Section */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">
                  Quick Share:
                </p>
                {isShareSupported ? (
                  <Button
                    variant="secondary"
                    size="default"
                    onClick={handleShare}
                    className="w-full md:w-auto"
                  >
                    <Share2 className="mr-2 h-4 w-4" /> Share via...
                  </Button>
                ) : (
                  <p className="text-xs text-gray-500">
                    Use the copy button to share your link on desktop.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Reward Structure Card remains unchanged */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
                  <Gift className="h-5 w-5 text-white" />
                </div>
                Reward Structure
              </CardTitle>
              <CardDescription>
                What you earn for each milestone
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                  <div>
                    <p className="font-semibold text-purple-700">
                      Each Referral
                    </p>
                    <p className="text-sm text-gray-600">
                      Friend signs up & becomes active
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-purple-600">15</p>
                    <p className="text-xs text-gray-500">credits</p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-cyan-50 rounded-lg border border-green-200">
                  <div>
                    <p className="font-semibold text-green-700">
                      Milestone Bonus
                    </p>
                    <p className="text-sm text-gray-600">
                      Every 10 successful referrals
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">50</p>
                    <p className="text-xs text-gray-500">bonus credits</p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div>
                    <p className="font-semibold text-orange-700">
                      Premium Upgrade
                    </p>
                    <p className="text-sm text-gray-600">
                      Friend subscribes to Pro plan
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-orange-600">100</p>
                    <p className="text-xs text-gray-500">extra credits</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How It Works section remains unchanged */}
        <Card
          hover={false}
          className="bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 border-purple-200"
        >
          <CardHeader>
            <CardTitle className="text-xl">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white font-bold">1</span>
                </div>
                <h4 className="font-semibold text-gray-900">Share Your Link</h4>
                <p className="text-sm text-gray-600">
                  Send your unique referral link to friends, colleagues, or
                  social media
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white font-bold">2</span>
                </div>
                <h4 className="font-semibold text-gray-900">Friend Signs Up</h4>
                <p className="text-sm text-gray-600">
                  They create an account using your referral code or link
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white font-bold">3</span>
                </div>
                <h4 className="font-semibold text-gray-900">They Get Active</h4>
                <p className="text-sm text-gray-600">
                  Your friend applies for jobs or subscribes to a plan
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white font-bold">4</span>
                </div>
                <h4 className="font-semibold text-gray-900">
                  You Earn Credits
                </h4>
                <p className="text-sm text-gray-600">
                  Receive 15 application credits instantly, plus bonuses!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
