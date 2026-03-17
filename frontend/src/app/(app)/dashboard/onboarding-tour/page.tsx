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
import { isValidPhoneNumber } from 'react-phone-number-input';

// --- Import all step components ---
import PersonalInfoStep from './PersonalInfoStep';
// import EducationStep from './EducationStep';
import EducationStep, { isEducationEntryValid } from './EducationStep';
// import SkillsExperienceStep from './SkillsExperienceStep';
import SkillsExperienceStep, {
  isExperienceEntryValid,
  isSkillsListValid,
} from './SkillsExperienceStep';

import ProjectsStep from './ProjectsStep';
import { isProjectEntryValid } from './ProjectsStep';
import JobPreferencesStep from './JobPreferencesStep';
import AvailabilityStep from './AvailabilityStep';
import { getStudentDetailsRequest } from '@/redux/reducers/studentReducer';
import { RootState } from '@/redux/rootReducer';
import { useSelector, useDispatch } from 'react-redux';
import { start } from 'repl';
import { useToast } from '@/hooks/use-toast';

// --- START: TYPE DEFINITIONS ---
type EducationEntry = {
  institute: string;
  degree: string;
  fieldOfStudy: string;
  country: string;
  startDate: string;
  endDate: string;
  grade: string;
  graduationYear?: string;
};

type ExperienceEntry = {
  company: string;
  title: string;
  duration: string;
  startDate: string;
  endDate: string;
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

  startDate: string;
  endDate: string;
  link: string;
};

// --- END: TYPE DEFINITIONS ---

const normalizeSkillName = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s\-'.,&]+/g, '');
};

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
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState('forward');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const totalSteps = 3;

  const { students } = useSelector((state: RootState) => state.student);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const ANALYSIS_MESSAGES = [
    'Reading your resume…',
    'Extracting personal details…',
    'Analyzing your skills…',
    'Understanding your experience…',
    'Mapping your education…',
    'Detecting projects…',
    'Optimizing your profile…',
    'Almost done…',
  ];

  const [analysisMessageIndex, setAnalysisMessageIndex] = useState(0);
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setAnalysisMessageIndex((prev) => (prev + 1) % ANALYSIS_MESSAGES.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [isLoading]);

  const [formData, setFormData] = useState({
    // --- Personal Info ---
    fullName: '',
    email: '',
    phone: '',
    location: '',
    currentLocation: '', // FIXED: Renamed to avoid collision
    designation: '',
    website: '', // Added based on your UI component
    profilePhoto: null as File | null,
    resume: null as File | null,

    // --- Arrays ---
    education: [
      {
        institute: '',
        degree: '',
        fieldOfStudy: '',
        country: '',
        graduationYear: '',
        grade: '',
        startDate: '',
        endDate: '',
      },
    ] as EducationEntry[],
    experience: [
      {
        company: '',
        title: '',
        duration: '',
        description: '',
        startDate: '',
        endDate: '',
      },
    ] as ExperienceEntry[],
    skills: [{ skill: '', level: 'BEGINNER' }] as SkillEntry[],
    projects: [
      {
        projectName: '',
        description: '',
        technologies: '',
        link: '',
        startDate: '',
        endDate: '',
      },
    ] as ProjectEntry[],

    // --- Job Preferences ---
    preferredLocation: '', // FIXED: Renamed to avoid collision
    preferredCity: '', // Add this
    preferredCountry: '', // Add this
    mustHaveSkills: [] as string[], // Add this
    educationLevel: '', // Add this
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

  useEffect(() => {
    if (!user) return;

    setFormData((prev) => ({
      ...prev,
      fullName: user.fullName || prev.fullName || students[0].fullName,
      email: user.email || prev.email || students[0].email,
    }));
  }, [user]);

  const handleArrayChange = <T,>(
    arrayName: keyof typeof formData,
    index: number,
    field: keyof T,
    value: any,
  ) => {
    if (!Array.isArray(formData[arrayName])) return;

    // --- START DUPLICATE SKILL CHECK ---
    if (arrayName === 'skills' && field === 'skill') {
      //  const isDuplicate = formData.skills.some(
      //    (item, i) =>
      //      i !== index &&
      //      item.skill.trim().toLowerCase() === value.trim().toLowerCase() &&
      //      value.trim() !== '',
      //  );
      const nextNormalized = normalizeSkillName(value);
      const isDuplicate =
        nextNormalized.length > 0 &&
        formData.skills.some(
          (item, i) =>
            i !== index && normalizeSkillName(item.skill) === nextNormalized,
        );

      if (isDuplicate) {
        toast({
          variant: 'destructive',
          title: 'Skill Already Added',
          description: 'This skill has already been added.',
        });

        return; // Stop the update
      }
    }
    // --- END DUPLICATE SKILL CHECK ---
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

  // const handleNext = () => {
  //   if (step < totalSteps) {
  //     setDirection('forward');
  //     setTimeout(() => setStep(step + 1), 50);
  //   }
  // };

  const handleNext = () => {
    setAttemptedNext(true);

    if (!isStepValid()) return;

    setAttemptedNext(false); // reset for next step
    setDirection('forward');
    setTimeout(() => setStep(step + 1), 50);
  };

  const handleBack = () => {
    if (step > 1) {
      setDirection('backward');
      setTimeout(() => setStep(step - 1), 50);
    }
  };
  // const handleSkip = () => {
  //   if (step < totalSteps) handleNext();
  //   else handleSubmit();
  // };

  const handleSkip = (e) => {
    // 1. Prevent default form submission behavior
    if (e) e.preventDefault();

    // 2. Set animation direction
    setDirection('forward');

    // 3. Logic
    if (step < totalSteps) {
      // DON'T call handleNext().
      // DO update state directly to bypass validation.
      setStep((prev) => prev + 1);
    } else {
      // If it's the last step, decide what "Skip" means.
      // Usually, you don't want handleSubmit() because that might validate too.
      // Instead, just redirect to the dashboard/success view.
      // handleDashboardRedirect(); // Or setStep(step + 1) to show success screen
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const response = await apiInstance.post('/students/profile/onboarding', {
        data: formData,
        selectedOptions,
      });

      setStep(totalSteps + 1);
      setIsLoading(false);
    } catch (error) {
      console.error('Error submitting profile:', error);
    } finally {
      setIsLoading(false);
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
        fullName: user?.fullName || prev.fullName,
        email: user?.email || prev.email,
        phone: apiData?.personalInfo?.phone || prev.phone,
        designation: apiData?.personalInfo?.jobRole || prev.designation,
        // FIXED: Map to currentLocation
        location: apiData?.personalInfo?.location || prev?.location,
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
                startDate: edu.startDate || '',
                endDate: edu.endDate || '',
              }))
            : prev.education,

        experience:
          apiData.experience?.length > 0
            ? apiData.experience.map((exp: any) => ({
                company: exp.company || '',
                title: exp.title || '',
                duration: formatDuration(exp.startDate, exp.endDate),
                description: exp.description || '',
                startDate: exp.startDate || '',
                endDate: exp.endDate || '',
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
                // startDate: proj.startDate || '',
                // endDate: proj.endDate || '',
                // FIX: Extract just the YYYY-MM-DD part
                startDate: proj.startDate
                  ? String(proj.startDate).split('T')[0]
                  : '',
                endDate: proj.endDate ? String(proj.endDate).split('T')[0] : '',
              }))
            : prev.projects,
      }));
    } catch (error) {
      console.error('Failed to extract data from resume:', error);
    } finally {
      setIsLoading(false);
      // setDirection('forward');
      // setStep(1);
    }
  };

  useEffect(() => {
    if (!isLoading) return;

    // 1. Push a new state so the "Back" button has something to pop
    // without actually leaving the current URL
    window.history.pushState(null, '', window.location.href);

    const handlePopState = (e: PopStateEvent) => {
      if (isLoading) {
        // 2. If they hit back, push the state again to "trap" them
        // and show a warning if you wish
        window.history.pushState(null, '', window.location.href);
        alert('Please wait until resume extraction is complete.');
      }
    };

    // Listen for the back button (popstate)
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isLoading]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isLoading) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isLoading]);

  // const handleDashboardRedirect = () => {
  //   router.push('/dashboard');
  // };
  const handleDashboardRedirect = () => {
    router.push(`/dashboard?from=onboarding`);
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
      // case 2:
      //   return {
      //     title: 'Education',
      //     subtitle: 'Your academic background',
      //     Icon: GraduationCap,
      //   };
      case 2:
        return {
          title: 'Skills & Experience',
          subtitle: 'Showcase your expertise',
          Icon: Code,
        };
      // case 4:
      //   return {
      //     title: 'Projects',
      //     subtitle: 'Show off your best work',
      //     Icon: BookCopy,
      //   };
      // case 5:
      //   return {
      //     title: 'Job Preferences',
      //     subtitle: 'What are you looking for?',
      //     Icon: Briefcase,
      //   };
      case 3:
        return {
          title: 'Availability',
          subtitle: 'When can you start?',
          Icon: Rocket,
        };
      default:
        return { title: '', subtitle: '', Icon: Sparkles };
    }
  };

  const [attemptedNext, setAttemptedNext] = useState(false);
  const safeTrim = (value: unknown) =>
    typeof value === 'string' ? value.trim() : '';

  const isStepValid = () => {
    switch (step) {
      case 1: {
        const designation = formData.designation.trim();
        const location = formData.location.trim();
        const isDesignationValid =
          designation.length >= 2 &&
          designation.length <= 30 &&
          /^[a-zA-Z\s]+$/.test(designation);
        const isLocationValid =
          location.length >= 2 &&
          location.length <= 50 &&
          /^[a-zA-Z\s,.'-]+$/.test(location);

        return (
          formData.fullName.trim() &&
          formData.email.trim() &&
          formData.phone.trim() &&
          isValidPhoneNumber(formData.phone) &&
          isDesignationValid &&
          isLocationValid
        );
      }

      // case 2: {
      //   const filledEducations = formData.education.filter((edu) =>
      //     Object.values(edu).some((v) => safeTrim(v)),
      //   );

      //   if (filledEducations.length === 0) return false;

      //   return filledEducations.every((edu) => isEducationEntryValid(edu));
      // }

      case 2: {
        const filledSkills = formData.skills.filter((s) =>
          Object.values(s).some((v) => safeTrim(v)),
        );
        const filledExperience = formData.experience.filter((e) =>
          Object.values(e).some((v) => safeTrim(v)),
        );

        if (filledSkills.length === 0 || filledExperience.length === 0) {
          return false;
        }

        return (
          //   formData.skills.every((s) => s.skill) &&
          // formData.experience.every((e) => e.company && e.title && e.duration)
          isSkillsListValid(filledSkills) &&
          filledExperience.every((e) => isExperienceEntryValid(e))
        );
      }

      // case 4: {
      //   const filledProjects = formData.projects.filter((p) =>
      //     Object.values(p).some((v) => safeTrim(v)),
      //   );

      //   if (filledProjects.length === 0) return false;

      //   return filledProjects.every((p) => isProjectEntryValid(p));
      // }

      // case 5: {
      //   const mustHaveSkills = Array.isArray(formData.mustHaveSkills)
      //     ? formData.mustHaveSkills
      //     : [];
      //   const normalized = mustHaveSkills
      //     .map((s) => safeTrim(s).toLowerCase())
      //     .filter(Boolean);
      //   const hasUniqueSkills = new Set(normalized).size === normalized.length;

      //   return (
      //     safeTrim(formData.preferredCity) !== '' &&
      //     safeTrim(formData.preferredCountry) !== '' &&
      //     // Array.isArray(formData.mustHaveSkills) &&
      //     // formData.mustHaveSkills.length > 0 &&
      //     normalized.length > 0 &&
      //     hasUniqueSkills &&
      //     safeTrim(formData.educationLevel) !== ''
      //   );
      // }
      case 3:
        return Boolean(selectedOptions.availability);

      default:
        return false;
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
            handleResumeExtract={handleResumeExtract}
            attemptedNext={attemptedNext}
            isLoading={isLoading}
          />
        );
      // case 2:
      //   return (
      //     <EducationStep
      //       education={formData.education}
      //       onchange={handleArrayChange.bind(null, 'education')}
      //       onAdd={addArrayItem.bind(null, 'education', {
      //         // institution: '',
      //         institute: '',
      //         degree: '',
      //         fieldOfStudy: '',
      //         graduationYear: '',
      //         grade: '',
      //         country: '',
      //         startDate: '',
      //         endDate: '',
      //       })}
      //       onRemove={removeArrayItem.bind(null, 'education')}
      //       attemptedNext={attemptedNext}
      //     />
      //   );
      case 2:
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
              startDate: '',
              endDate: '',
              description: '',
            })}
            onRemoveExperience={removeArrayItem.bind(null, 'experience')}
            attemptedNext={attemptedNext}
          />
        );
      // case 4:
      //   return (
      //     <ProjectsStep
      //       projects={formData.projects}
      //       onchange={handleArrayChange.bind(null, 'projects')}
      //       onAdd={addArrayItem.bind(null, 'projects', {
      //         projectName: '',
      //         description: '',
      //         technologies: '',
      //         startDate: '',
      //         endDate: '',
      //         link: '',
      //       })}
      //       onRemove={removeArrayItem.bind(null, 'projects')}
      //       attemptedNext={attemptedNext}
      //     />
      //   );
      // case 5:
      //   return (
      //     <JobPreferencesStep
      //       formData={formData}
      //       handleInputChange={handleInputChange}
      //       selectedOptions={selectedOptions}
      //       toggleOption={toggleOption}
      //       attemptedNext={attemptedNext}
      //     />
      //   );
      case 3:
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
  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
  //       <div className="text-center space-y-4">
  //         <Loader2 className="w-16 h-16 text-blue-600 mx-auto animate-spin" />

  //         <h2 className="text-2xl font-bold text-gray-700 transition-all duration-500">
  //           {ANALYSIS_MESSAGES[analysisMessageIndex]}
  //         </h2>

  //         <p className="text-gray-500">
  //           Please wait while we extract your information.
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

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
            <Card className="w-full max-w-3xl  border-4 bg-white/70 backdrop-blur-xl relative z-10">
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

                  {step !== 1 && step !== totalSteps && (
                    <Button
                      type="button"
                      onClick={handleSkip}
                      variant="outline"
                      className="h-14 px-6 rounded-lg border-2 border-blue-400 transition-all duration-300 text-base font-semibold hover:scale-105"
                    >
                      <SkipForward className="w-5 h-5 mr-2" />
                      {step === totalSteps ? 'Finish Later' : 'Skip'}
                    </Button>
                  )}
                  {/* <Button
                    type="button"
                    onClick={handleSkip}
                    variant="outline"
                    className="h-14 px-6 rounded-lg border-2 border-blue-400 transition-all duration-300 text-base font-semibold hover:scale-105"
                  >
                    <SkipForward className="w-5 h-5 mr-2" />{' '}
                    {step === totalSteps ? 'Finish Later' : 'Skip'}
                  </Button> */}

                  {step < totalSteps ? (
                    <Button
                      onClick={handleNext}
                      className={`flex-1 h-14 rounded-lg text-base font-semibold
    ${!isStepValid() ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
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
