import React from 'react';
import { X } from 'lucide-react';

const AgentPreviewModal = ({ formData, onCancel, onConfirm }) => {
  const {
    agentName,
    jobTitle,
    country,
    isRemote,
    employmentTypes,
    coverLetterStrategy,
    coverLetterInstructions,
    maxApplications,
  } = formData;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 text-slate-500 hover:text-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold text-slate-800 mb-4">
          Preview Agent Details
        </h2>

        <div className="space-y-2 text-sm text-slate-700">
          <Row label="Agent Name" value={agentName} />
          <Row label="Job Title" value={jobTitle} />
          <Row label="Country" value={country} />
          <Row label="Remote" value={isRemote ? 'Yes' : 'No'} />
          <Row
            label="Employment Types"
            value={
              employmentTypes?.length
                ? employmentTypes.join(', ')
                : 'Not specified'
            }
          />
          <Row label="Max Applications" value={maxApplications} />
          <Row label="Cover Letter Mode" value={coverLetterStrategy} />
          {coverLetterInstructions && (
            <Row
              label="Custom Instructions"
              value={coverLetterInstructions}
              multi
            />
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md border text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Confirm & Save
          </button>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value, multi }) => (
  <div className="flex flex-col border-b pb-2 mb-2">
    <span className="text-xs text-slate-400">{label}</span>
    <span
      className={`text-sm ${
        multi ? 'whitespace-pre-line' : 'truncate'
      } text-slate-800`}
    >
      {value || '—'}
    </span>
  </div>
);

export default AgentPreviewModal;
