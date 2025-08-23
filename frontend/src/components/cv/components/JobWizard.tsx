import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Briefcase,
  ChevronsRight,
  FileSignature,
  Loader2,
  User,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';

const JobWizard = ({
  isLoading,
  pastedJobDescription,
  setPastedJobDescription,
  enteredJobTitle,
  handleSetJobContext,
  setEnteredJobTitle,
}: any) => {
  const [activeTab, setActiveTab] = useState('paste');

  const tabData = [
    {
      value: 'paste',
      icon: FileSignature,
      label: 'Paste JD',
      description: 'Full job description',
      gradient: 'from-blue-500 to-cyan-400',
    },
    {
      value: 'select',
      icon: Briefcase,
      label: 'Select Role',
      description: 'Choose from templates',
      gradient: 'from-purple-500 to-pink-400',
    },
    {
      value: 'title',
      icon: User,
      label: 'Job Title',
      description: 'Quick setup',
      gradient: 'from-green-500 to-emerald-400',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-2">
            AI CV Optimizer
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Transform your CV with AI-powered insights tailored to your dream
            job
          </p>
        </div>

        <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-2xl shadow-blue-500/10 rounded-3xl overflow-hidden">
          {/* Animated Header */}
          <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 animate-pulse"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">
                  Step 1: Provide Job Context
                </CardTitle>
              </div>
              <CardDescription className="text-blue-100 text-base">
                Tell the AI about the job. This is crucial for tailoring your CV
                to perfection.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              {/* Enhanced Tabs List */}
              <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-2xl p-2 mb-8 h-auto">
                {tabData.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 hover:scale-105 ${
                        activeTab === tab.value
                          ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg`
                          : 'hover:bg-white/80 data-[state=active]:bg-white data-[state=active]:shadow-lg'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <div className="text-center">
                        <div className="font-semibold text-sm">{tab.label}</div>
                        <div
                          className={`text-xs ${
                            activeTab === tab.value
                              ? 'text-white/80'
                              : 'text-gray-500'
                          }`}
                        >
                          {tab.description}
                        </div>
                      </div>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {/* Paste Tab */}
              <TabsContent value="paste" className="space-y-6">
                <div className="space-y-4">
                  <div className="relative group">
                    <Textarea
                      placeholder="Paste the full job description here... 
✨ The more detailed, the better your CV optimization will be!"
                      className="min-h-[240px] border-2 border-gray-200 rounded-2xl p-4 focus:border-blue-500 focus:ring-0 resize-none transition-all duration-300 group-hover:border-gray-300 bg-gray-50/50 backdrop-blur-sm"
                      value={pastedJobDescription}
                      onChange={(e) => setPastedJobDescription(e.target.value)}
                    />
                    <div className="absolute top-4 right-4 text-gray-400">
                      <FileSignature className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-700 bg-blue-50 p-3 rounded-xl border border-blue-100">
                    <Zap className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span className="font-medium">Pro tip:</span> Include
                    requirements, responsibilities, and company culture for best
                    results
                  </div>
                </div>

                <Button
                  className={`w-full h-14 text-lg font-semibold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] ${
                    pastedJobDescription && !isLoading
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl text-white'
                      : 'bg-gray-300 text-gray-500'
                  }`}
                  onClick={() => handleSetJobContext('paste')}
                  disabled={!pastedJobDescription || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-5 w-5" />
                      Analyzing Job Description...
                    </>
                  ) : (
                    <>
                      <ChevronsRight className="mr-2 h-5 w-5" />
                      Optimize My CV
                    </>
                  )}
                </Button>
              </TabsContent>

              {/* Select Tab */}
              <TabsContent value="select" className="space-y-6">
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                    <Briefcase className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Coming Soon
                  </h3>
                  <p className="text-gray-600 text-lg max-w-md mx-auto mb-6">
                    We're crafting a collection of job templates to make your CV
                    optimization lightning fast.
                  </p>
                  <div className="inline-flex items-center gap-2 text-purple-600 font-medium">
                    <Sparkles className="h-4 w-4" />
                    Stay tuned for updates
                  </div>
                </div>
              </TabsContent>

              {/* Title Tab */}
              <TabsContent value="title" className="space-y-6">
                <div className="space-y-4">
                  <div className="relative group">
                    <Input
                      placeholder="e.g., Senior Software Engineer, Marketing Manager, Data Scientist..."
                      className="h-14 border-2 border-gray-200 rounded-2xl px-6 text-lg focus:border-green-500 focus:ring-0 transition-all duration-300 group-hover:border-gray-300 bg-gray-50/50 backdrop-blur-sm"
                      value={enteredJobTitle}
                      onChange={(e) => setEnteredJobTitle(e.target.value)}
                    />
                    <div className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-400">
                      <User className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-700 bg-green-50 p-3 rounded-xl border border-green-100">
                    <Sparkles className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="font-medium">Quick setup:</span> We'll
                    optimize based on common requirements for this role
                  </div>
                </div>

                <Button
                  className={`w-full h-14 text-lg font-semibold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] ${
                    enteredJobTitle && !isLoading
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl text-white'
                      : 'bg-gray-300 text-gray-500'
                  }`}
                  onClick={() => handleSetJobContext('title')}
                  disabled={!enteredJobTitle || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-5 w-5" />
                      Preparing Optimization...
                    </>
                  ) : (
                    <>
                      <ChevronsRight className="mr-2 h-5 w-5" />
                      Start Optimization
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="flex items-center justify-center gap-6 mt-8 text-gray-500 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Powered by AI
          </div>
          <div>•</div>
          <div>Secure & Private</div>
          <div>•</div>
          <div>Instant Results</div>
        </div>
      </div>
    </div>
  );
};

export default JobWizard;
