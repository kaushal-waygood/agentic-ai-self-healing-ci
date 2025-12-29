import React from 'react';
import CountrySelector from '../common/CountrySelector';

const Step1AgentConfig = ({
  nextStep,
  prevStep,
  handleChange,
  handleCheckboxChange,
  values,
  isEditing, // Receive the isEditing prop
}) => {
  const canProceed =
    values.agentName &&
    values.jobTitle &&
    values.country &&
    values.employmentTypes.length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 animate-fade-in">
      {/* ... Header remains the same ... */}
      <div className="relative bg-header-gradient-primary rounded-lg px-6 py-4 mb-2 text-white shadow-xl overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 ">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center font-bold text-xl">
              1
            </div>
            {/* Dynamically change title based on edit mode */}
            <h2 className="text-3xl font-bold">
              {isEditing ? 'Edit Agent' : 'Agent Configuration'}
            </h2>
          </div>
          <p className="text-white/90 ml-13">
            {isEditing
              ? 'You can only update the agent name.'
              : "Define your agent's name and job search criteria"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-xl p-8 space-y-4 border border-gray-100">
        {/* Agent Identity (Editable) */}
        <div className="space-y-2 group">
          <label className="flex items-center gap-2 font-semibold text-gray-700 text-sm">
            Agent Identity *
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. Senior Product Manager Hunter"
              onChange={handleChange('agentName')}
              value={values.agentName} // Use value for controlled component
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg transition-all duration-200 outline-none  focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Job Title (Disabled on Edit) */}
        <div className="space-y-2 group">
          <label className="flex items-center gap-2 font-semibold text-gray-700 text-sm">
            Job Title / Keywords *
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. Senior Product Manager, Product Owner"
              onChange={handleChange('jobTitle')}
              value={values.jobTitle}
              disabled={isEditing} // Disable when editing
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg transition-all duration-200 outline-none focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Country and Remote Toggle (Disabled on Edit) */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 font-semibold text-gray-700 text-sm">
              Country *
            </label>
            <div className="relative">
              <CountrySelector
                value={values.country}
                onChange={(countryCode) =>
                  handleChange('country')({ target: { value: countryCode } })
                }
                disabled={isEditing} // 👈 FIX 3: Disable selection in edit mode
                className={`w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none appearance-none transition-all duration-200 
                  ${
                    isEditing
                      ? 'bg-gray-100 cursor-not-allowed'
                      : 'focus:border-purple-500 focus:ring-4 focus:ring-purple-100 hover:border-blue-400 hover:bg-blue-50'
                  }
                `}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 font-semibold text-gray-700 text-sm">
              Work Location
            </label>
            <label
              className={`flex items-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-lg transition-all duration-200 group ${
                isEditing
                  ? 'bg-gray-100 cursor-not-allowed'
                  : 'cursor-pointer hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              <input
                type="checkbox"
                onChange={handleChange('isRemote')}
                checked={values.isRemote}
                disabled={isEditing} // Disable when editing
                className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-400 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏠</span>
                <span className="font-medium text-gray-700">
                  {isEditing ? (
                    <del>Remote / Work from home only</del>
                  ) : (
                    'Remote / Work from home only'
                  )}
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Employment Types (Disabled on Edit) */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 font-semibold text-gray-700 text-sm">
            Employment Types *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                value: 'Full-time',
                icon: '💼',
                desc: 'Standard 40-hour work week',
                color: 'purple',
              },
              {
                value: 'Contractor',
                icon: '🤝',
                desc: 'Project-based work',
                color: 'purple',
              },
              {
                value: 'Part-time',
                icon: '⏰',
                desc: 'Flexible hours, less than full-time',
                color: 'purple',
              },
              {
                value: 'Internship',
                icon: '🎓',
                desc: 'Learning-focused positions',
                color: 'purple',
              },
            ].map((type) => (
              <label
                key={type.value}
                className={`relative p-4 border-2 rounded-lg transition-all duration-200 ${
                  values.employmentTypes.includes(type.value)
                    ? `border-${type.color}-500 bg-${type.color}-50 shadow-md`
                    : 'border-gray-200'
                } ${
                  isEditing
                    ? 'cursor-not-allowed opacity-70'
                    : 'cursor-pointer   hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <input
                  type="checkbox"
                  value={type.value}
                  onChange={handleCheckboxChange}
                  checked={values.employmentTypes.includes(type.value)}
                  disabled={isEditing} // Disable when editing
                  className="sr-only"
                />
                {/* ... content of the label ... */}
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{type.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 mb-1">
                      {type.value}
                    </div>
                    <div className="text-sm text-gray-600">{type.desc}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* ... Navigation remains the same ... */}
        <div className="flex items-center justify-between pt-6 border-t-2 border-gray-100">
          <button
            onClick={prevStep}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all duration-200 hover:scale-105"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
          <button
            onClick={nextStep}
            disabled={!canProceed}
            className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all duration-200 ${
              canProceed
                ? 'bg-buttonPrimary hover:from-purple-700 hover:to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Next Step
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step1AgentConfig;
