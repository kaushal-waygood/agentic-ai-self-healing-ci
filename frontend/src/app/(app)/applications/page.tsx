
'use client';

import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCheck2, Search, Loader2, Trash2, MailOpen, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { mockApplications, type MockApplication } from "@/lib/data/applications";
import { mockUserProfile } from "@/lib/data/user";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { processIncomingEmail } from "@/ai/flows/process-incoming-email-flow";
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
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";


// Define colors for different statuses to make them visually distinct
const statusColors: { [key: string]: string } = {
  Applied: "bg-blue-100 text-blue-700 border-blue-300",
  'AI-Drafted': "bg-indigo-100 text-indigo-700 border-indigo-300",
  Sent: "bg-primary/10 text-primary border-primary/30",
  Viewed: "bg-purple-100 text-purple-700 border-purple-300",
  Interviewing: "bg-yellow-100 text-yellow-700 border-yellow-300",
  'Offer Extended': "bg-green-100 text-green-700 border-green-300",
  Rejected: "bg-red-100 text-red-700 border-red-300",
  Draft: "bg-gray-100 text-gray-700 border-gray-300",
  Error: "bg-destructive/10 text-destructive border-destructive/30",
};

const applicationStatuses = Object.keys(statusColors) as MockApplication['status'][];


export default function ApplicationsPage() {
  const [applications, setApplications] = useState<MockApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load data on the client side to prevent hydration mismatch
    setApplications(mockApplications);
    setIsLoading(false);
  }, []);

  const filteredApplications = useMemo(() => {
    if (!searchTerm) return applications;
    return applications.filter(app =>
      app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.company.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [applications, searchTerm]);
  
  const handleSelectAll = (checked: boolean | string) => {
    if (checked) {
      setSelectedIds(filteredApplications.map(app => app.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean | string) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(rowId => rowId !== id));
    }
  };

  const handleStatusChange = (appId: string, newStatus: MockApplication['status']) => {
    const appIndex = mockApplications.findIndex(a => a.id === appId);
    if (appIndex === -1) return;

    const oldStatus = mockApplications[appIndex].status;

    // Prevent earning XP multiple times for the same status
    if (newStatus === 'Interviewing' && oldStatus !== 'Interviewing') {
      mockUserProfile.careerXp = (mockUserProfile.careerXp || 0) + 100;
      toast({ title: "+100 Career XP!", description: "Great work on securing an interview!" });
    }
    if (newStatus === 'Offer Extended' && oldStatus !== 'Offer Extended') {
      mockUserProfile.careerXp = (mockUserProfile.careerXp || 0) + 500;
      toast({ title: "+500 Career XP! 🎉", description: "Congratulations on the offer!" });
    }

    mockApplications[appIndex].status = newStatus;
    // Add a note about the manual status change
    if (!mockApplications[appIndex].notes) {
        mockApplications[appIndex].notes = [];
    }
    mockApplications[appIndex].notes!.push(`Status manually changed to "${newStatus}".`);


    setApplications([...mockApplications]);
    toast({ title: "Status Updated", description: `Application status changed to "${newStatus}".` });
  };


  const handleDeleteSelected = () => {
    // Update the source of truth
    const updatedMockApplications = mockApplications.filter(app => !selectedIds.includes(app.id));
    // Since mockApplications is a global-like variable in dev, we reassign it
    // Note: this approach is for mock data. A real DB would have an API call here.
    mockApplications.length = 0;
    Array.prototype.push.apply(mockApplications, updatedMockApplications);

    // Update local state to trigger re-render
    setApplications(updatedMockApplications);
    setSelectedIds([]);
    toast({
      title: "Applications Deleted",
      description: `${selectedIds.length} application(s) have been removed.`,
    });
  };

  const handleSyncInbox = async () => {
    setIsSyncing(true);
    toast({ title: "Syncing Inbox...", description: "Checking for new replies to your applications." });

    // Find an application to simulate a reply for
    const appliedApp = applications.find(app => app.status === 'Applied' || app.status === 'Sent');
    
    if (!appliedApp) {
      toast({ title: "No Pending Applications", description: "No applications to check for replies right now." });
      setIsSyncing(false);
      return;
    }
    
    // Create a dynamic fake email reply for simulation
    const isPositiveReply = Math.random() > 0.5;
    let fakeEmailContent = '';

    if (isPositiveReply) {
      fakeEmailContent = `
        From: recruiter@${appliedApp.company.toLowerCase().replace(/\s/g, '')}.com
        Subject: Re: Your Application for ${appliedApp.jobTitle}
        
        Hi ${mockUserProfile.fullName},
        
        Thank you for your interest in the ${appliedApp.jobTitle} position at ${appliedApp.company}.
        We were impressed with your background and would like to schedule a 30-minute screening call with you next week.
        
        Please let me know what times work best for you.
        
        Best regards,
        Jane Doe
        Recruiter, ${appliedApp.company}
      `;
    } else {
      fakeEmailContent = `
        From: no-reply@${appliedApp.company.toLowerCase().replace(/\s/g, '')}.com
        Subject: An update on your application for ${appliedApp.jobTitle}
        
        Dear ${mockUserProfile.fullName},
        
        Thank you for your interest in the ${appliedApp.jobTitle} position at ${appliedApp.company}.
        After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match the requirements of the role at this time.
        
        We appreciate you taking the time to apply and wish you the best of luck in your job search.
        
        Sincerely,
        The ${appliedApp.company} Talent Acquisition Team
      `;
    }


    try {
      const result = await processIncomingEmail({
        emailContent: fakeEmailContent,
        userApplications: applications.map(a => ({ id: a.id, jobTitle: a.jobTitle, company: a.company })),
      });
      
      if (result.isRelevant && result.applicationId && result.summary) {
        // Update the application in our mock data
        const appIndex = mockApplications.findIndex(a => a.id === result.applicationId);
        if (appIndex > -1) {
          if (result.newStatus) {
            handleStatusChange(result.applicationId, result.newStatus);
          }
          if (!mockApplications[appIndex].notes) {
            mockApplications[appIndex].notes = [];
          }
          mockApplications[appIndex].notes!.push(result.summary);
        }

        // Add to user's action items
        mockUserProfile.actionItems.unshift({
          id: `action-${Date.now()}`,
          applicationId: result.applicationId,
          summary: result.summary,
          date: new Date().toISOString(),
          isRead: false,
        });

        // Force a re-render
        setApplications([...mockApplications]);
        
        toast({ title: "New Reply Found!", description: result.summary });

      } else {
        toast({ title: "No new relevant emails found." });
      }

    } catch (error) {
       toast({ variant: "destructive", title: "Sync Failed", description: "Could not process inbox updates." });
    } finally {
      setIsSyncing(false);
    }
  };


  return (
    <>
      <PageHeader
        title="My Applications"
        description="Track the status of your job applications and manage them effectively."
        icon={FileCheck2}
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Application History</CardTitle>
          <CardDescription>
            Overview of all jobs you've applied to. Click a status to update it.
          </CardDescription>
           <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-grow w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search applications by job title or company..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button onClick={handleSyncInbox} disabled={isSyncing} variant="outline" className="flex-grow">
                {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <RefreshCw className="mr-2 h-4 w-4"/>}
                Sync Inbox
              </Button>
              {selectedIds.length > 0 && (
                  <AlertDialog>
                      <AlertDialogTrigger asChild>
                          <Button variant="destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              ({selectedIds.length})
                          </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                  This will permanently delete {selectedIds.length} application(s). This action cannot be undone.
                              </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDeleteSelected}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                  </AlertDialog>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredApplications.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead padding="checkbox" className="w-[50px]">
                        <Checkbox
                          checked={selectedIds.length > 0 && selectedIds.length === filteredApplications.length}
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all rows"
                        />
                      </TableHead>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Date Applied</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((app) => (
                      <TableRow key={app.id} data-state={selectedIds.includes(app.id) && "selected"}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(app.id)}
                            onCheckedChange={(checked) => handleSelectRow(app.id, checked)}
                            aria-label={`Select row for ${app.jobTitle}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{app.jobTitle}</span>
                            {app.notes && app.notes.length > 0 && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <MailOpen className="h-3 w-3 text-primary" />
                                {app.notes[app.notes.length - 1]}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{app.company}</TableCell>
                        <TableCell>{app.dateApplied}</TableCell>
                        <TableCell>
                          <Select value={app.status} onValueChange={(newStatus) => handleStatusChange(app.id, newStatus as MockApplication['status'])}>
                            <SelectTrigger className={cn("w-[150px] focus:ring-0 focus:ring-offset-0 font-semibold text-xs h-7 px-2.5 py-0.5", statusColors[app.status])}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {applicationStatuses.map(status => (
                                <SelectItem key={status} value={status}>{status}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" asChild disabled={app.status === 'Draft' || app.status === 'Error'}>
                            <Link href={`/applications/${app.id}`}>View/Edit</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                <div className="flex items-center p-2 border-b">
                  <Checkbox
                    id="select-all-mobile"
                    checked={selectedIds.length > 0 && selectedIds.length === filteredApplications.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <label htmlFor="select-all-mobile" className="ml-3 text-sm font-medium">Select All</label>
                </div>
                {filteredApplications.map(app => (
                  <Card key={app.id} className={cn("p-4", selectedIds.includes(app.id) && "bg-muted")}>
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={selectedIds.includes(app.id)}
                        onCheckedChange={(checked) => handleSelectRow(app.id, checked)}
                        className="mt-1"
                      />
                      <div className="flex-grow space-y-2">
                        <div>
                          <p className="font-semibold">{app.jobTitle}</p>
                          <p className="text-sm text-muted-foreground">{app.company}</p>
                        </div>
                        <div className="text-xs text-muted-foreground">Applied: {app.dateApplied}</div>
                        {app.notes && app.notes.length > 0 && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <MailOpen className="h-3 w-3 text-primary" />
                            {app.notes[app.notes.length - 1]}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Select value={app.status} onValueChange={(newStatus) => handleStatusChange(app.id, newStatus as MockApplication['status'])}>
                            <SelectTrigger className={cn("flex-grow focus:ring-0 focus:ring-offset-0 font-semibold text-xs h-8 px-2.5 py-0.5", statusColors[app.status])}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {applicationStatuses.map(status => (
                                <SelectItem key={status} value={status}>{status}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button variant="outline" size="sm" asChild disabled={app.status === 'Draft' || app.status === 'Error'}>
                            <Link href={`/applications/${app.id}`}>View/Edit</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-10">
              <FileCheck2 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-medium">No Applications Yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Find a job and use the Application Wizard to see your history here.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/search-jobs">Find a job to apply for</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
