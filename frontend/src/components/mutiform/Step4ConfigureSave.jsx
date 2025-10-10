import React from 'react';

const Step4ConfigureSave = ({
  prevStep,
  handleChange,
  handleSubmit,
  values,
}) => {
  return (
    <div className="form-step">
      <div className="step-header">
        <h2>Step 4: Configure and Save</h2>
        <p>Set the final parameters before launching your application agent.</p>
      </div>
      <div className="form-card">
        <div className="form-group">
          <label>Max Applications to Prepare per Day *</label>
          <input
            type="number"
            min="1"
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
          <button className="back-btn" onClick={prevStep}>
            ← Back
          </button>
          <button className="submit-btn" onClick={handleSubmit}>
            ✓ Save Agent Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step4ConfigureSave;
