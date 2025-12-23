// 'use client';

// import { useEffect, useState } from 'react';
// import { MessageSquare, X, Send } from 'lucide-react';

// interface FeedbackPopupProps {
//   delay?: number; // milliseconds
// }

// export default function FeedbackPopup({ delay = 30000 }: FeedbackPopupProps) {
//   const [open, setOpen] = useState(false);
//   const [feedback, setFeedback] = useState('');

//   useEffect(() => {
//     if (sessionStorage.getItem('feedback_shown')) return;

//     const timer = setTimeout(() => {
//       setOpen(true);
//       sessionStorage.setItem('feedback_shown', 'true');
//     }, delay);

//     return () => clearTimeout(timer);
//   }, [delay]);

//   if (!open) return null;

//   return (
//     <div className="fixed bottom-6 right-6 z-50 w-[340px] rounded-xl bg-white shadow-2xl border border-slate-200 animate-slideUp">
//       <div className="flex items-center justify-between px-4 py-3 border-b bg-header-gradient-primary text-white rounded-t-xl">
//         <div className="flex items-center gap-2">
//           <MessageSquare className="w-5 h-5" />
//           <span className="font-semibold text-sm">Quick Feedback</span>
//         </div>

//         <button onClick={() => setOpen(false)}>
//           <X className="w-4 h-4 hover:opacity-80" />
//         </button>
//       </div>

//       {/* Body */}
//       <div className="p-4 space-y-3">
//         <p className="text-sm text-slate-600">How’s your experience so far?</p>

//         <textarea
//           value={feedback}
//           onChange={(e) => setFeedback(e.target.value)}
//           placeholder="Share your thoughts..."
//           className="w-full min-h-[80px] resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
//         />

//         <button
//           onClick={() => {
//             console.log('Feedback:', feedback);
//             setOpen(false);
//           }}
//           disabled={!feedback.trim()}
//           className="w-full flex items-center justify-center gap-2 bg-buttonPrimary text-white rounded-lg py-2 font-semibold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           <Send className="w-4 h-4" />
//           Submit Feedback
//         </button>
//       </div>

//       <style jsx>{`
//         @keyframes slideUp {
//           from {
//             opacity: 0;
//             transform: translateY(20px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//         .animate-slideUp {
//           animation: slideUp 0.4s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// }

'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

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
    }
  }, [forceOpen]);

  if (!open) return null;

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-[340px] rounded-xl
                    bg-white shadow-2xl border border-slate-200"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3
                      bg-gradient-to-r from-purple-500 to-blue-500
                      text-white rounded-t-xl"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <span className="font-semibold text-sm">Quick Feedback</span>
        </div>
        <button onClick={handleClose}>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <p className="text-sm text-slate-600">
          Before you go, how was your experience?
        </p>

        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Your feedback helps us improve..."
          className="w-full min-h-[80px] resize-none rounded-lg
                     border px-3 py-2 text-sm"
        />

        <button
          onClick={handleClose}
          className="w-full bg-buttonPrimary text-white py-2 rounded-lg"
        >
          Submit & Logout
        </button>

        <button
          onClick={handleClose}
          className="w-full text-sm text-slate-500 hover:underline"
        >
          Skip feedback
        </button>
      </div>
    </div>
  );
}
