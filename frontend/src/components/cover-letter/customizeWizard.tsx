import {
  ArrowLeft,
  Wand2,
  Check,
  Sparkles,
  Target,
  FileText,
  User,
  Lightbulb,
  Star,
  TrendingUp,
  Award,
  Rocket,
  Palette,
  Zap, // Add this import
} from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

const CustomizeWizard = ({ handleGenerate, isLoading, setWizardStep }: any) => {
  const [formData, setFormData] = useState({
    tone: 'Formal',
    style: 'Concise',
    personalStory: '',
  });

  const toneOptions = [
    { value: 'Formal', text: 'Formal', icon: Award, color: 'blue' },
    {
      value: 'Enthusiastic',
      text: 'Enthusiastic',
      icon: Star,
      color: 'purple',
    },
    { value: 'Reserved', text: 'Reserved', icon: User, color: 'green' },
    { value: 'Casual', text: 'Casual', icon: Lightbulb, color: 'yellow' },
  ];

  const styleOptions = [
    { value: 'Concise', text: 'Concise', icon: Zap, color: 'orange' },
    { value: 'Detailed', text: 'Detailed', icon: Target, color: 'red' },
  ];

  const getColorClasses = (color, selected) => {
    const colors = {
      blue: selected
        ? 'bg-blue-500 text-white'
        : 'bg-blue-50 text-blue-600 hover:bg-blue-100',
      yellow: selected
        ? 'bg-yellow-500 text-white'
        : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100',
      green: selected
        ? 'bg-green-500 text-white'
        : 'bg-green-50 text-green-600 hover:bg-green-100',
      purple: selected
        ? 'bg-purple-500 text-white'
        : 'bg-purple-50 text-purple-600 hover:bg-purple-100',
      orange: selected
        ? 'bg-orange-500 text-white'
        : 'bg-orange-50 text-orange-600 hover:bg-orange-100',
      red: selected
        ? 'bg-red-500 text-white'
        : 'bg-red-50 text-red-600 hover:bg-red-100',
    };
    return colors[color] || colors.blue;
  };

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex items-center justify-center p-2 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="h-4 w-4 text-white" />
              </div>
              <span className="hidden sm:inline text-sm font-medium text-green-600">
                Job Context
              </span>
            </div>
            <div className="w-12 h-0.5 bg-green-500"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="h-4 w-4 text-white" />
              </div>
              <span className="hidden sm:inline text-sm font-medium text-green-600">
                Your CV
              </span>
            </div>
            <div className="w-12 h-0.5 bg-gradient-to-r from-green-500 to-indigo-500"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-white font-bold text-sm">3</span>
              </div>
              <span className="hidden sm:inline text-sm font-medium text-indigo-600">
                Final Touches
              </span>
            </div>
          </div>
        </div>

        <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-2xl shadow-indigo-500/10 rounded-lg overflow-hidden">
          {/* Header */}
          <CardHeader className="p-2 bg-header-gradient-primary text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 ">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Wand2 className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl ">
                  Step 3: Final Touches
                </CardTitle>
              </div>
              <CardDescription className="text-indigo-100 text-base">
                Add your personal touch to make your cover letter stand out.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            {/* Quick Suggestions */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-500" />
                Quick Enhancement Options
              </h3>
              {/* Tone Options */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {toneOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = formData.tone === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => updateFormData('tone', option.value)}
                      className={`p-3 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
                        isSelected
                          ? `${getColorClasses(
                              option.color,
                              true,
                            )} border-transparent shadow-lg`
                          : `${getColorClasses(
                              option.color,
                              false,
                            )} border-gray-200 hover:border-gray-300`
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {option.text}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              {/* Style Options */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {styleOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = formData.style === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => updateFormData('style', option.value)}
                      className={`p-3 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
                        isSelected
                          ? `${getColorClasses(
                              option.color,
                              true,
                            )} border-transparent shadow-lg`
                          : `${getColorClasses(
                              option.color,
                              false,
                            )} border-gray-200 hover:border-gray-300`
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {option.text}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-indigo-700 text-sm font-medium">
                  <Check className="h-4 w-4" />
                  Selected Tone: {formData.tone} & Style: {formData.style}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              <span className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-lg border">
                AND/OR
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>

            {/* Custom Narratives */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-500" />
                Add a Personal Story
              </h3>
              <div className="relative group">
                <Textarea
                  placeholder="Share a specific achievement, personal connection to the company, or unique experience that makes you stand out..."
                  className="min-h-[150px] border-2 border-gray-200 rounded-lg p-4 focus:border-indigo-500 focus:ring-0 resize-none transition-all duration-300 group-hover:border-gray-300 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm text-base leading-relaxed"
                  value={formData.personalStory}
                  onChange={(e) =>
                    updateFormData('personalStory', e.target.value)
                  }
                />
                <div className="absolute top-4 right-4 text-gray-400">
                  <Lightbulb className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* AI Enhancement Preview */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-2 border border-indigo-100">
              <div className="flex items-center gap-3 ">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Rocket className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900">
                  AI Enhancement Ready
                </h4>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Our AI will analyze your job requirements, CV, and enhancement
                preferences to create a perfectly tailored cover letter that
                highlights your strengths.
              </p>
            </div>
          </CardContent>

          {/* Footer */}
          <CardFooter className="bg-gray-50/80 backdrop-blur-xl border-t border-gray-100 p-6">
            <div className="flex items-center flex-wrap justify-between w-full">
              <Button
                variant="ghost"
                onClick={() => setWizardStep('cv')}
                className="h-12 px-6 rounded-lg hover:bg-white/80 transition-all duration-300"
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to CV Context
              </Button>

              <Button
                size="lg"
                onClick={handleGenerate}
                disabled={isLoading}
                className={`h-14 px-8 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 '
                } text-white`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Generating Cover Letter...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-3 h-5 w-5" />
                    Generate Cover Letter
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CustomizeWizard;
