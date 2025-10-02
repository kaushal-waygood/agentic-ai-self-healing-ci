import React from 'react';

const Step1AgentConfig = ({
  nextStep,
  prevStep,
  handleChange,
  handleCheckboxChange,
  values,
}) => {
  // Basic validation check
  const canProceed =
    values.agentName &&
    values.jobTitle &&
    values.country &&
    values.employmentTypes.length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      {/* Step Header with gradient */}
      <div className="relative bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 rounded-2xl p-8 mb-6 text-white shadow-xl overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center font-bold text-xl">
              1
            </div>
            <h2 className="text-3xl font-bold">Agent Configuration</h2>
          </div>
          <p className="text-white/90 ml-13">
            Define your agent's name and job search criteria
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100">
        {/* Agent Identity */}
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
              defaultValue={values.agentName}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 outline-none placeholder-gray-400"
            />
            {values.agentName && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Job Title */}
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
              defaultValue={values.jobTitle}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all duration-200 outline-none placeholder-gray-400"
            />
            {values.jobTitle && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Country and Remote Toggle */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 font-semibold text-gray-700 text-sm">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              Country *
            </label>
            <div className="relative">
              <select
                onChange={handleChange('country')}
                defaultValue={values.country}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200 outline-none appearance-none bg-white cursor-pointer"
              >
                <option value="">Select a country</option>
                <option value="USA">🇺🇸 United States</option>
                <option value="Canada">🇨🇦 Canada</option>
                <option value="UK">🇬🇧 United Kingdom</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 font-semibold text-gray-700 text-sm">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Work Location
            </label>
            <label className="flex items-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group">
              <input
                type="checkbox"
                onChange={handleChange('isRemote')}
                checked={values.isRemote}
                className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-400 cursor-pointer"
              />
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏠</span>
                <span className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                  Remote / Work from home only
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Employment Types */}
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
                className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  values.employmentTypes.includes(type.value)
                    ? `border-${type.color}-500 bg-${type.color}-50 shadow-md`
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <input
                  type="checkbox"
                  value={type.value}
                  onChange={handleCheckboxChange}
                  checked={values.employmentTypes.includes(type.value)}
                  className="sr-only"
                />
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{type.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 mb-1">
                      {type.value}
                    </div>
                    <div className="text-sm text-gray-600">{type.desc}</div>
                  </div>
                  {values.employmentTypes.includes(type.value) && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full p-1">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation */}
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

          <div className="flex items-center gap-4">
            {!canProceed && (
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-lg animate-pulse">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium">
                  Complete required fields
                </span>
              </div>
            )}
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

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Step1AgentConfig;
