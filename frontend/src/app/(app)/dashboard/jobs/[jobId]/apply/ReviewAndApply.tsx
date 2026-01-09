import React, { useState } from 'react';
import { FileText, ArrowLeft } from 'lucide-react';
import apiInstance from '@/services/api';

const FileSummary = ({ label, choice, savedItem, file, colorClass }: any) => (
  <div className={`p-3 rounded-lg border ${colorClass} flex items-center mb-3`}>
    <div className="bg-white p-2 rounded-full shadow-sm mr-3">
      <FileText className="w-4 h-4 text-gray-600" />
    </div>
    <div className="flex-1 overflow-hidden">
      <p className="text-xs text-gray-500 uppercase font-semibold">{label}</p>
      <p className="text-sm font-medium text-gray-800 truncate">
        {choice === 'saved'
          ? savedItem?.htmlCVTitle || 'Saved File'
          : file?.name || 'No file uploaded'}
      </p>
    </div>
  </div>
);

export const ReviewAndApply = ({
  job,
  resumeChoice,
  selectedResume,
  cvFile,
  coverLetterChoice,
  clFile,
  onBack,
}: any) => {
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const handleAnswerChange = (id: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleApply = async () => {
    try {
      const payload = {
        answers,
        cvLink: cvFile ? 'UPLOADED_RESUME_URL' : null,
        coverLetterLink: clFile ? 'UPLOADED_CL_URL' : null,
      };

      const response = await apiInstance.post(
        `/jobs/${job._id}/apply`,
        payload,
      );

      console.log('Applied:', response.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-xl font-semibold text-gray-900">
        Step 2: Review & Apply
      </h2>

      {/* Resume + Cover Letter */}
      <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
        <FileSummary
          label="Resume"
          choice={resumeChoice}
          savedItem={selectedResume}
          file={cvFile}
          colorClass="border-purple-200 bg-purple-50"
        />
        <FileSummary
          label="Cover Letter"
          choice={coverLetterChoice}
          savedItem={{ htmlCVTitle: 'Default Cover Letter' }}
          file={clFile}
          colorClass="border-blue-200 bg-blue-50"
        />
      </div>

      {/* Screening Questions */}
      {job?.screeningQuestions?.length > 0 && (
        <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase">
            Screening Questions
          </h3>

          <div className="space-y-4">
            {job.screeningQuestions.map((q: any, index: number) => (
              <div
                key={q._id}
                className="p-4 rounded-lg border border-gray-200 bg-gray-50"
              >
                <p className="text-sm font-medium text-gray-800">
                  {index + 1}. {q.question}
                </p>

                {/* TEXT */}
                {q.type === 'text' && (
                  <input
                    type="text"
                    value={answers[q._id] || ''}
                    onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                    placeholder="Your answer"
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                )}

                {/* BOOLEAN */}
                {q.type === 'boolean' && (
                  <div className="mt-2 flex gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="radio"
                        name={q._id}
                        checked={answers[q._id] === true}
                        onChange={() => handleAnswerChange(q._id, true)}
                      />
                      Yes
                    </label>

                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="radio"
                        name={q._id}
                        checked={answers[q._id] === false}
                        onChange={() => handleAnswerChange(q._id, false)}
                      />
                      No
                    </label>
                  </div>
                )}

                {q.required && (
                  <p className="mt-1 text-xs text-red-500">Required</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 flex items-center justify-center rounded-xl px-4 py-3 text-gray-700 bg-white border border-gray-300"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>

        {job.applyMethod?.method === 'EMAIL' ? (
          <button
            onClick={handleApply}
            className="flex-[2] flex items-center justify-center rounded-xl px-6 py-3 text-white font-medium bg-purple-600"
          >
            Confirm & Apply
          </button>
        ) : (
          <a
            href={job.applyMethod?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-[2] flex items-center justify-center rounded-xl px-6 py-3 text-white font-medium bg-blue-600"
          >
            Go to Company Website
          </a>
        )}
      </div>
    </div>
  );
};
