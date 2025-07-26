'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Loader2, UploadCloud, User, ArrowLeft } from 'lucide-react';
import type { CvContext } from '../cover-letter-client';
import { mockUserProfile } from '@/lib/data/user';

interface CvContextStepProps {
  onCvContextSet: (context: CvContext) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setLoadingMessage: (message: string) => void;
  loadingMessage: string;
  toast: (options: any) => void;
  onBack: () => void;
}

export function CvContextStep({
  onCvContextSet,
  isLoading,
  setIsLoading,
  setLoadingMessage,
  loadingMessage,
  toast,
  onBack,
}: CvContextStepProps) {
  const [selectedSavedCvId, setSelectedSavedCvId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSetCvContext = (
    mode: 'saved' | 'profile' | 'upload',
    data: { value: string; name: string },
  ) => {
    onCvContextSet({ mode, value: data.value, name: data.name });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setLoadingMessage('Parsing uploaded CV...');
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const base64data = reader.result as string;
        handleSetCvContext('upload', {
          value: base64data,
          name: `Uploaded: ${file.name}`,
        });
        toast({
          title: 'CV Uploaded!',
          description: 'The uploaded CV will be used for context.',
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'CV Processing Failed',
          description: (error as Error).message,
        });
      } finally {
        setIsLoading(false);
        setLoadingMessage('');
      }
    };
    reader.onerror = () => {
      toast({ variant: 'destructive', title: 'File Read Error' });
      setIsLoading(false);
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          Step 2: CV Context
        </CardTitle>
        <CardDescription>
          Choose the CV the AI should reference.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={selectedSavedCvId}
          onValueChange={setSelectedSavedCvId}
          className="space-y-2 max-h-60 overflow-y-auto pr-2"
        >
          {mockUserProfile.savedCvs.map((cv) => (
            <Label
              key={cv.id}
              className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-muted/50 has-[:checked]:bg-primary/10 has-[:checked]:border-primary"
            >
              <RadioGroupItem value={cv.id} id={cv.id} />
              <div>
                <p className="font-semibold">{cv.name}</p>
                <p className="text-xs text-muted-foreground">
                  Saved: {new Date(cv.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Label>
          ))}
        </RadioGroup>
        {selectedSavedCvId && (
          <Button
            className="w-full"
            onClick={() =>
              handleSetCvContext('saved', {
                value:
                  mockUserProfile.savedCvs.find(
                    (c) => c.id === selectedSavedCvId,
                  )?.htmlContent || '',
                name:
                  mockUserProfile.savedCvs.find(
                    (c) => c.id === selectedSavedCvId,
                  )?.name || '',
              })
            }
          >
            Use Selected Saved CV
          </Button>
        )}
        <Separator className="my-4" />
        <Button
          variant="outline"
          className="w-full"
          onClick={() =>
            handleSetCvContext('profile', {
              value:
                mockUserProfile.generatedCvContent ||
                JSON.stringify(mockUserProfile),
              name: 'Active Profile CV',
            })
          }
        >
          <User className="mr-2 h-4 w-4" /> Use Active Profile CV
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {loadingMessage}
            </>
          ) : (
            <>
              <UploadCloud className="mr-2 h-4 w-4" />
              Upload a New CV
            </>
          )}
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept=".pdf,.doc,.docx,.png,.jpg"
        />
      </CardContent>
      <CardFooter>
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </CardFooter>
    </Card>
  );
}
