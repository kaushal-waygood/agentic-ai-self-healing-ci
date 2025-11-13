import apiInstance from '@/services/api';
import { ArrowLeft, ArrowRight, UploadCloud } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

const Step2ChooseCV = ({
  nextStep,
  prevStep,
  handleFileChange,
  values = {},
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const fetchCvs = async () => {
      setLoading(true);
      try {
        const response = await apiInstance.get('/students/resume/saved');
        if (!cancelled) setCvs(response.data?.html || []);
      } catch (err) {
        console.error('Failed to fetch CVs:', err);
        if (!cancelled) setCvs([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchCvs();
    return () => {
      cancelled = true;
    };
  }, []);

  // Drag handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer?.files;
    if (files && files[0]) {
      // notify parent then advance step
      handleFileChange({ target: { files } });
      nextStep();
    }
  };

  // When user picks a file via input
  const onSelectFile = (e) => {
    const files = e.target.files;
    handleFileChange(e);
    if (files && files[0]) {
      nextStep();
    }
  };

  // When user selects a saved CV from the list
  const onSelectSavedCv = (cv) => {
    // Create a lightweight "file-like" object so parent can handle saved CVs similarly to uploaded files.
    // We attach a custom marker __savedCvId so backend can detect it if needed.
    const fakeFile = {
      name: cv.htmlCVTitle || 'Saved CV',
      size: 0,
      type: 'text/html',
      __savedCvId: cv._id ?? cv.id ?? null,
    };
    // Pass to parent
    handleFileChange({ target: { files: [fakeFile] } });
    // Immediately go to next step
    nextStep();
  };

  const formattedSize = (size) => {
    if (!size && size !== 0) return '';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white px-6 py-4 rounded-lg shadow-lg mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center font-bold">
            2
          </div>
          <h2 className="text-2xl font-bold">Choose Your Master CV</h2>
        </div>
        <p className="text-white/90 mt-2">
          Select a saved CV or upload a new one. Selecting will advance to the
          next step.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow py-4 px-6 border border-gray-100">
        {/* Saved CVs */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-gray-700">Saved CVs</div>
            <div className="text-xs text-gray-500">
              {loading ? 'Loading...' : `${cvs.length} available`}
            </div>
          </div>

          <div className="max-h-56 overflow-auto space-y-2">
            {loading ? (
              <div className="py-8 text-center text-slate-500">
                Loading saved CVs...
              </div>
            ) : cvs.length === 0 ? (
              <div className="py-8 text-center text-slate-500 border-2 border-dashed rounded-md p-6 bg-blue-50">
                <div className="font-medium mb-1">No saved CVs</div>
                <div className="text-xs text-slate-400">
                  Upload one below or create with the AI assistant
                </div>
              </div>
            ) : (
              <ul className="space-y-2">
                {cvs.map((cv, idx) => (
                  <li
                    key={cv._id ?? idx}
                    role="button"
                    value={cvs.htmlCVTitle || 'Untitled CV'}
                    tabIndex={0}
                    onClick={() => onSelectSavedCv(cv)}
                    onKeyDown={(e) =>
                      e.key === 'Enter' ? onSelectSavedCv(cv) : null
                    }
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-blue-50 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-blue-50 rounded-md flex items-center justify-center text-blue-600 font-medium">
                        CV
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-800 truncate">
                          {cv.htmlCVTitle || 'Untitled CV'}
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                          {cv.createdAt || 'Saved'}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">Select</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-slate-500">OR</span>
          </div>
        </div>

        {/* Upload area */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`p-4 rounded-md text-center transition ${
            dragActive
              ? 'border-2 border-indigo-400 bg-indigo-50'
              : 'border-2 border-dashed border-gray-200'
          }`}
        >
          <input
            ref={inputRef}
            id="cv-upload"
            type="file"
            accept=".pdf,.doc,.docx,.png,.jpg"
            onChange={onSelectFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white shadow-sm"
          >
            <UploadCloud className="w-4 h-4" />
            Browse or drop file
          </button>

          {values?.cvFile ? (
            <div className="mt-3 flex items-center justify-center gap-4">
              <div className="text-sm">
                <div className="font-medium text-slate-800 truncate">
                  {values.cvFile.name}
                </div>
                <div className="text-xs text-slate-400">
                  {formattedSize(values.cvFile.size)}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleFileChange({ target: { files: [] } });
                }}
                className="text-sm text-red-600"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="mt-3 text-xs text-slate-500">
              PDF, DOC, DOCX, PNG, JPG
            </div>
          )}
        </div>

        {/* CTA */}
        {/* <div className="mt-4">
          <button
            type="button"
            onClick={() => {
              nextStep();
            }}
            className="w-full px-4 py-3 rounded-md bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white font-semibold"
          >
            Create / Use Selected CV
          </button>
        </div> */}

        {/* Footer nav */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <button
            onClick={prevStep}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all duration-200 
              bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105
                "
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step2ChooseCV;

/* helper */
function formattedSize(size) {
  if (size === undefined || size === null) return '';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}
