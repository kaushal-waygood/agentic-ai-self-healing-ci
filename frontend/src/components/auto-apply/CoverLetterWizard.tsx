import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { FormControl, FormField, FormItem, FormMessage } from '../ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Button } from '../ui/button';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Sparkles,
  Shield,
  Mail,
  Copy,
} from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { mockUserProfile } from '@/lib/data/user';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';

const CoverLetterWizard = ({
  form,
  setWizardStep,
  handleGoToNextStep,
}: any) => {
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
          <div className="w-12 h-0.5 bg-green-500"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium text-green-600">Your CV</span>
          </div>
          <div className="w-12 h-0.5 bg-gradient-to-r from-green-500 to-purple-500"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">3</span>
            </div>
            <span className="text-sm font-medium text-purple-600">
              Cover Letter
            </span>
          </div>
          <div className="w-12 h-0.5 bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-500 font-bold text-sm">4</span>
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
                <Mail className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Step 3: Set Cover Letter Strategy
              </CardTitle>
            </div>
            <CardDescription className="text-purple-100 text-base">
              Choose how you want to handle your cover letter (optional).
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-8">
          {/* Strategy Selection with Enhanced UI */}
          <FormField
            control={form.control}
            name="coverLetterSettings.strategy"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <div className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  Cover Letter Strategy
                </div>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value ?? 'generate'}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <Label
                      htmlFor="generate"
                      className={`flex flex-col items-start gap-4 p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:bg-purple-50 hover:border-purple-300 ${
                        field.value === 'generate'
                          ? 'bg-purple-50 border-purple-500 shadow-lg'
                          : 'border-gray-200 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center w-full justify-between">
                        <div className="flex items-center gap-3">
                          <RadioGroupItem
                            value="generate"
                            id="generate"
                            className="text-purple-500"
                          />
                          <div className="font-semibold text-gray-900">
                            Generate from scratch
                          </div>
                        </div>
                        <Sparkles className="h-5 w-5 text-purple-500" />
                      </div>
                      <p className="text-sm text-gray-500 pl-8">
                        AI will create a unique letter tailored to each job.
                      </p>
                    </Label>
                    <Label
                      htmlFor="use_template"
                      className={`flex flex-col items-start gap-4 p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:bg-purple-50 hover:border-purple-300 ${
                        field.value === 'use_template'
                          ? 'bg-purple-50 border-purple-500 shadow-lg'
                          : 'border-gray-200 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center w-full justify-between">
                        <div className="flex items-center gap-3">
                          <RadioGroupItem
                            value="use_template"
                            id="use_template"
                            className="text-purple-500"
                          />
                          <div className="font-semibold text-gray-900">
                            Use a saved template
                          </div>
                        </div>
                        <Copy className="h-5 w-5 text-purple-500" />
                      </div>
                      <p className="text-sm text-gray-500 pl-8">
                        Start with a saved letter and let AI optimize it for
                        each application.
                      </p>
                    </Label>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Conditional Template Selection Field */}
          {form.watch('coverLetterSettings.strategy') === 'use_template' && (
            <FormField
              control={form.control}
              name="coverLetterSettings.templateId"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <div className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-purple-500" />
                    Select Template
                  </div>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a saved cover letter" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockUserProfile.savedCoverLetters.map((cl) => (
                        <SelectItem key={cl.id} value={cl.id}>
                          {cl.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {mockUserProfile.savedCoverLetters.length === 0 && (
                    <p className="text-xs text-muted-foreground pt-2">
                      No saved cover letters available.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Instructions Textarea Field */}
          <FormField
            control={form.control}
            name="coverLetterSettings.instructions"
            render={({ field }) => (
              <FormItem className="mt-4">
                <div className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-2">
                  <Mail className="h-5 w-5 text-purple-500" />
                  Specific Instructions (Optional)
                </div>
                <FormControl>
                  <Textarea
                    placeholder="e.g., Always mention my passion for sustainable technology."
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>

        {/* Styled Card Footer */}
        <CardFooter className="bg-gray-50/80 backdrop-blur-xl border-t border-gray-100 p-4">
          <div className="flex items-center justify-between w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setWizardStep('cv')}
              className="h-12 px-6 rounded-xl"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              type="button"
              onClick={() =>
                handleGoToNextStep('coverLetter', ['coverLetterSettings'])
              }
              className="h-12 px-6 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
            >
              Next: Final Config <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Security Notice */}
      <div className="text-center mt-6">
        <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-lg">
          <Shield className="h-4 w-4 text-green-500" />
          Your data is processed securely and is always private.
        </div>
      </div>
    </div>
  );
};

export default CoverLetterWizard;
