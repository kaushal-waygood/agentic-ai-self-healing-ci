'use client';

import { createContext, useContext, useState } from 'react';
import FeedbackPopup from '../ui/feedbackPopup';

interface FeedbackContextType {
  openFeedback: () => void;
}

const FeedbackContext = createContext<FeedbackContextType | null>(null);

export const useFeedback = () => {
  const ctx = useContext(FeedbackContext);
  if (!ctx) {
    throw new Error('useFeedback must be used within FeedbackProvider');
  }
  return ctx;
};

export const FeedbackProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [forceOpen, setForceOpen] = useState(false);

  return (
    <FeedbackContext.Provider
      value={{
        openFeedback: () => setForceOpen(true),
      }}
    >
      {children}

      {/* Popup mounted ONCE */}
      <FeedbackPopup
        delay={30000}
        forceOpen={forceOpen}
        onClose={() => setForceOpen(false)}
      />
    </FeedbackContext.Provider>
  );
};
