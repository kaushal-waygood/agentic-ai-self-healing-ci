import {
  User,
  FileText,
  GraduationCap,
  Code,
  Briefcase,
  Rocket,
  Camera,
  Upload,
  CheckCircle2,
} from 'lucide-react';
import PersonalInfoStep from './PersonalInfoStep';
import ResumeStep from './ResumeStep';
import EducationStep from './EducationStep';
import SkillsExperienceStep from './SkillsExperienceStep';
import JobPreferencesStep from './JobPreferencesStep';
import { AvailabilityStep } from './AvailabilityStep';

const renderStep = () => {
  // Pass all necessary state and handlers to each step component
  const stepProps = {
    formData,
    handleInputChange,
    handleFileUpload,
    selectedOptions,
    toggleOption,
  };

  const steps = [
    {
      title: 'Personal Information',
      subtitle: "Let's get to know you better",
      icon: User,
      content: <PersonalInfoStep {...stepProps} />,
    },
    {
      title: 'Upload Resume',
      subtitle: 'Help us understand your background',
      icon: FileText,
      content: <ResumeStep {...stepProps} />,
    },
    {
      title: 'Education',
      subtitle: 'Tell us about your academic background',
      icon: GraduationCap,
      content: <EducationStep {...stepProps} />,
    },
    {
      title: 'Skills & Experience',
      subtitle: 'Showcase your expertise',
      icon: Code,
      content: <SkillsExperienceStep {...stepProps} />,
    },
    {
      title: 'Job Preferences',
      subtitle: 'What are you looking for?',
      icon: Briefcase,
      content: <JobPreferencesStep {...stepProps} />,
    },
    {
      title: 'Availability',
      subtitle: 'When can you start?',
      icon: Rocket,
      content: <AvailabilityStep {...stepProps} />,
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
