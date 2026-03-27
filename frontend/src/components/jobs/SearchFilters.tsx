// 'use client';

// import { useState, useEffect, useCallback, useRef } from 'react';
// import { Filter, Search, Loader2 } from 'lucide-react';
// import { useSearchParams } from 'next/navigation';
// import { Input } from '../ui/input';

// interface FilterState {
//   query: string;
//   country: string;
//   countryCode: string;
//   state: string;
//   city: string;
//   datePosted: string;
//   employmentType: string[];
//   experience: string[];
//   education: string[];
// }

// interface SearchFiltersProps {
//   initialFilters: Partial<FilterState>;
//   onSearchChange: (newFilters: Partial<FilterState>) => Promise<void> | void;
//   onOpenFilterModal: () => void;
// }

// const defaultFilters: FilterState = {
//   query: '',
//   country: '',
//   countryCode: '',
//   state: '',
//   city: '',
//   datePosted: '',
//   employmentType: [],
//   experience: [],
//   education: [],
// };

// export const SearchFilters = ({
//   initialFilters,
//   onSearchChange,
//   onOpenFilterModal,
// }: SearchFiltersProps) => {
//   const searchParams = useSearchParams();
//   useEffect(() => {
//     if (!searchParams) return;
//   }, []);

//   const [localFilters, setLocalFilters] = useState<FilterState>({
//     ...defaultFilters,
//     ...initialFilters,
//   });
//   const [isSearching, setIsSearching] = useState(false);

//   useEffect(() => {
//     if (!searchParams || isSearching) return;

//     const query = searchParams.get('q') || '';
//     const country = searchParams.get('country') || '';
//     const countryCode = searchParams.get('countryCode') || '';
//     const stateCode = searchParams.get('state') || '';
//     const city = searchParams.get('city') || '';
//     const datePosted = searchParams.get('datePosted') || '';

//     const employmentTypeParam = searchParams.get('employmentType') || '';
//     const experienceParam = searchParams.get('experience') || '';
//     const educationParam = searchParams.get('education') || '';

//     const employmentType = employmentTypeParam
//       ? employmentTypeParam.split(',').filter(Boolean)
//       : [];

//     const experience = experienceParam
//       ? experienceParam.split(',').filter(Boolean)
//       : [];

//     const education = educationParam
//       ? educationParam.split(',').filter(Boolean)
//       : [];

//     setLocalFilters((prev) => ({
//       ...prev,
//       // query: query || prev.query,
//       query: query,
//       country: country || prev.country,
//       countryCode: countryCode || prev.countryCode,
//       state: stateCode || prev.state,

//       city: city || prev.city,
//       datePosted: datePosted || prev.datePosted,
//       employmentType: employmentType.length
//         ? employmentType
//         : prev.employmentType,
//       experience: experience.length ? experience : prev.experience,
//       education: education.length ? education : prev.education,
//     }));
//   }, [searchParams, isSearching]);

//   const prevInitialFiltersRef = useRef<string>('');
//   useEffect(() => {
//     if (!initialFilters) return;
//     const serialized = JSON.stringify(initialFilters);
//     if (prevInitialFiltersRef.current === serialized) return;
//     prevInitialFiltersRef.current = serialized;
//     setLocalFilters((prev) => ({
//       ...defaultFilters,
//       ...prev,
//       ...initialFilters,
//     }));
//   }, [initialFilters]);

//   const handleInputChange = useCallback(
//     (name: keyof FilterState, value: string) => {
//       setLocalFilters((prev) => ({
//         ...prev,
//         [name]: value,
//       }));
//     },
//     [],
//   );

//   const handleSearchClick = useCallback(async () => {
//     const searchFilters: Partial<FilterState> = {
//       query: localFilters.query,
//       country: localFilters.country,
//       countryCode: localFilters.countryCode,
//       state: localFilters.state,
//       city: localFilters.city,
//       datePosted: localFilters.datePosted,
//       employmentType: [...localFilters.employmentType],
//       experience: [...localFilters.experience],
//       education: [...localFilters.education],
//     };

//     setIsSearching(true);
//     try {
//       await Promise.resolve(onSearchChange(searchFilters));
//     } catch (error) {
//       console.error('Search error:', error);
//     } finally {
//       setIsSearching(false);
//     }
//   }, [localFilters, onSearchChange]);

//   const onSearchChangeRef = useRef(onSearchChange);
//   useEffect(() => {
//     onSearchChangeRef.current = onSearchChange;
//   }, [onSearchChange]);

//   const handleKeyDown = useCallback(
//     (e: React.KeyboardEvent<HTMLInputElement>) => {
//       if (e.key === 'Enter') {
//         e.preventDefault();
//         if (!isSearching) handleSearchClick();
//       }
//     },
//     [isSearching, handleSearchClick],
//   );

//   return (
//     <div className="p-2 md:p-1 mb-2 transition-all duration-300 animate-in fade-in slide-in-from-top-5 duration-500">
//       <div className="flex flex-col lg:flex-row gap-2 ">
//         <div className="relative w-full bg-white">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4 group-focus-within:text-blue-500 transition-colors" />
//           <Input
//             id="search-bar"
//             type="text"
//             placeholder="economist in New York, NY | system design in San Francisco, CA"
//             value={localFilters.query}
//             onChange={(e) => handleInputChange('query', e.target.value)}
//             autoFocus
//             onKeyDown={handleKeyDown}
//             className="!pl-10 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all border-2"
//             aria-label="Search jobs"
//           />
//         </div>

//         <div className="grid grid-cols-2 md:grid-cols-2 gap-3 w-full md:w-auto">
//           <button
//             onClick={handleSearchClick}
//             disabled={isSearching}
//             className={`flex items-center justify-center gap-2 bg-buttonPrimary text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-md ${
//               isSearching
//                 ? 'cursor-not-allowed opacity-75'
//                 : 'hover:scale-105 hover:shadow-lg hover:brightness-110 active:scale-95'
//             }`}
//           >
//             {isSearching ? (
//               <Loader2 className="size-4 shrink-0 text-white animate-spin" />
//             ) : (
//               <Search className="size-4 shrink-0 text-white" />
//             )}
//             <span>{isSearching ? 'Searching...' : 'Search'}</span>
//           </button>

//           <button
//             onClick={onOpenFilterModal}
//             className="flex items-center justify-center gap-2 bg-buttonPrimary text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-md hover:scale-105 hover:shadow-lg hover:brightness-110 active:scale-95"
//           >
//             <Filter className="size-4 shrink-0 text-white" />
//             <span>Filters</span>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SearchFilters;

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface FilterState {
  query: string;
  country: string;
  countryCode: string;
  state: string;
  city: string;
  datePosted: string;
  employmentType: string[];
  experience: string[];
  education: string[];
}

interface SearchFiltersProps {
  initialFilters: Partial<FilterState>;
  onSearchChange: (newFilters: Partial<FilterState>) => Promise<void> | void;
  onOpenFilterModal: () => void;
}

const defaultFilters: FilterState = {
  query: '',
  country: '',
  countryCode: '',
  state: '',
  city: '',
  datePosted: '',
  employmentType: [],
  experience: [],
  education: [],
};

export const SearchFilters = ({
  initialFilters,
  onSearchChange,
  onOpenFilterModal,
}: SearchFiltersProps) => {
  const searchParams = useSearchParams();

  const [localFilters, setLocalFilters] = useState<FilterState>({
    ...defaultFilters,
    ...initialFilters,
  });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchParams || isSearching) return;

    const query = searchParams.get('q') || '';
    const country = searchParams.get('country') || '';
    const countryCode = searchParams.get('countryCode') || '';
    const stateCode = searchParams.get('state') || '';
    const city = searchParams.get('city') || '';
    const datePosted = searchParams.get('datePosted') || '';

    const employmentTypeParam = searchParams.get('employmentType') || '';
    const experienceParam = searchParams.get('experience') || '';
    const educationParam = searchParams.get('education') || '';

    const employmentType = employmentTypeParam
      ? employmentTypeParam.split(',').filter(Boolean)
      : [];

    const experience = experienceParam
      ? experienceParam.split(',').filter(Boolean)
      : [];

    const education = educationParam
      ? educationParam.split(',').filter(Boolean)
      : [];

    setLocalFilters((prev) => ({
      ...prev,
      query: query,
      country: country || prev.country,
      countryCode: countryCode || prev.countryCode,
      state: stateCode || prev.state,
      city: city || prev.city,
      datePosted: datePosted || prev.datePosted,
      employmentType: employmentType.length
        ? employmentType
        : prev.employmentType,
      experience: experience.length ? experience : prev.experience,
      education: education.length ? education : prev.education,
    }));
  }, [searchParams, isSearching]);

  const prevInitialFiltersRef = useRef<string>('');
  useEffect(() => {
    if (!initialFilters) return;
    const serialized = JSON.stringify(initialFilters);
    if (prevInitialFiltersRef.current === serialized) return;
    prevInitialFiltersRef.current = serialized;
    setLocalFilters((prev) => ({
      ...defaultFilters,
      ...prev,
      ...initialFilters,
    }));
  }, [initialFilters]);

  const handleInputChange = useCallback(
    (name: keyof FilterState, value: string) => {
      setLocalFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    [],
  );

  const handleSearchClick = useCallback(async () => {
    const searchFilters: Partial<FilterState> = {
      query: localFilters.query,
      country: localFilters.country,
      countryCode: localFilters.countryCode,
      state: localFilters.state,
      city: localFilters.city,
      datePosted: localFilters.datePosted,
      employmentType: [...localFilters.employmentType],
      experience: [...localFilters.experience],
      education: [...localFilters.education],
    };

    setIsSearching(true);
    try {
      await Promise.resolve(onSearchChange(searchFilters));
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [localFilters, onSearchChange]);

  const onSearchChangeRef = useRef(onSearchChange);
  useEffect(() => {
    onSearchChangeRef.current = onSearchChange;
  }, [onSearchChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!isSearching) handleSearchClick();
      }
    },
    [isSearching, handleSearchClick],
  );

  return (
    // <div className="flex w-full flex-col md:flex-row shrink-0 items-center gap-3 mb-5 transition-all duration-300 animate-in fade-in slide-in-from-top-5">

    <div className="mx-auto mb-8 flex w-full max-w-[900px] flex-col shrink-0 items-center gap-3 transition-all duration-300 animate-in fade-in slide-in-from-top-5 md:flex-row">
      {/* Search Inputs Container */}
      <div className="flex flex-col md:flex-row h-auto md:h-[52px] flex-1 w-full items-center rounded-2xl border border-slate-200 bg-white shadow-sm transition-all focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 hover:border-slate-300">
        {/* Job Title Input */}
        <div className="flex h-[52px] md:h-full w-full md:w-auto flex-1 items-center px-4">
          <svg
            className="h-[18px] w-[18px] shrink-0 text-slate-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Job title, keyword, or company"
            value={localFilters.query}
            onChange={(e) => handleInputChange('query', e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full flex-1 border-none bg-transparent px-3 text-[14px] font-semibold text-slate-900 placeholder-slate-400 outline-none focus:ring-0"
          />
        </div>

        {/* Divider */}
        <div className="hidden md:block h-6 w-px bg-slate-200"></div>
        <div className="block md:hidden h-px w-full bg-slate-100"></div>

        {/* Location Input */}
        {/* <div className="flex h-[52px] md:h-full w-full md:w-auto flex-1 items-center px-4">
          <svg
            className="h-[18px] w-[18px] shrink-0 text-slate-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="City, state, or remote"
            value={localFilters.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full flex-1 border-none bg-transparent px-3 text-[14px] font-semibold text-slate-900 placeholder-slate-400 outline-none focus:ring-0"
          />
          {localFilters.city && (
            <button
              onClick={() => handleInputChange('city', '')}
              className="rounded-md p-1 text-slate-300 transition-colors hover:text-slate-500"
              aria-label="Clear location"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div> */}
      </div>

      {/* Buttons Container */}
      <div className="flex w-full md:w-auto items-center gap-3">
        {/* Filters Button */}
        <button
          onClick={onOpenFilterModal}
          className="flex h-[52px] flex-1 md:flex-none justify-center shrink-0 items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-6 text-[14px] font-bold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
        >
          <svg
            className="h-[18px] w-[18px] text-slate-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filters
        </button>

        {/* Search Button */}
        <button
          onClick={handleSearchClick}
          disabled={isSearching}
          className="flex h-[52px] flex-1 md:flex-none justify-center shrink-0 items-center gap-2 rounded-2xl bg-blue-600 px-8 text-[14px] font-bold text-white shadow-[0_4px_16px_rgba(37,99,235,0.25)] transition-all hover:-translate-y-0.5 hover:bg-blue-700 disabled:opacity-70 disabled:hover:translate-y-0"
        >
          {isSearching ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Searching...</span>
            </>
          ) : (
            <span>Search</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default SearchFilters;
