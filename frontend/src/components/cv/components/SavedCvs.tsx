import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Eye,
  List,
  Calendar,
  Briefcase,
  FileText,
  Sparkles,
  Download,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

const SavedCvs = ({ resume, loadSavedCv }: any) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    setAnimateIn(true);
  }, []);

  const handleLoadCv = async (savedCv: any, index: number) => {
    setLoadingIndex(index);
    setTimeout(() => {
      loadSavedCv(savedCv);
      setLoadingIndex(null);
    }, 400);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <div
      className={`w-full max-w-7xl mx-auto transition-all duration-700 ease-out ${
        animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <Card className="overflow-hidden border-0 shadow-2xl bg-white relative">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-50 opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-tr from-violet-100/20 via-transparent to-blue-100/20" />

        <CardHeader className="relative bg-gradient-to-r from-violet-600 via-blue-600 to-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30">
                  <List className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
              </div>
              <div>
                <CardTitle className="font-headline text-2xl font-bold">
                  Your Saved CVs
                </CardTitle>
                <CardDescription className="text-violet-100 mt-1">
                  Manage your professional CVs. Auto-saved drafts appear here.
                </CardDescription>
              </div>
            </div>

            {resume?.html?.length > 0 && (
              <div className="hidden sm:flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <FileText className="h-4 w-4 text-white" />
                <span className="text-white font-medium">
                  {resume.html.length} CV{resume.html.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Animated dots */}
          <div className="absolute top-4 right-4 flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1 h-1 bg-white/40 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="relative p-8">
          {resume?.html?.length > 0 ? (
            <div className="space-y-4">
              {resume.html.map((savedCv: any, i: number) => (
                <div
                  key={i}
                  className={`group relative overflow-hidden rounded-2xl border transition-all duration-500 ease-out cursor-pointer ${
                    hoveredIndex === i
                      ? 'border-violet-300 shadow-xl shadow-violet-200/50 scale-[1.01]'
                      : 'border-gray-200 hover:border-violet-200 shadow-sm'
                  }`}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    transform: `translateY(${
                      hoveredIndex === i ? '-3px' : '0px'
                    })`,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {/* Animated background gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r from-violet-500/5 via-blue-500/5 to-indigo-500/5 transition-opacity duration-500 ${
                      hoveredIndex === i ? 'opacity-100' : 'opacity-0'
                    }`}
                  />

                  {/* Floating orbs */}
                  <div
                    className={`absolute top-2 right-2 w-20 h-20 bg-gradient-to-br from-violet-400/10 to-blue-400/10 rounded-full blur-xl transition-opacity duration-500 ${
                      hoveredIndex === i ? 'opacity-100' : 'opacity-0'
                    }`}
                  />

                  <div className="relative p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start gap-4">
                          <div
                            className={`p-3 rounded-xl transition-all duration-300 ${
                              hoveredIndex === i
                                ? 'bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-lg'
                                : 'bg-violet-100 text-violet-600'
                            }`}
                          >
                            <FileText className="h-5 w-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3
                              className={`font-bold text-xl leading-tight mb-2 transition-all duration-300 ${
                                hoveredIndex === i
                                  ? 'text-violet-700'
                                  : 'text-gray-900'
                              }`}
                            >
                              {savedCv.htmlCVTitle}
                            </h3>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className={`relative overflow-hidden transition-all duration-300 border-2 ${
                            loadingIndex === i
                              ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white border-transparent shadow-lg scale-105'
                              : hoveredIndex === i
                              ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white border-transparent shadow-lg hover:shadow-xl'
                              : 'border-violet-200 text-violet-700 hover:border-violet-300 bg-white'
                          }`}
                          onClick={() => handleLoadCv(savedCv, i)}
                          disabled={loadingIndex === i}
                        >
                          {/* Shimmer effect */}
                          <div
                            className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform transition-transform duration-1000 ${
                              hoveredIndex === i
                                ? 'translate-x-full'
                                : '-translate-x-full'
                            }`}
                          />

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

                  {/* Animated bottom border */}
                  <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-violet-500 via-blue-500 to-indigo-500 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 relative">
              {/* Background decoration */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5">
                <div className="w-64 h-64 rounded-full bg-gradient-to-br from-violet-500 to-blue-500" />
              </div>

              <div className="relative">
                <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center mb-6 shadow-2xl shadow-violet-500/25">
                  <FileText className="h-10 w-10 text-white" />
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
                  </div>
                </div>

                <h3 className="font-bold text-2xl mb-3 bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                  No CVs Yet
                </h3>

                <p className="text-gray-600 max-w-md mx-auto mb-8 leading-relaxed">
                  You haven't generated any CVs yet. Use the wizard above to
                  create your first professional CV tailored to your target
                  role.
                </p>

                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-200">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 animate-pulse" />
                  <span className="text-violet-700 font-medium">
                    Ready to get started
                  </span>
                  <div
                    className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse"
                    style={{ animationDelay: '0.5s' }}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SavedCvs;
