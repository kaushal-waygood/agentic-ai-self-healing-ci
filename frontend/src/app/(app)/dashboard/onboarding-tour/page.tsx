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
  FileText,
  Rocket,
  Upload,
  SkipForward,
  Edit,
  Loader2,
  BookCopy, // Added icon for Projects
} from 'lucide-react';
import apiInstance from '@/services/api'; // Adjust path if necessary

// --- Import all step components ---
import PersonalInfoStep from './PersonalInfoStep';
import ResumeStep from './ResumeStep';
import EducationStep from './EducationStep';
import SkillsExperienceStep from './SkillsExperienceStep';
import ProjectsStep from './ProjectsStep';
import JobPreferencesStep from './JobPreferencesStep';
import AvailabilityStep from './AvailabilityStep';
import { getStudentDetailsRequest } from '@/redux/reducers/studentReducer';

// --- START: TYPE DEFINITIONS ---
// Matches the EducationStep component
type EducationEntry = {
  institute: string;
  degree: string;
  graduationYear: string;
  grade: string;
};

// Matches the SkillsExperienceStep component
type ExperienceEntry = {
  company: string;
  title: string;
  duration: string;
  description: string;
};

// Matches the SkillsExperienceStep component
type SkillEntry = {
  skill: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
};

// Matches the ProjectsStep component
type ProjectEntry = {
  projectName: string;
  description: string;
  technologies: string; // Stored as a comma-separated string for simple form handling
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
  const totalSteps = 7; // 1:Personal, 2:Resume, 3:Edu, 4:Skills/Exp, 5:Projects, 6:JobPrefs, 7:Availability

  const [formData, setFormData] = useState({
    // Personal Info
    fullName: '',
    email: '',
    phone: '',
    designation: '',
    profilePhoto: null as File | null,
    resume: null as File | null,
    // Dynamic Arrays
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
    // Job Preferences
    location: '',
    expectedSalary: '',
  });

  const [selectedOptions, setSelectedOptions] = useState({
    jobType: [] as string[],
    availability: '',
  });

  const progress = step > 0 ? ((step - 1) / totalSteps) * 100 : 0;

  // --- START: DATA FETCHING (ON MOUNT) ---
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await apiInstance.get('/students/details');
        const data = response.data.data;
        if (data) {
          setFormData((prev) => ({
            ...prev,
            fullName: data.fullName || '',
            email: data.email || '',
            phone: data.phone || '',
            designation: data.jobRole || '',
            // --- Populate Arrays ---
            education:
              data.education?.length > 0
                ? data.education.map((edu: any) => ({
                    institute: edu.institute || '',
                    degree: edu.degree || '',
                    graduationYear:
                      edu.graduationYear ||
                      (edu.endDate
                        ? new Date(edu.endDate).getFullYear().toString()
                        : ''),
                    grade: edu.grade || '',
                  }))
                : prev.education,
            experience:
              data.experience?.length > 0
                ? data.experience.map((exp: any) => ({
                    company: exp.company || '',
                    title: exp.title || '',
                    duration: formatDuration(exp.startDate, exp.endDate),
                    description: exp.description || '',
                  }))
                : prev.experience,
            skills:
              data.skills?.length > 0
                ? data.skills.map((skill: any) => ({
                    skill: skill.skill || '',
                    level: skill.level || 'BEGINNER',
                  }))
                : prev.skills,
            projects:
              data.projects?.length > 0
                ? data.projects.map((proj: any) => ({
                    projectName: proj.projectName || '',
                    description: proj.description || '',
                    technologies: (proj.technologies || []).join(', '),
                    link: proj.link || '',
                  }))
                : prev.projects,
          }));
        }
      } catch (error) {
        console.error('Failed to fetch student details:', error);
      }
    };
    fetchDetails();
  }, []);
  // --- END: DATA FETCHING ---

  // --- START: GENERIC HANDLERS FOR DYNAMIC ARRAYS ---
  const handleArrayChange = <T,>(
    arrayName: keyof typeof formData,
    index: number,
    field: keyof T,
    value: any,
  ) => {
    // Ensure the array we're trying to access is actually an array
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
  // --- END: GENERIC HANDLERS ---

  // --- START: STANDARD HANDLERS ---
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
    const repsonse = await apiInstance.post('/students/profile/onboarding', {
      data: formData,
      selectedOptions,
    });
    setStep(totalSteps + 1);
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
        fullName: apiData.fullName || prev.fullName,
        email: apiData.email || prev.email,
        phone: apiData.phone || prev.phone,
        designation: apiData.experience?.[0]?.title || prev.designation,
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

  const handleDashboardRedirect = () => {
    router.push('/dashboard');
  };

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
              onClick={() => {
                setDirection('forward');
                setStep(1);
              }}
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
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
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
              onClick={() => handleDashboardRedirect()}
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
          <PersonalInfoStep
            formData={formData}
            handleInputChange={handleInputChange}
            handleFileUpload={handleFileUpload}
          />
        ),
      },
      {
        title: 'Upload Resume',
        subtitle: 'Help us understand your background',
        icon: FileText,
        content: (
          <ResumeStep formData={formData} handleFileUpload={handleFileUpload} />
        ),
      },
      {
        title: 'Education',
        subtitle: 'Your academic background',
        icon: GraduationCap,
        content: (
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
        ),
      },
      {
        title: 'Skills & Experience',
        subtitle: 'Showcase your expertise',
        icon: Code,
        content: (
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
        ),
      },
      {
        title: 'Projects',
        subtitle: 'Show off your best work',
        icon: BookCopy,
        content: (
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
        ),
      },
      {
        title: 'Job Preferences',
        subtitle: 'What are you looking for?',
        icon: Briefcase,
        content: (
          <JobPreferencesStep
            formData={formData}
            handleInputChange={handleInputChange}
            selectedOptions={selectedOptions}
            toggleOption={toggleOption}
          />
        ),
      },
      {
        title: 'Availability',
        subtitle: 'When can you start?',
        icon: Rocket,
        content: (
          <AvailabilityStep
            selectedOptions={selectedOptions}
            toggleOption={toggleOption}
          />
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
                        ? 'w-10 h-2.5 bg-white rounded-full shadow-lg'
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
                    className="h-full bg-white transition-all duration-700 ease-out rounded-full relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </>
          )}

          {step > 0 && renderStep()}

          {/* Navigation buttons */}
          {step > 0 && (
            <>
              <div className="flex gap-3 mt-5">
                <Button
                  onClick={handleBack}
                  disabled={step === 1}
                  variant="outline"
                  className="h-14 px-6 rounded-2xl border-2 hover:bg-gray-100 disabled:opacity-30 transition-all duration-300 text-base font-semibold hover:scale-105 disabled:hover:scale-100"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" /> Back
                </Button>

                <Button
                  onClick={handleSkip}
                  variant="outline"
                  className="h-14 px-6 rounded-2xl border-2 border-orange-300 text-orange-600 hover:bg-orange-50 transition-all duration-300 text-base font-semibold hover:scale-105"
                >
                  <SkipForward className="w-5 h-5 mr-2" />{' '}
                  {step === totalSteps ? 'Finish Later' : 'Skip'}
                </Button>

                {step < totalSteps ? (
                  <Button
                    onClick={handleNext}
                    className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-base font-semibold"
                  >
                    Next <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-base font-semibold"
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" /> Complete
                  </Button>
                )}
              </div>

              {/* Progress text */}
              <div className="text-center mt-4">
                <p className="text-sm text-gray-400 font-medium">
                  {step === totalSteps
                    ? "🎉 Final step! You're almost done!"
                    : `${totalSteps - step} more step${
                        totalSteps - step > 1 ? 's' : ''
                      } to go`}
                </p>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
  // --- END: MAIN RETURN ---
};

export default OnboardingPage;
