import React from 'react';

const Step4ConfigureSave = ({
  prevStep,
  handleChange,
  nextStep,
  handleSubmit,
  values,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 animate-fade-in">
      {/* header  */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white px-6 py-4 rounded-lg shadow-lg mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center font-bold">
            4
          </div>
          <h2 className="text-2xl font-bold">Configure and Save</h2>
        </div>
        <p className="text-white/90 mt-2">
          Set the final parameters before launching your application agent.{' '}
        </p>
      </div>
      <div className="form-card">
        <div className="form-group ">
          <label>Max Applications to Prepare per Day *</label>
          <input
            type="number"
            min="1"
            // diabled
            disabled
            max="8"
            onChange={handleChange('maxApplications')}
            defaultValue={values.maxApplications}
          />
          <small>
            Your plan supports up to 8 applications per day. The agent will stop
            once this limit is reached. Must be at least 1.
          </small>
        </div>
        <div className="form-navigation">
          <button
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all duration-200 hover:scale-105"
            onClick={prevStep}
          >
            ← Back
          </button>
          <button
            className="flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all duration-200 
              bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105
                "
            onClick={handleSubmit}
          >
            ✓ Save Agent Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step4ConfigureSave;
