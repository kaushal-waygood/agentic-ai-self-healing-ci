
"use client"; // Required for navigator.clipboard and useToast

import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Copy, Users, DollarSign, Share2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { mockUserProfile } from "@/lib/data/user";
import { mockSubscriptionPlans } from "@/lib/data/subscriptions";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReferralsPage() {
  const { toast } = useToast();
  
  const [referralsMade, setReferralsMade] = useState<number | null>(null);
  const [creditsEarned, setCreditsEarned] = useState<number | null>(null);
  const [userReferralCode, setUserReferralCode] = useState<string | null>(null);
  const [referralLink, setReferralLink] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs only on the client, preventing hydration mismatches.
    setReferralsMade(mockUserProfile.referralsMade || 0);
    setCreditsEarned(mockUserProfile.earnedApplicationCredits || 0);
    const code = mockUserProfile.referralCode || "";
    setUserReferralCode(code);
    setReferralLink(`${window.location.origin}/signup?ref=${code}`);
  }, []); 


  const handleCopyReferralLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    toast({ title: "Referral Link Copied!", description: "Share it with your friends." });
  };

  const handleSocialShare = (platform: 'twitter' | 'linkedin') => {
    if (!referralLink) return;
    
    const text = encodeURIComponent(`I'm using CareerPilot to supercharge my job search with AI. You should check it out! Use my link to get started:`);
    let url = '';

    if (platform === 'twitter') {
      url = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(referralLink)}`;
    } else if (platform === 'linkedin') {
      url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`;
    }

    if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      <PageHeader
        title="Referral Program"
        description="Invite friends to CareerPilot and earn application credits!"
        icon={Gift}
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Users className="h-5 w-5 text-primary"/>Invite Friends</CardTitle>
            <CardDescription>Share your unique referral link or code.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Your unique referral code:</p>
              {userReferralCode === null ? <Skeleton className="h-7 w-24" /> : <p className="text-lg font-semibold text-primary">{userReferralCode}</p>}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Your referral link:</p>
              <div className="flex items-center space-x-2">
                {referralLink === null ? <Skeleton className="h-10 flex-grow" /> : <Input type="text" value={referralLink} readOnly className="bg-muted/30"/> }
                <Button variant="outline" size="icon" onClick={handleCopyReferralLink} aria-label="Copy referral link" disabled={!referralLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => handleSocialShare('twitter')}>
                    <Share2 className="mr-2 h-4 w-4" /> Share on X
                </Button>
                 <Button variant="outline" size="sm" onClick={() => handleSocialShare('linkedin')}>
                    <Share2 className="mr-2 h-4 w-4" /> Share on LinkedIn
                </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Share via email, social media, or directly with your friends.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Gift className="h-5 w-5 text-primary"/>Your Referrals</CardTitle>
            <CardDescription>Track your referral progress.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {referralsMade === null ? <Skeleton className="h-10 w-16 mx-auto"/> : <div className="text-4xl font-bold font-headline">{referralsMade}</div>}
            <p className="text-sm text-muted-foreground">Successful Referrals</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><DollarSign className="h-5 w-5 text-primary"/>Credits Earned</CardTitle>
            <CardDescription>Rewards for your successful referrals.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {creditsEarned === null ? <Skeleton className="h-10 w-16 mx-auto"/> : <div className="text-4xl font-bold font-headline">{creditsEarned}</div>}
            <p className="text-sm text-muted-foreground">Application Credits</p>
            <Button variant="link" size="sm" className="mt-2 px-0">Learn more about rewards</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8 shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>1. Share your unique referral code or link with friends, colleagues, or anyone looking to boost their job search.</p>
          <p>2. When someone signs up for CareerPilot using your link or code and becomes an active user (e.g., applies for a job or subscribes), it counts as a successful referral.</p>
          <p>3. For each successful referral, you'll earn <strong>{mockSubscriptionPlans[0].referralBonus || '10 application credits'}</strong>. These credits can be used for more applications on the Basic plan or towards premium features.</p>
          <p>4. Keep track of your referrals and earned credits right here on this page. The more you share, the more you earn!</p>
        </CardContent>
      </Card>
    </>
  );
}
