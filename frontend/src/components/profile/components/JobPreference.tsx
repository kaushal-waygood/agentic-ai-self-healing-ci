'use client';

import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Briefcase,
  DollarSign,
  GraduationCap,
  Building,
  Settings,
  Check,
  Code,
  ChevronDown,
  ChevronUp,
  Save,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import LocationPreferences from './LocationPreferences';
import { useJobPreferences } from '@/hooks/useProfile';

/* ------------------------------------------------------------------ */
/* Static Config */
/* ------------------------------------------------------------------ */

const sectionsConfig = {
  primary: [
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'skills', label: 'Skills & Education', icon: GraduationCap },
  ],
  advanced: [
    { id: 'job', label: 'Job Details', icon: Briefcase },
    { id: 'compensation', label: 'Compensation', icon: DollarSign },
    { id: 'company', label: 'Company', icon: Building },
    { id: 'additional', label: 'Additional', icon: Settings },
  ],
};

/* ------------------------------------------------------------------ */
/* Types */
/* ------------------------------------------------------------------ */

interface PreferredSalary {
  min: string;
  max: string;
  currency: string;
  period: string;
}

interface JobPreferencesFormData {
  preferredCountries: string[];
  preferredCities: string[];
  isRemote: boolean;
  relocationWillingness: string;

  preferredJobTitles: string;
  preferredJobTypes: string[];
  preferredIndustries: string;
  preferredExperienceLevel: string;

  preferredSalary: PreferredSalary;

  mustHaveSkills: string[];
  niceToHaveSkills: string;
  preferredCertifications: string;
  preferredEducationLevel: string;

  preferredCompanySizes: string[];
  preferredCompanyCultures: string[];

  visaSponsorshipRequired: boolean;
  immediateAvailability: boolean;
}

/* ------------------------------------------------------------------ */
/* Defaults */
/* ------------------------------------------------------------------ */

const defaultFormData: JobPreferencesFormData = {
  preferredCountries: [],
  preferredCities: [],
  isRemote: false,
  relocationWillingness: '',
  preferredJobTitles: '',
  preferredJobTypes: [],
  preferredIndustries: '',
  preferredExperienceLevel: '',
  preferredSalary: { min: '', max: '', currency: 'USD', period: 'YEAR' },
  mustHaveSkills: [],
  niceToHaveSkills: '',
  preferredCertifications: '',
  preferredEducationLevel: '',
  preferredCompanySizes: [],
  preferredCompanyCultures: [],
  visaSponsorshipRequired: false,
  immediateAvailability: false,
};

/* ------------------------------------------------------------------ */
/* Helpers */
/* ------------------------------------------------------------------ */

const jobTypes = [
  { id: 'FULL_TIME', label: 'Full-time' },
  { id: 'PART_TIME', label: 'Part-time' },
  { id: 'CONTRACT', label: 'Contract' },
  { id: 'TEMPORARY', label: 'Temporary' },
  { id: 'INTERNSHIP', label: 'Internship' },
  { id: 'FREELANCE', label: 'Freelance' },
];

const experienceLevels = [
  { id: 'ENTRY_LEVEL', label: 'Entry Level', icon: '🌱' },
  { id: 'MID_LEVEL', label: 'Mid Level', icon: '🚀' },
  { id: 'SENIOR', label: 'Senior Level', icon: '⭐' },
  { id: 'EXECUTIVE', label: 'Executive', icon: '👑' },
  { id: 'NONE', label: 'None', icon: '💫' },
];

const companySizes = [
  { id: 'small', label: 'Small', desc: '1-50 employees', icon: '🏠' },
  { id: 'medium', label: 'Medium', desc: '51-500 employees', icon: '🏢' },
  { id: 'large', label: 'Large', desc: '501-1000 employees', icon: '🏬' },
  {
    id: 'enterprise',
    label: 'Enterprise',
    desc: '1000+ employees',
    icon: '🌆',
  },
];

const educationLevels = [
  { id: 'High School', label: 'High School', icon: '📚' },
  { id: 'Associate ', label: 'Associate Degree', icon: '🎓' },
  { id: 'bachelor ', label: "Bachelor's Degree", icon: '🎓' },
  { id: 'Master', label: "Master's Degree", icon: '📜' },
  { id: 'Phd', label: 'PhD', icon: '🔬' },
  { id: 'None', label: 'No Formal Education Required', icon: '💡' },
];

const companyCultures = [
  { id: 'startup', label: 'Startup', icon: '🚀' },
  { id: 'tech', label: 'Tech-focused', icon: '💻' },
  { id: 'corporate', label: 'Corporate', icon: '🏛️' },
  { id: 'nonprofit', label: 'Non-profit', icon: '❤️' },
  { id: 'remote-first', label: 'Remote-first', icon: '🌍' },
];

const splitToArray = (v: string) =>
  v
    ? v
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

const arrayToString = (a?: string[]) => (Array.isArray(a) ? a.join(', ') : '');

const skillsToString = (a?: { skill: string }[]) =>
  Array.isArray(a)
    ? a
        .map((s) => s.skill)
        .filter(Boolean)
        .join(', ')
    : '';

const hydrateForm = (jp: any): JobPreferencesFormData => ({
  preferredCountries: jp.preferredCountries ?? [],
  preferredCities: jp.preferredCities ?? [],
  isRemote: jp.isRemote ?? false,
  relocationWillingness: String(jp.relocationWillingness ?? ''),
  preferredJobTitles: arrayToString(jp.preferredJobTitles),
  preferredJobTypes: jp.preferredJobTypes ?? [],
  preferredIndustries: arrayToString(jp.preferredIndustries),
  preferredExperienceLevel: jp.preferredExperienceLevel ?? '',
  preferredSalary: {
    min: jp.preferredSalary?.min ?? '',
    max: jp.preferredSalary?.max ?? '',
    currency: jp.preferredSalary?.currency ?? 'USD',
    period: jp.preferredSalary?.period ?? 'YEAR',
  },
  mustHaveSkills: jp.mustHaveSkills ?? [],
  niceToHaveSkills: skillsToString(jp.niceToHaveSkills),
  preferredCertifications: arrayToString(jp.preferredCertifications),
  preferredEducationLevel: jp.preferredEducationLevel ?? '',
  preferredCompanySizes: jp.preferredCompanySizes ?? [],
  preferredCompanyCultures: jp.preferredCompanyCultures ?? [],
  visaSponsorshipRequired: jp.visaSponsorshipRequired ?? false,
  immediateAvailability: jp.immediateAvailability ?? false,
});

const buildPayload = (fd: JobPreferencesFormData) => ({
  ...fd,
  relocationWillingness: fd.relocationWillingness === 'true',
  preferredJobTitles: splitToArray(fd.preferredJobTitles),
  preferredIndustries: splitToArray(fd.preferredIndustries),
  preferredCertifications: splitToArray(fd.preferredCertifications),

  mustHaveSkills:
    typeof fd.mustHaveSkills === 'string'
      ? splitToArray(fd.mustHaveSkills)
      : fd.mustHaveSkills,
  niceToHaveSkills: splitToArray(fd.niceToHaveSkills).map((skill) => ({
    skill,
  })),
});

/* ------------------------------------------------------------------ */
/* UI Components */
/* ------------------------------------------------------------------ */

const CustomCheckbox = ({
  checked,
  onChange,
  children,
  color = 'blue',
}: {
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
  color?: string;
}) => (
  <div
    className={`relative cursor-pointer group transition-all duration-300 transform hover:scale-[1.02] ${
      checked
        ? ``
        : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'
    } rounded-lg p-4 border-2 ${
      checked ? `border-${color}-400` : 'border-slate-200 dark:border-slate-600'
    }`}
    onClick={onChange}
  >
    <div className="flex items-center justify-between">
      {children}
      <div
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
          checked ? 'border-blue-400 bg-white/20' : `border-${color}-300`
        }`}
      >
        {checked && <Check className="w-4 h-4 text-blue-400" />}
      </div>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Main Form Component */
/* ------------------------------------------------------------------ */

const JobPreferencesForm = () => {
  const { toast } = useToast();
  const { jobPreferences, updateJobPreferences } = useJobPreferences();
  const [formData, setFormData] = useState(defaultFormData);
  console.log('job prefrence form data', jobPreferences);

  // Only manage state for Advanced tab toggle
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  useEffect(() => {
    if (jobPreferences) {
      setFormData(hydrateForm(jobPreferences));
    }
  }, [jobPreferences]);
  console.log('hydrateForm(jobPreferences)', formData);
  const handleSavePreferences = (
    e: React.FormEvent,
    type: 'primary' | 'advanced',
  ) => {
    e.preventDefault();
    updateJobPreferences(buildPayload(formData));
    toast({
      title:
        type === 'primary' ? 'Primary details saved' : 'Advanced details saved',
      description: 'Your job preferences have been updated.',
    });
  };

  const handleInputChange = (
    field: keyof JobPreferencesFormData,
    value: any,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  console.log('edu level ', formData.preferredEducationLevel);
  const toggleArrayValue = (
    field:
      | 'preferredJobTypes'
      | 'preferredCompanySizes'
      | 'preferredCompanyCultures',
    value: string,
  ) => {
    setFormData((prev) => {
      const current = (prev[field] || []) as string[];
      return {
        ...prev,
        [field]: current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });
  };

  const handleSalaryChange = (field: keyof PreferredSalary, value: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredSalary: { ...prev.preferredSalary, [field]: value },
    }));
  };

  console.log('form dta ', formData);
  // --- Sub-Component for rendering section content ---
  const RenderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case 'location':
        return (
          <LocationPreferences
            formData={formData}
            handleInputChange={handleInputChange}
            setFormData={setFormData}
          />
        );
      case 'job':
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <Briefcase className="inline w-4 h-4 mr-2" />
                  Preferred Job Titles
                </label>
                <textarea
                  className="w-full p-4 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white focus:border-blue-400 dark:bg-slate-800 outline-blue-400 transition-all resize-none"
                  rows={3}
                  placeholder="Software Engineer, Product Manager..."
                  value={formData.preferredJobTitles}
                  onChange={(e) =>
                    handleInputChange('preferredJobTitles', e.target.value)
                  }
                />
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Preferred Industries
                </label>
                <textarea
                  className="w-full p-4 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 outline-blue-400 transition-all resize-none"
                  rows={3}
                  placeholder="Technology, Healthcare, Finance..."
                  value={formData.preferredIndustries}
                  onChange={(e) =>
                    handleInputChange('preferredIndustries', e.target.value)
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                Job Types
              </label>
              <div className="grid md:grid-cols-3 gap-4">
                {jobTypes.map((type) => (
                  <CustomCheckbox
                    key={type.id}
                    checked={formData.preferredJobTypes.includes(type.id)}
                    onChange={() =>
                      toggleArrayValue('preferredJobTypes', type.id)
                    }
                    color="blue"
                  >
                    <div className="font-medium">{type.label}</div>
                  </CustomCheckbox>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                Experience Level
              </label>
              <div className="grid md:grid-cols-3 gap-4">
                {experienceLevels.map((level) => (
                  <CustomCheckbox
                    key={level.id}
                    checked={formData.preferredExperienceLevel === level.id}
                    onChange={() =>
                      handleInputChange('preferredExperienceLevel', level.id)
                    }
                    color="blue"
                  >
                    <div>
                      <div className="font-medium">
                        {level.icon} {level.label}
                      </div>
                    </div>
                  </CustomCheckbox>
                ))}
              </div>
            </div>
          </div>
        );
      case 'compensation':
        return (
          <div className="space-y-6">
            <div className="dark:to-slate-700 rounded-lg p-6 border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">
                <DollarSign className="inline w-5 h-5 mr-2" />
                Expected Salary Range
              </h4>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Minimum Salary
                  </label>
                  <input
                    type="number"
                    className="w-full p-3 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 outline-blue-400 transition-all"
                    placeholder="50,000"
                    value={formData.preferredSalary.min}
                    onChange={(e) => handleSalaryChange('min', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Maximum Salary
                  </label>
                  <input
                    type="number"
                    className="w-full p-3 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 outline-blue-400 transition-all"
                    placeholder="80,000"
                    value={formData.preferredSalary.max}
                    onChange={(e) => handleSalaryChange('max', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Currency
                  </label>
                  <select
                    className="w-full p-3 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 outline-blue-400 transition-all"
                    value={formData.preferredSalary.currency}
                    onChange={(e) =>
                      handleSalaryChange('currency', e.target.value)
                    }
                  >
                    <option value="USD">💵 USD</option>
                    <option value="EUR">💶 EUR</option>
                    <option value="INR">💰 INR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Period
                  </label>
                  <select
                    className="w-full p-3 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 outline-blue-400 transition-all"
                    value={formData.preferredSalary.period}
                    onChange={(e) =>
                      handleSalaryChange('period', e.target.value)
                    }
                  >
                    <option value="YEAR">📅 Yearly</option>
                    <option value="MONTH">📆 Monthly</option>
                    <option value="WEEK">📋 Weekly</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );
      case 'skills':
        return (
          <div className="space-y-4">
            <div className="grid md:grid-cols-1 gap-4">
              {/* <div className="group">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <Code className="inline w-4 h-4 mr-2" />
                  Must-have Skills
                </label>
                <textarea
                  className="w-full p-3 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 outline-blue-400 transition-all resize-none"
                  rows={4}
                  placeholder="JavaScript, Python, React..."
                  value={formData.mustHaveSkills}
                  onChange={(e) =>
                    handleInputChange('mustHaveSkills', e.target.value)
                  }
                />
              </div> */}
              {/* 
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <Star className="inline w-4 h-4 mr-2" />
                  Nice-to-have Skills
                </label>
                <textarea
                  className="w-full p-3 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 outline-blue-400 transition-all resize-none"
                  rows={4}
                  placeholder="Docker, AWS, GraphQL..."
                  value={formData.niceToHaveSkills}
                  onChange={(e) =>
                    handleInputChange('niceToHaveSkills', e.target.value)
                  }
                />
              </div> */}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* <div className="group">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <Award className="inline w-4 h-4 mr-2" />
                  Certifications
                </label>
                <textarea
                  className="w-full p-3 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 outline-blue-400 transition-all resize-none"
                  rows={3}
                  placeholder="AWS Certified, PMP, Scrum Master..."
                  value={formData.preferredCertifications}
                  onChange={(e) =>
                    handleInputChange('preferredCertifications', e.target.value)
                  }
                />
              </div> */}

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                  <GraduationCap className="inline w-4 h-4 mr-2" />
                  Education Level
                </label>
                <div className="relative">
                  <select
                    value={formData.preferredEducationLevel || ''}
                    onChange={(e) =>
                      handleInputChange(
                        'preferredEducationLevel',
                        e.target.value,
                      )
                    }
                    className="w-full p-3 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 outline-blue-400 transition-all"
                  >
                    <option value="" disabled>
                      Select education level
                    </option>
                    {educationLevels.map((level) => (
                      <option key={level.id} value={level.id}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        );
      case 'company':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                Company Sizes
              </label>
              <div className="grid md:grid-cols-3 gap-4">
                {companySizes.map((size) => (
                  <CustomCheckbox
                    key={size.id}
                    checked={formData.preferredCompanySizes.includes(size.id)}
                    onChange={() =>
                      toggleArrayValue('preferredCompanySizes', size.id)
                    }
                    color="blue"
                  >
                    <div>
                      <div className="font-semibold">
                        {size.icon} {size.label}
                      </div>
                      <div className="text-sm opacity-80">{size.desc}</div>
                    </div>
                  </CustomCheckbox>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                Company Cultures
              </label>
              <div className="grid md:grid-cols-3 gap-4">
                {companyCultures.map((culture) => (
                  <CustomCheckbox
                    key={culture.id}
                    checked={formData.preferredCompanyCultures.includes(
                      culture.id,
                    )}
                    onChange={() =>
                      toggleArrayValue('preferredCompanyCultures', culture.id)
                    }
                    color="blue"
                  >
                    <div>
                      <div className="font-semibold">
                        {culture.icon} {culture.label}
                      </div>
                    </div>
                  </CustomCheckbox>
                ))}
              </div>
            </div>
          </div>
        );
      case 'additional':
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <CustomCheckbox
                checked={formData.visaSponsorshipRequired}
                onChange={() =>
                  handleInputChange(
                    'visaSponsorshipRequired',
                    !formData.visaSponsorshipRequired,
                  )
                }
                color="blue"
              >
                <div>
                  <div className="font-semibold">
                    🛂 Visa Sponsorship Required
                  </div>
                  <div className="text-sm opacity-80">
                    Do you need visa sponsorship?
                  </div>
                </div>
              </CustomCheckbox>

              <CustomCheckbox
                checked={formData.immediateAvailability}
                onChange={() =>
                  handleInputChange(
                    'immediateAvailability',
                    !formData.immediateAvailability,
                  )
                }
                color="blue"
              >
                <div>
                  <div className="font-semibold">⚡ Immediate Availability</div>
                  <div className="text-sm opacity-80">
                    Can you start immediately?
                  </div>
                </div>
              </CustomCheckbox>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="rounded-lg p-2 max-h-[80vh] overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* PRIMARY SECTION (ALWAYS OPEN) */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-lg border border-white/20 overflow-hidden">
          <div className="p-2 sm:p-4 space-y-4">
            {sectionsConfig.primary.map((section, index) => (
              <div key={section.id}>
                {index > 0 && (
                  <div className=" bg-slate-200 dark:bg-slate-700 " />
                )}
                {/* <div className="mb-4 flex items-center gap-2">
                  <section.icon className="w-5 h-5 text-blue-500" />
                  <h4 className="text-md font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-sm">
                    {section.label}
                  </h4>
                </div> */}
                {RenderSectionContent(section.id)}
              </div>
            ))}

            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700 mt-6">
              <button
                onClick={(e) => handleSavePreferences(e, 'primary')}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg shadow-blue-400/20 transition-all"
              >
                <Save className="w-4 h-4" />
                Save Primary Changes
              </button>
            </div>
          </div>
        </div>

        {/* ADVANCED ACCORDION (COLLAPSIBLE) */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-lg shadow-xl shadow-purple-400/10 border border-white/20 overflow-hidden">
          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="w-full flex items-center justify-between p-4 sm:p-6 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Settings className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  Advanced Preferences
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Job Details, Salary, Company Culture
                </p>
              </div>
            </div>
            {isAdvancedOpen ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>

          {isAdvancedOpen && (
            <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-700 space-y-8 animate-in slide-in-from-top-2 duration-200">
              {sectionsConfig.advanced.map((section, index) => (
                <div key={section.id}>
                  {index > 0 && (
                    <div className="h-px bg-slate-200 dark:bg-slate-700 my-8" />
                  )}
                  <div className="mb-4 flex items-center gap-2">
                    <section.icon className="w-5 h-5 text-purple-500" />
                    <h4 className="text-md font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-sm">
                      {section.label}
                    </h4>
                  </div>
                  {RenderSectionContent(section.id)}
                </div>
              ))}

              <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700 mt-6">
                <button
                  onClick={(e) => handleSavePreferences(e, 'advanced')}
                  className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow-lg shadow-purple-400/20 transition-all"
                >
                  <Save className="w-4 h-4" />
                  Save Advanced Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobPreferencesForm;
