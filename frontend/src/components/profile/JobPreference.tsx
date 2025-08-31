'use client';

import React, { useEffect, useState } from 'react';
import {
  ChevronDown,
  MapPin,
  Briefcase,
  DollarSign,
  GraduationCap,
  Building,
  Settings,
  Check,
  Star,
  Globe,
  Code,
  Award,
} from 'lucide-react';
import { Textarea } from '../ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { useDispatch } from 'react-redux';
import {
  getStudentDetailsRequest,
  getStudentJobPreferenceRequest,
  updateJobPreferedByStudentRequest,
  updateStudentJobPreferenceRequest,
} from '@/redux/reducers/studentReducer';
import apiInstance from '@/services/api';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/rootReducer';
import LocationPreferences from './components/LocationPreferences';

const JobPreferencesForm = () => {
  const [activeSection, setActiveSection] = useState('location');
  const [tags, setTags] = useState([]);

  const dispatch = useDispatch();
  const { students } = useSelector((state: RootState) => state.student);
  const [formData, setFormData] = useState({
    // Location
    preferredCountries: [],
    preferredCities: [],
    isRemote: false,
    relocationWillingness: '',
    // Job Details
    preferredJobTitles: '',
    preferredJobTypes: [],
    preferredIndustries: '',
    preferredExperienceLevel: '',
    // Compensation
    preferredSalary: { min: '', max: '', currency: 'USD', period: 'YEAR' },
    // Skills
    mustHaveSkills: '',
    niceToHaveSkills: '',
    preferredCertifications: '',
    preferredEducationLevel: '',
    // Company
    preferredCompanySizes: [],
    preferredCompanyCultures: [],
    // Additional
    visaSponsorshipRequired: false,
    immediateAvailability: false,
  });

  // This useEffect will run when `students` data is fetched from Redux
  useEffect(() => {
    if (students && students.jobPreferences) {
      const { jobPreferences } = students;

      // Helper function to convert an array of skill objects to a string
      const skillsToString = (skillsArray) => {
        if (!Array.isArray(skillsArray)) return '';
        return skillsArray.map((item) => item.skill).join(', ');
      };

      // Helper function to convert an array of strings to a string
      const arrayToString = (stringArray) => {
        if (!Array.isArray(stringArray)) return '';
        return stringArray.join(', ');
      };

      setFormData({
        preferredCountries: jobPreferences.preferredCountries || [],
        preferredCities: jobPreferences.preferredCities || [],
        isRemote: jobPreferences.isRemote || false,
        relocationWillingness: jobPreferences.relocationWillingness || '',

        preferredJobTitles: arrayToString(jobPreferences.preferredJobTitles),
        preferredJobTypes: jobPreferences.preferredJobTypes || [],
        preferredIndustries: arrayToString(jobPreferences.preferredIndustries),
        preferredExperienceLevel: jobPreferences.preferredExperienceLevel || '',

        preferredSalary: {
          min: jobPreferences.preferredSalary?.min || '',
          max: jobPreferences.preferredSalary?.max || '',
          currency: jobPreferences.preferredSalary?.currency || 'USD',
          period: jobPreferences.preferredSalary?.period || 'YEAR',
        },

        // ✨ This is the key transformation for your skills
        mustHaveSkills: skillsToString(jobPreferences.mustHaveSkills),
        niceToHaveSkills: skillsToString(jobPreferences.niceToHaveSkills),

        preferredCertifications: arrayToString(
          jobPreferences.preferredCertifications,
        ),
        preferredEducationLevel: jobPreferences.preferredEducationLevel || '',

        preferredCompanySizes: jobPreferences.preferredCompanySizes || [],
        preferredCompanyCultures: jobPreferences.preferredCompanyCultures || [],

        visaSponsorshipRequired:
          jobPreferences.visaSponsorshipRequired || false,
        immediateAvailability: jobPreferences.immediateAvailability || false,
      });
    }
  }, [students]); // Dependency array ensures this runs when `students` changes

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
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSalaryChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      preferredSalary: {
        ...prev.preferredSalary,
        [field]: value,
      },
    }));
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      preferredCountries: formData.preferredCountries.join(','),
      preferredCities: formData.preferredCities.join(','),
      // Also join other fields that are now arrays in the form but need to be strings for the API
      preferredJobTitles: Array.isArray(formData.preferredJobTitles)
        ? formData.preferredJobTitles.join(',')
        : formData.preferredJobTitles,
      preferredIndustries: Array.isArray(formData.preferredIndustries)
        ? formData.preferredIndustries.join(',')
        : formData.preferredIndustries,
      preferredCertifications: Array.isArray(formData.preferredCertifications)
        ? formData.preferredCertifications.join(',')
        : formData.preferredCertifications,
    };
    const response = await apiInstance.post('/students/prefered-job/add', {
      formData: payload,
    });
    console.log('formData', response);
  };

  useEffect(() => {
    dispatch(getStudentDetailsRequest());
  }, [dispatch]);

  const toggleArrayValue = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const CustomCheckbox = ({
    checked,
    onChange,
    children,
    color = 'purple',
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
    <div className="flex flex-wrap gap-2 mb-8">
      {sections.map((section) => {
        const Icon = section.icon;
        return (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 ${
              activeSection === section.id
                ? `bg-gradient-to-r from-${section.color}-400 to-${section.color}-600 text-white shadow-lg shadow-${section.color}-400/30`
                : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="font-medium">{section.label}</span>
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
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full mb-6 shadow-lg shadow-purple-400/30">
            <Briefcase className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            Job Preferences
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Tell us about your dream job and we'll help you find the perfect
            match. Complete each section to get personalized job
            recommendations.
          </p>
        </div>

        {/* Navigation */}
        <SectionNavigation />

        {/* Form Content */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-purple-400/10 border border-white/20 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                {sections.find((s) => s.id === activeSection)?.label}
              </h2>
              <div className="h-1 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full w-24"></div>
            </div>

            {renderActiveSection()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <button className="px-8 py-4 bg-gradient-to-r from-slate-400 to-slate-600 text-white rounded-xl font-semibold shadow-lg shadow-slate-400/30 hover:shadow-xl hover:shadow-slate-400/40 transform hover:scale-105 transition-all duration-300">
            Save Draft
          </button>
          <button
            onClick={handleSavePreferences}
            className="px-8 py-4 bg-gradient-to-r from-purple-400 to-cyan-400 text-white rounded-xl font-semibold shadow-lg shadow-purple-400/30 hover:shadow-xl hover:shadow-purple-400/40 transform hover:scale-105 transition-all duration-300"
          >
            Save Preferences
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="max-w-md mx-auto mt-8">
          <div className="flex justify-between items-center">
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
                  <div className="w-8 h-0.5 bg-slate-200 dark:bg-slate-700 mx-2"></div>
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
interface narrativProps {
  narrativesForm: any;
  handleNarrativesSubmit: any;
}

// Corrected Narratives Component
export const Narratives = ({
  narrativesForm,
  handleNarrativesSubmit,
}: narrativProps) => {
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
