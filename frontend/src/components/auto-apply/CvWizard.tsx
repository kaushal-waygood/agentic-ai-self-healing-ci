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
  FileText,
  Check,
  Briefcase,
  Clock,
  Zap,
  Target,
  Upload,
  Shield,
} from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

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
  const [dragActive, setDragActive] = useState(false);

  // This effect from your original code is preserved.
  // It automatically navigates to the next step once a CV is selected or uploaded.
  useEffect(() => {
    if (baseCvId) {
      const timer = setTimeout(() => {
        handleGoToNextStep('cv', ['baseCvId']);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [baseCvId, handleGoToNextStep]);

  // Wrapper function to handle the file upload process.
  const handleUploadClick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      await handleFileUpload(e);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  // Drag-and-drop event handlers from the UI component.
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle file drop for the drag-and-drop UI.
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Create a synthetic event object to pass to the original handler.
      const syntheticEvent = {
        target: { files: e.dataTransfer.files },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleUploadClick(syntheticEvent);
    }
  };

  // Helper function to get an icon based on CV type, for UI enhancement.
  const getCvTypeIcon = (type: string) => {
    switch (type) {
      case 'technical':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'startup':
        return <Zap className="h-4 w-4 text-purple-500" />;
      case 'senior':
        return <Target className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Indicator UI */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium text-green-600">
              Job Context
            </span>
          </div>
          <div className="w-12 h-0.5 bg-gradient-to-r from-green-500 to-purple-500"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">2</span>
            </div>
            <span className="text-sm font-medium text-purple-600">Your CV</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-500 font-bold text-sm">3</span>
            </div>
            <span className="text-sm text-gray-500">Generate</span>
          </div>
        </div>
      </div>

      <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-2xl shadow-purple-500/10 rounded-3xl overflow-hidden">
        {/* Styled Card Header */}
        <CardHeader className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white relative">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Step 2: Choose Your Master CV
              </CardTitle>
            </div>
            <CardDescription className="text-purple-100 text-base">
              Select a base CV from your saved list or upload a new one. This is
              required.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-8">
          {/* Section for Saved CVs */}
          <FormField
            control={form.control}
            name="baseCvId"
            render={({ field }) => (
              <FormItem>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <Briefcase className="h-5 w-5 text-purple-500" />
                  Select a Base CV <span className="text-destructive">*</span>
                </h3>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value ?? ''}
                    className="space-y-3"
                  >
                    {mockUserProfile.savedCvs.map((cv) => (
                      <Label
                        key={cv.id}
                        htmlFor={`cv-${cv.id}`}
                        className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:bg-purple-50 hover:border-purple-300 ${
                          field.value === cv.id
                            ? 'bg-purple-50 border-purple-500 shadow-lg'
                            : 'border-gray-200 hover:shadow-md'
                        }`}
                      >
                        <RadioGroupItem
                          value={cv.id}
                          id={`cv-${cv.id}`}
                          className="text-purple-500"
                        />
                        <div className="flex-1 flex items-center gap-3">
                          {getCvTypeIcon(cv.type)}
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">
                              {cv.name}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Updated {cv.lastModified}
                            </div>
                          </div>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                </FormControl>
                {mockUserProfile.savedCvs.length === 0 && (
                  <p className="text-sm text-center py-4 text-muted-foreground">
                    No saved CVs found. Please create or upload one below.
                  </p>
                )}
                <FormMessage className="pt-2" />
              </FormItem>
            )}
          />

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <span className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-lg border">
              OR
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>

          {/* Upload and Create Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-purple-500" />
              Add a New CV
            </h3>
            {/* Drag-and-Drop Area */}
            <div
              className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
                dragActive
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/30'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="mb-4 h-12 px-8 text-base font-semibold rounded-xl border-2 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  {isLoading && loadingMessage ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-5 w-5" />
                      {loadingMessage}
                    </>
                  ) : (
                    <>
                      <UploadCloud className="mr-2 h-5 w-5" />
                      Upload File or Drag & Drop
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500">
                  Supports .pdf, .doc, .docx, .png, .jpg
                </p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleUploadClick}
                className="hidden"
                accept=".pdf,.doc,.docx,.png,.jpg"
              />
            </div>
            {/* Create New CV Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-base font-semibold rounded-xl border-2 hover:bg-purple-50 hover:border-purple-300"
              onClick={() => setWizardStep('createCv')}
              disabled={isLoading}
            >
              <PlusCircle className="mr-2 h-5 w-5" /> Create a New CV
            </Button>
          </div>
        </CardContent>

        {/* Styled Card Footer */}
        <CardFooter className="bg-gray-50/80 backdrop-blur-xl border-t border-gray-100 p-4">
          <div className="flex items-center justify-between w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setWizardStep('filters')}
              className="h-12 px-6 rounded-xl"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              type="button"
              onClick={() => handleGoToNextStep('cv', ['baseCvId'])}
              disabled={!baseCvId || isLoading}
              className="h-12 px-6 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
            >
              Next: Cover Letter <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Security Notice */}
      <div className="text-center mt-6">
        <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-lg">
          <Shield className="h-4 w-4 text-green-500" />
          All uploads are processed securely and deleted after use.
        </div>
      </div>
    </div>
  );
};

export default CvWizard;
