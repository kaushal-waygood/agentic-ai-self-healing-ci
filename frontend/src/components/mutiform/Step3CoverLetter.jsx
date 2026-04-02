import React, { useEffect, useMemo, useState } from 'react';
import apiInstance from '@/services/api';
import { Clock, FileText, Sparkles } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGeneratedCLsRequest } from '../../redux/reducers/aiReducer';

const Step3CoverLetter = ({
  prevStep,
  values,
  handleSubmit,
  handleChange,
  handleCoverLetterStrategyChange,
  handleSelectedCoverLetterChange,
}) => {
  const [savedCoverLetters, setSavedCoverLetters] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const dispatch = useDispatch();
  const { generatedCLs, loading: aiLoading } = useSelector((state) => state.ai);

  useEffect(() => {
    let cancelled = false;

    const fetchCoverLetters = async () => {
      try {
        setLoadingSaved(true);
        const response = await apiInstance.get('/students/letter/saved');
        if (!cancelled) {
          setSavedCoverLetters(response.data.html || []);
        }
      } catch (error) {
        console.error('Failed to fetch cover letters:', error);
        if (!cancelled) {
          setSavedCoverLetters([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingSaved(false);
        }
      }
    };

    fetchCoverLetters();
    dispatch(fetchGeneratedCLsRequest());

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  const coverLetters = useMemo(() => {
    const saved = savedCoverLetters.map((cl) => ({
      id: cl._id,
      title: cl.coverLetterTitle || 'Saved cover letter',
      updatedAt: cl.updatedAt || cl.createdAt,
      source: 'saved',
      badge: 'Saved',
    }));

    const generated = (generatedCLs || [])
      .filter((cl) => cl?.status === 'completed')
      .map((cl) => ({
        id: cl._id,
        title: cl.clTitle || 'Generated cover letter',
        updatedAt: cl.updatedAt || cl.createdAt,
        source: 'generated',
        badge: 'Generated',
      }));

    return [...generated, ...saved].sort(
      (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0),
    );
  }, [generatedCLs, savedCoverLetters]);

  const loading = loadingSaved || aiLoading;
  const canProceed =
    values.coverLetterStrategy !== 'template' ||
    Boolean(values.selectedCoverLetterId);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 animate-fade-in">
      <div className="bg-header-gradient-primary text-white px-6 py-4 rounded-lg shadow-lg mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center font-bold">
            3
          </div>
          <h2 className="text-2xl font-bold">Set Cover Letter Strategy</h2>
        </div>
        <p className="text-white/90 ">
          Choose how you want to handle your cover letter.
        </p>
      </div>

      <div className="form-card">
        <label>Cover Letter Strategy</label>

        <div className="flex flex-col gap-4 border-black">
          <button
            type="button"
            onClick={() => handleCoverLetterStrategyChange('generate')}
            className={`strategy-option text-left ${
              values.coverLetterStrategy === 'generate'
                ? 'border-blue-500 border-2 bg-blue-50'
                : ''
            }`}
          >
            <h1 className="text-md font-semibold">Generate from scratch</h1>
            <p className="text-sm font-normal">
              AI will create a unique letter tailored to each job.
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleCoverLetterStrategyChange('template')}
            className={`strategy-option text-left ${
              values.coverLetterStrategy === 'template'
                ? 'border-blue-500 border-2 bg-blue-50'
                : ''
            }`}
          >
            <h2 className="text-md font-semibold">
              Use a saved or generated Cover Letter
            </h2>
            <p className="text-sm font-normal">
              Start with one of your existing letters and let AI adapt it for
              each application.
            </p>
          </button>
        </div>

        {values.coverLetterStrategy === 'template' && (
          <div className="saved-letters">
            <h4 className="text-lg font-semibold mb-2">
              Your Saved And Generated Cover Letters
            </h4>
            {loading ? (
              <p>Loading cover letters...</p>
            ) : coverLetters.length > 0 ? (
              <div className="max-h-[35vh] overflow-y-auto grid grid-cols-1 gap-2">
                {coverLetters.map((cl) => {
                  const isSelected =
                    values.selectedCoverLetterId === cl.id &&
                    values.selectedCoverLetterSource === cl.source;

                  return (
                    <button
                      key={`${cl.source}-${cl.id}`}
                      type="button"
                      onClick={() => handleSelectedCoverLetterChange(cl)}
                      className={`p-3 border rounded-lg text-left transition ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center flex-row justify-between gap-3 mb-2">
                        <div className="flex items-center flex-row gap-3 min-w-0">
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              isSelected
                                ? 'border-cyan-500 bg-cyan-500'
                                : 'border-slate-300'
                            }`}
                          >
                            {isSelected && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>

                          {cl.source === 'generated' ? (
                            <Sparkles className="w-4 h-4 text-violet-500 shrink-0" />
                          ) : (
                            <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                          )}

                          <div className="min-w-0">
                            <div className="font-medium truncate">
                              {cl.title}
                            </div>
                            <div className="text-sm text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>
                                {cl.updatedAt
                                  ? new Date(cl.updatedAt).toLocaleDateString()
                                  : 'Saved'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-[11px] px-2 py-1 rounded-full font-medium shrink-0 ${
                            cl.source === 'generated'
                              ? 'bg-violet-100 text-violet-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {cl.badge}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">
                No saved or generated cover letters found.
              </p>
            )}
          </div>
        )}

        <div className="form-group mt-4">
          <label>Specific Instructions (Optional)</label>
          <textarea
            placeholder="e.g. Always mention my passion for sustainable technology."
            onChange={handleChange('coverLetterInstructions')}
            value={values.coverLetterInstructions || ''}
            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-400"
          />
        </div>

        <div className="form-navigation mt-6 flex justify-between">
          <button
            className="back-btn px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
            onClick={prevStep}
          >
            ← Back
          </button>
          <button
            disabled={!canProceed}
            className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all duration-200 ${
              canProceed
                ? 'bg-buttonPrimary text-white shadow-lg hover:shadow-xl hover:scale-105'
                : 'bg-gray-300 text-gray-500'
            }`}
            onClick={() => {
              handleSubmit();
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
