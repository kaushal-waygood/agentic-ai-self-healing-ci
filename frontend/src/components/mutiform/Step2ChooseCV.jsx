import apiInstance from '@/services/api';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Sparkles,
  UploadCloud,
  User,
  X,
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGeneratedCVsRequest } from '../../redux/reducers/aiReducer';

const Step2ChooseCV = ({
  nextStep,
  prevStep,
  handleFileChange,
  handleCvOptionChange,
  handleSelectedCvChange,
  values = {},
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [savedCvs, setSavedCvs] = useState([]);
  const [loadingSavedCvs, setLoadingSavedCvs] = useState(true);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const dispatch = useDispatch();
  const { generatedCVs, loading: aiLoading } = useSelector((state) => state.ai);

  const isUsingProfile = values?.cvOption === 'current_profile';
  const isUsingUploadedPdf = values?.cvOption === 'uploaded_pdf';
  const isUsingSelectedCv = values?.cvOption === 'saved_cv';
  const hasUploadedFile = values?.cvFile instanceof File;
  const hasSelectedCv = Boolean(values?.selectedCVId);
  const hasSelection =
    isUsingProfile || (isUsingUploadedPdf && hasUploadedFile) || hasSelectedCv;

  useEffect(() => {
    let cancelled = false;

    const fetchSavedCvs = async () => {
      setLoadingSavedCvs(true);
      try {
        const response = await apiInstance.get('/students/resume/saved');
        if (!cancelled) {
          setSavedCvs(response.data?.html || []);
        }
      } catch (fetchError) {
        console.error('Failed to fetch saved CVs:', fetchError);
        if (!cancelled) {
          setSavedCvs([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingSavedCvs(false);
        }
      }
    };

    fetchSavedCvs();
    dispatch(fetchGeneratedCVsRequest());

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  const existingCvs = useMemo(() => {
    const saved = savedCvs.map((cv) => ({
      id: cv._id,
      title: cv.htmlCVTitle || 'Saved CV',
      createdAt: cv.createdAt,
      source: 'saved',
      badge: 'Saved',
    }));

    const generated = (generatedCVs || [])
      .filter((cv) => cv?.status === 'completed')
      .map((cv) => ({
        id: cv._id,
        title: cv.cvTitle || 'Generated CV',
        createdAt: cv.createdAt,
        source: 'generated',
        badge: 'Generated',
      }));

    return [...generated, ...saved].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
    );
  }, [generatedCVs, savedCvs]);

  const validateFile = (file) => {
    if (!file) return false;

    const fileName = file.name.toLowerCase();
    const isPdf =
      file.type === 'application/pdf' || fileName.endsWith('.pdf');

    if (!isPdf) {
      setError('Only PDF CVs are supported for AI Auto Application.');
      return false;
    }

    setError(null);
    return true;
  };

  const selectProfile = () => {
    setError(null);
    handleCvOptionChange('current_profile');
  };

  const selectExistingCv = (cv) => {
    setError(null);
    handleSelectedCvChange(cv);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    }

    if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer?.files;
    if (files && files[0] && validateFile(files[0])) {
      handleFileChange({ target: { files } });
    }
  };

  const onSelectFile = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      if (validateFile(files[0])) {
        handleFileChange(e);
      } else {
        e.target.value = '';
      }
    }
  };

  const removeUploadedFile = (e) => {
    e.preventDefault();
    handleFileChange({ target: { files: [] } });
    handleCvOptionChange('current_profile');
    if (inputRef.current) inputRef.current.value = '';
  };

  const selectedSummary = hasUploadedFile
    ? values.cvFile.name
    : hasSelectedCv
      ? values.selectedCVTitle
      : 'Use My Profile';

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 animate-fade-in">
      <div className="bg-header-gradient-primary text-white px-6 py-4 rounded-lg shadow-lg mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center font-bold">
            2
          </div>
          <h2 className="text-2xl font-bold">Choose Your CV Source</h2>
        </div>
        <p className="text-white/90">
          Use your profile, upload a PDF CV, or select one of your existing
          saved or generated CVs.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow py-4 px-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={selectProfile}
            className={`relative text-left border rounded-xl p-5 transition-all ${
              isUsingProfile
                ? 'border-blue-500 bg-blue-50 shadow-sm'
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/40'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-base font-semibold text-slate-900">
                    Use My Profile
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    Fastest option. We use your current profile details as the
                    base for job matching and tailored docs.
                  </div>
                </div>
              </div>
              {isUsingProfile && (
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
              )}
            </div>
          </button>

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border rounded-xl p-5 transition-all ${
              isUsingUploadedPdf || dragActive || hasUploadedFile
                ? 'border-indigo-400 bg-indigo-50'
                : 'border-gray-200 border-dashed'
            }`}
          >
            <input
              ref={inputRef}
              id="cv-upload"
              type="file"
              accept=".pdf,application/pdf"
              onChange={onSelectFile}
              className="hidden"
            />

            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-base font-semibold text-slate-900">
                  Upload CV PDF
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  Use a dedicated PDF CV if you want a different resume context
                  for this agent.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-buttonPrimary text-white shadow-sm"
            >
              <UploadCloud className="w-4 h-4" />
              Browse PDF
            </button>

            {hasUploadedFile ? (
              <div className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">
                    {values.cvFile.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    PDF selected for this agent
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeUploadedFile}
                  className="text-sm text-red-600 shrink-0"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="mt-4 text-xs text-slate-500">
                PDF only, up to 5 MB
              </div>
            )}
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-gray-700">
              Saved And Generated CVs
            </div>
            <div className="text-xs text-gray-500">
              {loadingSavedCvs || aiLoading
                ? 'Loading...'
                : `${existingCvs.length} available`}
            </div>
          </div>

          <div className="max-h-64 overflow-auto space-y-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            {loadingSavedCvs || aiLoading ? (
              <div className="py-8 text-center text-slate-500">
                Loading available CVs...
              </div>
            ) : existingCvs.length === 0 ? (
              <div className="py-8 text-center text-slate-500">
                No saved or generated CVs found yet.
              </div>
            ) : (
              existingCvs.map((cv) => {
                const isSelected =
                  isUsingSelectedCv &&
                  values?.selectedCVId === cv.id &&
                  values?.selectedCVSource === cv.source;

                return (
                  <button
                    key={`${cv.source}-${cv.id}`}
                    type="button"
                    onClick={() => selectExistingCv(cv)}
                    className={`w-full text-left rounded-xl border p-3 transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                        : 'border-white bg-white hover:border-emerald-200 hover:bg-emerald-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                            cv.source === 'generated'
                              ? 'bg-violet-100 text-violet-600'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {cv.source === 'generated' ? (
                            <Sparkles className="w-5 h-5" />
                          ) : (
                            <FileText className="w-5 h-5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-slate-800 truncate">
                            {cv.title}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {cv.createdAt
                              ? new Date(cv.createdAt).toLocaleString()
                              : 'Saved'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[11px] px-2 py-1 rounded-full font-medium ${
                            cv.source === 'generated'
                              ? 'bg-violet-100 text-violet-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {cv.badge}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md flex items-center justify-between animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
            <button type="button" onClick={() => setError(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="mt-5 rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-600">
          <span>
            Selected source: <strong>{selectedSummary}</strong>
          </span>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <button
            type="button"
            onClick={prevStep}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <button
            type="button"
            onClick={nextStep}
            disabled={!hasSelection}
            className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all ${
              hasSelection
                ? 'bg-buttonPrimary text-white shadow-lg hover:scale-105'
                : 'bg-gray-300 text-gray-500'
            }`}
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step2ChooseCV;
