'use client';

import React from 'react';
import { FileText, ArrowLeft, Loader2 } from 'lucide-react';
import Image from 'next/image';

const FileSummary = ({ label, choice, savedItem, file, colorClass }: any) => (
  <div className={`p-3 rounded-lg border ${colorClass} flex items-center mb-3`}>
    <div className="bg-white p-2 rounded-full shadow-sm mr-3">
      <FileText className="w-4 h-4 text-gray-600" />
    </div>
    <div className="flex-1 overflow-hidden">
      <p className="text-xs text-gray-500 uppercase font-semibold">{label}</p>
      <p className="text-sm font-medium text-gray-800 truncate">
        {choice === 'saved'
          ? savedItem?.htmlCVTitle || savedItem?.title || 'Saved File' // Added fallback for .title
          : file?.name || 'No file uploaded'}
      </p>
    </div>
  </div>
);

export const ReviewAndApply = ({
  job,
  resumeChoice,
  selectedResume,
  isApplying,
  cvFile,
  coverLetterChoice,
  selectedCoverLetter,
  clFile,
  onBack,
  handleApply,
  answers,
  handleAnswerChange,
}: any) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* --- POPUP LOADER MODAL --- */}
      {isApplying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
            <div className="relative">
              <Loader2 className="w-20 h-20 text-blue-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                {/* <div className="w-2 h-2 bg-blue-600 rounded-full"></div> */}

                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8 "
                />
              </div>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Submitting Application
            </h3>
            <p className="mt-2 text-sm text-gray-500 text-center">
              Please wait while we upload your documents and send your
              application to the employer.
            </p>
          </div>
        </div>
      )}
      {/* Resume + Cover Letter */}
      <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
        <FileSummary
          label="Resume"
          choice={resumeChoice}
          savedItem={selectedResume}
          file={cvFile}
          colorClass="border-blue-200 bg-blue-50"
        />
        <FileSummary
          label="Cover Letter"
          choice={coverLetterChoice}
          savedItem={selectedCoverLetter}
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
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                )}{' '}
                {q.type === 'number' && (
                  <input
                    type="number"
                    value={answers[q._id] || ''}
                    onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                    placeholder="Your answer"
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            className="flex-[2] flex items-center justify-center rounded-xl px-6 py-3 text-white font-medium bg-buttonPrimary hover:bg-blue-600"
          >
            {isApplying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Confirm & Apply'
            )}
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
