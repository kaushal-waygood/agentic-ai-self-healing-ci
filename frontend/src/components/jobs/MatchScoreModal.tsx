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
import { Loader2, Sparkles, AlertCircle, Target, Briefcase, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MatchScore {
  matchScore: number;
  skillsFitPercent?: number;
  experienceFitPercent?: number;
  seniorityFitPercent?: number;
  techFitPercent?: number;
  roleFitPercent?: number;
  breakdown?: { skills: string; experience: string; seniority: string };
  skillsMatched?: { skill: string }[];
  skillsMissing?: string[];
  suggestions?: string[];
  recommendation: string;
  improvedSummary?: string;
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
      <DialogContent className="sm:max-w-[500px] bg-white rounded-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI Match Score
          </DialogTitle>
          <DialogDescription>
            Analyzing your profile against the job description.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
              <p className="text-gray-600">Calculating your score...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center gap-4 text-red-600 py-8">
              <AlertCircle className="w-12 h-12" />
              <p className="font-semibold">{error}</p>
              <Link href={'/signup'}>Sign up</Link>
            </div>
          )}

          {scoreData && !isLoading && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-5">
                {/* Main score */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
                    <span className="text-3xl font-bold text-white">
                      {scoreData.matchScore}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {scoreData.matchScore >= 7
                      ? 'Strong match'
                      : scoreData.matchScore >= 4
                        ? 'Moderate match'
                        : 'Consider upskilling'}
                  </p>
                </div>

                {/* Match breakdown - job description vs CV for any job type */}
                {((scoreData.skillsFitPercent ?? scoreData.techFitPercent) !== undefined ||
                  (scoreData.experienceFitPercent ?? scoreData.roleFitPercent) !== undefined ||
                  scoreData.seniorityFitPercent !== undefined) && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Match breakdown
                    </h3>
                    <div className="grid gap-3">
                      {(scoreData.skillsFitPercent ?? scoreData.techFitPercent) !== undefined && (
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="flex items-center gap-1.5">
                              <Target className="w-3.5 h-3.5 text-blue-600" />
                              Skills match
                            </span>
                            <span>{(scoreData.skillsFitPercent ?? scoreData.techFitPercent)}%</span>
                          </div>
                          <Progress value={scoreData.skillsFitPercent ?? scoreData.techFitPercent} className="h-2" />
                        </div>
                      )}
                      {(scoreData.experienceFitPercent ?? scoreData.roleFitPercent) !== undefined && (
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="flex items-center gap-1.5">
                              <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                              Experience match
                            </span>
                            <span>{(scoreData.experienceFitPercent ?? scoreData.roleFitPercent)}%</span>
                          </div>
                          <Progress value={scoreData.experienceFitPercent ?? scoreData.roleFitPercent} className="h-2" />
                        </div>
                      )}
                      {scoreData.seniorityFitPercent !== undefined && (
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="flex items-center gap-1.5">
                              <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                              Experience level
                            </span>
                            <span>{scoreData.seniorityFitPercent}%</span>
                          </div>
                          <Progress value={scoreData.seniorityFitPercent} className="h-2" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Skills matched */}
                {scoreData.skillsMatched && scoreData.skillsMatched.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Skills matched ({scoreData.skillsMatched.length})
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {scoreData.skillsMatched.slice(0, 15).map((s, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="bg-green-100 text-green-800 border-green-200"
                        >
                          {typeof s === 'object' && 'skill' in s ? s.skill : String(s)}
                        </Badge>
                      ))}
                      {scoreData.skillsMatched.length > 15 && (
                        <Badge variant="outline">+{scoreData.skillsMatched.length - 15} more</Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Recommendation */}
                <div className="bg-purple-50/50 rounded-lg p-3 border border-purple-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    AI Recommendation
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {scoreData.recommendation}
                  </p>
                </div>

                {/* Suggestions */}
                {scoreData.suggestions && scoreData.suggestions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Suggestions
                    </h3>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {scoreData.suggestions.map((s, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-amber-500">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </ScrollArea>
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
