import React, { useEffect, useState } from 'react';
import apiInstance from '@/services/api';
import { Clock, FileText } from 'lucide-react';

const Step3CoverLetter = ({
  nextStep,
  prevStep,
  handleChange,
  values,
  handleSubmit,
}) => {
  const [coverLetters, setCoverLetters] = useState([]);
  const [stats, setStats] = useState({ coverLettersCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoverLetters = async () => {
      try {
        setLoading(true);
        const response = await apiInstance.get('/students/letter/saved');

        setCoverLetters(response.data.html || []);
        setStats((prev) => ({
          ...prev,
          coverLettersCount: response.data.html?.length || 0,
        }));
      } catch (error) {
        console.error('Failed to fetch cover letters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoverLetters();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 animate-fade-in">
      {/* header  */}
      <div className="bg-header-gradient-primary text-white px-6 py-4 rounded-lg shadow-lg mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center font-bold">
            3
          </div>
          <h2 className="text-2xl font-bold">Set Cover Letter Strategy</h2>
        </div>
        <p className="text-white/90 ">
          Choose how you want to handle your cover letter (optional).
        </p>
      </div>
      <div className="form-card">
        <label>Cover Letter Strategy</label>

        <div className="flex flex-col gap-4 border-black">
          {/* Option 1: Generate new letter */}
          <label
            className={`strategy-option  ${
              values.coverLetterStrategy === 'generate'
                ? 'border-blue-500 border-2 bg-blue-50'
                : ''
            }`}
          >
            <input
              type="radio"
              name="strategy"
              value="generate"
              checked={values.coverLetterStrategy === 'generate'}
              onChange={handleChange('coverLetterStrategy')}
            />
            <h1 className="text-md font-semibold">Generate from scratch</h1>
            <p className="text-sm font-normal">
              AI will create a unique letter tailored to each job.
            </p>
          </label>

          {/* Option 2: Use saved template */}
          <label
            className={`strategy-option ${
              values.coverLetterStrategy === 'template'
                ? 'border-blue-500 border-2 bg-blue-50'
                : ''
            }`}
          >
            <input
              type="radio"
              name="strategy"
              value="template"
              checked={values.coverLetterStrategy === 'template'}
              onChange={handleChange('coverLetterStrategy')}
            />
            <h2 className="text-md font-semibold">Use a saved Cover Letter</h2>
            <p className="text-sm font-normal">
              Start with a saved letter and let AI optimize it for each
              application.
            </p>
          </label>
        </div>

        {/* Show cover letter list when template is selected */}
        {values.coverLetterStrategy === 'template' && (
          <div className="saved-letters  ">
            <h4 className="text-lg font-semibold mb-2">
              Your Saved Cover Letters
            </h4>
            {loading ? (
              <p>Loading saved letters...</p>
            ) : coverLetters.length > 0 ? (
              <div className="max-h-[35vh] overflow-y-auto grid grid-cols-1 gap-2">
                {coverLetters.map((cl) => (
                  <button
                    key={cl._id}
                    onClick={() =>
                      handleChange('savedClId')({
                        target: { value: cl._id },
                      })
                    }
                    className={`p-3 border rounded-lg text-left transition ${
                      values.savedClId === cl._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center flex-row gap-3 mb-2">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          values.savedClId === cl._id
                            ? 'border-cyan-500 bg-cyan-500'
                            : 'border-slate-300'
                        }`}
                      >
                        {values.savedClId === cl._id && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <FileText className="w-4 h-4 text-slate-500" />

                      <div>
                        <div className="font-medium">
                          {cl.coverLetterTitle?.slice(0, 50) || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {cl.updatedAt && (
                            <div className="text-sm text-slate-500 flex  items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>
                                {new Date(cl.updatedAt).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No saved cover letters found.</p>
            )}
          </div>
        )}

        <div className="form-group mt-4">
          <label>Specific Instructions (Optional)</label>
          <textarea
            placeholder="e.g. Always mention my passion for sustainable technology."
            onChange={handleChange('coverLetterInstructions')}
            defaultValue={values.coverLetterInstructions}
            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-400"
          ></textarea>
        </div>

        <div className="form-navigation mt-6 flex justify-between">
          <button
            className="back-btn px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
            onClick={prevStep}
          >
            ← Back
          </button>
          <button
            className="flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all duration-200 
             bg-buttonPrimary hover:to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105
                "
            // onClick={nextStep}
            onClick={() => {
              handleSubmit();
              // nextStep();
            }}
          >
            Next: Final Config →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step3CoverLetter;
