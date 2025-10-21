import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Briefcase,
  MapPin,
  Home,
  CheckCircle,
  AlertCircle,
  Search,
  Target,
  Globe,
  Clock,
  Building2,
  Users,
  GraduationCap,
  Sparkles,
  Check,
} from 'lucide-react';

const FilterWizard = ({
  form,
  errors,
  isFiltersStepValid,
  handleGoToNextStep,
  setView,
  setWizardStep,
  editingAgent,
}: any) => {
  const [formData, setFormData] = useState({
    name: '',
    jobFilters: {
      query: '',
      country: '',
      workFromHome: false,
      employmentTypes: [],
    },
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isValid, setIsValid] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Mock data
  const countries = [
    { code: 'us', name: 'United States' },
    { code: 'uk', name: 'United Kingdom' },
    { code: 'ca', name: 'Canada' },
    { code: 'de', name: 'Germany' },
    { code: 'fr', name: 'France' },
    { code: 'au', name: 'Australia' },
    { code: 'in', name: 'India' },
    { code: 'jp', name: 'Japan' },
  ];

  const employmentTypeOptions = [
    {
      id: 'FULLTIME',
      label: 'Full-time',
      icon: '💼',
      description: 'Standard 40-hour work week',
    },
    {
      id: 'CONTRACTOR',
      label: 'Contractor',
      icon: '🤝',
      description: 'Project-based work',
    },
    {
      id: 'PARTTIME',
      label: 'Part-time',
      icon: '⏰',
      description: 'Flexible hours, less than full-time',
    },
    {
      id: 'INTERN',
      label: 'Internship',
      icon: '🎓',
      description: 'Learning-focused positions',
    },
  ];

  const updateFormData = (field, value) => {
    setFormData((prev) => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value,
          },
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleEmploymentTypeChange = (typeId, checked) => {
    const currentTypes = formData.jobFilters.employmentTypes || [];
    let newTypes;

    if (checked) {
      newTypes = [...currentTypes, typeId];
    } else {
      newTypes = currentTypes.filter((t) => t !== typeId);
    }

    updateFormData('jobFilters.employmentTypes', newTypes);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Agent name is required';
    }

    if (!formData.jobFilters.query.trim()) {
      errors.query = 'Job title/keywords are required';
    }

    if (!formData.jobFilters.country) {
      errors.country = 'Country selection is required';
    }

    if (!formData.jobFilters.employmentTypes?.length) {
      errors.employmentTypes = 'At least one employment type is required';
    }

    setValidationErrors(errors);
    const isFormValid = Object.keys(errors).length === 0;
    setIsValid(isFormValid);
    return isFormValid;
  };

  useEffect(() => {
    validateForm();
  }, [formData]);

  const steps = [
    { title: 'Agent Details', icon: Bot },
    { title: 'Job Filters', icon: Target },
    { title: 'Select CV', icon: Briefcase },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Create AI Job Agent
          </h1>
          <p className="text-lg text-gray-600">
            Configure your personal job search assistant
          </p>
        </div>

        {/* Step Progress */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`flex items-center space-x-3 px-4 py-2 rounded-full transition-all duration-300 ${
                    index === 0
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                      index === 0
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {index === 0 ? (
                      <step.icon className="w-3 h-3" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="font-medium">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-8 h-0.5 bg-gray-200 mx-2"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  Step 1: Agent Configuration
                </h2>
                <p className="text-indigo-100">
                  Define your agent's name and job search criteria
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isValid ? 'bg-green-400' : 'bg-yellow-400'
                  } animate-pulse`}
                ></div>
                <span className="text-sm">
                  {isValid ? 'Ready' : 'In Progress'}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Agent Name Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Bot className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Agent Identity
                </h3>
                <span className="text-red-500 text-sm">*</span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g., Senior Product Manager Hunter"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className={`w-full px-4 py-4 border-2 rounded-xl transition-all duration-300 focus:outline-none ${
                    validationErrors.name
                      ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                      : 'border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100'
                  } ${
                    formData.name ? 'bg-green-50 border-green-300' : 'bg-white'
                  }`}
                />
                {formData.name && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                )}
                {validationErrors.name && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                )}
              </div>
              {validationErrors.name && (
                <p className="text-red-500 text-sm flex items-center mt-2">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {validationErrors.name}
                </p>
              )}
            </div>

            {/* Separator */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  Job Search Criteria
                </span>
              </div>
            </div>

            {/* Job Filters Section */}
            <div className="space-y-6">
              {/* Job Title/Keywords */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Search className="w-5 h-5 text-purple-500" />
                  <label className="text-lg font-semibold text-gray-800">
                    Job Title / Keywords
                  </label>
                  <span className="text-red-500 text-sm">*</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g., Senior Product Manager, Product Owner"
                    value={formData.jobFilters.query}
                    onChange={(e) =>
                      updateFormData('jobFilters.query', e.target.value)
                    }
                    className={`w-full px-4 py-4 border-2 rounded-xl transition-all duration-300 focus:outline-none ${
                      validationErrors.query
                        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                        : 'border-gray-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100'
                    } ${
                      formData.jobFilters.query
                        ? 'bg-green-50 border-green-300'
                        : 'bg-white'
                    }`}
                  />
                  {formData.jobFilters.query && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                  )}
                </div>
                {validationErrors.query && (
                  <p className="text-red-500 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.query}
                  </p>
                )}
              </div>

              {/* Country Selection */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-blue-500" />
                  <label className="text-lg font-semibold text-gray-800">
                    Country
                  </label>
                  <span className="text-red-500 text-sm">*</span>
                </div>
                <div className="relative">
                  <select
                    value={formData.jobFilters.country}
                    onChange={(e) =>
                      updateFormData('jobFilters.country', e.target.value)
                    }
                    className={`w-full px-4 py-4 border-2 rounded-xl transition-all duration-300 focus:outline-none appearance-none cursor-pointer ${
                      validationErrors.country
                        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                        : 'border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100'
                    } ${
                      formData.jobFilters.country
                        ? 'bg-green-50 border-green-300'
                        : 'bg-white'
                    }`}
                  >
                    <option className="absolute" value="">
                      Select a country
                    </option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    {formData.jobFilters.country ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <MapPin className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
                {validationErrors.country && (
                  <p className="text-red-500 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.country}
                  </p>
                )}
              </div>

              {/* Remote Work Option */}
              <div className="p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
                <label className="flex items-center space-x-4 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.jobFilters.workFromHome}
                      onChange={(e) =>
                        updateFormData(
                          'jobFilters.workFromHome',
                          e.target.checked,
                        )
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-6 h-6 border-2 rounded-lg transition-all duration-200 ${
                        formData.jobFilters.workFromHome
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {formData.jobFilters.workFromHome && (
                        <Check className="w-4 h-4 text-white absolute top-0.5 left-0.5" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Home className="w-5 h-5 text-blue-500" />
                    <div>
                      <span className="font-medium text-gray-800">
                        Remote / Work from home only
                      </span>
                      <p className="text-sm text-gray-500">
                        Filter for remote-friendly positions
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              {/* Employment Types */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Briefcase className="w-5 h-5 text-green-500" />
                  <label className="text-lg font-semibold text-gray-800">
                    Employment Types
                  </label>
                  <span className="text-red-500 text-sm">*</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {employmentTypeOptions.map((option) => (
                    <div
                      key={option.id}
                      className={`group relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md ${
                        formData.jobFilters.employmentTypes?.includes(option.id)
                          ? 'border-green-400 bg-green-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                      onClick={() =>
                        handleEmploymentTypeChange(
                          option.id,
                          !formData.jobFilters.employmentTypes?.includes(
                            option.id,
                          ),
                        )
                      }
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div
                            className={`w-5 h-5 border-2 rounded transition-all duration-200 ${
                              formData.jobFilters.employmentTypes?.includes(
                                option.id,
                              )
                                ? 'bg-green-500 border-green-500'
                                : 'border-gray-300 group-hover:border-gray-400'
                            }`}
                          >
                            {formData.jobFilters.employmentTypes?.includes(
                              option.id,
                            ) && (
                              <Check className="w-3 h-3 text-white absolute top-0.5 left-0.5" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 flex-1">
                          <span className="text-2xl">{option.icon}</span>
                          <div>
                            <h4 className="font-medium text-gray-800">
                              {option.label}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {option.description}
                            </p>
                          </div>
                        </div>
                      </div>
                      {formData.jobFilters.employmentTypes?.includes(
                        option.id,
                      ) && (
                        <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-green-500">
                          <Check className="absolute -top-4 -right-3 w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {validationErrors.employmentTypes && (
                  <p className="text-red-500 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.employmentTypes}
                  </p>
                )}
              </div>
            </div>

            {/* Preview Section */}
            {isValid && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-gray-800">Agent Preview</h4>
                </div>
                <div className="bg-white rounded-lg p-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-indigo-500" />
                    <span className="font-medium">Agent Name:</span>
                    <span className="text-gray-700">{formData.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-purple-500" />
                    <span className="font-medium">Searching for:</span>
                    <span className="text-gray-700">
                      {formData.jobFilters.query}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">Location:</span>
                    <span className="text-gray-700">
                      {countries.find(
                        (c) => c.code === formData.jobFilters.country,
                      )?.name || 'Not selected'}
                      {formData.jobFilters.workFromHome &&
                        ' (Remote preferred)'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-4 h-4 text-green-500" />
                    <span className="font-medium">Types:</span>
                    <span className="text-gray-700">
                      {formData.jobFilters.employmentTypes
                        ?.map(
                          (typeId) =>
                            employmentTypeOptions.find(
                              (opt) => opt.id === typeId,
                            )?.label,
                        )
                        .join(', ') || 'None selected'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {/* Footer */}
          <div className="bg-gray-50 px-8 py-6 flex justify-between items-center border-t border-gray-200">
            <button
              onClick={() => setWizardStep('intro')}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {isValid
                  ? '✅ All fields completed'
                  : '⚠️ Complete required fields'}
              </div>
              <button
                onClick={() =>
                  handleGoToNextStep('filters', [
                    'name',
                    'jobFilters.query',
                    'jobFilters.country',
                    'jobFilters.employmentTypes',
                  ])
                }
                disabled={!isValid}
                className={`flex items-center space-x-2 px-6 py-3 font-semibold text-white rounded-full transition-all duration-300 transform ${
                  isValid
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105 hover:shadow-lg'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterWizard;
