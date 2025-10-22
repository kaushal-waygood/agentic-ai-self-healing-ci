'use client';
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  GraduationCap,
  Code,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Mail,
  Phone,
  User,
  Upload,
  FileText,
  Award,
  Target,
  Rocket,
  Building,
  Camera,
  SkipForward,
  Edit,
  Loader2,
} from 'lucide-react';
import apiInstance from '@/services/api';

const OnboardingPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(0); // Start at step 0 for the choice
  const [direction, setDirection] = useState('forward');
  const [isLoading, setIsLoading] = useState(false);
  const totalSteps = 6;
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    designation: '',
    profilePhoto: null,
    resume: null,
    college: '',
    degree: '',
    graduationYear: '',
    cgpa: '',
    skills: '',
    projects: '',
    experience: '',
    companyName: '',
    jobTitle: '',
    duration: '',
    jobType: [],
    location: '',
    expectedSalary: '',
    availability: '',
  });

  const [selectedOptions, setSelectedOptions] = useState({
    jobType: [],
    availability: '',
  });

  const progress = ((step - 1) / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setDirection('forward');
      setTimeout(() => setStep(step + 1), 50);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setDirection('backward');
      setTimeout(() => setStep(step - 1), 50);
    }
  };

  const handleSkip = () => {
    if (step < totalSteps) {
      setDirection('forward');
      setTimeout(() => setStep(step + 1), 50);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFileUpload = (field, file) => {
    setFormData({ ...formData, [field]: file });
  };

  const toggleOption = (field, value) => {
    const current = selectedOptions[field];
    const newSelection = Array.isArray(current)
      ? current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      : value;
    setSelectedOptions({ ...selectedOptions, [field]: newSelection });
  };

  const handleSubmit = () => {
    setStep(totalSteps + 1);
  };

  useEffect(() => {
    const response = async () => {
      await apiInstance.get('/students/details');
    };
    response();
  }, []);

  const handleResumeExtract = async (file) => {
    if (!file) return;

    setIsLoading(true);
    const apiFormData = new FormData();
    apiFormData.append('cv', file);

    try {
      const response = await apiInstance.post(
        '/students/resume/extract',
        apiFormData,
      );

      // --- START: API Integration ---
      const apiData = response.data.data;

      if (!apiData) {
        console.error('API response did not contain data.');
        // Optionally, show an error message to the user
        setIsLoading(false);
        return;
      }

      // Helper function to format date ranges
      const formatDuration = (start, end) => {
        if (!start || !end) return '';
        const startDate = new Date(start).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
        });
        const endDate = new Date(end).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
        });
        return `${startDate} - ${endDate}`;
      };

      // Extract the first experience and education entries for simplicity
      const firstExperience = apiData.experience?.[0];
      const firstEducation = apiData.education?.[0];

      // Convert skills array to a comma-separated string
      const skillsString =
        apiData.skills?.map((skillObj) => skillObj.skill).join(', ') || '';

      // Map job types to the format used in the UI
      const jobTypes =
        apiData.jobPreferences?.preferredJobTypes?.map((type) => {
          if (type === 'FULL_TIME') return 'Full-time';
          // Add other mappings as needed, e.g., PART_TIME -> Part-time
          return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
        }) || [];

      const extractedData = {
        fullName: apiData.fullName || '',
        email: apiData.email || '',
        phone: apiData.phone || '',
        designation: firstExperience?.title || '', // Use job title as designation
        college: firstEducation?.institute || '',
        degree: firstEducation?.degree || '',
        // graduationYear is not in the API response, so it remains empty
        cgpa: firstEducation?.grade || '',
        skills: skillsString,
        companyName: firstExperience?.company || '',
        jobTitle: firstExperience?.title || '',
        duration: formatDuration(
          firstExperience?.startDate,
          firstExperience?.endDate,
        ),
      };

      setFormData((prev) => ({
        ...prev,
        ...extractedData,
        resume: file,
      }));

      // Update the selected options for the UI to reflect API data
      setSelectedOptions((prev) => ({
        ...prev,
        jobType: jobTypes,
      }));
      // --- END: API Integration ---
    } catch (error) {
      console.error('Failed to extract data from resume:', error);
      // Optionally, show an error message to the user
    } finally {
      setIsLoading(false);
      setStep(1); // Go to the first step to review the data
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 text-purple-600 mx-auto animate-spin" />
          <h2 className="text-2xl font-bold text-gray-700">
            Analyzing your resume...
          </h2>
          <p className="text-gray-500">
            Please wait while we extract your information.
          </p>
        </div>
      </div>
    );
  }

  if (step === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg p-8 md:p-10 text-center shadow-2xl bg-white/70 backdrop-blur-xl animate-[fadeIn_0.5s_ease-out]">
          <div className="mx-auto w-16 h-16 mb-6 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Let's Get Started
          </h1>
          <p className="text-gray-500 text-lg mb-8">
            How would you like to set up your profile?
          </p>
          <div className="space-y-4">
            <label className="block w-full text-left p-6 rounded-2xl border-2 border-transparent bg-white shadow-lg hover:shadow-2xl hover:border-purple-500 cursor-pointer transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg mr-4">
                  <Upload className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">
                    Auto-fill with Resume
                  </h3>
                  <p className="text-sm text-gray-500">
                    Upload your resume and we'll do the heavy lifting.
                  </p>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-400 ml-auto" />
              </div>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleResumeExtract(e.target.files[0])}
                className="hidden"
              />
            </label>
            <Button
              onClick={() => setStep(1)}
              className="w-full text-left p-6 rounded-2xl border-2 border-transparent bg-white shadow-lg hover:shadow-2xl hover:border-purple-500 transition-all duration-300 transform hover:-translate-y-1 h-auto"
              variant="outline"
            >
              <div className="flex items-center">
                <div className="p-3 bg-gray-100 rounded-lg mr-4">
                  <Edit className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">
                    Fill Out Manually
                  </h3>
                  <p className="text-sm text-gray-500">
                    Enter your details step-by-step.
                  </p>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-400 ml-auto" />
              </div>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (step === totalSteps + 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4">
        <div className="text-center animate-[fadeIn_0.8s_ease-out]">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mx-auto flex items-center justify-center mb-6 animate-bounce">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Welcome {formData.fullName.split(' ')[0]} 🎉
            </h1>
            <p className="text-gray-600 text-lg mb-6">
              Your profile is all set up. Get ready to start your journey!
            </p>
            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg font-semibold shadow-lg"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    const steps = [
      {
        title: 'Personal Information',
        subtitle: "Let's get to know you better",
        icon: User,
        content: (
          <div className="space-y-5">
            {/* Profile Photo Upload */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center overflow-hidden border-2 border-white shadow-lg">
                  {formData.profilePhoto ? (
                    <img
                      src={URL.createObjectURL(formData.profilePhoto)}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="w-8 h-8 text-white" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 p-1.5 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform duration-300">
                  <Upload className="w-3.5 h-3.5 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileUpload('profilePhoto', e.target.files[0])
                    }
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <Input
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Full Name"
              className="h-11 text-base border-2 focus:border-purple-500 transition-all duration-300 rounded-lg px-4 bg-white/50 backdrop-blur-sm"
            />
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Email Address"
              className="h-11 text-base border-2 focus:border-purple-500 transition-all duration-300 rounded-lg px-4 bg-white/50 backdrop-blur-sm"
            />
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Phone Number"
              className="h-11 text-base border-2 focus:border-purple-500 transition-all duration-300 rounded-lg px-4 bg-white/50 backdrop-blur-sm"
            />
            <Input
              value={formData.designation}
              onChange={(e) => handleInputChange('designation', e.target.value)}
              placeholder="Current Designation (e.g., Software Engineer)"
              className="h-11 text-base border-2 focus:border-purple-500 transition-all duration-300 rounded-lg px-4 bg-white/50 backdrop-blur-sm"
            />
          </div>
        ),
      },
      {
        title: 'Upload Resume',
        subtitle: 'Help us understand your background',
        icon: FileText,
        content: (
          <div className="space-y-6">
            <label className="block">
              <div className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center hover:border-purple-500 transition-all duration-300 cursor-pointer bg-white/50 backdrop-blur-sm hover:bg-white/70">
                <Upload className="w-10 h-10 mx-auto mb-3 text-purple-500" />
                <p className="text-base font-semibold text-gray-700 mb-1">
                  {formData.resume
                    ? formData.resume.name
                    : 'Click to upload resume'}
                </p>
                <p className="text-xs text-gray-500">
                  PDF, DOC, DOCX (Max 5MB)
                </p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) =>
                    handleFileUpload('resume', e.target.files[0])
                  }
                  className="hidden"
                />
              </div>
            </label>
            {formData.resume && (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-semibold text-sm">
                  Resume uploaded successfully!
                </span>
              </div>
            )}
          </div>
        ),
      },
      {
        title: 'Education',
        subtitle: 'Tell us about your academic background',
        icon: GraduationCap,
        content: (
          <div className="space-y-4">
            <Input
              value={formData.college}
              onChange={(e) => handleInputChange('college', e.target.value)}
              placeholder="College/University Name"
              className="h-11 text-base border-2 focus:border-purple-500 transition-all duration-300 rounded-lg px-4 bg-white/50 backdrop-blur-sm"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                value={formData.degree}
                onChange={(e) => handleInputChange('degree', e.target.value)}
                placeholder="Degree"
                className="h-11 text-base border-2 focus:border-purple-500 transition-all duration-300 rounded-lg px-4 bg-white/50 backdrop-blur-sm"
              />
              <Input
                type="number"
                value={formData.graduationYear}
                onChange={(e) =>
                  handleInputChange('graduationYear', e.target.value)
                }
                placeholder="Year"
                className="h-11 text-base border-2 focus:border-purple-500 transition-all duration-300 rounded-lg px-4 bg-white/50 backdrop-blur-sm"
              />
            </div>
            <Input
              value={formData.cgpa}
              onChange={(e) => handleInputChange('cgpa', e.target.value)}
              placeholder="CGPA/Percentage"
              className="h-11 text-base border-2 focus:border-purple-500 transition-all duration-300 rounded-lg px-4 bg-white/50 backdrop-blur-sm"
            />
          </div>
        ),
      },
      {
        title: 'Skills & Experience',
        subtitle: 'Showcase your expertise',
        icon: Code,
        content: (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-1">
                Skills
              </label>
              <textarea
                value={formData.skills}
                onChange={(e) => handleInputChange('skills', e.target.value)}
                placeholder="e.g., React, Python, Machine Learning, UI/UX Design..."
                className="w-full h-20 text-base border-2 focus:border-purple-500 transition-all duration-300 rounded-lg p-3 bg-white/50 backdrop-blur-sm resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-1">
                Work Experience
              </label>
              <div className="space-y-2.5">
                <Input
                  value={formData.companyName}
                  onChange={(e) =>
                    handleInputChange('companyName', e.target.value)
                  }
                  placeholder="Company Name"
                  className="h-10 text-sm border-2 focus:border-purple-500 transition-all duration-300 rounded-lg px-3 bg-white/50 backdrop-blur-sm"
                />
                <div className="grid grid-cols-2 gap-2.5">
                  <Input
                    value={formData.jobTitle}
                    onChange={(e) =>
                      handleInputChange('jobTitle', e.target.value)
                    }
                    placeholder="Job Title"
                    className="h-10 text-sm border-2 focus:border-purple-500 transition-all duration-300 rounded-lg px-3 bg-white/50 backdrop-blur-sm"
                  />
                  <Input
                    value={formData.duration}
                    onChange={(e) =>
                      handleInputChange('duration', e.target.value)
                    }
                    placeholder="Duration"
                    className="h-10 text-sm border-2 focus:border-purple-500 transition-all duration-300 rounded-lg px-3 bg-white/50 backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        ),
      },
      {
        title: 'Job Preferences',
        subtitle: 'What are you looking for?',
        icon: Briefcase,
        content: (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 ml-1">
                Job Type (Select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  'Full-time',
                  'Part-time',
                  'Internship',
                  'Freelance',
                  'Remote',
                  'Contract',
                ].map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleOption('jobType', type)}
                    className={`p-3 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
                      selectedOptions.jobType.includes(type)
                        ? 'border-purple-500 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'border-gray-200 bg-white/50 backdrop-blur-sm hover:border-purple-300'
                    }`}
                  >
                    <span className="font-semibold text-sm">{type}</span>
                  </button>
                ))}
              </div>
            </div>
            <Input
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Preferred Location"
              className="h-11 text-base border-2 focus:border-purple-500 transition-all duration-300 rounded-lg px-4 bg-white/50 backdrop-blur-sm"
            />
            <Input
              value={formData.expectedSalary}
              onChange={(e) =>
                handleInputChange('expectedSalary', e.target.value)
              }
              placeholder="Expected Salary (Optional)"
              className="h-11 text-base border-2 focus:border-purple-500 transition-all duration-300 rounded-lg px-4 bg-white/50 backdrop-blur-sm"
            />
          </div>
        ),
      },
      {
        title: 'Availability',
        subtitle: 'When can you start?',
        icon: Rocket,
        content: (
          <div className="grid grid-cols-1 gap-4">
            {[
              'Immediately',
              'Within 2 weeks',
              'Within 1 month',
              '1-3 months',
              '3+ months',
            ].map((avail) => (
              <button
                key={avail}
                onClick={() => toggleOption('availability', avail)}
                className={`p-3 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  selectedOptions.availability === avail
                    ? 'border-purple-500 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'border-gray-200 bg-white/50 backdrop-blur-sm hover:border-purple-300'
                }`}
              >
                <span className="text-md font-semibold">{avail}</span>
              </button>
            ))}
          </div>
        ),
      },
    ];

    const currentStep = steps[step - 1];
    const Icon = currentStep.icon;

    return (
      <div
        key={step}
        className={`space-y-5 ${
          direction === 'forward'
            ? 'animate-[slideInRight_0.5s_ease-out]'
            : 'animate-[slideInLeft_0.5s_ease-out]'
        }`}
      >
        <div className="flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 p-5 rounded-3xl shadow-2xl transform transition-all duration-300 hover:scale-110 hover:rotate-6">
              <Icon className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        <div className="text-center space-y-0">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
            {currentStep.title}
          </h2>
          <p className="text-gray-500 text-lg md:text-xl">
            {currentStep.subtitle}
          </p>
        </div>

        <div className="pt-4">{currentStep.content}</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4 overflow-hidden relative">
      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>

      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-[float_6s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-[float_8s_ease-in-out_infinite]"></div>
        <div className="absolute top-40 right-40 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-[float_7s_ease-in-out_infinite]"></div>
      </div>

      <Card className="w-full max-w-3xl shadow-2xl border-0 bg-white/70 backdrop-blur-xl relative z-10">
        <div className="p-6 md:p-10 lg:p-12">
          {step > 0 && (
            <>
              {/* Step indicators */}
              <div className="flex justify-center gap-1.5 mb-4 flex-wrap">
                {[...Array(totalSteps)].map((_, i) => (
                  <div
                    key={i}
                    className={`transition-all duration-500 ${
                      i + 1 === step
                        ? 'w-10 h-2.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full shadow-lg'
                        : i + 1 < step
                        ? 'w-2.5 h-2.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full'
                        : 'w-2.5 h-2.5 bg-gray-300 rounded-full'
                    }`}
                  />
                ))}
              </div>

              {/* Progress bar */}
              <div className="mb-5">
                <div className="flex justify-between text-sm font-semibold text-gray-600 mb-3">
                  <span>
                    Step {step} of {totalSteps}
                  </span>
                  <span>{Math.round(progress)}% Complete</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 transition-all duration-700 ease-out rounded-full relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </>
          )}

          {renderStep()}

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-5">
            <Button
              onClick={handleBack}
              disabled={step === 1}
              variant="outline"
              className="h-14 px-6 rounded-2xl border-2 hover:bg-gray-100 disabled:opacity-30 transition-all duration-300 text-base font-semibold hover:scale-105 disabled:hover:scale-100"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>

            {step !== 2 && ( // Hide skip button on resume upload step
              <Button
                onClick={handleSkip}
                variant="outline"
                className="h-14 px-6 rounded-2xl border-2 border-orange-300 text-orange-600 hover:bg-orange-50 transition-all duration-300 text-base font-semibold hover:scale-105"
              >
                <SkipForward className="w-5 h-5 mr-2" />
                Skip
              </Button>
            )}

            {step < totalSteps ? (
              <Button
                onClick={handleNext}
                className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-base font-semibold"
              >
                Next
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-base font-semibold"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Complete
              </Button>
            )}
          </div>

          {/* Progress text */}
          {step > 0 && (
            <div className="text-center mt-4">
              <p className="text-sm text-gray-400 font-medium">
                {step === totalSteps
                  ? "🎉 Final step! You're almost done!"
                  : `${totalSteps - step} more step${
                      totalSteps - step > 1 ? 's' : ''
                    } to go`}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default OnboardingPage;
