import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Briefcase,
  Loader2,
  User,
  Target,
  Zap,
  UploadCloud,
  ArrowLeft,
  FileText,
  Check,
  Clock,
  Shield,
  Upload,
} from 'lucide-react';
import React, { useState, useRef } from 'react';

const CVGeneratorClient = ({
  handleFileInputUploadClick,
  isLoading,
  loadingMessage,
  fileInputRef,
  handleFileUpload,
  handleUseProfile,
  mockUserProfile,
  selectedSavedCvId,
  setSelectedSavedCvId,
  handleSetCvSource,
  setWizardStep,
}: any) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileUpload({ target: { files: [file] } });
    }
  };

  const getCvTypeIcon = (type) => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100 flex items-center justify-center">
      <div className="w-full">
        {/* Progress Indicator */}
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
              <span className="text-sm font-medium text-purple-600">
                Your CV
              </span>
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
          {/* Header */}
          <CardHeader className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 animate-pulse"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">
                  Step 2: Provide Your CV
                </CardTitle>
              </div>
              <CardDescription className="text-purple-100 text-base">
                Choose your professional background source to create the perfect
                tailored CV.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            {/* Upload Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <UploadCloud className="h-5 w-5 text-purple-500" />
                Upload CV File
              </h3>

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
                    variant="outline"
                    className="mb-4 h-12 px-8 text-base font-semibold rounded-xl border-2 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300"
                    onClick={handleFileInputUploadClick}
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
                        Choose File or Drag & Drop
                      </>
                    )}
                  </Button>

                  <p className="text-sm text-gray-600 mb-2">
                    Supports PDF, DOC, DOCX, PNG, JPG formats
                  </p>
                  <p className="text-xs text-gray-500">
                    Maximum file size: 10MB
                  </p>

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={handleFileUpload}
                />
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              <span className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-lg border">
                OR
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>

            {/* Profile Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5 text-purple-500" />
                Use Existing Profile
              </h3>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {mockUserProfile.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {mockUserProfile.email}
                    </p>
                  </div>
                </div>

                <Button
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
                  onClick={handleUseProfile}
                  disabled={isLoading}
                >
                  {isLoading && loadingMessage === 'Loading your profile...' ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-5 w-5" />
                      Loading Profile...
                    </>
                  ) : (
                    <>
                      <User className="mr-2 h-5 w-5" />
                      Use My Profile Data
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Saved CVs Section */}
            {mockUserProfile.savedCvs?.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-purple-500" />
                  Previously Saved CVs
                </h3>

                <RadioGroup
                  value={selectedSavedCvId}
                  onValueChange={setSelectedSavedCvId}
                  className="space-y-3"
                >
                  {mockUserProfile.savedCvs.map((cv) => (
                    <Label
                      key={cv.id}
                      className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:bg-purple-50 hover:border-purple-300 ${
                        selectedSavedCvId === cv.id
                          ? 'bg-purple-50 border-purple-500 shadow-lg'
                          : 'border-gray-200 hover:shadow-md'
                      }`}
                    >
                      <RadioGroupItem
                        value={cv.id}
                        id={cv.id}
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

                <Button
                  className={`w-full h-12 font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${
                    selectedSavedCvId
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-500'
                  }`}
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
                  <FileText className="mr-2 h-5 w-5" />
                  Use Selected CV
                </Button>
              </div>
            )}
          </CardContent>

          {/* Footer */}
          <CardFooter className="bg-gray-50/80 backdrop-blur-xl border-t border-gray-100">
            <div className="flex items-center justify-between w-full">
              <Button
                variant="ghost"
                onClick={() => setWizardStep('job')}
                className="h-12 px-6 rounded-xl hover:bg-white/80 transition-all duration-300"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Job Context
              </Button>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Shield className="h-4 w-4 text-green-500" />
                Your data is secure and encrypted
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Security Notice */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-lg">
            <Shield className="h-4 w-4 text-green-500" />
            All uploads are processed securely and deleted after optimization
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVGeneratorClient;
