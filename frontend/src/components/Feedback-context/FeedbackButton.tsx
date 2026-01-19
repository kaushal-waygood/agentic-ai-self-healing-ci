'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageSquarePlus, X, Send, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';

// 1. Constants - Easy to update categories later
const FEEDBACK_CATEGORIES = [
  'CV Generator Issues',
  'Cover Letter Generator Issues',
  'Tailored Application Issues',
  'Job Apply Issues',
  'Job Search Issues',
  'Profile completion Issues',
  'Plan Upgrade Issue',
  'Other',
] as const;

const FeedbackButton = () => {
  const pathname = usePathname();

  // 2. States
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: FEEDBACK_CATEGORIES[0],
    message: '',
  });

  // 3. Scroll Lock Effect
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // 4. Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Mock delay
      setIsOpen(false);
      setFormData({ category: FEEDBACK_CATEGORIES[0], message: '' });
    } catch (error) {
      console.error('Failed to send feedback', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* TRIGGER BUTTON */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[99]">
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-1 py-3 sm:px-3 sm:py-6 rounded-l-2xl shadow-[-4px_0_20px_rgba(79,70,229,0.3)] transition-all duration-300 translate-x-1 hover:translate-x-0 active:scale-95"
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
        >
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs sm:text-[11px] font-bold uppercase tracking-[0.2em]">
              Feedback
            </span>
          </div>
        </button>
      </div>

      {/* MODAL OVERLAY */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
            onClick={() => !isSubmitting && setIsOpen(false)}
          />

          {/* Modal Card */}
          <div className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="bg-indigo-600 p-8 text-white relative">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-2xl font-bold">Help us improve</h3>
              <p className="text-indigo-100 text-xs mt-2 opacity-80">
                Found an issue on{' '}
                <span className="font-mono bg-indigo-700 px-1 rounded">
                  {pathname}
                </span>
                ?
              </p>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
                  Issue Category
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                >
                  {FEEDBACK_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
                  Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Please describe the issue in detail..."
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none resize-none transition-all"
                />
              </div>

              <Button
                disabled={isSubmitting}
                className="w-full py-7 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-md gap-3 shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Report
                  </>
                )}
              </Button>

              <p className="text-center text-[10px] text-gray-400">
                Your technical details (path, browser) are included
                automatically.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackButton;
