'use client';

import { useState } from 'react';
import { X, Calendar, MessageSquare, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import apiInstance from '@/services/api';

interface ImprovementPopupProps {
  onClose: () => void;
  onYes?: () => void;
}

export default function ImprovementPopup({
  onClose,
  onYes,
}: ImprovementPopupProps) {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    try {
      await apiInstance.post('/user/feedback', {
        feedback,
        type: 'improvement-suggestion',
      });
      setSubmitted(true);
      if (onYes) onYes();
    } catch (error) {
      console.error('Feedback submit failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCalendarClick = () => {
    setShowCalendar(true);
    if (onYes) onYes();
  };

  const handleClose = () => {
    onClose();
  };

  if (showCalendar) {
    return (
      <>
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999]"
          onClick={onClose}
        />
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>

            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                Schedule a Call
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Pick a time that works for you
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-3">
                Click below to schedule a 30-minute feedback session:
              </p>
              <a
                // href={
                //   process.env.NEXT_PUBLIC_CALENDLY_URL ||
                //   'https://calendly.com/your-username/feedback'
                // }
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2">
                  <Calendar className="w-4 h-4" />
                  Open Calendar
                </Button>
              </a>
            </div>

            <button
              onClick={() => setShowCalendar(false)}
              className="text-sm text-gray-500 hover:text-gray-700 mt-4 block mx-auto"
            >
              ← Back to feedback
            </button>
          </div>
        </div>
      </>
    );
  }

  if (submitted) {
    return (
      <>
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999]"
          onClick={onClose}
        />
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ThumbsUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Thank You!</h3>
              <p className="text-sm text-gray-500 mt-2">
                We appreciate your feedback!
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999]"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>

          <div className="text-center mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Help us improve Zobsai!
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Share your feedback to help shape our platform
            </p>
          </div>

          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tell us what features you'd like to see, what's not working well, or any suggestions..."
            className="w-full h-32 p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none mb-4"
          />
          {/* 
          <button
            onClick={handleCalendarClick}
            className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 mb-4 mx-auto"
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule a 30-min call instead</span>
          </button> */}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              Maybe later
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!feedback.trim() || isSubmitting}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
