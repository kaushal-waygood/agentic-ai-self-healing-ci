import React from 'react';
import { HelpCircle, Check, X } from 'lucide-react';

interface Question {
  _id: string;
  question: string;
  type: 'text' | 'boolean';
  required: boolean;
}

interface ApplicationQuestionsProps {
  questions: Question[];
  answers: Record<string, any>;
  setAnswers: (id: string, value: any) => void;
  onBack: () => void;
  onNext: () => void;
}

export const ApplicationQuestions = ({
  questions,
  answers,
  setAnswers,
  onBack,
  onNext,
}: ApplicationQuestionsProps) => {
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-gray-100 pb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Step 2: Additional Info
        </h2>
        <p className="text-gray-500 text-sm">
          Please answer the following questions to complete your application.
        </p>
      </div>

      <div className="space-y-6">
        {questions.map((q) => (
          <div
            key={q._id}
            className="p-5 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start mb-4">
              <div className="bg-purple-100 p-2 rounded-lg mr-3 mt-0.5">
                <HelpCircle className="w-4 h-4 text-purple-600" />
              </div>
              <label className="text-base font-semibold text-gray-800">
                {q.question}
                {q.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            </div>

            {/* Conditional Rendering based on type */}
            {q.type === 'text' ? (
              <input
                type="text"
                value={answers[q._id] || ''}
                onChange={(e) => setAnswers(q._id, e.target.value)}
                placeholder="Type your answer here..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-50 focus:outline-none transition-all"
              />
            ) : q.type === 'boolean' ? (
              <div className="flex gap-4">
                <button
                  onClick={() => setAnswers(q._id, true)}
                  className={`flex-1 flex items-center justify-center py-3 rounded-xl border-2 transition-all font-medium ${
                    answers[q._id] === true
                      ? 'border-green-500 bg-green-50 text-green-700 shadow-sm'
                      : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200'
                  }`}
                >
                  <Check
                    className={`w-4 h-4 mr-2 ${
                      answers[q._id] === true ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  Yes
                </button>
                <button
                  onClick={() => setAnswers(q._id, false)}
                  className={`flex-1 flex items-center justify-center py-3 rounded-xl border-2 transition-all font-medium ${
                    answers[q._id] === false
                      ? 'border-red-500 bg-red-50 text-red-700 shadow-sm'
                      : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200'
                  }`}
                >
                  <X
                    className={`w-4 h-4 mr-2 ${
                      answers[q._id] === false ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  No
                </button>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={onBack}
          className="flex-1 px-6 py-4 rounded-2xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-[2] px-6 py-4 rounded-2xl font-bold text-white bg-gray-900 hover:bg-purple-700 hover:shadow-xl hover:shadow-purple-200 transition-all duration-300"
        >
          Review Application
        </button>
      </div>
    </div>
  );
};
