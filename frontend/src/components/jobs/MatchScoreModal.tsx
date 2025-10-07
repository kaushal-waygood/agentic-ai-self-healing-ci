'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface MatchScore {
  matchScore: number;
  recommendation: string;
}

interface MatchScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  scoreData: MatchScore | null;
  error: string | null;
}

export function MatchScoreModal({
  isOpen,
  onClose,
  isLoading,
  scoreData,
  error,
}: MatchScoreModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI Match Score
          </DialogTitle>
          <DialogDescription>
            Analyzing your profile against the job description.
          </DialogDescription>
        </DialogHeader>

        <div className="py-8 text-center">
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
              <p className="text-gray-600">Calculating your score...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center gap-4 text-red-600">
              <AlertCircle className="w-12 h-12" />
              <p className="font-semibold">{error}</p>
              <Link href={'/signup'}>Singup</Link>
            </div>
          )}

          {scoreData && !isLoading && (
            <div>
              <p className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
                {scoreData.matchScore}/10
              </p>
              <p className="text-gray-700 text-left">
                {scoreData.recommendation}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
