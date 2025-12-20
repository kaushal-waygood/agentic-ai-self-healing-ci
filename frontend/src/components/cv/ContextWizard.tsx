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
} from 'lucide-react';
import React, { useState } from 'react';

const ContextWizard = ({
  additionalNarratives,
  setAdditionalNarratives,
  setWizardStep,
  handleGenerate,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);

  const suggestions = [
    {
      id: 1,
      text: 'Highlight my leadership experience',
      icon: Target,
      color: 'blue',
    },
    {
      id: 2,
      text: 'Emphasize my problem-solving skills',
      icon: Lightbulb,
      color: 'yellow',
    },
    {
      id: 3,
      text: 'Showcase team collaboration abilities',
      icon: User,
      color: 'green',
    },
    {
      id: 4,
      text: 'Focus on my innovation mindset',
      icon: Star,
      color: 'purple',
    },
    {
      id: 5,
      text: 'Feature my results-driven approach',
      icon: TrendingUp,
      color: 'orange',
    },
    {
      id: 6,
      text: 'Mention my specific industry expertise',
      icon: Award,
      color: 'red',
    },
  ];

  // FIX: This function now updates the parent's `additionalNarratives` state
  const toggleSuggestion = (suggestion) => {
    const suggestionTextWithPeriod = `${suggestion.text}.`;
    const isCurrentlySelected = selectedSuggestions.includes(suggestion.id);

    setSelectedSuggestions((prev) =>
      isCurrentlySelected
        ? prev.filter((sId) => sId !== suggestion.id)
        : [...prev, suggestion.id],
    );

    setAdditionalNarratives((currentNarratives) => {
      if (isCurrentlySelected) {
        // It's being deselected, so remove the text.
        let newText = currentNarratives.replace(suggestionTextWithPeriod, '');
        newText = newText.replace(/\s\s+/g, ' ').trim(); // Clean up extra spaces
        return newText;
      } else {
        // It's being selected, so add the text.
        // Add a space if there's already text.
        return `${currentNarratives} ${suggestionTextWithPeriod}`.trim();
      }
    });
  };

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

  const handleGenerateClick = async () => {
    setIsGenerating(true);
    await handleGenerate();
    setIsGenerating(false);
  };

  return (
    <div className="flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center mb-8">
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
                Add your personal touch to make your CV stand out from the
                crowd.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-500" />
                Quick Enhancement Options
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {suggestions.map((suggestion) => {
                  const Icon = suggestion.icon;
                  const isSelected = selectedSuggestions.includes(
                    suggestion.id,
                  );
                  return (
                    <button
                      key={suggestion.id}
                      onClick={() => toggleSuggestion(suggestion)} // FIX: Pass the whole suggestion object
                      className={`p-3 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
                        isSelected
                          ? `${getColorClasses(
                              suggestion.color,
                              true,
                            )} border-transparent shadow-lg`
                          : `${getColorClasses(
                              suggestion.color,
                              false,
                            )} border-gray-200 hover:border-gray-300`
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {suggestion.text}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              {selectedSuggestions.length > 0 && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-indigo-700 text-sm font-medium">
                    <Check className="h-4 w-4" />
                    {selectedSuggestions.length} enhancement
                    {selectedSuggestions.length > 1 ? 's' : ''} selected
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              <span className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-lg border">
                OR
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-500" />
                Custom Instructions
              </h3>
              <div className="relative group">
                <Textarea
                  placeholder="Tell us what to emphasize in your CV...

Examples:
• Highlight my leadership in cross-functional teams
• Emphasize experience with scalable systems and microservices
• Showcase my passion for user-centric design principles
• Focus on my track record of driving revenue growth
• Mention my expertise in agile methodologies"
                  className="min-h-[180px] border-2 border-gray-200 rounded-lg p-4 focus:border-indigo-500 focus:ring-0 resize-none transition-all duration-300 group-hover:border-gray-300 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm text-base leading-relaxed"
                  value={additionalNarratives}
                  onChange={(e) => setAdditionalNarratives(e.target.value)}
                />
                <div className="absolute top-4 right-4 text-gray-400">
                  <Lightbulb className="h-5 w-5" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-700 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <Target className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <span>
                    <span className="font-medium">Pro tip:</span> Be specific
                    about achievements and technologies
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 bg-green-50 p-3 rounded-lg border border-green-100">
                  <TrendingUp className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>
                    <span className="font-medium">Focus on:</span> Quantifiable
                    results and impact
                  </span>
                </div>
              </div>
            </div>

            {/* <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Rocket className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900">
                  AI Enhancement Ready
                </h4>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Our AI will analyze your job requirements, current CV, and
                enhancement preferences to create a perfectly tailored resume
                that highlights your strengths and matches what employers are
                looking for.
              </p>
            </div> */}
          </CardContent>

          <CardFooter className="bg-gray-50/80 backdrop-blur-xl border-t border-gray-100 p-6">
            <div className="flex items-center flex-wrap justify-between w-full">
              <Button
                variant="ghost"
                onClick={() => setWizardStep('cv')}
                className="h-12 px-6 rounded-lg hover:bg-white/80 transition-all duration-300"
                disabled={isGenerating}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to CV Selection
              </Button>

              <Button
                size="lg"
                onClick={handleGenerateClick}
                disabled={isGenerating}
                className={`h-14 px-8 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] ${
                  isGenerating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 '
                } text-white`}
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Generating Your Perfect CV...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-3 h-5 w-5" />
                    Generate My Perfect CV
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

export default ContextWizard;
