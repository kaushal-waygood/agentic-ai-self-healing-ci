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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';

const GeneratedCoverLetter = ({
  generatedLetter,
  setGeneratedLetter,
  handleInitiateSave,
  handleRegenerate,
  isNamingDialogDisplayed,
  setIsNamingDialogDisplayed,
  cvNameForSavingInput,
  setCvNameForSavingInput,
  confirmSaveNamedCv,
  onSendEmail,
}: any) => {
  return (
    <div className="min-h-screen  p-2 md:p-3 lg:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Success Banner */}
        {/* <div className="mb-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-2 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">
                Cover Letter Generated!
              </h2>
            </div>
          </div>
        </div> */}

        <div className="flex flex-col gap-4">
          {/* Editor Card */}
          <div>
            <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-lg overflow-hidden">
              <CardHeader className=" p-2 bg-header-gradient-primary text-white">
                <div className="flex items-center gap-2 ">
                  <div className="w-12 h-12  rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="h-7 w-7 " />
                  </div>

                  <div className="flex-1">
                    <h2 className="text-lg  md:text-xl font-bold ">
                      Your AI Generated Cover Letter
                    </h2>
                  </div>
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
                  handleSave={handleInitiateSave}
                  type="coverletter"
                  onSendEmail={onSendEmail}
                  sendEmailHint="Cover letter only"
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Action Bar */}
        {/* <div className="mt-8 bg-white/60 backdrop-blur-xl border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
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
                className="rounded-lg"
              >
                <Clock className="mr-2 h-4 w-4" />
                Save for Later
              </Button>
              <Link href="/dashboard/search-jobs">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg">
                  <Award className="mr-2 h-4 w-4" />
                  Start Applying
                </Button>
              </Link>
            </div>
          </div>
        </div> */}
      </div>
      {isNamingDialogDisplayed && (
        <AlertDialog
          open={isNamingDialogDisplayed}
          onOpenChange={setIsNamingDialogDisplayed}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Name Your CV</AlertDialogTitle>
              <AlertDialogDescription>
                Give this version a unique name. E.g., "CV for Google PM Role".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
              placeholder="Enter CV Name"
              value={cvNameForSavingInput}
              onChange={(e) => setCvNameForSavingInput(e.target.value)}
              className="my-4"
            />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmSaveNamedCv}>
                Save CV
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default GeneratedCoverLetter;
