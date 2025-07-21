
"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, MoreHorizontal, Check, X, Archive, Search } from "lucide-react";
import type { JobListing, JobStatus } from "@/lib/data/jobs";
import type { Organization } from "@/lib/data/user";
import { mockJobListings } from "@/lib/data/jobs";
import { useToast } from "@/hooks/use-toast";
import { logAdminAction } from "@/lib/data/audit-logs";

interface JobModerationClientProps {
  initialJobs: JobListing[];
  organizations: Organization[];
}

const statusConfig: Record<JobStatus, { color: string, text: string }> = {
    pending_review: { color: "bg-yellow-100 text-yellow-800 border-yellow-300", text: "Pending Review" },
    published: { color: "bg-green-100 text-green-800 border-green-300", text: "Published" },
    rejected: { color: "bg-red-100 text-red-800 border-red-300", text: "Rejected" },
    archived: { color: "bg-gray-100 text-gray-800 border-gray-300", text: "Archived" },
    draft: { color: "bg-blue-100 text-blue-800 border-blue-300", text: "Draft" },
}

export function JobListingsModerationClient({ initialJobs, organizations }: JobModerationClientProps) {
  const { toast } = useToast();
  const [jobs, setJobs] = useState(initialJobs);
  const [searchTerm, setSearchTerm] = useState("");

  const getOrgName = (orgId?: string) => {
    if (!orgId) return "Platform";
    return organizations.find(o => o.id === orgId)?.name || "Unknown Org";
  };
  
  const handleStatusChange = (jobId: string, newStatus: JobStatus) => {
    const jobIndex = mockJobListings.findIndex(j => j.id === jobId);
    if (jobIndex > -1) {
        mockJobListings[jobIndex].status = newStatus;
        setJobs([...mockJobListings]);
        logAdminAction("JOB_ACTION", jobId, `Changed job status to ${newStatus}.`);
        toast({ title: "Job Status Updated", description: `The job has been set to "${statusConfig[newStatus].text}".` });
    }
  };
  
  const filteredJobs = useMemo(() => {
    return jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [jobs, searchTerm]);

  const renderJobTable = (status: JobStatus) => {
    const jobsForStatus = filteredJobs.filter(j => j.status === status);
    return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Date Posted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobsForStatus.length > 0 ? (
              jobsForStatus.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>{job.company}</TableCell>
                  <TableCell><Badge variant="outline">{getOrgName(job.postedByOrgId)}</Badge></TableCell>
                  <TableCell>{job.postedDate}</TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild><Button variant="ghost" size="sm"><Eye className="mr-2 h-4 w-4"/>View</Button></DialogTrigger>
                      <DialogContent className="sm:max-w-2xl">
                        <DialogHeader><DialogTitle>{job.title}</DialogTitle><DialogDescription>{job.company} - {job.location}</DialogDescription></DialogHeader>
                        <div className="prose dark:prose-invert max-w-none max-h-[60vh] overflow-y-auto p-1" dangerouslySetInnerHTML={{ __html: job.description }} />
                      </DialogContent>
                    </Dialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {status === 'pending_review' && (
                            <>
                                <DropdownMenuItem onSelect={() => handleStatusChange(job.id, 'published')}><Check className="mr-2 h-4 w-4"/>Approve & Publish</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleStatusChange(job.id, 'rejected')} className="text-destructive focus:bg-destructive/10"><X className="mr-2 h-4 w-4"/>Reject</DropdownMenuItem>
                            </>
                        )}
                        {(status === 'rejected' || status === 'published') && (
                            <DropdownMenuItem onSelect={() => handleStatusChange(job.id, 'archived')}><Archive className="mr-2 h-4 w-4"/>Archive</DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={5} className="h-24 text-center">No jobs in this category.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search jobs by title or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow"
            />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending_review">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending_review">Pending ({filteredJobs.filter(j=>j.status === 'pending_review').length})</TabsTrigger>
            <TabsTrigger value="published">Published ({filteredJobs.filter(j=>j.status === 'published').length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({filteredJobs.filter(j=>j.status === 'rejected').length})</TabsTrigger>
            <TabsTrigger value="archived">Archived ({filteredJobs.filter(j=>j.status === 'archived').length})</TabsTrigger>
          </TabsList>
          <TabsContent value="pending_review" className="mt-4">{renderJobTable('pending_review')}</TabsContent>
          <TabsContent value="published" className="mt-4">{renderJobTable('published')}</TabsContent>
          <TabsContent value="rejected" className="mt-4">{renderJobTable('rejected')}</TabsContent>
          <TabsContent value="archived" className="mt-4">{renderJobTable('archived')}</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
