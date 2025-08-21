import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, PlusCircle, UploadCloud, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { StyledCard } from '../StyledCard';
import { itemVariants } from '../motion';
import { mockUserProfile } from '@/lib/data/user'; // Adjust path as needed

// Define props
interface CvStepProps {
  isLoading: boolean;
  setWizardStep: (step: any) => void;
  handleCvContextSubmit: (mode: any, value?: string | File) => void;
  handleCVContext: (e: React.ChangeEvent<HTMLInputElement>) => void;
  cvFileInputRef: React.RefObject<HTMLInputElement>;
}

export const CvStep = ({
  isLoading,
  setWizardStep,
  handleCvContextSubmit,
  handleCVContext,
  cvFileInputRef,
}: CvStepProps) => {
  const [selectedCvId, setSelectedCvId] = useState('');

  return (
    <StyledCard>
      <CardHeader>
        <CardTitle>Step 2: Provide Your CV</CardTitle>
        <CardDescription>
          The AI needs your background to tailor it for the job.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <motion.div variants={itemVariants}>
          <Label className="text-slate-300">Select from Saved CVs</Label>
          <RadioGroup
            value={selectedCvId}
            onValueChange={setSelectedCvId}
            className="mt-2 space-y-1 max-h-40 overflow-y-auto border border-slate-700 p-2 rounded-md"
          >
            {mockUserProfile.savedCvs.length > 0 ? (
              mockUserProfile.savedCvs.map((cv) => (
                <Label
                  key={cv.id}
                  className="flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors hover:bg-slate-800 has-[:checked]:bg-purple-600/20 has-[:checked]:border-purple-500 border border-transparent"
                >
                  <RadioGroupItem value={cv.id} />
                  {cv.name}
                </Label>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center p-4">
                No saved CVs.
              </p>
            )}
          </RadioGroup>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white"
              disabled={!selectedCvId || isLoading}
              onClick={() => handleCvContextSubmit('saved', selectedCvId)}
            >
              Use Saved CV
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              className="h-24 w-full flex flex-col gap-2 bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-blue-500"
              onClick={() => handleCvContextSubmit('profile')}
              disabled={isLoading}
            >
              <User className="h-6 w-6 text-blue-400" /> Use My Profile
            </Button>
          </motion.div>
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              className="h-24 w-full flex flex-col gap-2 bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-blue-500"
              onClick={() => cvFileInputRef.current?.click()}
              disabled={isLoading}
            >
              <UploadCloud className="h-6 w-6 text-blue-400" /> Upload CV File
            </Button>
          </motion.div>
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              className="h-24 w-full flex flex-col gap-2 bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-blue-500"
              onClick={() => setWizardStep('createCv')}
              disabled={isLoading}
            >
              <PlusCircle className="h-6 w-6 text-blue-400" /> Create New CV
            </Button>
          </motion.div>
          <input
            type="file"
            ref={cvFileInputRef}
            onChange={handleCVContext}
            className="hidden"
            accept=".pdf,.doc,.docx"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" onClick={() => setWizardStep('job')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </CardFooter>
    </StyledCard>
  );
};
