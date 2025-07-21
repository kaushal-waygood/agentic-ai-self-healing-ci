
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockSubscriptionPlans, SubscriptionPlan } from "@/lib/data/subscriptions"; 
import { mockUserProfile, mockOrganizations, type Organization, PlanId, mockUsers, UserProfile, planTierOrder } from "@/lib/data/user"; 
import { CheckCircle, Zap, Building, School, Mail, Star, Gem, ShieldCheck, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

const iconMap: { [key: string]: React.ElementType } = {
  Zap,
  Star,
  Gem,
  ShieldCheck,
  Building,
};

// Skeleton component for a better loading experience
function PricingTableSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-stretch">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="flex flex-col">
          <CardHeader className="pt-8 text-center">
            <Skeleton className="h-7 w-1/2 mx-auto" />
            <Skeleton className="h-4 w-3/4 mx-auto mt-2" />
            <Skeleton className="h-10 w-1/3 mx-auto mt-4" />
          </CardHeader>
          <CardContent className="flex-grow space-y-3">
            {[...Array(4)].map((_, j) => (
              <div key={j} className="flex items-start">
                <Skeleton className="h-5 w-5 rounded-full mr-2 shrink-0" />
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function renderLimit(label: string, limit: number, unit: string) {
    if (limit === 0 && label !== 'AI application credits') return null;
    let text = '';
    if (label === 'AI application credits') {
      text = `Earn ${limit} ${label} per successful referral`;
      return (
        <li className="flex items-start">
            <Star className="h-5 w-5 text-yellow-500 mr-2 shrink-0 mt-0.5" />
            <span>{text}</span>
        </li>
      );
    } else {
      text = limit === -1 ? `Unlimited ${label}` : `Up to ${limit} ${label} ${unit}`;
    }

    return (
        <li className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
            <span>{text}</span>
        </li>
    );
}

type BillingCycle = 'monthly' | 'quarterly' | 'halfYearly';

export function PricingTable() {
  const { toast } = useToast();
  const router = useRouter();
  
  const [isClient, setIsClient] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  // Dialog states
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [isDowngradeDialogOpen, setIsDowngradeDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  // Data for dialogs
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [upgradeDetails, setUpgradeDetails] = useState({ newPlanCost: 0, credit: 0, amountDue: 0, seats: 1, seatCost: 0 });
  
  const [recipientEmail, setRecipientEmail] = useState("");
  const defaultSubject = "A zero-cost opportunity to supercharge our students' careers";
  const [defaultBody, setDefaultBody] = useState("");
  const [emailBody, setEmailBody] = useState("");
  
  useEffect(() => {
    let user = mockUserProfile;
    
    // --- SIMULATED BACKGROUND TASK FOR DOWNGRADES ---
    // In a real app, a cron job would handle this. Here, we check on page load.
    if (user.scheduledPlanChange && user.subscriptionEndDate && new Date() >= new Date(user.subscriptionEndDate)) {
        const downgradedPlanId = user.scheduledPlanChange;
        const today = new Date();
        const newEndDate = new Date(today);
        newEndDate.setMonth(newEndDate.getMonth() + 1); // Default to monthly for the new cycle

        // For organization members, a downgrade means cancelling their personal plan add-on.
        // Their base `currentPlanId` is determined by the org and doesn't change here.
        if (user.role === 'OrgMember' || user.role === 'OrgAdmin') {
            user.personalPlanId = undefined;
            user.personalSubscriptionStatus = undefined;
        } else {
            // For individual users, we change their main plan.
            user.currentPlanId = downgradedPlanId;
        }

        // Reset subscription cycle details for individuals or org members who are starting a new (downgraded) billing cycle.
        user.subscriptionStartDate = today.toISOString();
        user.subscriptionEndDate = newEndDate.toISOString();
        user.billingCycle = 'monthly'; // Reset to monthly on downgrade
        user.scheduledPlanChange = null; // Clear the scheduled change

        const userIndex = mockUsers.findIndex(u => u.id === user.id);
        if (userIndex > -1) {
            mockUsers[userIndex] = { ...user };
        }
        Object.assign(mockUserProfile, user);

        toast({
            title: "Plan Changed",
            description: `Your subscription has been successfully updated to the ${mockSubscriptionPlans.find(p => p.id === downgradedPlanId)?.name} plan.`,
        });
    }
    // --- END SIMULATED TASK ---


    setCurrentUser(user);
    setOrganization(
      user.organizationId
        ? mockOrganizations.find(org => org.id === user.organizationId) || null
        : null
    );
    const body = `Dear [Career Services / Department Head],\n\nI hope this email finds you well.\n\nAs a student here, I know firsthand how challenging and competitive the current job market is. To get an edge, I've been using a tool called CareerPilot, which uses AI to help create professional, tailored job applications that stand out.\n\nI was incredibly excited to learn they have a special program where they offer their **"Enterprise Plus" plan completely free of charge to universities.** This isn't a trial; it's a permanent, zero-cost sponsorship.\n\nThis means our university could provide every student with free access to CareerPilot's premium "Plus" features—including advanced AI tools and automated application support—at absolutely no cost to the institution. It would give all of us a significant advantage in our job hunts.\n\nWould you be open to exploring this free opportunity for us? It would be a massive help to so many students navigating this tough market.\n\nYou can learn more here: https://careerpilot.example.com\n\nThank you for your time and for all you do to support our careers.\n\nSincerely,\n${user.fullName}\n`;
    setDefaultBody(body);
    setEmailBody(body);
    setIsClient(true);
  }, []);
  
  const calculatePrice = (plan: SubscriptionPlan, cycle: BillingCycle) => {
    let basePrice = plan.basePriceMonthly;
    let price, periodMonths, discountPercent;
    
    switch (cycle) {
        case 'quarterly':
            periodMonths = 3;
            discountPercent = plan.quarterlyDiscountPercent || 0;
            break;
        case 'halfYearly':
            periodMonths = 6;
            discountPercent = plan.halfYearlyDiscountPercent || 0;
            break;
        default:
            periodMonths = 1;
            discountPercent = 0;
            break;
    }
    
    price = basePrice * periodMonths * (1 - discountPercent / 100);
    const perMonthPrice = price / periodMonths;
    
    return { totalPrice: price, perMonthPrice, periodMonths, discountPercent };
  }

  const handlePlanClick = (plan: SubscriptionPlan) => {
    if (!currentUser) return;
    
    const isOrgAdmin = currentUser.role === 'OrgAdmin';
    let basePlanId: PlanId = currentUser.currentPlanId;
    if (isOrgAdmin && organization) {
        basePlanId = organization.planId;
    }
    const effectivePlanId = currentUser.personalPlanId && planTierOrder[currentUser.personalPlanId] > planTierOrder[basePlanId] ? currentUser.personalPlanId : basePlanId;
    const effectivePlanTier = planTierOrder[effectivePlanId];
    const clickedPlanTier = planTierOrder[plan.id as PlanId];

    setSelectedPlan(plan);

    if (clickedPlanTier > effectivePlanTier) { // UPGRADE
      const currentPlan = mockSubscriptionPlans.find(p => p.id === effectivePlanId)!;
      const { totalPrice: pricePaid } = calculatePrice(currentPlan, currentUser.billingCycle || 'monthly');
      
      let initialSeats = 1;
      let seatCost = 0;
      if (isOrgAdmin && organization) {
          initialSeats = organization.seats;
          seatCost = plan.basePriceMonthly; // Assuming per-seat pricing for simplicity
      }
      const { totalPrice } = calculatePrice(plan, billingCycle);
      const newPlanCost = isOrgAdmin ? totalPrice * initialSeats : totalPrice;
      
      let credit = 0;
      if (currentUser.subscriptionStartDate && currentUser.subscriptionEndDate) {
        const startDate = new Date(currentUser.subscriptionStartDate);
        const endDate = new Date(currentUser.subscriptionEndDate);
        const today = new Date();
        if (today < endDate) {
          const totalDuration = endDate.getTime() - startDate.getTime();
          const remainingDuration = endDate.getTime() - today.getTime();
          credit = (remainingDuration / totalDuration) * pricePaid;
        }
      }
      
      setUpgradeDetails({ newPlanCost, credit, amountDue: newPlanCost - credit, seats: initialSeats, seatCost });
      setIsUpgradeDialogOpen(true);

    } else if (clickedPlanTier < effectivePlanTier) { // DOWNGRADE
      // This is now also handled by a specific button for org members
      setIsDowngradeDialogOpen(true);
    }
  };

  const handleSeatsChange = (newSeatCount: number) => {
      if (!selectedPlan) return;
      const { totalPrice } = calculatePrice(selectedPlan, billingCycle);
      const newPlanCost = totalPrice * newSeatCount;
      setUpgradeDetails(prev => ({
          ...prev,
          seats: newSeatCount,
          newPlanCost: newPlanCost,
          amountDue: newPlanCost - prev.credit,
      }));
  }

  const handleConfirmUpgrade = () => {
    if (!currentUser || !selectedPlan) return;
    const userIndex = mockUsers.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) return;

    const { periodMonths } = calculatePrice(selectedPlan, billingCycle);
    const today = new Date();
    const newEndDate = new Date(today);
    newEndDate.setMonth(newEndDate.getMonth() + periodMonths);

    const isPersonalUpgrade = currentUser.organizationId && !selectedPlan.id.startsWith('enterprise');
    const isOrgUpgrade = currentUser.role === 'OrgAdmin';

    const updatedUser: UserProfile = { ...currentUser };

    if (isPersonalUpgrade) {
        updatedUser.personalPlanId = selectedPlan.id as PlanId;
        updatedUser.personalSubscriptionStatus = 'active';
    } else {
        updatedUser.currentPlanId = selectedPlan.id as PlanId;
        updatedUser.personalPlanId = undefined; // Clear personal plan if it's a base plan change
        updatedUser.personalSubscriptionStatus = undefined;
    }

    if (isOrgUpgrade && organization) {
        const orgIndex = mockOrganizations.findIndex(o => o.id === organization.id);
        if(orgIndex > -1) {
          mockOrganizations[orgIndex].planId = selectedPlan.id as PlanId;
          mockOrganizations[orgIndex].seats = upgradeDetails.seats;
          setOrganization(mockOrganizations[orgIndex]);
        }
    }


    updatedUser.subscriptionStartDate = today.toISOString();
    updatedUser.subscriptionEndDate = newEndDate.toISOString();
    updatedUser.billingCycle = billingCycle;
    updatedUser.scheduledPlanChange = null;
    updatedUser.usage = { aiJobApply: 0, aiCvGenerator: 0, aiCoverLetterGenerator: 0, applications: 0 };


    mockUsers[userIndex] = updatedUser;
    Object.assign(mockUserProfile, updatedUser);
    setCurrentUser(updatedUser);
    
    toast({ title: "Upgrade Successful!", description: `You are now on the ${selectedPlan.name} plan.` });
    setIsUpgradeDialogOpen(false);
  };
  
  const handleConfirmDowngrade = () => {
    if (!currentUser || !selectedPlan) return;
    const userIndex = mockUsers.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) return;

    const updatedUser = { ...currentUser };
    
    updatedUser.scheduledPlanChange = selectedPlan.id as PlanId;

    mockUsers[userIndex] = updatedUser;
    Object.assign(mockUserProfile, updatedUser);
    setCurrentUser(updatedUser);

    toast({ title: "Downgrade Scheduled", description: `Your plan will change to ${selectedPlan.name} on ${new Date(currentUser.subscriptionEndDate!).toLocaleDateString()}.` });
    setIsDowngradeDialogOpen(false);
  };

  const handleCancelDowngrade = () => {
     if (!currentUser) return;
    const userIndex = mockUsers.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) return;
    
    const updatedUser = { ...currentUser, scheduledPlanChange: null };
    mockUsers[userIndex] = updatedUser;
    Object.assign(mockUserProfile, updatedUser);
    setCurrentUser(updatedUser);

    toast({ title: "Plan Change Cancelled", description: "You will remain on your current plan." });
  }

  if (!isClient || !currentUser) {
    return <PricingTableSkeleton />;
  }
  
  const isOrgAdmin = currentUser.role === 'OrgAdmin';
  const isOrgMember = currentUser.role === 'OrgMember';
  
  let basePlanId: PlanId = currentUser.currentPlanId;
  let orgPlanId: PlanId | undefined = undefined;
  let personalPlanId: PlanId | undefined = currentUser.personalPlanId;

  if (isOrgMember && organization) {
    orgPlanId = organization.planId;
    basePlanId = orgPlanId;
  } else if (isOrgAdmin && organization) {
    orgPlanId = organization.planId;
    basePlanId = orgPlanId;
  }
  
  const effectivePlanId = personalPlanId && planTierOrder[personalPlanId] > planTierOrder[basePlanId]
      ? personalPlanId
      : basePlanId;

  const individualPlans = mockSubscriptionPlans.filter(p => !p.id.startsWith('enterprise'));
  const allPlans = isOrgAdmin ? mockSubscriptionPlans.filter(p => p.id.startsWith('enterprise')) : individualPlans;
  
  const renderPlanCard = (plan: SubscriptionPlan) => {
    const Icon = plan.icon ? iconMap[plan.icon] : null;
    const cardPlanId = plan.id as PlanId;
    const cardPlanTier = planTierOrder[cardPlanId];
    const effectivePlanTier = planTierOrder[effectivePlanId];
    const orgPlanTier = orgPlanId ? planTierOrder[orgPlanId] : -1;
    
    const orgPlanEquivalentId = orgPlanId ? orgPlanId.replace('enterprise_', '') as PlanId : undefined;

    let buttonText = "Choose Plan";
    let buttonDisabled = false;
    let buttonAction: () => void = () => handlePlanClick(plan);

    if (cardPlanId === effectivePlanId) {
        buttonText = "Current Plan";
        buttonDisabled = true;
    } else if (isOrgMember && personalPlanId && cardPlanId === orgPlanEquivalentId) {
        buttonText = "Downgrade to Org Plan";
        buttonAction = () => {
            setSelectedPlan(plan);
            setIsDowngradeDialogOpen(true);
        };
    } else if (cardPlanTier > effectivePlanTier) {
        buttonText = "Upgrade";
    } else if (cardPlanTier < effectivePlanTier) {
       buttonText = "Downgrade";
       if (isOrgMember) {
          buttonDisabled = true;
       }
    }
    
    if (isOrgAdmin) {
      if (cardPlanTier < orgPlanTier) {
        buttonText = "Downgrade";
      } else if (cardPlanTier > orgPlanTier) {
        buttonText = "Upgrade";
      } else {
        buttonText = "Current Org Plan";
        buttonDisabled = true;
      }
    }

    if (!isOrgAdmin && cardPlanId.startsWith('enterprise')) {
      buttonDisabled = true;
    }

    if (isOrgMember && cardPlanId === 'basic') {
      buttonDisabled = true;
      buttonText = "Org Plan is Better";
    }
    
    const { totalPrice, perMonthPrice, periodMonths, discountPercent } = calculatePrice(plan, billingCycle);

    return (
      <Card 
        key={`${plan.id}-${billingCycle}`}
        className={cn(
          "flex flex-col shadow-lg transition-all duration-300 hover:scale-[1.02] border",
          plan.borderColor,
          plan.isPopular && "border-2 ring-2 ring-primary/50",
          plan.id === effectivePlanId && "border-primary border-2 bg-primary/10"
        )}
      >
        {plan.isPopular && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2"><div className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"><Zap className="h-3.5 w-3.5" />Most Popular</div></div>}
        <CardHeader className="pt-8 text-center">
          {Icon && <Icon className={cn("h-8 w-8 mx-auto mb-2", plan.iconColor)} />}
          <CardTitle className="text-2xl font-bold font-headline">{plan.name}</CardTitle>
          <CardDescription className="h-10 min-h-[2.5rem]">{plan.id === 'basic' ? 'Get started for free' : plan.id === 'plus' ? 'For serious job seekers' : plan.id === 'pro' ? 'For professionals aiming high' : isOrgAdmin ? 'For institutions' : 'For the ultimate advantage'}</CardDescription>
          
          <div className="pt-2 min-h-[5rem]">
            {totalPrice === 0 && plan.id === 'basic' ? (
                <span className="text-4xl font-extrabold font-headline">Free</span>
            ) : (
                <>
                    <span className="text-3xl font-extrabold font-headline">${perMonthPrice.toFixed(2)}</span>
                    <p className="text-sm text-muted-foreground">/ month {isOrgAdmin && 'per seat'}</p>
                    <p className="text-xs text-muted-foreground font-semibold mt-1">
                      {billingCycle !== 'monthly' ? `Billed as $${totalPrice.toFixed(2)} every ${periodMonths} months.` : `Billed monthly.`}
                      {discountPercent > 0 && <span className="ml-2 text-green-600">Save {discountPercent}%</span>}
                    </p>
                </>
            )}
            {plan.id === 'plus' && (
              <div className="mt-4 text-center text-xs text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md">
                  <Link href="#institutional-offer" className="font-semibold underline hover:text-blue-600">
                      Are you a student? Get this for FREE
                  </Link>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <ul className="space-y-3 text-sm">
            {renderLimit("Total Applications", plan.limits?.applicationLimit ?? 0, 'per month')}
            {renderLimit("AI Applications", plan.limits?.aiJobApply ?? 0, 'per month')}
            {renderLimit("AI CV Generations", plan.limits?.aiCvGenerator ?? 0, 'per month')}
            {renderLimit("AI Cover Letters", plan.limits?.aiCoverLetterGenerator ?? 0, 'per month')}
            {renderLimit("Auto-Apply Agents", plan.limits?.autoApplyAgents ?? 0, '')}
            {plan.id === 'basic' && renderLimit("AI application credits", plan.referralBonus ?? 0, 'per successful referral')}
            {(plan.displayFeatures || []).map((feature, index) => <li key={index} className="flex items-start"><Star className="h-5 w-5 text-yellow-500 mr-2 shrink-0 mt-0.5" /><span>{feature}</span></li>)}
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full" variant={plan.isPopular && !buttonDisabled ? "default" : "outline"} disabled={buttonDisabled} onClick={buttonAction}>{buttonText}</Button>
        </CardFooter>
      </Card>
    );
  };
  
  return (
    <>
      {currentUser.scheduledPlanChange && (
        <Alert className="mb-8 border-yellow-400 bg-yellow-50 text-yellow-800">
          <AlertTriangle className="h-4 w-4 !text-yellow-600" />
          <AlertTitle className="font-semibold">Pending Plan Change</AlertTitle>
          <AlertDescription>
            Your plan is scheduled to change to **{mockSubscriptionPlans.find(p => p.id === currentUser.scheduledPlanChange)?.name}** on **{new Date(currentUser.subscriptionEndDate!).toLocaleDateString()}**.
            <Button variant="link" size="sm" className="p-0 h-auto ml-2 text-yellow-700 font-semibold" onClick={handleCancelDowngrade}>Cancel Change</Button>
          </AlertDescription>
        </Alert>
      )}

      {isOrgMember && (
          <Alert className="mb-8">
            <School className="h-4 w-4" />
            <AlertTitle className="font-semibold">You're on an Institutional Plan!</AlertTitle>
            <AlertDescription>
              {personalPlanId
                  ? `You have personally upgraded to the ${mockSubscriptionPlans.find(p => p.id === personalPlanId)?.name} plan.`
                  : `Your institution (${organization?.name}) provides you with a base plan. You can choose to purchase a personal upgrade for more features.`}
            </AlertDescription>
          </Alert>
      )}

      <div className="flex justify-center mb-8">
          <Tabs defaultValue="monthly" onValueChange={(value) => setBillingCycle(value as BillingCycle)}>
            <TabsList>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
              <TabsTrigger value="halfYearly">Half-Yearly</TabsTrigger>
            </TabsList>
          </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-stretch">
        {allPlans.map(renderPlanCard)}
      </div>

      {currentUser.role === 'Individual' && (
        <Card id="institutional-offer" className="mt-8 shadow-lg bg-gradient-to-r from-blue-50 via-transparent to-transparent dark:from-blue-900/20 dark:via-transparent">
            <CardHeader><CardTitle className="flex items-center gap-2"><School className="h-6 w-6 text-primary" />Get Premium Access for FREE</CardTitle><CardDescription>Ask your university or bootcamp for free premium access to CareerPilot.</CardDescription></CardHeader>
            <CardContent><p className="mb-4">The job market is tough. Give yourself a powerful advantage with our Plus plan features, sponsored entirely by your school.</p><p className="text-sm text-muted-foreground">When your institution signs up for our <strong>free Enterprise Plus plan</strong>, you and every other student get premium access at zero cost to you and to the university. Click the button to send a pre-written request to your career services now.</p></CardContent>
            <CardFooter>
            <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}><DialogTrigger asChild><Button variant="secondary"><Mail className="mr-2 h-4 w-4" /> Request Free Premium Access</Button></DialogTrigger>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader><DialogTitle>Request CareerPilot from Your Institution</DialogTitle><DialogDescription>Edit the draft below and send it to your career services or department head.</DialogDescription></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="recipient" className="text-right">To:</Label><Input id="recipient" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} className="col-span-3" placeholder="career.services@university.edu" /></div>
                        <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="subject" className="text-right">Subject:</Label><Input id="subject" value={defaultSubject} readOnly className="col-span-3 bg-muted" /></div>
                        <div className="grid grid-cols-4 items-start gap-4"><Label htmlFor="body" className="text-right pt-2">Body:</Label><Textarea id="body" value={emailBody} onChange={e => setEmailBody(e.target.value)} className="col-span-3 min-h-[250px]" /></div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                      <Button onClick={() => window.location.href=`mailto:${recipientEmail}?subject=${encodeURIComponent(defaultSubject)}&body=${encodeURIComponent(emailBody)}`}>Open in Email Client</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            </CardFooter>
        </Card>
      )}

       <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade to {selectedPlan?.name}</DialogTitle>
            <DialogDescription>Confirm your subscription upgrade. Your new plan will start immediately.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
             {isOrgAdmin && (
                <div className="space-y-2">
                    <Label htmlFor="seats">Number of Seats</Label>
                    <Input id="seats" type="number" min="1" value={upgradeDetails.seats} onChange={(e) => handleSeatsChange(Number(e.target.value))} />
                    <p className="text-xs text-muted-foreground">Each seat costs ${upgradeDetails.seatCost.toFixed(2)}/{billingCycle === 'monthly' ? 'mo' : billingCycle === 'quarterly' ? 'qtr' : '6mo'}.</p>
                </div>
             )}
            <div className="p-4 rounded-md border bg-muted space-y-2">
              <div className="flex justify-between text-sm"><p>New Plan ({billingCycle}):</p><p>${upgradeDetails.newPlanCost.toFixed(2)}</p></div>
              <div className="flex justify-between text-sm text-green-600"><p>Credit for unused time:</p><p>- ${upgradeDetails.credit.toFixed(2)}</p></div>
              <hr/>
              <div className="flex justify-between font-bold"><p>Total Due Today:</p><p>${upgradeDetails.amountDue.toFixed(2)}</p></div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
            <Button onClick={handleConfirmUpgrade}>Confirm Upgrade</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDowngradeDialogOpen} onOpenChange={setIsDowngradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Downgrade to {selectedPlan?.name}</DialogTitle>
            <DialogDescription>Your plan will change at the end of your current billing period.</DialogDescription>
          </DialogHeader>
           <div className="py-4">
                <p className="text-sm text-muted-foreground">
                    You will continue to have access to your current plan's features until your subscription renews on{' '}
                    <strong className="text-foreground">{new Date(currentUser.subscriptionEndDate!).toLocaleDateString()}</strong>.
                    On that date, your plan will automatically switch to {selectedPlan?.name}.
                </p>
            </div>
          <DialogFooter>
             <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
            <Button onClick={handleConfirmDowngrade}>Schedule Downgrade</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
