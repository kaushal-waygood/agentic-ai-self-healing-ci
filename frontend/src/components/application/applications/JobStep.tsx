import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, UploadCloud } from 'lucide-react';
import { JobListing } from '@/lib/data/jobs'; // Adjust this import path as needed

type JobStepProps = {
  isLoading: boolean;
  loadingMessage: string;
  jobListings: JobListing[];
  onSubmit: (mode: 'select' | 'paste' | 'upload', value: File | string) => void;
};

export function JobStep({
  isLoading,
  loadingMessage,
  jobListings,
  onSubmit,
}: JobStepProps) {
  const [pastedJobDesc, setPastedJobDesc] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const jobDescFileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 1: Provide the Job Description</CardTitle>
        <CardDescription>
          Select a job, paste the details, or upload a file.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* --- SELECT JOB --- */}
        <div>
          <Label htmlFor="job-select">Select from Saved/Found Jobs</Label>
          <RadioGroup
            id="job-select"
            value={selectedJobId}
            onValueChange={setSelectedJobId}
            className="mt-2 space-y-1 max-h-40 overflow-y-auto border p-2 rounded-md"
          >
            {(jobListings || []).slice(0, 10).map((job) => (
              <Label
                key={job.id}
                className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-muted"
              >
                <RadioGroupItem value={job.id} />
                {job.title} at {job.company}
              </Label>
            ))}
          </RadioGroup>
          <Button
            className="w-full mt-2"
            disabled={!selectedJobId || isLoading}
            onClick={() => onSubmit('select', selectedJobId)}
          >
            Use Selected Job
          </Button>
        </div>

        {/* --- SEPARATOR --- */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        {/* --- PASTE JOB --- */}
        <div>
          <Label htmlFor="job-paste">Paste Job Description</Label>
          <Textarea
            id="job-paste"
            placeholder="Paste the full job description here..."
            className="mt-2 min-h-[150px]"
            value={pastedJobDesc}
            onChange={(e) => setPastedJobDesc(e.target.value)}
          />
          <Button
            className="w-full mt-2"
            disabled={!pastedJobDesc || isLoading}
            onClick={() => onSubmit('paste', pastedJobDesc)}
          >
            Use Pasted Description
          </Button>
        </div>

        {/* --- SEPARATOR --- */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        {/* --- UPLOAD JOB --- */}
        <div>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => jobDescFileInputRef.current?.click()}
            disabled={isLoading}
          >
            {isLoading && loadingMessage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                {loadingMessage}
              </>
            ) : (
              <>
                <UploadCloud className="mr-2 h-4 w-4" /> Upload Job Description
                File
              </>
            )}
          </Button>
          <input
            type="file"
            ref={jobDescFileInputRef}
            onChange={(e) =>
              e.target.files?.[0] && onSubmit('upload', e.target.files[0])
            }
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg"
          />
          <p className="text-xs text-muted-foreground text-center mt-1">
            PDF, PNG, JPG supported
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
