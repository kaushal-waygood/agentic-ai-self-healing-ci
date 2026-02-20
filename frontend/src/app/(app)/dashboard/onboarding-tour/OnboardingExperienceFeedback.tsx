// components/OnboardingExperienceFeedback.tsx
'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea'; // Make sure to import Textarea
import { useState } from 'react';
import { Star } from 'lucide-react';
import apiInstance from '@/services/api';

export default function OnboardingExperienceFeedback({
  onClose,
}: {
  onClose: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState(''); // New state for text feedback

  const handleSubmit = async () => {
    localStorage.setItem('onboarding_feedback_done', '1');
    const response = await apiInstance.post('/user/feedback', {
      rating,
      message: feedback,
    });
    onClose();
  };

  return (
    // Overlay: Fixed, centered, dark background with blur
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity p-4">
      <Card className="w-full max-w-md p-6 bg-white dark:bg-gray-900 shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">How was your onboarding?</h3>
          <p className="text-gray-500 mb-6 text-sm">
            Please rate your experience from 1 to 5 stars.
          </p>

          {/* Star Rating Section */}
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
              >
                <Star
                  size={32}
                  className={`transition-colors duration-200 ${
                    star <= (hover || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-transparent text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Optional Feedback Section */}
          <div className="text-left mb-6">
            <label
              htmlFor="feedback"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Any suggestions?{' '}
              <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <Textarea
              id="feedback"
              placeholder="What could we do better?"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="resize-none min-h-[80px]"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose}>
              Skip
            </Button>
            <Button onClick={handleSubmit} disabled={rating === 0}>
              Submit
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
