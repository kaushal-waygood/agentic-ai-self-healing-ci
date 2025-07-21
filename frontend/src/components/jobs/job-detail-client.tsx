
"use client";

import { useState, useEffect } from "react";
import { JobListing } from "@/lib/data/jobs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Briefcase, Clock, Building, DollarSign, Star, FilePlus2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { calculateJobMatchingScore, CalculateJobMatchingScoreOutput } from '@/ai/flows/ai-job-matching-score';
import { mockUserProfile, mockOrganizations, planTierOrder } from "@/lib/data/user";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { ToastAction } from "../ui/toast";


interface JobDetailClientProps {
  job: JobListing;
}

export function JobDetailClient({ job }: JobDetailClientProps) {
  const [matchScoreResult, setMatchScoreResult] = useState<CalculateJobMatchingScoreOutput | null>(null);
  const [isLoadingScore, setIsLoadingScore] = useState(false);
  const { toast } = useToast();
  const [canUseProFeatures, setCanUseProFeatures] = useState(false);

  useEffect(() => {
    // Determine the user's effective plan
    const user = mockUserProfile;
    const org = user.organizationId ? mockOrganizations.find(o => o.id === user.organizationId) : null;
    let basePlanId = user.currentPlanId;
    if (user.role === 'OrgMember' && org) {
        basePlanId = org.planId;
    }
    const effectivePlanId = user.personalPlanId && planTierOrder[user.personalPlanId] > planTierOrder[basePlanId]
      ? user.personalPlanId
      : basePlanId;

    // AI Match Score is a "Pro" level feature
    setCanUseProFeatures(planTierOrder[effectivePlanId] >= planTierOrder['pro']);
  }, []);

  const handleGetMatchScore = async () => {
    if (!canUseProFeatures) {
      toast({
        variant: "destructive",
        title: "Upgrade to Pro",
        description: "AI Match Score is a Pro feature. Please upgrade your plan to use it.",
        action: <ToastAction altText="Upgrade" asChild><Link href="/subscriptions">Upgrade Plan</Link></ToastAction>,
      });
      return;
    }
    
    setIsLoadingScore(true);
    setMatchScoreResult(null);
    try {
      const userProfileSummary = `
        Job Preference: ${mockUserProfile.jobPreference}
        Skills: ${mockUserProfile.skills.join(", ")}
        Experience: ${mockUserProfile.experience.map(e => `${e.jobTitle} at ${e.company} for ${e.endDate}`).join('; ')}
        Narratives: ${mockUserProfile.narratives.achievements}. ${mockUserProfile.narratives.challenges}.
      `;
      const result = await calculateJobMatchingScore({
        jobDescription: job.description,
        userProfile: userProfileSummary,
      });
      setMatchScoreResult(result);
    } catch (error) {
      console.error("Failed to get match score:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not calculate the AI match score.",
      });
    } finally {
      setIsLoadingScore(false);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="prose dark:prose-invert max-w-none prose-headings:font-semibold prose-h4:mt-8 prose-h4:mb-4 prose-h5:mt-6 prose-h5:mb-3 prose-p:leading-relaxed prose-ul:list-disc prose-ul:pl-5 prose-li:my-1" 
              dangerouslySetInnerHTML={{ __html: job.description }} 
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-6">
        <Card>
           <CardHeader>
              <CardTitle className="font-headline">Apply Now</CardTitle>
           </CardHeader>
           <CardContent>
             <Button asChild className="w-full">
                <Link href={`/apply?jobId=${encodeURIComponent(job.id)}`}>
                  <FilePlus2 className="mr-2 h-4 w-4" /> Tailor My Documents for this Role
                </Link>
             </Button>
           </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Job Overview</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2"><Building className="h-4 w-4 text-muted-foreground"/><span>{job.company}</span></div>
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground"/><span>{job.location}</span></div>
            <div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-muted-foreground"/><span>{job.type || 'Not specified'}</span></div>
            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground"/><span>{job.postedDate}</span></div>
            {job.salary && <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground"/><span>{job.salary}</span></div>}
             <div className="flex flex-wrap gap-2 pt-2">
                {job.earlyApplicant && <Badge variant="secondary" className="bg-green-100 text-green-800">Early Applicant</Badge>}
                {job.activelyHiring && <Badge variant="secondary" className="bg-blue-100 text-blue-800">Actively Hiring</Badge>}
                {job.publisher && <Badge variant="outline">{job.publisher}</Badge>}
            </div>
          </CardContent>
        </Card>

         <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Star className="h-5 w-5 text-primary"/> AI Match Score
            </CardTitle>
            <CardDescription>
                {canUseProFeatures 
                    ? "See how your profile aligns with this job."
                    : "This is a Pro feature. Upgrade to unlock."
                }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingScore && <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>}
            {matchScoreResult ? (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-5xl font-bold text-primary">{matchScoreResult.matchScore}</p>
                  <p className="text-sm text-muted-foreground">Match Score</p>
                </div>
                <div>
                  <h4 className="font-semibold">Reasoning:</h4>
                  <p className="text-sm text-muted-foreground">{matchScoreResult.reasoning}</p>
                </div>
                 <div>
                  <h4 className="font-semibold">Strengths:</h4>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground">
                    {matchScoreResult.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                 <div>
                  <h4 className="font-semibold">Areas for Improvement:</h4>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground">
                    {matchScoreResult.areasForImprovement.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
              </div>
            ) : (
               <Button onClick={handleGetMatchScore} className="w-full" disabled={isLoadingScore || !canUseProFeatures}>
                {canUseProFeatures ? 'Calculate My Score' : <><ShieldCheck className="mr-2 h-4 w-4"/> Upgrade to Pro</>}
              </Button>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
