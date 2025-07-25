'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Briefcase,
  ChevronsRight,
  FileSignature,
  Loader2,
  User,
} from 'lucide-react';
import type { JobContext } from '../cover-letter-client';
import type { JobListing } from '@/lib/data/jobs';
import type { extractJobDetails as ExtractJobDetailsType } from '@/ai/flows/extract-job-details-flow';

interface JobContextStepProps {
  onJobContextSet: (context: JobContext) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setLoadingMessage: (message: string) => void;
  toast: (options: any) => void;
  extractJobDetails: typeof ExtractJobDetailsType;
  mockJobListings: JobListing[];
}

export function JobContextStep({
  onJobContextSet,
  isLoading,
  setIsLoading,
  setLoadingMessage,
  toast,
  extractJobDetails,
  mockJobListings,
}: JobContextStepProps) {
  const [pastedJobDesc, setPastedJobDesc] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [enteredJobTitle, setEnteredJobTitle] = useState('');

  const handleSetJobContext = async (mode: 'paste' | 'select' | 'title') => {
    setIsLoading(true);
    setLoadingMessage('Processing job context...');
    let context: JobContext | null = null;
    try {
      if (mode === 'select' && selectedJobId) {
        const job = mockJobListings.find((j) => j.id === selectedJobId);
        if (job)
          context = {
            mode,
            value: job.id,
            title: job.title,
            description: job.description,
          };
      } else if (mode === 'paste' && pastedJobDesc) {
        const extracted = await extractJobDetails({
          jobDescription: pastedJobDesc,
        });
        context = {
          mode,
          value: pastedJobDesc,
          title: extracted.jobTitle,
          description: pastedJobDesc,
        };
      } else if (mode === 'title' && enteredJobTitle) {
        context = {
          mode,
          value: enteredJobTitle,
          title: enteredJobTitle,
          description: `Job application for the role of ${enteredJobTitle}.`,
        };
      }

      if (context) {
        onJobContextSet(context);
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid Input',
          description: 'Please provide valid job information.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Processing Job',
        description: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          Step 1: Job Context
        </CardTitle>
        <CardDescription>
          Tell the AI about the job. This is crucial for tailoring your letter.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="paste" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="paste">
              <FileSignature className="mr-2 h-4 w-4" />
              Paste
            </TabsTrigger>
            <TabsTrigger value="select">
              <Briefcase className="mr-2 h-4 w-4" />
              Select
            </TabsTrigger>
            <TabsTrigger value="title">
              <User className="mr-2 h-4 w-4" />
              Title
            </TabsTrigger>
          </TabsList>
          <TabsContent value="paste" className="pt-4 space-y-4">
            <Textarea
              placeholder="Paste the full job description here..."
              className="min-h-[200px]"
              value={pastedJobDesc}
              onChange={(e) => setPastedJobDesc(e.target.value)}
            />
            <Button
              className="w-full"
              onClick={() => handleSetJobContext('paste')}
              disabled={!pastedJobDesc || isLoading}
            >
              {isLoading ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                <ChevronsRight className="mr-2" />
              )}
              Use This Description
            </Button>
          </TabsContent>
          <TabsContent value="select" className="pt-4 space-y-4">
            <RadioGroup
              value={selectedJobId}
              onValueChange={setSelectedJobId}
              className="space-y-2 max-h-60 overflow-y-auto pr-2"
            >
              {mockJobListings.map((job) => (
                <Label
                  key={job.id}
                  className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-muted/50 has-[:checked]:bg-primary/10 has-[:checked]:border-primary"
                >
                  <RadioGroupItem value={job.id} id={`job-${job.id}`} />
                  <div>
                    <p className="font-semibold">{job.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {job.company}
                    </p>
                  </div>
                </Label>
              ))}
            </RadioGroup>
            <Button
              className="w-full"
              onClick={() => handleSetJobContext('select')}
              disabled={!selectedJobId || isLoading}
            >
              {isLoading ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                <ChevronsRight className="mr-2" />
              )}
              Use Selected Job
            </Button>
          </TabsContent>
          <TabsContent value="title" className="pt-4 space-y-4">
            <Input
              placeholder="e.g., Senior Software Engineer"
              value={enteredJobTitle}
              onChange={(e) => setEnteredJobTitle(e.target.value)}
            />
            <Button
              className="w-full"
              onClick={() => handleSetJobContext('title')}
              disabled={!enteredJobTitle || isLoading}
            >
              {isLoading ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                <ChevronsRight className="mr-2" />
              )}
              Use This Title
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
