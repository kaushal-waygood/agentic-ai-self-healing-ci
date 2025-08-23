import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Save,
  Star,
  Download,
  Share2,
  Edit3,
  CheckCircle,
  TrendingUp,
  Eye,
  Zap,
  Award,
  Target,
  FileText,
  Sparkles,
  BarChart3,
  ThumbsUp,
  Clock,
  RefreshCw,
} from 'lucide-react';
import React, { useState } from 'react';
import { EditableMaterial } from '../application/editable-material';

const GeneratedCV = ({
  generatedCvOutput,
  handleInitiateSave,
  setCurrentCvContent,
}: any) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(true);

  const handleShare = () => {
    console.log('Sharing CV...');
  };

  const handleRegenerate = () => {
    console.log('Regenerating CV...');
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 90) return 'from-green-500 to-emerald-500';
    if (score >= 80) return 'from-blue-500 to-indigo-500';
    if (score >= 70) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Success Banner */}
        <div className="mb-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">
                CV Generated Successfully!
              </h2>
              <p className="text-green-100">
                Your AI-optimized CV is ready for review and customization.
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-green-100">Generated at</div>
              <div className="font-medium">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Analytics Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* ATS Score Card */}
            <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold">
                    ATS Analysis
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div
                    className={`text-5xl font-bold bg-gradient-to-r ${getScoreBg(
                      generatedCvOutput.atsScore,
                    )} bg-clip-text text-transparent mb-2`}
                  >
                    {generatedCvOutput.atsScore}
                  </div>
                  <div className="text-gray-500 text-sm">ATS Score / 100</div>
                </div>

                {/* Score Breakdown */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Job Match</span>
                    <span
                      className={`font-semibold ${getScoreColor(
                        generatedCvOutput.jobMatch,
                      )}`}
                    >
                      {generatedCvOutput.jobMatch}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Keywords</span>
                    <span
                      className={`font-semibold ${getScoreColor(
                        generatedCvOutput.keywordMatch,
                      )}`}
                    >
                      {generatedCvOutput.keywordMatch}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Format</span>
                    <span
                      className={`font-semibold ${getScoreColor(
                        generatedCvOutput.formatScore,
                      )}`}
                    >
                      {generatedCvOutput.formatScore}%
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {generatedCvOutput.atsScoreReasoning}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-indigo-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl h-12"
                  //   onClick={handleDownload}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-2 hover:bg-blue-50 hover:border-blue-300 rounded-xl h-12"
                  onClick={handleShare}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share CV
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-2 hover:bg-purple-50 hover:border-purple-300 rounded-xl h-12"
                  onClick={handleRegenerate}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                  <ThumbsUp className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="font-semibold text-green-800">
                      Excellent Match
                    </div>
                    <div className="text-sm text-green-600">
                      94% job alignment
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <Target className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="font-semibold text-blue-800">
                      Well Targeted
                    </div>
                    <div className="text-sm text-blue-600">
                      Keywords optimized
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main CV Display */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold">
                        Your AI Generated CV
                      </CardTitle>
                      <CardDescription className="text-indigo-100 text-sm">
                        Review and customize your optimized CV below
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    onClick={handleInitiateSave}
                    disabled={isSaving}
                    className="bg-white/20 hover:bg-white/30 border-white/30 text-white rounded-xl h-10 transition-all duration-300"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Final
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-8">
                {/* CV Content */}
                <EditableMaterial
                  editorId="cv-live-editor"
                  title="CV"
                  content={generatedCvOutput.cv}
                  setContent={setCurrentCvContent}
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
                  Your CV is optimized and ready to impress employers
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="rounded-xl">
                <Clock className="mr-2 h-4 w-4" />
                Save for Later
              </Button>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl">
                <Award className="mr-2 h-4 w-4" />
                Start Applying
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratedCV;
