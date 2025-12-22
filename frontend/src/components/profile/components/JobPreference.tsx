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
  Star,
  Code,
  Award,
} from 'lucide-react';
import { Textarea } from '../../ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/form';
import { useDispatch, useSelector } from 'react-redux';
import {
  getStudentDetailsRequest,
  getStudentJobPreferenceRequest,
} from '@/redux/reducers/studentReducer';
import apiInstance from '@/services/api';
import { RootState } from '@/redux/rootReducer';
import LocationPreferences from './LocationPreferences';
import { useToast } from '@/hooks/use-toast';

// Types for form data
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

  preferredJobTitles: string; // comma-separated in UI
  preferredJobTypes: string[];
  preferredIndustries: string; // comma-separated in UI
  preferredExperienceLevel: string;

  preferredSalary: PreferredSalary;

  mustHaveSkills: string; // comma-separated
  niceToHaveSkills: string; // comma-separated
  preferredCertifications: string; // comma-separated
  preferredEducationLevel: string;

  preferredCompanySizes: string[];
  preferredCompanyCultures: string[];

  visaSponsorshipRequired: boolean;
  immediateAvailability: boolean;
}

const defaultFormData: JobPreferencesFormData = {
  preferredCountries: [],
  preferredCities: [],
  isRemote: false,
  relocationWillingness: '',

  preferredJobTitles: '',
  preferredJobTypes: [],
  preferredIndustries: '',
  preferredExperienceLevel: '',

  preferredSalary: {
    min: '',
    max: '',
    currency: 'USD',
    period: 'YEAR',
  },

  mustHaveSkills: '',
  niceToHaveSkills: '',
  preferredCertifications: '',
  preferredEducationLevel: '',

  preferredCompanySizes: [],
  preferredCompanyCultures: [],

  visaSponsorshipRequired: false,
  immediateAvailability: false,
};

const JobPreferencesForm = () => {
  const [activeSection, setActiveSection] = useState<
    'location' | 'job' | 'compensation' | 'skills' | 'company' | 'additional'
  >('location');
  const { toast } = useToast();

  const dispatch = useDispatch();
  const { jobPreference } = useSelector((state: RootState) => state.student);

  useEffect(() => {
    // dispatch(getStudentJobPreferenceRequest());
  }, [dispatch]);

  const [formData, setFormData] =
    useState<JobPreferencesFormData>(defaultFormData);

  // hydrate from jobPreference when it loads/changes
  useEffect(() => {
    if (!jobPreference) return;

    const { preferences: jp } = jobPreference as any;

    const skillsToString = (skillsArray: any) =>
      Array.isArray(skillsArray)
        ? skillsArray
            .map((item) => item.skill ?? '')
            .filter(Boolean)
            .join(', ')
        : '';

    const arrayToString = (stringArray: any) =>
      Array.isArray(stringArray) ? stringArray.join(', ') : '';

    setFormData((prev) => ({
      ...prev,
      preferredCountries: jp.preferredCountries || [],
      preferredCities: jp.preferredCities || [],
      isRemote: jp.isRemote || false,
      relocationWillingness: jp.relocationWillingness || '',

      preferredJobTitles: arrayToString(jp.preferredJobTitles),
      preferredJobTypes: jp.preferredJobTypes || [],
      preferredIndustries: arrayToString(jp.preferredIndustries),
      preferredExperienceLevel: jp.preferredExperienceLevel || '',

      preferredSalary: {
        min: jp.preferredSalary?.min || '',
        max: jp.preferredSalary?.max || '',
        currency: jp.preferredSalary?.currency || 'USD',
        period: jp.preferredSalary?.period || 'YEAR',
      },

      mustHaveSkills: skillsToString(jp.mustHaveSkills),
      niceToHaveSkills: skillsToString(jp.niceToHaveSkills),

      preferredCertifications: arrayToString(jp.preferredCertifications),
      preferredEducationLevel: jp.preferredEducationLevel || '',

      preferredCompanySizes: jp.preferredCompanySizes || [],
      preferredCompanyCultures: jp.preferredCompanyCultures || [],

      visaSponsorshipRequired: jp.visaSponsorshipRequired || false,
      immediateAvailability: jp.immediateAvailability || false,
    }));
  }, [jobPreference]);

  const experienceLevels = [
    { id: 'ENTRY_LEVEL', label: 'Entry Level', icon: '🌱' },
    { id: 'MID_LEVEL', label: 'Mid Level', icon: '🚀' },
    { id: 'SENIOR', label: 'Senior Level', icon: '⭐' },
    { id: 'EXECUTIVE', label: 'Executive', icon: '👑' },
    { id: 'NONE', label: 'None', icon: '💫' },
  ];

  const jobTypes = [
    {
      id: 'FULL_TIME',
      label: 'Full-time',
      color: 'from-purple-400 to-purple-600',
    },
    { id: 'PART_TIME', label: 'Part-time', color: 'from-blue-400 to-blue-600' },
    { id: 'CONTRACT', label: 'Contract', color: 'from-cyan-400 to-cyan-600' },
    {
      id: 'TEMPORARY',
      label: 'Temporary',
      color: 'from-green-400 to-green-600',
    },
    {
      id: 'INTERNSHIP',
      label: 'Internship',
      color: 'from-yellow-400 to-yellow-600',
    },
    { id: 'FREELANCE', label: 'Freelance', color: 'from-red-400 to-red-600' },
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

  const companyCultures = [
    { id: 'startup', label: 'Startup', icon: '🚀', color: 'purple' },
    { id: 'tech', label: 'Tech-focused', icon: '💻', color: 'blue' },
    { id: 'corporate', label: 'Corporate', icon: '🏛️', color: 'slate' },
    { id: 'nonprofit', label: 'Non-profit', icon: '❤️', color: 'green' },
    { id: 'remote-first', label: 'Remote-first', icon: '🌍', color: 'cyan' },
  ];

  const educationLevels = [
    { id: 'high_school', label: 'High School', icon: '📚' },
    { id: 'associate', label: 'Associate Degree', icon: '🎓' },
    { id: 'bachelor', label: "Bachelor's Degree", icon: '🎓' },
    { id: 'master', label: "Master's Degree", icon: '📜' },
    { id: 'phd', label: 'PhD', icon: '🔬' },
    { id: 'none', label: 'No Formal Education Required', icon: '💡' },
  ];

  const sections = [
    { id: 'location', label: 'Location', icon: MapPin, color: 'purple' },
    { id: 'job', label: 'Job Details', icon: Briefcase, color: 'blue' },
    {
      id: 'compensation',
      label: 'Compensation',
      icon: DollarSign,
      color: 'cyan',
    },
    {
      id: 'skills',
      label: 'Skills & Education',
      icon: GraduationCap,
      color: 'green',
    },
    { id: 'company', label: 'Company', icon: Building, color: 'yellow' },
    { id: 'additional', label: 'Additional', icon: Settings, color: 'red' },
  ] as const;

  const handleInputChange = (
    field: keyof JobPreferencesFormData,
    value: any,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSalaryChange = (field: keyof PreferredSalary, value: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredSalary: {
        ...prev.preferredSalary,
        [field]: value,
      },
    }));
  };

  const handleNextSection = () => {
    const currentIndex = sections.findIndex((s) => s.id === activeSection);
    if (currentIndex < sections.length - 1) {
      setActiveSection(sections[currentIndex + 1].id);
    }
  };

  const handlePreviousSection = () => {
    const currentIndex = sections.findIndex((s) => s.id === activeSection);
    if (currentIndex > 0) {
      setActiveSection(sections[currentIndex - 1].id);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();

    const splitToArray = (value: string) =>
      value
        ? value
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean)
        : [];

    const payload = {
      ...formData,
      preferredCountries: Array.isArray(formData.preferredCountries)
        ? formData.preferredCountries
        : splitToArray(formData.preferredCountries as any),
      preferredCities: Array.isArray(formData.preferredCities)
        ? formData.preferredCities
        : splitToArray(formData.preferredCities as any),

      preferredJobTitles: splitToArray(formData.preferredJobTitles),
      preferredIndustries: splitToArray(formData.preferredIndustries),
      preferredCertifications: splitToArray(formData.preferredCertifications),

      mustHaveSkills: splitToArray(formData.mustHaveSkills).map((skill) => ({
        skill,
      })),
      niceToHaveSkills: splitToArray(formData.niceToHaveSkills).map(
        (skill) => ({ skill }),
      ),
    };

    try {
      await apiInstance.post('/students/prefered-job/add', {
        formData: payload,
      });

      toast({
        variant: 'default',
        title: 'Success',
        description: 'Preferences saved successfully',
        duration: 4000,
      });

      // dispatch(getStudentJobPreferenceRequest());
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not save job preferences.',
        duration: 4000,
      });
    }
  };

  useEffect(() => {
    dispatch(getStudentDetailsRequest());
  }, [dispatch]);

  const toggleArrayValue = (
    field:
      | 'preferredJobTypes'
      | 'preferredCompanySizes'
      | 'preferredCompanyCultures',
    value: string,
  ) => {
    setFormData((prev) => {
      const current = (prev[field] || []) as string[];
      const exists = current.includes(value);
      return {
        ...prev,
        [field]: exists
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });
  };

  const CustomCheckbox = ({
    checked,
    onChange,
    children,
    color = 'purple',
  }: {
    checked: boolean;
    onChange: () => void;
    children: React.ReactNode;
    color?: string;
  }) => (
    <div
      className={`relative cursor-pointer group transition-all duration-300 transform hover:scale-105 ${
        checked
          ? `bg-gradient-to-r from-${color}-400 to-${color}-600 text-white shadow-lg shadow-${color}-400/30`
          : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'
      } rounded-xl p-4 border-2 ${
        checked
          ? `border-${color}-400`
          : 'border-slate-200 dark:border-slate-600'
      }`}
      onClick={onChange}
    >
      <div className="flex items-center justify-between">
        {children}
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            checked ? 'border-white bg-white/20' : `border-${color}-300`
          }`}
        >
          {checked && <Check className="w-4 h-4 text-white" />}
        </div>
      </div>
    </div>
  );

  const SectionNavigation = () => (
    <div className=" flex flex-wrap gap-1 mb-4">
      {sections.map((section) => {
        const Icon = section.icon;
        return (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
              activeSection === section.id
                ? `bg-gradient-to-r from-${section.color}-400 to-${section.color}-600 text-white  shadow-${section.color}-400/30`
                : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm">{section.label}</span>
          </button>
        );
      })}
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
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
                  className="w-full p-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 transition-all duration-300 resize-none"
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
                  className="w-full p-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 transition-all duration-300 resize-none"
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
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6">
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
                    className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 transition-all duration-300"
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
                    className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 transition-all duration-300"
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
                    className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 transition-all duration-300"
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
                    className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 transition-all duration-300"
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
            <div className="grid md:grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <Code className="inline w-4 h-4 mr-2" />
                  Must-have Skills
                </label>
                <textarea
                  className="w-full p-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:border-green-400 focus:ring-4 focus:ring-green-400/20 transition-all duration-300 resize-none"
                  rows={4}
                  placeholder="JavaScript, Python, React..."
                  value={formData.mustHaveSkills}
                  onChange={(e) =>
                    handleInputChange('mustHaveSkills', e.target.value)
                  }
                />
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <Star className="inline w-4 h-4 mr-2" />
                  Nice-to-have Skills
                </label>
                <textarea
                  className="w-full p-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:border-green-400 focus:ring-4 focus:ring-green-400/20 transition-all duration-300 resize-none"
                  rows={4}
                  placeholder="Docker, AWS, GraphQL..."
                  value={formData.niceToHaveSkills}
                  onChange={(e) =>
                    handleInputChange('niceToHaveSkills', e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <Award className="inline w-4 h-4 mr-2" />
                  Certifications
                </label>
                <textarea
                  className="w-full p-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:border-green-400 focus:ring-4 focus:ring-green-400/20 transition-all duration-300 resize-none"
                  rows={3}
                  placeholder="AWS Certified, PMP, Scrum Master..."
                  value={formData.preferredCertifications}
                  onChange={(e) =>
                    handleInputChange('preferredCertifications', e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                  <GraduationCap className="inline w-4 h-4 mr-2" />
                  Education Level
                </label>
                <div className="space-y-2">
                  {educationLevels.map((level) => (
                    <CustomCheckbox
                      key={level.id}
                      checked={formData.preferredEducationLevel === level.id}
                      onChange={() =>
                        handleInputChange('preferredEducationLevel', level.id)
                      }
                      color="green"
                    >
                      <div className="font-medium">
                        {level.icon} {level.label}
                      </div>
                    </CustomCheckbox>
                  ))}
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
              <div className="grid md:grid-cols-2 gap-4">
                {companySizes.map((size) => (
                  <CustomCheckbox
                    key={size.id}
                    checked={formData.preferredCompanySizes.includes(size.id)}
                    onChange={() =>
                      toggleArrayValue('preferredCompanySizes', size.id)
                    }
                    color="yellow"
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
                    color="yellow"
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
                color="red"
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
                color="red"
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
    <div className="dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="rounded-lg p-2 sm:p-6 md:p-2 max-h-[80vh] overflow-y-auto">
        {/* <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent mb-3 sm:mb-4">
            Job Preferences
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto px-2">
            Tell us about your dream job and we'll help you find the perfect
            match. Complete each section to get personalized job
            recommendations.
          </p>
        </div> */}

        <div className="mb-2 sm:mb-4">
          <SectionNavigation />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl shadow-2xl shadow-purple-400/10 border border-white/20 p-3 sm:p-6 md:p-2">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-md sm:text-md md:text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                {sections.find((s) => s.id === activeSection)?.label}
              </h2>
              <div className="h-1 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full w-20 sm:w-24"></div>
            </div>

            {renderActiveSection()}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-8">
          {sections.findIndex((s) => s.id === activeSection) > 0 && (
            <button
              onClick={handlePreviousSection}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gray-300 dark:bg-slate-700 text-slate-800 dark:text-white rounded-lg font-semibold shadow hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Back
            </button>
          )}

          {sections.findIndex((s) => s.id === activeSection) <
            sections.length - 1 && (
            <button
              onClick={handleNextSection}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-400 to-cyan-400 text-white rounded-xl font-semibold shadow-lg shadow-blue-400/30 hover:shadow-xl hover:shadow-blue-400/40 transform hover:scale-105 transition-all duration-300"
            >
              Next
            </button>
          )}

          {sections.findIndex((s) => s.id === activeSection) ===
            sections.length - 1 && (
            <button
              onClick={handleSavePreferences}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-400 to-cyan-400 text-white rounded-xl font-semibold shadow-lg shadow-purple-400/30 hover:shadow-xl hover:shadow-purple-400/40 transform hover:scale-105 transition-all duration-300"
            >
              Save Preferences
            </button>
          )}
        </div>

        <div className="max-w-md mx-auto mt-8 ">
          <div className="flex justify-between items-center flex-wrap gap-1 sm:gap-0">
            {sections.map((section, index) => (
              <div key={section.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    activeSection === section.id
                      ? `bg-gradient-to-r from-${section.color}-400 to-${section.color}-600 text-white shadow-lg`
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  }`}
                >
                  {index + 1}
                </div>
                {index < sections.length - 1 && (
                  <div className="w-6 sm:w-8 h-0.5 bg-slate-200 dark:bg-slate-700 mx-1 sm:mx-2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPreferencesForm;

// Interface for props
interface NarrativProps {
  narrativesForm: any;
  handleNarrativesSubmit: any;
}

// Narratives Component (unchanged)
export const Narratives = ({
  narrativesForm,
  handleNarrativesSubmit,
}: NarrativProps) => {
  return (
    <Form {...narrativesForm}>
      <form onSubmit={narrativesForm.handleSubmit(handleNarrativesSubmit)}>
        <div className="space-y-4">
          <FormField
            control={narrativesForm.control}
            name="narrativeChallenges"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Challenging Situations Overcome</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe a challenging situation you overcame..."
                    className="resize-y min-h-[100px]"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={narrativesForm.control}
            name="narrativeAchievements"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Significant Achievements</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe a significant achievement..."
                    className="resize-y min-h-[100px]"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={narrativesForm.control}
            name="narrativeAppreciation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Appreciation Received</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe any appreciation or recognition you received..."
                    className="resize-y min-h-[100px]"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
};
