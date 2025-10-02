import React from 'react';

const Step3CoverLetter = ({ nextStep, prevStep, handleChange, values }) => {
  return (
    <div className="form-step">
      <div className="step-header">
        <h2>Step 3: Set Cover Letter Strategy</h2>
        <p>Choose how you want to handle your cover letter (optional).</p>
      </div>
      <div className="form-card">
        <label>Cover Letter Strategy</label>
        <div className="strategy-options">
          <label
            className={`strategy-option ${
              values.coverLetterStrategy === 'generate' ? 'selected' : ''
            }`}
          >
            <input
              type="radio"
              name="strategy"
              value="generate"
              checked={values.coverLetterStrategy === 'generate'}
              onChange={handleChange('coverLetterStrategy')}
            />
            <strong>Generate from scratch</strong>
            <small>AI will create a unique letter tailored to each job.</small>
          </label>
          <label
            className={`strategy-option ${
              values.coverLetterStrategy === 'template' ? 'selected' : ''
            }`}
          >
            <input
              type="radio"
              name="strategy"
              value="template"
              checked={values.coverLetterStrategy === 'template'}
              onChange={handleChange('coverLetterStrategy')}
            />
            <strong>Use a saved template</strong>
            <small>
              Start with a saved letter and let AI optimize it for each
              application.
            </small>
          </label>
        </div>

        <div className="form-group">
          <label>Specific Instructions (Optional)</label>
          <textarea
            placeholder="e.g. Always mention my passion for sustainable technology."
            onChange={handleChange('coverLetterInstructions')}
            defaultValue={values.coverLetterInstructions}
          ></textarea>
        </div>
        <div className="form-navigation">
          <button className="back-btn" onClick={prevStep}>
            ← Back
          </button>
          <button className="next-btn" onClick={nextStep}>
            Next: Final Config →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step3CoverLetter;
