'use client';
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  GraduationCap,
  Code,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  User,
  Rocket,
  Upload,
  SkipForward,
  Edit,
  Loader2,
  BookCopy,
} from 'lucide-react';
import apiInstance from '@/services/api';

// --- Import all step components ---
import PersonalInfoStep from './PersonalInfoStep';
import EducationStep from './EducationStep';
import SkillsExperienceStep from './SkillsExperienceStep';
import ProjectsStep from './ProjectsStep';
import JobPreferencesStep from './JobPreferencesStep';
import AvailabilityStep from './AvailabilityStep';
import { getStudentDetailsRequest } from '@/redux/reducers/studentReducer';
import { RootState } from '@/redux/rootReducer';
import { useSelector, useDispatch } from 'react-redux';

// --- START: TYPE DEFINITIONS ---
type EducationEntry = {
  institute: string;
  degree: string;
  graduationYear: string;
  grade: string;
};

type ExperienceEntry = {
  company: string;
  title: string;
  duration: string;
  description: string;
};

type SkillEntry = {
  skill: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
};

type ProjectEntry = {
  projectName: string;
  description: string;
  technologies: string;
  link: string;
};
// --- END: TYPE DEFINITIONS ---

// Helper function to format duration
const formatDuration = (start?: string, end?: string | null): string => {
  if (!start) return '';
  const startDate = new Date(start).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  });
  const endDate = end
    ? new Date(end).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      })
    : 'Present';
  return `${startDate} - ${endDate}`;
};

const OnboardingPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState('forward');
  const [isLoading, setIsLoading] = useState(false);

  const totalSteps = 6;

  const { students } = useSelector((state: RootState) => state.student);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    // --- Personal Info ---
    fullName: '',
    email: '',
    phone: '',
    currentLocation: '', // FIXED: Renamed to avoid collision
    designation: '',
    website: '', // Added based on your UI component
    profilePhoto: null as File | null,
    resume: null as File | null,

    // --- Arrays ---
    education: [
      { institute: '', degree: '', graduationYear: '', grade: '' },
    ] as EducationEntry[],
    experience: [
      { company: '', title: '', duration: '', description: '' },
    ] as ExperienceEntry[],
    skills: [{ skill: '', level: 'BEGINNER' }] as SkillEntry[],
    projects: [
      { projectName: '', description: '', technologies: '', link: '' },
    ] as ProjectEntry[],

    // --- Job Preferences ---
    preferredLocation: '', // FIXED: Renamed to avoid collision
    expectedSalary: '',
  });

  const [selectedOptions, setSelectedOptions] = useState({
    jobType: [] as string[],
    availability: '',
  });

  const progress = step > 0 ? ((step - 1) / totalSteps) * 100 : 0;

  useEffect(() => {
    dispatch(getStudentDetailsRequest());
  }, [dispatch]);

  const handleArrayChange = <T,>(
    arrayName: keyof typeof formData,
    index: number,
    field: keyof T,
    value: any,
  ) => {
    if (!Array.isArray(formData[arrayName])) return;

    const newArray = [...(formData[arrayName] as T[])];
    newArray[index] = { ...newArray[index], [field]: value };
    setFormData((prev) => ({ ...prev, [arrayName]: newArray }));
  };

  const addArrayItem = <T,>(arrayName: keyof typeof formData, newItem: T) => {
    if (!Array.isArray(formData[arrayName])) return;
    setFormData((prev) => ({
      ...prev,
      [arrayName]: [...(prev[arrayName] as T[]), newItem],
    }));
  };

  const removeArrayItem = (arrayName: keyof typeof formData, index: number) => {
    const currentArray = formData[arrayName] as any[];
    if (!Array.isArray(currentArray) || currentArray.length <= 1) return;

    const newArray = currentArray.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, [arrayName]: newArray }));
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (
    field: 'profilePhoto' | 'resume',
    file: File | null,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const toggleOption = (field: 'jobType' | 'availability', value: string) => {
    if (field === 'jobType') {
      const newJobTypes = selectedOptions.jobType.includes(value)
        ? selectedOptions.jobType.filter((item) => item !== value)
        : [...selectedOptions.jobType, value];
      setSelectedOptions((prev) => ({ ...prev, jobType: newJobTypes }));
    } else {
      setSelectedOptions((prev) => ({
        ...prev,
        availability: prev.availability === value ? '' : value,
      }));
    }
  };

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
    if (step < totalSteps) handleNext();
    else handleSubmit();
  };

  const handleSubmit = async () => {
    try {
      const response = await apiInstance.post('/students/profile/onboarding', {
        data: formData,
        selectedOptions,
      });

      console.log(response.data);
      setStep(totalSteps + 1);
    } catch (error) {
      console.error('Error submitting profile:', error);
    }
  };

  const handleResumeExtract = async (file: File | null) => {
    if (!file) return;

    setIsLoading(true);
    const apiFormData = new FormData();
    apiFormData.append('cv', file);

    try {
      const response = await apiInstance.post(
        '/students/resume/extract',
        apiFormData,
      );
      const apiData = response.data.data;
      if (!apiData) {
        console.error('API response did not contain data.');
        setIsLoading(false);
        return;
      }

      setFormData((prev) => ({
        ...prev,
        fullName: students[0]?.student?.fullName || prev.fullName,
        email: students[0]?.student?.email || prev.email,
        phone: apiData?.personalInfo?.phone || prev.phone,
        designation: apiData?.personalInfo?.jobRole || prev.designation,
        // FIXED: Map to currentLocation
        currentLocation:
          apiData?.personalInfo?.location || prev.currentLocation,
        resume: file,

        education:
          apiData.education?.length > 0
            ? apiData.education.map((edu: any) => ({
                institute: edu.institute || '',
                degree: edu.degree || '',
                graduationYear: edu.endDate
                  ? new Date(edu.endDate).getFullYear().toString()
                  : '',
                grade: edu.grade || '',
              }))
            : prev.education,

        experience:
          apiData.experience?.length > 0
            ? apiData.experience.map((exp: any) => ({
                company: exp.company || '',
                title: exp.title || '',
                duration: formatDuration(exp.startDate, exp.endDate),
                description: exp.description || '',
              }))
            : prev.experience,

        skills:
          apiData.skills?.length > 0
            ? apiData.skills.map((skill: any) => ({
                skill: skill.skill || '',
                level: skill.level || 'BEGINNER',
              }))
            : prev.skills,

        projects:
          apiData.projects?.length > 0
            ? apiData.projects.map((proj: any) => ({
                projectName: proj.projectName || '',
                description: proj.description || '',
                technologies: (proj.technologies || []).join(', '),
                link: proj.link || '',
              }))
            : prev.projects,
      }));
    } catch (error) {
      console.error('Failed to extract data from resume:', error);
    } finally {
      setIsLoading(false);
      setDirection('forward');
      setStep(1);
    }
  };

  const handleDashboardRedirect = () => {
    router.push('/dashboard/search-jobs');
  };

  // --- HELPER: Get Title and Icon for the current step ---
  const getStepHeader = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return {
          title: 'Personal Information',
          subtitle: "Let's get to know you better",
          Icon: User,
        };
      case 2:
        return {
          title: 'Education',
          subtitle: 'Your academic background',
          Icon: GraduationCap,
        };
      case 3:
        return {
          title: 'Skills & Experience',
          subtitle: 'Showcase your expertise',
          Icon: Code,
        };
      case 4:
        return {
          title: 'Projects',
          subtitle: 'Show off your best work',
          Icon: BookCopy,
        };
      case 5:
        return {
          title: 'Job Preferences',
          subtitle: 'What are you looking for?',
          Icon: Briefcase,
        };
      case 6:
        return {
          title: 'Availability',
          subtitle: 'When can you start?',
          Icon: Rocket,
        };
      default:
        return { title: '', subtitle: '', Icon: Sparkles };
    }
  };

  const renderStepContent = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoStep
            formData={formData}
            handleInputChange={handleInputChange}
            handleFileUpload={handleFileUpload}
          />
        );
      case 2:
        return (
          <EducationStep
            education={formData.education}
            onchange={handleArrayChange.bind(null, 'education')}
            onAdd={addArrayItem.bind(null, 'education', {
              institute: '',
              degree: '',
              graduationYear: '',
              grade: '',
            })}
            onRemove={removeArrayItem.bind(null, 'education')}
          />
        );
      case 3:
        return (
          <SkillsExperienceStep
            skills={formData.skills}
            experience={formData.experience}
            onSkillChange={handleArrayChange.bind(null, 'skills')}
            onAddSkill={addArrayItem.bind(null, 'skills', {
              skill: '',
              level: 'BEGINNER',
            })}
            onRemoveSkill={removeArrayItem.bind(null, 'skills')}
            onExperienceChange={handleArrayChange.bind(null, 'experience')}
            onAddExperience={addArrayItem.bind(null, 'experience', {
              company: '',
              title: '',
              duration: '',
              description: '',
            })}
            onRemoveExperience={removeArrayItem.bind(null, 'experience')}
          />
        );
      case 4:
        return (
          <ProjectsStep
            projects={formData.projects}
            onchange={handleArrayChange.bind(null, 'projects')}
            onAdd={addArrayItem.bind(null, 'projects', {
              projectName: '',
              description: '',
              technologies: '',
              link: '',
            })}
            onRemove={removeArrayItem.bind(null, 'projects')}
          />
        );
      case 5:
        return (
          <JobPreferencesStep
            formData={formData}
            handleInputChange={handleInputChange}
            selectedOptions={selectedOptions}
            toggleOption={toggleOption}
          />
        );
      case 6:
        return (
          <AvailabilityStep
            selectedOptions={selectedOptions}
            toggleOption={toggleOption}
          />
        );
      default:
        return null;
    }
  };

  // --- RENDER: Loading State ---
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

  // --- RENDER: Main View Switcher ---
  const renderMainView = () => {
    switch (true) {
      case step === 0:
        return (
          <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-lg p-8 md:p-10 text-center shadow-2xl bg-white/70 backdrop-blur-xl animate-[fadeIn_0.5s_ease-out]">
              <div className="mx-auto w-16 h-16 mb-6 flex items-center justify-center bg-blue-600 rounded-lg shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-headingTextPrimary bg-clip-text text-transparent mb-2">
                Let's Get Started
              </h1>
              <p className="text-gray-500 text-lg mb-8">
                How would you like to set up your profile?
              </p>

              <div className="space-y-4">
                {/* Auto-fill with Resume */}
                <label className="block text-left w-full cursor-pointer rounded-lg border-2 bg-white p-6 transition-all duration-300 hover:border-blue-400 hover:-translate-y-1">
                  <div className="flex items-center">
                    <div className="p-3  rounded-lg mr-4">
                      <Upload className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        Auto-fill with Resume
                      </h3>
                      <p className="text-sm text-gray-500">
                        Upload your resume and we’ll do the heavy lifting.
                      </p>
                    </div>
                    <ArrowRight className="ml-auto w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) =>
                      handleResumeExtract(e.target.files?.[0] || null)
                    }
                    className="hidden"
                  />
                </label>

                {/* Fill Out Manually */}
                <button
                  onClick={() => {
                    setDirection('forward');
                    setStep(1);
                  }}
                  className="w-full h-auto p-6 text-left rounded-lg border-2 border-gray-200 transition-all duration-300 hover:border-blue-400 hover:shadow-md hover:-translate-y-1"
                >
                  <div className="flex items-center w-full">
                    <div className="p-3 rounded-lg mr-4">
                      <Edit className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        Fill Out Manually
                      </h3>
                      <p className="text-sm text-gray-500">
                        Enter your details step-by-step.
                      </p>
                    </div>
                    <ArrowRight className="ml-auto w-5 h-5 text-gray-400" />
                  </div>
                </button>
              </div>
            </Card>
          </div>
        );

      // --- CASE SUCCESS: COMPLETED PAGE ---
      case step === totalSteps + 1:
        return (
          <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="text-center animate-[fadeIn_0.8s_ease-out]">
              <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mx-auto flex items-center justify-center mb-6 ">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-headingTextPrimary bg-clip-text text-transparent mb-4">
                  Welcome {formData.fullName.split(' ')[0]} 🎉
                </h1>
                <p className="text-gray-600 text-lg mb-6">
                  Your profile is all set up. Get ready to start your journey!
                </p>
                <Button
                  onClick={() => handleDashboardRedirect()}
                  className="w-full h-14 rounded-lg text-lg font-semibold hover:bg-blue-700 "
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </div>
        );

      // --- DEFAULT: WIZARD FORM STEPS ---
      default:
        const { title, subtitle, Icon } = getStepHeader(step);

        return (
          <div className="min-h-screen  flex items-center justify-center p-4 overflow-hidden relative">
            <Card className="w-full max-w-3xl shadow-2xl border-0 bg-white/70 backdrop-blur-xl relative z-10">
              <div className="p-6 md:p-10 lg:p-12">
                {/* Progress Bar */}
                <div className="mb-5">
                  <div className="flex justify-between text-sm font-semibold text-gray-600 mb-3">
                    <span>
                      Step {step} of {totalSteps}
                    </span>
                    <span>{Math.round(progress)}% Complete</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-blue-600 transition-all duration-700 ease-out rounded-full relative"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Step Content Container */}
                <div
                  key={step}
                  className={`space-y-1 ${
                    direction === 'forward'
                      ? 'animate-[slideInRight_0.5s_ease-out]'
                      : 'animate-[slideInLeft_0.5s_ease-out]'
                  }`}
                >
                  {/* Step Header */}
                  <div className="flex items-center justify-center">
                    <div className="relative hidden md:block">
                      <div className="relative ">
                        <Icon className="w-14 h-14 text-blue-500 " />
                      </div>
                    </div>
                  </div>
                  <div className="text-center space-y-0">
                    <div>
                      <h2 className="text-3xl md:text-4xl font-bold bg-headingTextPrimary bg-clip-text text-transparent">
                        {title}
                      </h2>
                    </div>
                    <p className="text-gray-500 text-lg md:text-xl">
                      {subtitle}
                    </p>
                  </div>

                  {/* Actual Form Component via Switch */}
                  <div className="pt-4">{renderStepContent(step)}</div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between flex-wrap gap-3 mt-5">
                  <Button
                    onClick={handleBack}
                    disabled={step === 1}
                    variant="outline"
                    className="h-14 px-6 rounded-lg border-2 border-blue-400 transition-all duration-300 text-base font-semibold hover:scale-105"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back
                  </Button>

                  <Button
                    onClick={handleSkip}
                    variant="outline"
                    className="h-14 px-6 rounded-lg border-2 border-blue-400 transition-all duration-300 text-base font-semibold hover:scale-105"
                  >
                    <SkipForward className="w-5 h-5 mr-2" />{' '}
                    {step === totalSteps ? 'Finish Later' : 'Skip'}
                  </Button>

                  {step < totalSteps ? (
                    <Button
                      onClick={handleNext}
                      className="flex-1 h-14 rounded-lg  transition-all duration-300 transform hover:scale-105 text-base font-semibold"
                    >
                      Next <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      className="flex-1 h-14 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-base font-semibold"
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2" /> Complete
                    </Button>
                  )}
                </div>

                {/* Progress Footer Text */}
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-400 font-medium">
                    {step === totalSteps
                      ? "🎉 Final step! You're almost done!"
                      : `${totalSteps - step} more step${
                          totalSteps - step > 1 ? 's' : ''
                        } to go`}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        );
    }
  };

  return renderMainView();
};

export default OnboardingPage;
