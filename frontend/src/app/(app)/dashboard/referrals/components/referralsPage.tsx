// 'use client';
// export const CREDIT_EARN = {
//   SIGNUP_WITH_REFERRAL_REFERRED: 50,
//   SIGNUP_WITH_REFERRAL_REFERRER: 50,
//   DAILY_CHECKIN: 10,
//   FIRST_JOB_SEARCH: 5,
//   FIRST_CV: 10,
//   FIRST_CL: 10,
//   PROFILE_COMPLETE_PERSONAL: 10,
//   PROFILE_COMPLETE_EDUCATION: 10,
//   PROFILE_COMPLETE_EXPERIENCE: 10,
//   PROFILE_COMPLETE_PROJECT: 10,
//   PROFILE_COMPLETE_SKILL: 10,
//   JOB_SEARCH_DAILY: 5,
//   FOLLOW_SOCIAL: 5,
//   READ_BLOG: 5,
//   ALLOW_BROWSER_NOTIF: 20,
//   FIRST_AUTO_AGENT_SETUP: 10,
//   FIRST_AUTO_APPLICATION_SENT: 10,
//   APPLY_ON_COMPANY_SITE: 1,
//   LIKE_COMMENT_SHARE: 1,
//   SHARE_SOCIAL_CONTENT: 1,
//   VISITJOB_SITE: 5,
// };

// import React, { useState, useEffect } from 'react';
// import {
//   Gift,
//   Copy,
//   Users,
//   DollarSign,
//   Share2,
//   Star,
//   Award,
//   CheckCircle2,
//   Shield,
//   Gem,
// } from 'lucide-react';
// import { useDispatch, useSelector } from 'react-redux';
// import { getProfileRequest } from '@/redux/reducers/authReducer';

// // --- UI Components ---
// const Card = ({ children, className = '', hover = true }) => (
//   <div
//     className={`bg-white rounded-lg border border-slate-200 transition-all duration-300 ${className}`}
//   >
//     {children}
//   </div>
// );
// const CardHeader = ({ children, className = '' }) => (
//   <div className={`p-6 pb-2 ${className}`}>{children}</div>
// );
// const CardContent = ({ children, className = '' }) => (
//   <div className={`p-6 pt-2 ${className}`}>{children}</div>
// );
// const CardTitle = ({ children, className = '' }) => (
//   <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
//     {children}
//   </h3>
// );
// const CardDescription = ({ children, className = '' }) => (
//   <p className={`text-sm text-gray-600 mt-1 ${className}`}>{children}</p>
// );
// const Button = ({
//   children,
//   variant = 'default',
//   size = 'default',
//   className = '',
//   onClick,
//   disabled = false,
//   ...props
// }) => {
//   const variants = {
//     default:
//       'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white  ',
//     outline:
//       'border-2 border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400',
//     success:
//       'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white ',
//     secondary:
//       'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white ',
//   };
//   const sizes = {
//     default: 'px-6 py-3 text-sm font-medium',
//     sm: 'px-4 py-2 text-xs font-medium',
//     icon: 'p-3 w-12 h-12 flex items-center justify-center',
//   };
//   return (
//     <button
//       className={`rounded-lg transition-all duration-200 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
//       onClick={onClick}
//       disabled={disabled}
//       {...props}
//     >
//       {children}
//     </button>
//   );
// };
// const Input = ({ className = '', ...props }) => (
//   <input
//     className={`w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-slate-50 ${className}`}
//     {...props}
//   />
// );
// const Skeleton = ({ className = '' }) => (
//   <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />
// );

// // --- Referral Logic ---
// const referralTiers = [
//   { name: 'Bronze', threshold: 0, icon: Shield, color: 'text-orange-600' },
//   { name: 'Silver', threshold: 5, icon: Star, color: 'text-gray-500' },
//   { name: 'Gold', threshold: 10, icon: Award, color: 'text-yellow-500' },
//   { name: 'Platinum', threshold: 20, icon: Gem, color: 'text-blue-500' },
//   { name: 'Diamond', threshold: 50, icon: Gem, color: 'text-purple-500' },
// ];

// const getReferralTier = (referralCount) => {
//   let currentTier = referralTiers[0];
//   let nextTier = referralTiers[1];

//   for (let i = 0; i < referralTiers.length; i++) {
//     if (referralCount >= referralTiers[i].threshold) {
//       currentTier = referralTiers[i];
//       if (i < referralTiers.length - 1) {
//         nextTier = referralTiers[i + 1];
//       } else {
//         nextTier = currentTier; // Max rank reached
//       }
//     }
//   }

//   const isMaxRank = currentTier.name === nextTier.name;
//   const progressStart = currentTier.threshold;
//   const progressEnd = nextTier.threshold;

//   const neededForNext = isMaxRank ? 0 : progressEnd - referralCount;

//   const progressPercent = isMaxRank
//     ? 100
//     : Math.floor(
//         ((referralCount - progressStart) / (progressEnd - progressStart)) * 100,
//       );

//   return {
//     ...currentTier,
//     nextTierName: nextTier.name,
//     neededForNext,
//     progressPercent,
//     isMaxRank,
//   };
// };

// export default function ReferralsPage() {
//   const [referralLink, setReferralLink] = useState('');
//   const [copied, setCopied] = useState(false);
//   const [isShareSupported, setIsShareSupported] = useState(false);

//   const dispatch = useDispatch();
//   const { user, loading } = useSelector((state) => state.auth);

//   useEffect(() => {
//     dispatch(getProfileRequest());
//     if (navigator.share) {
//       setIsShareSupported(true);
//     }
//   }, [dispatch]);

//   useEffect(() => {
//     if (user?.referralCode) {
//       const link = `${window.location.origin}/signup?ref=${user.referralCode}`;
//       setReferralLink(link);
//     }
//   }, [user]);

//   const handleCopyReferralLink = async () => {
//     if (!referralLink) return;
//     try {
//       await navigator.clipboard.writeText(referralLink);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     } catch (err) {
//       console.error('Failed to copy:', err);
//     }
//   };

//   const handleShare = async () => {
//     if (!referralLink) return;
//     const shareData = {
//       title: 'Join me on ZobsAI!',
//       text: `🚀 I'm using ZobsAI to supercharge my job search with AI. Use my link to get started:`,
//       url: referralLink,
//     };
//     try {
//       if (navigator.share) {
//         await navigator.share(shareData);
//       }
//     } catch (err) {
//       console.error('Share failed:', err);
//     }
//   };

//   if (loading || !user) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
//         <div className="max-w-7xl mx-auto">
//           <div className="grid gap-6 md:grid-cols-3 mb-8">
//             <Skeleton className="h-40" />
//             <Skeleton className="h-40" />
//             <Skeleton className="h-40" />
//           </div>
//           <div className="grid gap-6 lg:grid-cols-2">
//             <Skeleton className="h-64" />
//             <Skeleton className="h-64" />
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const currentTier = getReferralTier(user.referralCount || 0);
//   const RankIcon = currentTier.icon;
//   // Use the value from the config
//   const creditsPerReferral = CREDIT_EARN.SIGNUP_WITH_REFERRAL_REFERRER;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* --- Stats Overview --- */}
//         <div className="grid gap-6 md:grid-cols-2 mb-8">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-3">
//                 <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
//                   <Users className="h-5 w-5 text-white" />
//                 </div>
//                 Your Referrals
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold">
//                 {user?.referralCount || 0}
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-3">
//                 <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
//                   <DollarSign className="h-5 w-5 text-white" />
//                 </div>
//                 Credits Earned
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold">
//                 {(user?.referralCount || 0) * creditsPerReferral}
//               </div>
//               <p className="text-xs text-gray-500 mt-1">
//                 {creditsPerReferral} credits per referral
//               </p>
//             </CardContent>
//           </Card>
//         </div>

//         {/* --- Main Referral Section --- */}
//         <div className="grid gap-6 lg:grid-cols-2 mb-8">
//           <Card className="lg:col-span-1">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-3">
//                 <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg">
//                   <Share2 className="h-5 w-5 text-white" />
//                 </div>
//                 Share Your Link
//               </CardTitle>
//               <CardDescription>
//                 Spread the word and earn rewards
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="space-y-3">
//                 <div>
//                   <p className="text-sm font-medium text-gray-700 mb-2">
//                     Your unique referral link:
//                   </p>
//                   <div className="flex gap-2">
//                     <Input
//                       type="text"
//                       value={referralLink}
//                       readOnly
//                       className="flex-1 font-mono text-sm"
//                     />
//                     <Button
//                       variant="outline"
//                       size="icon"
//                       onClick={handleCopyReferralLink}
//                       disabled={!referralLink}
//                       className={
//                         copied
//                           ? 'bg-green-50 border-green-300 text-green-600'
//                           : ''
//                       }
//                       title="Copy link"
//                     >
//                       {copied ? (
//                         <CheckCircle2 className="h-4 w-4" />
//                       ) : (
//                         <Copy className="h-4 w-4" />
//                       )}
//                     </Button>
//                   </div>
//                   {copied && (
//                     <p className="text-xs text-green-600 mt-1 font-medium">
//                       ✨ Link copied to clipboard!
//                     </p>
//                   )}
//                 </div>
//               </div>
//               <div className="space-y-3 ">
//                 <p className="text-sm font-medium text-gray-700">
//                   Quick Share:
//                 </p>
//                 {isShareSupported ? (
//                   <Button
//                     variant="secondary"
//                     size="default"
//                     onClick={handleShare}
//                     className=" flex items-center"
//                   >
//                     <Share2 className="mr-2 h-4 w-4" /> Share via...
//                   </Button>
//                 ) : (
//                   <p className="text-xs text-gray-500">
//                     Use the copy button to share your link.
//                   </p>
//                 )}
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-3">
//                 <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
//                   <Gift className="h-5 w-5 text-white" />
//                 </div>
//                 Reward Structure
//               </CardTitle>
//               <CardDescription>
//                 What you earn for each milestone
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div className="flex justify-between items-center p-3  rounded-lg border border-purple-200">
//                   <div>
//                     <p className="font-semibold text-purple-700">
//                       Each Referral
//                     </p>
//                     <p className="text-sm text-gray-600">
//                       Friend signs up & gets active
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-xl font-bold text-purple-600">
//                       {creditsPerReferral}
//                     </p>
//                     <p className="text-xs text-gray-500">credits</p>
//                   </div>
//                 </div>
//                 <div className="flex justify-between items-center p-3 rounded-lg border border-green-200">
//                   <div>
//                     <p className="font-semibold text-green-700">
//                       Milestone Bonus
//                     </p>
//                     <p className="text-sm text-gray-600">
//                       Every 10 successful referrals
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-xl font-bold text-green-600">50</p>
//                     <p className="text-xs text-gray-500">bonus credits</p>
//                   </div>
//                 </div>
//                 <div className="flex justify-between items-center p-3 rounded-lg border border-yellow-200">
//                   <div>
//                     <p className="font-semibold text-orange-700">
//                       Premium Upgrade
//                     </p>
//                     <p className="text-sm text-gray-600">
//                       Friend subscribes to a Pro plan
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-xl font-bold text-orange-600">100</p>
//                     <p className="text-xs text-gray-500">extra credits</p>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* --- How It Works Section --- */}
//         <Card hover={false} className=" border-purple-200">
//           <CardHeader>
//             <CardTitle className="text-xl">How It Works</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
//               <div className="text-center space-y-3">
//                 <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
//                   <span className="text-white font-bold">1</span>
//                 </div>
//                 <h4 className="font-semibold text-gray-900">Share Your Link</h4>
//                 <p className="text-sm text-gray-600">
//                   Send your unique link to friends or colleagues.
//                 </p>
//               </div>
//               <div className="text-center space-y-3">
//                 <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
//                   <span className="text-white font-bold">2</span>
//                 </div>
//                 <h4 className="font-semibold text-gray-900">Friend Signs Up</h4>
//                 <p className="text-sm text-gray-600">
//                   They create an account using your referral link.
//                 </p>
//               </div>
//               <div className="text-center space-y-3">
//                 <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto">
//                   <span className="text-white font-bold">3</span>
//                 </div>
//                 <h4 className="font-semibold text-gray-900">They Get Active</h4>
//                 <p className="text-sm text-gray-600">
//                   Your friend applies for jobs or subscribes.
//                 </p>
//               </div>
//               <div className="text-center space-y-3">
//                 <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto">
//                   <span className="text-white font-bold">4</span>
//                 </div>
//                 <h4 className="font-semibold text-gray-900">
//                   You Earn Credits
//                 </h4>
//                 <p className="text-sm text-gray-600">
//                   Receive {creditsPerReferral} credits instantly, plus bonuses!
//                 </p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }

'use client';

export const CREDIT_EARN = {
  SIGNUP_WITH_REFERRAL_REFERRED: 50,
  SIGNUP_WITH_REFERRAL_REFERRER: 50,
  DAILY_CHECKIN: 10,
  FIRST_JOB_SEARCH: 5,
  FIRST_CV: 10,
  FIRST_CL: 10,
  PROFILE_COMPLETE_PERSONAL: 10,
  PROFILE_COMPLETE_EDUCATION: 10,
  PROFILE_COMPLETE_EXPERIENCE: 10,
  PROFILE_COMPLETE_PROJECT: 10,
  PROFILE_COMPLETE_SKILL: 10,
  JOB_SEARCH_DAILY: 5,
  FOLLOW_SOCIAL: 5,
  READ_BLOG: 5,
  ALLOW_BROWSER_NOTIF: 20,
  FIRST_AUTO_AGENT_SETUP: 10,
  FIRST_AUTO_APPLICATION_SENT: 10,
  APPLY_ON_COMPANY_SITE: 1,
  LIKE_COMMENT_SHARE: 1,
  SHARE_SOCIAL_CONTENT: 1,
  VISITJOB_SITE: 5,
};

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Copy } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getProfileRequest } from '@/redux/reducers/authReducer';
import { RootState } from '@/redux/rootReducer';

export default function ReferralsPage() {
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);

  const dispatch = useDispatch();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(getProfileRequest());
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

  const handleShareX = () => {
    if (!referralLink) return;
    const text =
      "🚀 I'm using ZobsAI to supercharge my job search with AI. Use my link to get started:";
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralLink)}`;
    window.open(url, '_blank');
  };

  const handleShareLinkedIn = () => {
    if (!referralLink) return;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`;
    window.open(url, '_blank');
  };

  const creditsPerReferral = CREDIT_EARN.SIGNUP_WITH_REFERRAL_REFERRER;

  if (loading || !user) {
    return (
      <div className="flex h-screen flex-col bg-slate-50 font-jakarta antialiased">
        <main className="flex-1 p-6 md:p-8 lg:p-10">
          <div className="mx-auto w-full max-w-[1000px] space-y-6 md:space-y-8 animate-pulse">
            <div className="h-10 w-48 rounded-lg bg-slate-200"></div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6">
              <div className="h-28 rounded-[20px] bg-slate-200"></div>
              <div className="h-28 rounded-[20px] bg-slate-200"></div>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 md:gap-8">
              <div className="h-72 rounded-[24px] bg-slate-200"></div>
              <div className="h-72 rounded-[24px] bg-slate-200"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-jakarta text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      <main className="custom-scrollbar flex-1 overflow-y-auto p-6 md:p-8 lg:p-8">
        <div className="mx-auto w-full max-w-[1200px] space-y-6 md:space-y-8">
          {/* HEADER */}
          <div>
            <h1 className="text-[28px] font-black leading-tight tracking-tight text-slate-900">
              Refer & Earn
            </h1>
            <p className="mt-1 text-[14px] font-medium text-slate-500">
              Spread the word, invite your friends, and earn exclusive rewards.
            </p>
          </div>

          {/* STATS ROW */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6">
            <div className="group flex items-center justify-between rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md">
              <div>
                <div className="mb-1 text-[13px] font-extrabold uppercase tracking-widest text-slate-500 transition-colors group-hover:text-blue-600">
                  Your Referrals
                </div>
                <div className="text-4xl font-black tracking-tight text-slate-900">
                  {user?.referralCount || 0}
                </div>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm">
                <svg
                  className="h-7 w-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="group flex items-center justify-between rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md">
              <div>
                <div className="mb-1 text-[13px] font-extrabold uppercase tracking-widest text-slate-500 transition-colors group-hover:text-emerald-600">
                  Credits Earned
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black tracking-tight text-slate-900">
                    {(user?.referralCount || 0) * creditsPerReferral}
                  </span>
                  <span className="rounded-md border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-600">
                    {creditsPerReferral} / referral
                  </span>
                </div>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm">
                <svg
                  className="h-7 w-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* MIDDLE SECTION */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 md:gap-8">
            {/* Share Your Link */}
            <section className="flex flex-col rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-[18px] font-extrabold tracking-tight text-slate-900">
                    Share Your Link
                  </h2>
                  <p className="text-[13px] font-medium text-slate-500">
                    Spread the word and earn credits instantly.
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <label className="mb-2 block text-[13px] font-bold text-slate-700">
                  Your unique referral link:
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1.5 transition-all focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50">
                  <input
                    readOnly
                    value={referralLink}
                    className="flex-1 truncate bg-transparent px-3 py-2 text-[14px] font-semibold text-slate-800 outline-none select-all"
                  />
                  <button
                    onClick={handleCopyReferralLink}
                    className={`flex shrink-0 items-center justify-center gap-1.5 rounded-lg border bg-white px-4 py-2 text-[12px] font-bold transition-all shadow-sm ${
                      copied
                        ? 'border-green-300 text-green-600'
                        : 'border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600'
                    }`}
                  >
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="mt-auto">
                <label className="mb-3 block text-[13px] font-bold text-slate-700">
                  Quick Share:
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleShareX}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-[13.5px] font-bold text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                    </svg>
                    Share on X
                  </button>
                  <button
                    onClick={handleShareLinkedIn}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0A66C2] px-5 py-3 text-[13.5px] font-bold text-white shadow-[0_4px_12px_rgba(10,102,194,0.25)] transition-all hover:-translate-y-0.5 hover:bg-[#004182]"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    Share on LinkedIn
                  </button>
                </div>
              </div>
            </section>

            {/* Reward Structure */}
            <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                    ></path>
                  </svg>
                </div>
                <div>
                  <h2 className="text-[18px] font-extrabold tracking-tight text-slate-900">
                    Reward Structure
                  </h2>
                  <p className="text-[13px] font-medium text-slate-500">
                    What you earn for each milestone.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:bg-slate-50">
                  <div className="flex items-center gap-3.5">
                    <div className="h-8 w-2 rounded-full bg-indigo-400 transition-colors group-hover:bg-indigo-500"></div>
                    <div>
                      <div className="mb-1 text-[14px] font-extrabold leading-none text-slate-900">
                        Each Referral
                      </div>
                      <div className="text-[12px] font-medium text-slate-500">
                        Friend signs up & gets active
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[18px] font-black leading-none text-indigo-600">
                      {creditsPerReferral}
                    </div>
                    <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                      Credits
                    </div>
                  </div>
                </div>

                <div className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:bg-slate-50">
                  <div className="flex items-center gap-3.5">
                    <div className="h-8 w-2 rounded-full bg-emerald-400 transition-colors group-hover:bg-emerald-500"></div>
                    <div>
                      <div className="mb-1 text-[14px] font-extrabold leading-none text-slate-900">
                        Milestone Bonus
                      </div>
                      <div className="text-[12px] font-medium text-slate-500">
                        Every 10 successful referrals
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[18px] font-black leading-none text-emerald-600">
                      50
                    </div>
                    <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      Bonus
                    </div>
                  </div>
                </div>

                <div className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:bg-slate-50">
                  <div className="flex items-center gap-3.5">
                    <div className="h-8 w-2 rounded-full bg-blue-500 transition-colors group-hover:bg-blue-600"></div>
                    <div>
                      <div className="mb-1 text-[14px] font-extrabold leading-none text-slate-900">
                        Premium Upgrade
                      </div>
                      <div className="text-[12px] font-medium text-slate-500">
                        Friend subscribes to a Pro plan
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[18px] font-black leading-none text-blue-600">
                      100
                    </div>
                    <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-400">
                      Extra
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* BOTTOM SECTION: How It Works */}
          <section className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-10">
            <div className="relative z-10 mb-10 text-center">
              <h2 className="mb-1 text-[20px] font-extrabold tracking-tight text-slate-900">
                How It Works
              </h2>
              <p className="text-[13.5px] font-medium text-slate-500">
                Four simple steps to start earning your rewards.
              </p>
            </div>

            {/* Horizontal Line Connector (Desktop only) */}
            <div className="absolute left-20 right-20 top-[110px] z-0 hidden h-1 rounded-full bg-slate-100 md:block"></div>

            <div className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-4 md:gap-4">
              <div className="group flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white text-lg font-black text-slate-400 shadow-sm transition-all group-hover:border-blue-500 group-hover:bg-blue-50 group-hover:text-blue-600">
                  1
                </div>
                <h4 className="mb-1.5 text-[14.5px] font-extrabold text-slate-900 transition-colors group-hover:text-blue-600">
                  Share Your Link
                </h4>
                <p className="px-4 text-[12px] font-medium leading-relaxed text-slate-500">
                  Send your unique referral link to friends or colleagues.
                </p>
              </div>

              <div className="group flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white text-lg font-black text-slate-400 shadow-sm transition-all group-hover:border-blue-500 group-hover:bg-blue-50 group-hover:text-blue-600">
                  2
                </div>
                <h4 className="mb-1.5 text-[14.5px] font-extrabold text-slate-900 transition-colors group-hover:text-blue-600">
                  Friend Signs Up
                </h4>
                <p className="px-4 text-[12px] font-medium leading-relaxed text-slate-500">
                  They create a free account using your custom link.
                </p>
              </div>

              <div className="group flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white text-lg font-black text-slate-400 shadow-sm transition-all group-hover:border-blue-500 group-hover:bg-blue-50 group-hover:text-blue-600">
                  3
                </div>
                <h4 className="mb-1.5 text-[14.5px] font-extrabold text-slate-900 transition-colors group-hover:text-blue-600">
                  They Get Active
                </h4>
                <p className="px-4 text-[12px] font-medium leading-relaxed text-slate-500">
                  Your friend applies for jobs or uses an AI tool.
                </p>
              </div>

              <div className="group flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-blue-500 bg-blue-50 text-lg font-black text-blue-600 shadow-md shadow-blue-500/20 transition-all">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h4 className="mb-1.5 text-[14.5px] font-extrabold text-blue-600">
                  You Earn Credits
                </h4>
                <p className="px-4 text-[12px] font-medium leading-relaxed text-slate-500">
                  Receive {creditsPerReferral} credits instantly added to your
                  balance!
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <style jsx>{`
        /* Elegant custom scrollbars */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
