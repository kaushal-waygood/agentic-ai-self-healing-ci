import React from 'react';

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
    <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      {/* ... Header remains the same ... */}
      <div className="relative bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 rounded-2xl p-8 mb-6 text-white shadow-xl overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
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
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100">
        {/* Agent Identity (Editable) */}
        <div className="space-y-2 group">
          <label className="flex items-center gap-2 font-semibold text-gray-700 text-sm">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            Agent Identity *
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. Senior Product Manager Hunter"
              onChange={handleChange('agentName')}
              value={values.agentName} // Use value for controlled component
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 outline-none"
            />
          </div>
        </div>

        {/* Job Title (Disabled on Edit) */}
        <div className="space-y-2 group">
          <label className="flex items-center gap-2 font-semibold text-gray-700 text-sm">
            <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
            Job Title / Keywords *
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. Senior Product Manager, Product Owner"
              onChange={handleChange('jobTitle')}
              value={values.jobTitle}
              disabled={isEditing} // Disable when editing
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl transition-all duration-200 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Country and Remote Toggle (Disabled on Edit) */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 font-semibold text-gray-700 text-sm">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              Country *
            </label>
            <div className="relative">
              <select
                onChange={handleChange('country')}
                value={values.country}
                disabled={isEditing} // Disable when editing
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none appearance-none bg-white cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select a country</option>
                <option value="USA">🇺🇸 United States</option>
                <option value="Canada">🇨🇦 Canada</option>
                <option value="UK">🇬🇧 United Kingdom</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 font-semibold text-gray-700 text-sm">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Work Location
            </label>
            <label
              className={`flex items-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl transition-all duration-200 group ${
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
            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
            Employment Types *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                value: 'Full-time',
                icon: '💼',
                desc: 'Standard 40-hour work week',
                color: 'indigo',
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
                color: 'pink',
              },
              {
                value: 'Internship',
                icon: '🎓',
                desc: 'Learning-focused positions',
                color: 'orange',
              },
            ].map((type) => (
              <label
                key={type.value}
                className={`relative p-4 border-2 rounded-xl transition-all duration-200 ${
                  values.employmentTypes.includes(type.value)
                    ? `border-${type.color}-500 bg-${type.color}-50 shadow-md`
                    : 'border-gray-200'
                } ${
                  isEditing
                    ? 'cursor-not-allowed opacity-70'
                    : 'cursor-pointer hover:border-gray-300 hover:shadow-sm'
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
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 hover:scale-105"
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
            className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all duration-200 ${
              canProceed
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
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
