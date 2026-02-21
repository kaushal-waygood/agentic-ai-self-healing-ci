// 'use client';

// import { useEffect, useState, useRef } from 'react';
// import { MessageSquare, X, Send, CheckCircle, Loader2 } from 'lucide-react';
// import apiInstance from '@/services/api';

// export default function FeedbackPopup({
//   delay,
//   enableAutoOpen = false,
//   forceOpen = false,
//   onClose,
// }: any) {
//   const [open, setOpen] = useState(forceOpen);
//   const [feedback, setFeedback] = useState('');
//   const [submitted, setSubmitted] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const isMounted = useRef(false);

//   useEffect(() => {
//     isMounted.current = true;
//     return () => {
//       isMounted.current = false;
//     };
//   }, []);

//   useEffect(() => {
//     if (forceOpen) setOpen(true);
//   }, [forceOpen]);

//   const handleClose = () => {
//     setOpen(false);
//     setTimeout(() => {
//       if (isMounted.current) {
//         setSubmitted(false);
//         setFeedback('');
//         setIsSubmitting(false);
//       }
//     }, 400);
//     if (onClose) onClose();
//   };

//   useEffect(() => {
//     if (!enableAutoOpen) return;
//     if (sessionStorage.getItem('feedback_shown')) return;

//     const timer = setTimeout(() => {
//       if (isMounted.current) {
//         setOpen(true);
//         sessionStorage.setItem('feedback_shown', 'true');
//       }
//     }, delay);
//     return () => clearTimeout(timer);
//   }, [delay, enableAutoOpen]);

//   const handleSubmit = async () => {
//     if (!feedback.trim()) return;
//     setIsSubmitting(true);
//     try {
//       await apiInstance.post('/user/feedback', { feedback });
//       setSubmitted(true);
//       setTimeout(() => {
//         if (isMounted.current) handleClose();
//       }, 5000);
//     } catch (error) {
//       console.error('Feedback failed', error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div
//       className={`fixed bottom-8 right-8 z-[100] w-[350px] overflow-hidden rounded-2xl
//       /* DARK THEME BACKGROUND */
//      bg-white/95 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]
//       border transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]
//       ${
//         open
//           ? 'opacity-100 translate-y-0 scale-100'
//           : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
//       }`}
//     >
//       {/* Header with Blue Accent */}
//       <div className="relative px-5 py-4 border-b border-slate-300 bg-blue-300/">
//         <div className="flex items-center gap-3">
//           <div className="p-2 bg-blue-500 rounded-xl shadow-lg shadow-blue-500/20">
//             <MessageSquare className="w-4 h-4 text-white" />
//           </div>
//           <div>
//             <h3 className="text-sm font-bold text-blue-700">
//               {submitted ? 'Feedback Received' : 'Quick Feedback'}
//             </h3>
//             {!submitted && (
//               <p className="text-[11px] text-slate-400 font-medium">
//                 How is your experience?
//               </p>
//             )}
//           </div>
//         </div>
//         <button
//           onClick={handleClose}
//           className="absolute right-4 top-5 p-1.5 rounded-lg
//           text-slate-500 hover:bg-slate-800 hover:text-white transition-all"
//         >
//           <X className="w-4 h-4" />
//         </button>
//       </div>

//       {/* Body */}
//       <div className="p-5">
//         {!submitted ? (
//           <div className="space-y-4">
//             <div className="relative">
//               <textarea
//                 value={feedback}
//                 onChange={(e) => setFeedback(e.target.value)}
//                 placeholder="What can we improve?"
//                 /* LIGHTER DARK TEXTAREA */
//                 className="w-full min-h-[120px] resize-none rounded-xl
//                 border border-slate-700 px-4 py-3 text-sm
//                 placeholder:text-slate-500 focus:outline-none focus:ring-2
//                 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all"
//               />
//               <div className="absolute bottom-3 right-3 text-[10px] text-slate-500 font-mono">
//                 {feedback.length} chars
//               </div>
//             </div>

//             <button
//               onClick={handleSubmit}
//               disabled={!feedback.trim() || isSubmitting}
//               className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-200
//               disabled:text-slate-500 disabled:cursor-not-allowed text-white py-3 rounded-xl
//               flex items-center justify-center gap-2 transition-all duration-200
//               font-bold text-sm active:scale-[0.97] "
//             >
//               {isSubmitting ? (
//                 <Loader2 className="w-4 h-4 animate-spin" />
//               ) : (
//                 <>
//                   <Send className="w-3.5 h-3.5" />
//                   Send Feedback
//                 </>
//               )}
//             </button>

//             <button
//               onClick={handleClose}
//               className="w-full text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors"
//             >
//               Maybe later
//             </button>
//           </div>
//         ) : (
//           <div className="flex flex-col items-center text-center py-6 animate-in fade-in zoom-in-95 duration-500">
//             <div className="w-20 h-20 bg-green-200 rounded-full flex items-center justify-center mb-4 border border-green-500/20">
//               <CheckCircle className="w-10 h-10 text-green-600" />
//             </div>
//             <h4 className="text-lg font-bold text-white">Thank you!</h4>
//             <p className="text-sm mt-2 px-4 leading-relaxed">
//               We've received your feedback. It helps us build a better
//               experience for you.
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Decorative Bottom Glow */}
//       <div
//         className={`h-1.5 w-full transition-colors duration-500 ${
//           submitted ? 'bg-green-500' : 'bg-blue-600'
//         }`}
//       />
//     </div>
//   );
// }

'use client';

import { useEffect, useState, useRef } from 'react';
import { MessageSquare, X, Send, CheckCircle, Loader2 } from 'lucide-react';
import apiInstance from '@/services/api';

export default function FeedbackPopup({
  delay = 3000,
  enableAutoOpen = false,
  forceOpen = false,
  onClose,
}: any) {
  const [open, setOpen] = useState(forceOpen);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      if (isMounted.current) {
        setSubmitted(false);
        setFeedback('');
        setIsSubmitting(false);
      }
    }, 400);
    if (onClose) onClose();
  };

  useEffect(() => {
    if (!enableAutoOpen) return;
    if (sessionStorage.getItem('feedback_shown')) return;

    const timer = setTimeout(() => {
      if (isMounted.current) {
        setOpen(true);
        sessionStorage.setItem('feedback_shown', 'true');
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, enableAutoOpen]);

  const handleSubmit = async () => {
    if (!feedback.trim()) return;
    setIsSubmitting(true);
    try {
      await apiInstance.post('/user/feedback', { feedback });
      setSubmitted(true);
      setTimeout(() => {
        if (isMounted.current) handleClose();
      }, 5000);
    } catch (error) {
      console.error('Feedback failed', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed bottom-8 right-8 z-[100] w-[350px] overflow-hidden rounded-2xl
      /* DARK THEME BACKGROUND */
     bg-white/95 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] 
      border transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]
      ${
        open
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
      }`}
    >
      {/* Header with Blue Accent */}
      <div className="relative px-5 py-4 border-b border-slate-300 bg-blue-300/">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500 rounded-xl shadow-lg shadow-blue-500/20">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-blue-700">
              {submitted ? 'Feedback Received' : 'Quick Feedback'}
            </h3>
            {!submitted && (
              <p className="text-[11px] text-slate-400 font-medium">
                How is your experience?
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleClose}
          className="absolute right-4 top-5 p-1.5 rounded-lg 
          text-slate-500 hover:bg-slate-800 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-5">
        {!submitted ? (
          <div className="space-y-4">
            <div className="relative">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="What can we improve?"
                /* LIGHTER DARK TEXTAREA */
                className="w-full min-h-[120px] resize-none rounded-xl
                border border-slate-700 px-4 py-3 text-sm 
                placeholder:text-slate-500 focus:outline-none focus:ring-2 
                focus:ring-blue-500/40 focus:border-blue-500/50 transition-all"
              />
              <div className="absolute bottom-3 right-3 text-[10px] text-slate-500 font-mono">
                {feedback.length} chars
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!feedback.trim() || isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-200 
              disabled:text-slate-500 disabled:cursor-not-allowed text-white py-3 rounded-xl 
              flex items-center justify-center gap-2 transition-all duration-200 
              font-bold text-sm active:scale-[0.97] "
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Send Feedback
                </>
              )}
            </button>

            <button
              onClick={handleClose}
              className="w-full text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors"
            >
              Maybe later
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center py-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-green-200 rounded-full flex items-center justify-center mb-4 border border-green-500/20">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h4 className="text-lg font-bold text-white">Thank you!</h4>
            <p className="text-sm mt-2 px-4 leading-relaxed">
              We've received your feedback. It helps us build a better
              experience for you.
            </p>
          </div>
        )}
      </div>

      {/* Decorative Bottom Glow */}
      <div
        className={`h-1.5 w-full transition-colors duration-500 ${
          submitted ? 'bg-green-500' : 'bg-blue-600'
        }`}
      />
    </div>
  );
}