'use client';

import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompletionModalProps {
  open: boolean;
  onClose: () => void;
}

const CompletionModal: FC<CompletionModalProps> = ({ open, onClose }) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[50]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Modal Box */}
          <motion.div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center"
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-14 h-14 text-green-500" />
            </div>

            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Onboarding Completed!
            </h2>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You're all set! Enjoy your personalized ZobsAI experience.
            </p>

            <Button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white font-semibold py-2 rounded-xl shadow hover:scale-[1.03] transition"
            >
              Continue to Dashboard
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CompletionModal;
