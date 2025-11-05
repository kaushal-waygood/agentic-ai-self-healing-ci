import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  List,
  FileText,
  Sparkles,
  Calendar,
  ArrowRight,
  Search,
  X,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const SavedCvs = ({ resume, loadSavedCv }: any) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [animateIn, setAnimateIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const route = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setAnimateIn(true);
  }, []);

  //  Load selected CV
  const handleLoadCv = async (savedCv: any, index: number) => {
    const queryCvId = searchParams.get('q');
    route.push(`/dashboard/my-docs/cv/${savedCv._id}?q=saved`);
  };

  //  Triggered on search (Enter key or search button)
  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      handleReset(); // auto-reset if empty
    } else {
      setActiveSearch(searchTerm.trim());
    }
  };

  //  Triggered when typing
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Auto-reset when input is cleared
    if (value.trim() === '') {
      handleReset();
    }
  };

  //  Triggered when pressing Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  //  Reset list + clear input
  const handleReset = () => {
    setSearchTerm('');
    setActiveSearch('');
  };

  //  Format saved date
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

  //  Filter CVs
  const filteredCvs = activeSearch
    ? resume?.html?.filter((savedCv: any) =>
        savedCv.htmlCVTitle?.toLowerCase().includes(activeSearch.toLowerCase()),
      )
    : resume?.html;

  return (
    <div
      className={`w-full max-w-7xl mx-auto transition-all duration-700 ease-out ${
        animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <Card className="overflow-hidden border-0 shadow-2xl bg-white relative">
        {/* ===== HEADER ===== */}
        <CardHeader className="relative bg-gradient-to-r from-violet-600 via-blue-600 to-indigo-600 text-white p-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30">
                  <List className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
              </div>
              <div>
                <CardTitle className="font-headline text-xl">
                  Your Saved CVs
                </CardTitle>
                <CardDescription className="text-violet-100">
                  Manage your professional CVs. Auto-saved drafts appear here.
                </CardDescription>
              </div>
            </div>

            {/* Right Section (Search + Count) */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {/* 🔍 Search Input + Button */}
              <div className="relative w-full  sm:w-72 flex items-center">
                <Input
                  type="text"
                  placeholder="Search CVs..."
                  value={searchTerm}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  className="pl-3 pr-10 bg-white/10 text-white placeholder:text-violet-200  border border-violet-200 border-white/10 focus:border-white/20 focus:ring-0"
                />
                {searchTerm && (
                  <button
                    onClick={handleReset}
                    className="absolute right-8 text-violet-200 hover:text-white"
                    title="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={handleSearch}
                  className="absolute right-2 text-violet-200 hover:text-white"
                  title="Search"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>

              {/* CV Count */}
              {resume?.html?.length > 0 && (
                <div className="hidden sm:flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                  <FileText className="h-4 w-4 text-white" />
                  <span className="text-white font-medium">
                    {filteredCvs?.length ?? 0} CV
                    {filteredCvs?.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        {/* ===== CONTENT ===== */}
        <CardContent className="relative p-2">
          {filteredCvs?.length > 0 ? (
            <div className="space-y-3">
              {filteredCvs.map((savedCv: any, i: number) => (
                <div
                  key={i}
                  className={`group relative overflow-hidden rounded-2xl transition-all duration-500 ease-out cursor-pointer ${
                    hoveredIndex === i
                      ? 'border-violet-300 shadow-xl shadow-violet-200/50 scale-[1.01]'
                      : 'border-gray-200 hover:border-violet-200 shadow-sm'
                  }`}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    transform: `translateY(${
                      hoveredIndex === i ? '-3px' : '0px'
                    })`,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-r from-violet-500/5 via-blue-500/5 to-indigo-500/5 transition-opacity duration-500 ${
                      hoveredIndex === i ? 'opacity-100' : 'opacity-0'
                    }`}
                  />

                  <div className="relative p-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start gap-4">
                          <div className="min-w-0 flex-1">
                            <h5
                              className={`text-md font-semibold leading-tight transition-all duration-300 ${
                                hoveredIndex === i
                                  ? 'text-violet-700'
                                  : 'text-gray-900'
                              }`}
                            >
                              {savedCv.htmlCVTitle}
                            </h5>
                            <p className="flex items-center text-sm text-gray-500 mt-1">
                              <Calendar className="mr-1.5 h-3 w-3" />
                              Saved: {formatDate(savedCv.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <Button
                          size="sm"
                          className={`relative overflow-hidden transition-all duration-300 ${
                            loadingIndex === i
                              ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white border-transparent shadow-lg scale-105'
                              : hoveredIndex === i
                              ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white border-transparent shadow-lg hover:shadow-xl'
                              : 'border-violet-200 text-violet-700 hover:border-violet-300 bg-white'
                          }`}
                          onClick={() => handleLoadCv(savedCv, i)}
                          disabled={loadingIndex === i}
                        >
                          <div className="relative flex items-center gap-2">
                            {loadingIndex === i ? (
                              <>
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                <span className="font-medium">Loading...</span>
                              </>
                            ) : (
                              <ArrowRight className="h-4 w-4" />
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
            <div className="text-center py-16 relative">
              <div className="absolute inset-0 flex items-center justify-center opacity-5">
                <div className="w-64 h-64 rounded-full bg-gradient-to-br from-violet-500 to-blue-500" />
              </div>

              <div className="relative">
                <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center mb-6 shadow-2xl shadow-violet-500/25">
                  <FileText className="h-10 w-10 text-white" />
                </div>

                <h3 className="font-bold text-2xl mb-3 bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                  No CVs Found
                </h3>

                <p className="text-gray-600 max-w-md mx-auto mb-8 leading-relaxed">
                  You haven't generated any CVs yet or your search didn’t match
                  any results. Try a different keyword or clear your search.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SavedCvs;
