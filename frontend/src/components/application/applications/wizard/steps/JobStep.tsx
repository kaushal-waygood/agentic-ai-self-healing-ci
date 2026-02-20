import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { StyledCard } from '../StyledCard';
import { itemVariants } from '../motion';
import { JobListing } from '@/lib/data/jobs';

// Define props for the component
interface JobStepProps {
  isLoading: boolean;
  loadingMessage: string;
  mockJobListings: JobListing[];
  handleJobContextSubmit: (
    mode: 'select' | 'paste' | 'upload',
    value: string | File,
  ) => void;
  jobDescFileInputRef: React.RefObject<HTMLInputElement>;
}

export const JobStep = ({
  isLoading,
  loadingMessage,
  mockJobListings,
  handleJobContextSubmit,
  jobDescFileInputRef,
}: JobStepProps) => {
  const [selectedJobId, setSelectedJobId] = useState('');
  const [pastedJobDesc, setPastedJobDesc] = useState('');

  return (
    <StyledCard>
      <CardHeader>
        <CardTitle>Step 1: Provide the Job Description</CardTitle>
        <CardDescription>
          Select a job, paste the details, or upload a file.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <motion.div variants={itemVariants}>
          <Label htmlFor="job-select" className="text-slate-300">
            Select from Saved/Found Jobs
          </Label>
          <RadioGroup
            id="job-select"
            value={selectedJobId}
            onValueChange={setSelectedJobId}
            className="mt-2 space-y-1 max-h-40 overflow-y-auto border border-slate-700 p-2 rounded-md"
          >
            {(mockJobListings || []).slice(0, 10).map((job) => (
              <Label
                key={job.id}
                className="flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors hover:bg-slate-800 has-[:checked]:bg-purple-600/20 has-[:checked]:border-purple-500 border border-transparent"
              >
                <RadioGroupItem value={job.id} />
                {job.title} at {job.company}
              </Label>
            ))}
          </RadioGroup>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white"
              disabled={!selectedJobId || isLoading}
              onClick={() => handleJobContextSubmit('select', selectedJobId)}
            >
              Use Selected Job
            </Button>
          </motion.div>
        </motion.div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900 px-2 text-slate-500">Or</span>
          </div>
        </div>
        <motion.div variants={itemVariants}>
          <Label htmlFor="job-paste" className="text-slate-300">
            Paste Job Description
          </Label>
          <Textarea
            id="job-paste"
            placeholder="Paste the full job description here..."
            className="mt-2 min-h-[150px] bg-slate-800 border-slate-600 focus:border-purple-500"
            value={pastedJobDesc}
            onChange={(e) => setPastedJobDesc(e.target.value)}
          />
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white"
              disabled={!pastedJobDesc || isLoading}
              onClick={() => handleJobContextSubmit('paste', pastedJobDesc)}
            >
              Use Pasted Description
            </Button>
          </motion.div>
        </motion.div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900 px-2 text-slate-500">Or</span>
          </div>
        </div>
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            className="w-full bg-slate-800 border border-slate-600 hover:bg-slate-700"
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
                <UploadCloud className="mr-2 h-4 w-4 text-purple-400" /> Upload
                Job Description File
              </>
            )}
          </Button>
          <input
            type="file"
            ref={jobDescFileInputRef}
            onChange={(e) =>
              e.target.files?.[0] &&
              handleJobContextSubmit('upload', e.target.files[0])
            }
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg"
          />
          <p className="text-xs text-slate-500 text-center mt-1">
            PDF, PNG, JPG supported
          </p>
        </motion.div>
      </CardContent>
    </StyledCard>
  );
};
