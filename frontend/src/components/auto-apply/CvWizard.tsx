'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { Select, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { mockUserProfile } from '@/lib/data/user';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  PlusCircle,
  UploadCloud,
} from 'lucide-react';
import { useRef, useEffect } from 'react';

const CvWizard = ({
  form,
  errors,
  isLoading,
  loadingMessage,
  handleFileUpload,
  setWizardStep,
  wizardStep,
  handleGoToNextStep,
  baseCvId,
  setIsLoading,
  setLoadingMessage,
}: {
  form: any;
  errors: any;
  isLoading: boolean;
  loadingMessage: string;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  setWizardStep: (step: any) => void;
  wizardStep: string;
  handleGoToNextStep: (step: string, fields?: string[]) => void;
  baseCvId: string;
  setIsLoading: (loading: boolean) => void;
  setLoadingMessage: (message: string) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Watch for changes in baseCvId to auto-proceed
  useEffect(() => {
    if (baseCvId) {
      const timer = setTimeout(() => {
        handleGoToNextStep('cv', ['baseCvId']);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [baseCvId, handleGoToNextStep]);

  const handleUploadClick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      await handleFileUpload(e);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 2: Choose Your Master CV</CardTitle>
        <CardDescription>Select a base CV. This is required.</CardDescription>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="baseCvId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Select Base CV <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => field.onChange(value)}
                  value={field.value ?? ''}
                  className="space-y-2"
                >
                  {mockUserProfile.savedCvs.map((cv) => (
                    <FormItem
                      key={cv.id}
                      className="flex items-center space-x-3 space-y-0"
                    >
                      <FormControl>
                        <RadioGroupItem value={cv.id} id={`cv-${cv.id}`} />
                      </FormControl>
                      <Label
                        htmlFor={`cv-${cv.id}`}
                        className="font-normal cursor-pointer flex-grow"
                      >
                        {cv.name}
                      </Label>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              {mockUserProfile.savedCvs.length === 0 && (
                <p className="text-sm text-center py-4 text-muted-foreground">
                  No saved CVs. Please create or upload one below.
                </p>
              )}
              <FormMessage className="pt-2" />
            </FormItem>
          )}
        />
        <Separator className="my-6" />
        <div className="space-y-2 text-center">
          <p className="text-sm text-muted-foreground mb-2">Or add a new CV</p>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              fileInputRef.current?.click();
              console.log('fileInputRef.current', fileInputRef.current);
            }}
            disabled={isLoading}
          >
            {isLoading && loadingMessage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                {loadingMessage}
              </>
            ) : (
              <>
                <UploadCloud className="mr-2 h-4 w-4" />
                Upload a CV
              </>
            )}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUploadClick}
            className="hidden"
            accept=".pdf,.doc,.docx,.png,.jpg"
          />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setWizardStep('createCv')}
            disabled={isLoading}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Create a New CV
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setWizardStep('filters')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          type="button"
          onClick={() => handleGoToNextStep('cv', ['baseCvId'])}
          disabled={!baseCvId || isLoading}
        >
          Next: Cover Letter <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CvWizard;
