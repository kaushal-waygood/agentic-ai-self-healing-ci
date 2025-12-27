// 'use client';

// import { useEffect, useState } from 'react';
// import { MessageSquare, X, Send } from 'lucide-react';

// interface FeedbackPopupProps {
//   delay?: number;
//   forceOpen?: boolean;
//   onClose?: () => void;
// }

// export default function FeedbackPopup({
//   delay = 30000,
//   forceOpen = false,
//   onClose,
// }: FeedbackPopupProps) {
//   const [open, setOpen] = useState(false);
//   const [feedback, setFeedback] = useState('');

//   // Auto-open after login
//   useEffect(() => {
//     if (sessionStorage.getItem('feedback_shown')) return;

//     const timer = setTimeout(() => {
//       setOpen(true);
//       sessionStorage.setItem('feedback_shown', 'true');
//     }, delay);

//     return () => clearTimeout(timer);
//   }, [delay]);

//   // Manual open (logout click)
//   useEffect(() => {
//     if (forceOpen) {
//       setOpen(true);
//     }
//   }, [forceOpen]);

//   if (!open) return null;

//   const handleClose = () => {
//     setOpen(false);
//     onClose?.();
//   };

//   return (
//     <div
//       className="fixed bottom-6 right-6 z-50 w-[340px] rounded-lg
//                     bg-white shadow-2xl border border-slate-200"
//     >
//       {/* Header */}
//       <div
//         className="flex items-center justify-between px-4 py-3
//                      bg-header-gradient-primary
//                       text-white rounded-t-lg"
//       >
//         <div className="flex items-center gap-2">
//           <MessageSquare className="w-5 h-5" />
//           <span className="font-semibold text-sm">Quick Feedback</span>
//         </div>
//         <button onClick={handleClose}>
//           <X className="w-4 h-4" />
//         </button>
//       </div>

//       {/* Body */}
//       <div className="p-4 space-y-3 ">
//         <p className="text-sm text-slate-600">
//           Before you go, how was your experience?
//         </p>

//         <textarea
//           value={feedback}
//           onChange={(e) => setFeedback(e.target.value)}
//           placeholder="Your feedback helps us improve..."
//           className="w-full bg-gray-200 min-h-[80px] resize-none rounded-lg
//                      border px-3 py-2 text-sm"
//         />

//         <button
//           onClick={handleClose}
//           className="w-full bg-buttonPrimary hover:bg-blue-700 text-white py-2 rounded-lg"
//         >
//           Submit
//         </button>

//         <button
//           onClick={handleClose}
//           className="w-full text-sm text-slate-500 hover:underline"
//         >
//           Skip feedback
//         </button>
//       </div>
//     </div>
//   );
// }

'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, X, Send, CheckCircle } from 'lucide-react';

interface FeedbackPopupProps {
  delay?: number;
  forceOpen?: boolean;
  onClose?: () => void;
}

export default function FeedbackPopup({
  delay = 30000,
  forceOpen = false,
  onClose,
}: FeedbackPopupProps) {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Auto-open after login
  useEffect(() => {
    if (sessionStorage.getItem('feedback_shown')) return;

    const timer = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem('feedback_shown', 'true');
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  // Manual open (logout click)
  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
      setSubmitted(false);
    }
  }, [forceOpen]);

  const handleClose = () => {
    setOpen(false);
    setSubmitted(false);
    setFeedback('');
    onClose?.();
  };

  const handleSubmit = () => {
    // Optional: send `feedback` to API here
    setSubmitted(true);

    // Auto close after showing thank you
    setTimeout(() => {
      handleClose();
    }, 3000);
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 w-[340px] rounded-lg
      bg-white shadow-2xl border border-slate-200
      transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]

      ${
        open
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
      }`}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3
        bg-header-gradient-primary text-white rounded-t-lg"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <span className="font-semibold text-sm">
            {submitted ? 'Thank You!' : 'Quick Feedback'}
          </span>
        </div>
        <button onClick={handleClose}>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {!submitted ? (
          <>
            <p className="text-sm text-slate-600">
              Share your experience with us.
            </p>

            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Your feedback helps us improve..."
              className="w-full bg-gray-200 min-h-[80px] resize-none rounded-lg
              border px-3 py-2 text-sm"
            />

            <button
              onClick={handleSubmit}
              className="w-full bg-buttonPrimary hover:bg-blue-700
              text-white py-2 rounded-lg flex items-center
              justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Submit
            </button>

            <button
              onClick={handleClose}
              className="w-full text-sm text-slate-500 hover:underline"
            >
              Skip feedback
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center text-center py-6">
            <CheckCircle className="w-10 h-10 text-green-500 mb-3" />
            <p className="text-lg font-semibold text-slate-800">Thank you!</p>
            <p className="text-sm text-slate-600 mt-1">
              We really appreciate your feedback.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
