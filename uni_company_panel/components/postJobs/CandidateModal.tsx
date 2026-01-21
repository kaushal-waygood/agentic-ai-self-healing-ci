import React from 'react';
import { X } from 'lucide-react'; // Optional: Install lucide-react for icons
import { Button } from '../ui/button';

const CandidateModal = ({ candidate, onClose }) => {
  if (!candidate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Candidate Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase">
                Full Name
              </label>
              <p className="text-gray-900 font-medium">
                {candidate.student?.fullName}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase">
                Status
              </label>
              <p className="mt-1">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                  {candidate.status}
                </span>
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase">
                Email
              </label>
              <p className="text-gray-600">{candidate.student?.email}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase">
                Phone
              </label>
              <p className="text-gray-600">
                {candidate.student?.phone || 'N/A'}
              </p>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase">
              Application Summary
            </label>
            <p className="mt-2 text-gray-700 text-sm leading-relaxed">
              Applied via <strong>{candidate.applicationMethod}</strong> on{' '}
              {new Date(candidate.appliedAt).toLocaleDateString()}.
            </p>
          </div>

          {/* Add more fields here based on your candidate schema, e.g., experience, education */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase">
              Resume/CV
            </label>
            <div className="mt-2">
              <a
                href={candidate.cvLink}
                target="_blank"
                className="inline-flex items-center text-sm text-indigo-600 hover:underline font-medium"
              >
                View Attachment &rarr;
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button className="bg-indigo-600 text-white">
            Shortlist Candidate
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CandidateModal;
