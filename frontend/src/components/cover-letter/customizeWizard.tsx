import React, { useState } from 'react';
import {
  ArrowLeft,
  Loader2,
  Wand2,
  Check,
  Palette,
  FileText,
  MessageSquare,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

const CustomizeWizard = ({
  customizationForm,
  handleGenerate,
  isLoading,
  setWizardStep,
}: any) => {
  const [formData, setFormData] = useState({
    tone: 'Formal',
    style: 'Concise',
    personalStory: '',
  });
  const [showPreview, setShowPreview] = useState(false);

  const toneOptions = [
    {
      value: 'Formal',
      label: 'Formal',
      description: 'Professional and traditional',
      icon: '🎩',
      color: 'blue',
    },
    {
      value: 'Enthusiastic',
      label: 'Enthusiastic',
      description: 'Energetic and passionate',
      icon: '🚀',
      color: 'orange',
    },
    {
      value: 'Reserved',
      label: 'Reserved',
      description: 'Modest and understated',
      icon: '🤝',
      color: 'green',
    },
    {
      value: 'Casual',
      label: 'Casual',
      description: 'Friendly and approachable',
      icon: '😊',
      color: 'purple',
    },
  ];

  const styleOptions = [
    {
      value: 'Concise',
      label: 'Concise',
      description: 'Short and to the point',
      icon: '⚡',
      color: 'indigo',
    },
    {
      value: 'Detailed',
      label: 'Detailed',
      description: 'Comprehensive and thorough',
      icon: '📋',
      color: 'emerald',
    },
  ];

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getColorClasses = (color, isSelected) => {
    const colors = {
      blue: isSelected
        ? 'border-blue-500 bg-blue-50'
        : 'border-gray-200 hover:border-blue-300',
      orange: isSelected
        ? 'border-orange-500 bg-orange-50'
        : 'border-gray-200 hover:border-orange-300',
      green: isSelected
        ? 'border-green-500 bg-green-50'
        : 'border-gray-200 hover:border-green-300',
      purple: isSelected
        ? 'border-purple-500 bg-purple-50'
        : 'border-gray-200 hover:border-purple-300',
      indigo: isSelected
        ? 'border-indigo-500 bg-indigo-50'
        : 'border-gray-200 hover:border-indigo-300',
      emerald: isSelected
        ? 'border-emerald-500 bg-emerald-50'
        : 'border-gray-200 hover:border-emerald-300',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100 ">
      <div className="w-full">
        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                <Check className="w-4 h-4" />
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">
                Job Details
              </span>
            </div>
            <div className="w-16 h-0.5 bg-green-200"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                <Check className="w-4 h-4" />
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">
                CV Context
              </span>
            </div>
            <div className="w-16 h-0.5 bg-purple-200"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-purple-600">
                Customize
              </span>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2 flex items-center">
                  <Sparkles className="w-8 h-8 mr-3" />
                  Customize Your Letter
                </h2>
                <p className="text-purple-100">
                  Fine-tune the tone, style, and add your personal touch
                </p>
              </div>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center"
              >
                <FileText className="w-4 h-4 mr-2" />
                Preview
                <ChevronDown
                  className={`w-4 h-4 ml-2 transition-transform ${
                    showPreview ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Preview Section */}
          {showPreview && (
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200 p-6">
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Letter Preview Settings:
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">Tone:</span>
                    <span className="font-medium text-gray-800">
                      {formData.tone}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">Style:</span>
                    <span className="font-medium text-gray-800">
                      {formData.style}
                    </span>
                  </div>
                </div>
                {formData.personalStory && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="text-gray-500 text-sm">
                      Personal Story:
                    </span>
                    <p className="text-gray-700 text-sm mt-1 italic">
                      "{formData.personalStory.substring(0, 100)}..."
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-8">
            <div className="space-y-8">
              {/* Tone Selection */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Palette className="w-5 h-5 text-purple-500" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Choose Your Tone
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {toneOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`group relative p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${getColorClasses(
                        option.color,
                        formData.tone === option.value,
                      )}`}
                      onClick={() => updateFormData('tone', option.value)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">{option.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 text-lg">
                            {option.label}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {option.description}
                          </p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                            formData.tone === option.value
                              ? `border-${option.color}-500 bg-${option.color}-500`
                              : 'border-gray-300 group-hover:border-gray-400'
                          }`}
                        >
                          {formData.tone === option.value && (
                            <div className="w-full h-full bg-white rounded-full scale-50"></div>
                          )}
                        </div>
                      </div>
                      {formData.tone === option.value && (
                        <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-purple-500">
                          <Check className="absolute -top-4 -right-3 w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Style Selection */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Select Writing Style
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {styleOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`group relative p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${getColorClasses(
                        option.color,
                        formData.style === option.value,
                      )}`}
                      onClick={() => updateFormData('style', option.value)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">{option.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 text-lg">
                            {option.label}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {option.description}
                          </p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                            formData.style === option.value
                              ? `border-${option.color}-500 bg-${option.color}-500`
                              : 'border-gray-300 group-hover:border-gray-400'
                          }`}
                        >
                          {formData.style === option.value && (
                            <div className="w-full h-full bg-white rounded-full scale-50"></div>
                          )}
                        </div>
                      </div>
                      {formData.style === option.value && (
                        <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-indigo-500">
                          <Check className="absolute -top-4 -right-3 w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Personal Story */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <MessageSquare className="w-5 h-5 text-pink-500" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Add Personal Touch
                  </h3>
                  <span className="text-sm text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                    Optional
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    className="w-full p-6 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all duration-300 resize-none"
                    rows="4"
                    placeholder="Share a specific achievement, personal connection to the company, or unique experience that makes you stand out..."
                    value={formData.personalStory}
                    onChange={(e) =>
                      updateFormData('personalStory', e.target.value)
                    }
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                    {formData.personalStory.length}/500
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="text-blue-500 mt-0.5">💡</div>
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">
                        Pro Tip
                      </h4>
                      <p className="text-sm text-blue-600 mt-1">
                        Mention specific achievements, relevant experiences, or
                        genuine connections to make your letter more compelling
                        and memorable.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-6 px-8 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none transition-all duration-300 flex items-center justify-center space-x-3"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Generating Your Perfect Letter...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-6 h-6" />
                      <span>Generate Cover Letter</span>
                      <Sparkles className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 flex justify-between items-center">
            <button
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              onClick={() => setWizardStep('cv')}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to CV Context</span>
            </button>

            <div className="text-sm text-gray-500">
              Final Step - Ready to Generate!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizeWizard;
