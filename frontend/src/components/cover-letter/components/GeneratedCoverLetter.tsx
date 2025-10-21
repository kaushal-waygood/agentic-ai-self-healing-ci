import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Save,
  Star,
  CheckCircle,
  Award,
  Target,
  FileText,
  Sparkles,
  BarChart3,
  ThumbsUp,
  Clock,
  Palette,
} from 'lucide-react';
import React from 'react';
import EditableMaterial from '../../application/editable-material';

const GeneratedCoverLetter = ({
  generatedLetter,
  setGeneratedLetter,
  handleInitiateSave,
  handleRegenerate,
  customizationOptions, // Pass the customization state here
}: any) => {
  return (
    <div className="min-h-screen  p-2 md:p-3 lg:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Success Banner */}
        <div className="mb-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-2 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">
                Cover Letter Generated!
              </h2>
              {/* <p className="text-green-100">
                Your AI-tailored letter is ready for review and customization.
              </p> */}
            </div>
            {/* <div className="text-right">
              <div className="text-sm text-green-100">Generated at</div>
              <div className="font-medium">
                {new Date().toLocaleTimeString()}
              </div>
            </div> */}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Editor Card */}
          <div>
            <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className=" p-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold">
                        Your AI Generated Cover Letter
                      </CardTitle>
                      <CardDescription className="text-indigo-100 text-sm">
                        Review and customize your optimized letter below.
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    onClick={handleInitiateSave}
                    className="bg-white/20 hover:bg-white/30 border-white/30 text-white rounded-xl h-10 transition-all duration-300"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Final
                  </Button>
                </div>
              </CardHeader>
              <CardContent className=" sm:p-4">
                <EditableMaterial
                  editorId="cover-letter-live-editor"
                  title="Cover Letter"
                  content={generatedLetter}
                  setContent={setGeneratedLetter}
                  handleRegenerate={handleRegenerate}
                  isHtml
                />
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Tone & Style Analysis Card */}
            <Card className="flex-1 bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Palette className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold">
                    Tone & Style Analysis
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center mb-4 space-y-2">
                  <div className="text-3xl font-bold text-blue-600">
                    {customizationOptions?.tone || 'Formal'}
                  </div>
                  <div className="text-sm text-gray-500">Selected Tone</div>
                </div>
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-indigo-600">
                    {customizationOptions?.style || 'Concise'}
                  </div>
                  <div className="text-sm text-gray-500">Selected Style</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    This letter is crafted with a{' '}
                    <strong className="font-semibold">
                      {customizationOptions?.tone || 'Formal'}
                    </strong>{' '}
                    and{' '}
                    <strong className="font-semibold">
                      {customizationOptions?.style || 'Concise'}
                    </strong>{' '}
                    approach to best represent your profile.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Performance Highlights Card */}
            <Card className="flex-1 bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                  Performance Highlights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                  <ThumbsUp className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="font-semibold text-green-800">
                      Strong Opening
                    </div>
                    <div className="text-sm text-green-600">
                      Designed to capture attention.
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <Target className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="font-semibold text-blue-800">
                      Clear Call-to-Action
                    </div>
                    <div className="text-sm text-blue-600">
                      Encourages the next step.
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  <div>
                    <div className="font-semibold text-purple-800">
                      Tailored Content
                    </div>
                    <div className="text-sm text-purple-600">
                      Aligned with job context.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="mt-8 bg-white/60 backdrop-blur-xl border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">
                  Ready to apply?
                </div>
                <div className="text-sm text-gray-600">
                  Your letter is optimized and ready to impress.
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleInitiateSave}
                variant="outline"
                className="rounded-xl"
              >
                <Clock className="mr-2 h-4 w-4" />
                Save for Later
              </Button>
              <Link href="/dashboard/search-jobs">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl">
                  <Award className="mr-2 h-4 w-4" />
                  Start Applying
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratedCoverLetter;
