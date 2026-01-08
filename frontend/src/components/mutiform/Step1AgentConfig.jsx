import React, { useEffect } from 'react';
import CountrySelector from '../common/CountrySelector';

const Step1AgentConfig = ({
  nextStep,
  prevStep,
  handleChange,
  handleCheckboxChange,
  updateKeywords, // <<< receives from parent
  values,
  isEditing,
}) => {
  const canProceed =
    values.agentName &&
    values.jobTitle &&
    values.country &&
    values.employmentTypes.length > 0;

  // ===================== Keyword Logic ===================== //
  const pushKeyword = () => {
    const text = values.keywordInput?.trim();
    if (!text) return;

    const updated = Array.from(new Set([...(values.keywords || []), text]));
    updateKeywords(updated);
    handleChange('keywordInput')({ target: { value: '' } });
  };

  const handleKeywordTyping = (e) => handleChange('keywordInput')(e);

  const handleKeywordKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      pushKeyword();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 animate-fade-in">
      {/* HEADER */}
      <div className="relative bg-header-gradient-primary rounded-lg px-6 py-4 mb-2 text-white shadow-xl overflow-hidden">
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center font-bold text-xl">
            1
          </div>
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

      {/* FORM */}
      <div className="bg-white rounded-lg shadow-xl p-8 space-y-4 border border-gray-100">
        {/* Agent Name */}
        <div className="space-y-2">
          <label className="font-semibold text-gray-700 text-sm">
            Agent Identity *
          </label>
          <input
            type="text"
            placeholder="e.g. Senior Product Manager Hunter"
            onChange={handleChange('agentName')}
            value={values.agentName}
            className="w-full px-4 py-3 border-2 rounded-lg"
          />
        </div>

        {/* Job Title */}
        <div className="space-y-2">
          <label className="font-semibold text-gray-700 text-sm">
            Target Job Title *
          </label>
          <input
            type="text"
            placeholder="Software Engineer / Backend Developer"
            onChange={handleChange('jobTitle')}
            value={values.jobTitle}
            disabled={isEditing}
            className="w-full px-4 py-3 border-2 rounded-lg outline-none focus:ring-purple-500"
          />
        </div>

        {/* Keywords */}
        <div className="space-y-2">
          <label className="font-semibold text-gray-700 text-sm">
            Keywords / Skills * (Enter or , to add)
          </label>

          <input
            type="text"
            placeholder="React, Node, Docker..."
            onChange={handleKeywordTyping}
            onKeyDown={handleKeywordKeyPress}
            value={values.keywordInput || ''}
            disabled={isEditing}
            className="w-full px-4 py-3 border-2 rounded-lg outline-none focus:ring-purple-500"
          />

          <div className="flex flex-wrap gap-2 mt-2">
            {values.keywords?.map((k, i) => (
              <span
                key={i}
                onClick={() =>
                  updateKeywords(values.keywords.filter((x) => x !== k))
                }
                className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-md font-semibold cursor-pointer flex items-center gap-1"
              >
                {k} ✕
              </span>
            ))}
          </div>
        </div>

        {/* Country + Remote */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="font-semibold text-gray-700 text-sm">
              Country *
            </label>
            <CountrySelector
              value={values.country}
              onChange={(code) =>
                handleChange('country')({ target: { value: code } })
              }
              disabled={isEditing}
            />
          </div>

          <label
            className={`flex items-center gap-3 p-3 border-2 rounded-lg ${
              isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
          >
            <input
              type="checkbox"
              onChange={handleChange('isRemote')}
              checked={values.isRemote}
              disabled={isEditing}
              className="w-5 h-5"
            />
            <span className="font-medium text-gray-700">Remote Only</span>
          </label>
        </div>

        {/* Employment Type */}
        <div>
          <label className="font-semibold text-gray-700 text-sm">
            Employment Types *
          </label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {['Full-time', 'Contractor', 'Part-time', 'Internship'].map(
              (type) => (
                <label
                  key={type}
                  className={`p-4 border-2 rounded-lg cursor-pointer 
                ${
                  values.employmentTypes.includes(type)
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200'
                }
                ${isEditing && 'cursor-not-allowed opacity-70'}`}
                >
                  <input
                    type="checkbox"
                    value={type}
                    onChange={handleCheckboxChange}
                    checked={values.employmentTypes.includes(type)}
                    disabled={isEditing}
                    className="sr-only"
                  />
                  {type}
                </label>
              ),
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t">
          <button
            onClick={prevStep}
            className="px-6 py-3 bg-gray-200 rounded-lg"
          >
            Back
          </button>
          <button
            onClick={nextStep}
            disabled={!canProceed}
            className={`px-6 py-3 rounded-lg ${
              canProceed ? 'bg-purple-600 text-white' : 'bg-gray-300'
            }`}
          >
            Next Step
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step1AgentConfig;
