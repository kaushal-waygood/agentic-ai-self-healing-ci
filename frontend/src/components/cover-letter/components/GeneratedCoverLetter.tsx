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
