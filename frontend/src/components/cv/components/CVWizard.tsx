import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Loader2, UploadCloud, User } from 'lucide-react';
import React from 'react';

const CVWizard = ({
  handleFileInputUploadClick,
  isLoading,
  fileInputRef,
  loadingMessage,
  handleFileUpload,
  handleUseProfile,
  selectedSavedCvId,
  setSelectedSavedCvId,
  mockUserProfile,
  handleSetCvSource,
  setWizardStep,
}: any) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          Step 2: Provide Your CV
        </CardTitle>
        <CardDescription>
          Choose your professional background source.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          variant="outline"
          className="w-full h-20 text-base flex-col gap-2"
          onClick={handleFileInputUploadClick}
          disabled={isLoading}
        >
          {isLoading && loadingMessage ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              <UploadCloud />
              Upload CV File
            </>
          )}
        </Button>
        <Input
          type="file"
          className="hidden"
          ref={fileInputRef}
          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
          onChange={handleFileUpload}
        />
        <Button
          variant="outline"
          className="w-full h-20 text-base"
          onClick={handleUseProfile}
        >
          <User />
          Use My Profile
        </Button>
        {mockUserProfile.savedCvs?.length > 0 && (
          <>
            <Separator />
            <RadioGroup
              value={selectedSavedCvId}
              onValueChange={setSelectedSavedCvId}
              className="space-y-2 max-h-40 overflow-y-auto p-2 border rounded-md"
            >
              {mockUserProfile.savedCvs.map((cv) => (
                <Label
                  key={cv.id}
                  className="flex items-center gap-3 p-2 border rounded-md cursor-pointer hover:bg-muted/50 has-[:checked]:bg-primary/10 has-[:checked]:border-primary"
                >
                  <RadioGroupItem value={cv.id} id={cv.id} />
                  {cv.name}
                </Label>
              ))}
            </RadioGroup>
            <Button
              className="w-full"
              onClick={() =>
                handleSetCvSource('saved', {
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
              disabled={!selectedSavedCvId}
            >
              Use Selected CV
            </Button>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="ghost" onClick={() => setWizardStep('job')}>
          <ArrowLeft className="mr-2" />
          Back
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CVWizard;
