'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Eye, List, FileText, Sparkles, Calendar } from 'lucide-react';
import React, { useState, useEffect } from 'react';

// Define the shape of the props for type safety
interface SavedCoverLettersProps {
  savedLettersList: any[]; // You can create a more specific type for your letter object
  loadSavedLetter: (letter: any) => void;
}

const SavedCoverLetters = ({
  savedLettersList,
  loadSavedLetter,
}: SavedCoverLettersProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    // Trigger the entry animation
    setAnimateIn(true);
  }, []);

  // Renamed from handleLoadCv to handleLoadLetter for clarity
  const handleLoadLetter = (savedLetter: any, index: number) => {
    setLoadingIndex(index);
    // Simulate a brief delay for a smoother user experience
    setTimeout(() => {
      loadSavedLetter(savedLetter);
      setLoadingIndex(null);
    }, 400);
  };

  // Helper function to format dates nicely
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      className={`w-full mx-auto transition-all duration-700 ease-out ${
        animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <Card className="overflow-hidden border-0 shadow-2xl bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-50 opacity-60" />

        <CardHeader className="relative bg-gradient-to-r from-violet-600 via-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30">
                <List className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="font-headline text-2xl font-bold">
                  Your Saved Letters
                </CardTitle>
                <CardDescription className="text-violet-100 mt-1">
                  Manage your cover letters. Auto-saved drafts appear here.
                </CardDescription>
              </div>
            </div>

            {savedLettersList.length > 0 && (
              <div className="hidden sm:flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <FileText className="h-4 w-4 text-white" />
                <span className="text-white font-medium">
                  {savedLettersList.length} Letter
                  {savedLettersList.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="relative p-6 sm:p-8">
          {savedLettersList.length > 0 ? (
            <div className="space-y-4">
              {savedLettersList.map((savedLetter, i) => (
                <div
                  key={savedLetter._id} // Using the unique _id for the key is better practice
                  className="group relative overflow-hidden rounded-2xl border transition-all duration-300 ease-out cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    transform: `translateY(${
                      hoveredIndex === i ? '-4px' : '0px'
                    })`,
                    boxShadow:
                      hoveredIndex === i
                        ? '0 10px 25px -5px rgba(109, 40, 217, 0.1), 0 8px 10px -6px rgba(109, 40, 217, 0.1)'
                        : '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                    borderColor:
                      hoveredIndex === i
                        ? 'rgba(139, 92, 246, 0.4)'
                        : '#e5e7eb',
                  }}
                >
                  <div className="relative p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-1 flex items-center gap-4 min-w-0">
                        <div
                          className={`flex-shrink-0 p-3 rounded-xl transition-all duration-300 ${
                            hoveredIndex === i
                              ? 'bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-lg'
                              : 'bg-violet-100 text-violet-600'
                          }`}
                        >
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-gray-900 truncate">
                            {savedLetter.coverLetterTitle}
                          </h3>
                          <p className="flex items-center text-xs text-gray-500 mt-1">
                            <Calendar className="mr-1.5 h-3 w-3" />
                            Saved: {formatDate(savedLetter.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="relative overflow-hidden transition-all duration-300 border"
                          onClick={() => handleLoadLetter(savedLetter, i)}
                          disabled={loadingIndex === i}
                        >
                          <div className="relative flex items-center gap-2">
                            {loadingIndex === i ? (
                              <>
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                <span className="font-medium">Loading...</span>
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4" />
                                <span className="font-medium">View/Load</span>
                              </>
                            )}
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16 relative">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center mb-6 shadow-xl shadow-violet-500/20">
                <FileText className="h-8 w-8 text-white" />
                <div className="absolute top-0 right-0">
                  <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
                </div>
              </div>

              <h3 className="font-bold text-2xl mb-2 bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                No Saved Letters
              </h3>

              <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                You haven't saved any cover letters yet. Use the generator to
                create your first one.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SavedCoverLetters;
