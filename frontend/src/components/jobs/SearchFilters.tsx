'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Filter, Search, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { State } from 'country-state-city';
import { Input } from '../ui/input';

interface FilterState {
  query: string;
  country: string;
  state: string; // stores code in UI, converted to name on search
  city: string;
  datePosted: string;
  employmentType: string[];
}

interface SearchFiltersProps {
  initialFilters: Partial<FilterState>;
  onSearchChange: (newFilters: Partial<FilterState>) => Promise<void> | void;
  onOpenFilterModal: () => void;
}

const defaultFilters: FilterState = {
  query: '',
  country: '',
  state: '',
  city: '',
  datePosted: '',
  employmentType: [],
};

export const SearchFilters = ({
  initialFilters,
  onSearchChange,
  onOpenFilterModal,
}: SearchFiltersProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    if (!searchParams) return;
  }, []);

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
    const stateCode = searchParams.get('stateCode') || '';
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
      query: query || prev.query,
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

  // Sync external filter changes (e.g. filter pills remove) without looping.
  // We JSON-stringify to compare by value, not reference — initialFilters is a
  // new object every render from Redux, so a plain reference check would loop.
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

  const getStateName = (countryCode: string, stateCode: string): string => {
    if (!countryCode || !stateCode) return '';
    const st = State.getStateByCodeAndCountry(stateCode, countryCode);
    return st?.name || stateCode;
  };

  const pushFiltersToUrl = (filters: FilterState) => {
    const params = new URLSearchParams();

    const stateName = getStateName(filters.countryCode, filters.state);

    if (filters.query) params.set('q', filters.query);

    if (filters.country) params.set('country', filters.country);
    if (filters.countryCode) params.set('countryCode', filters.countryCode);

    if (stateName) {
      params.set('state', stateName); // readable in URL
      params.set('stateCode', filters.state); // keeps code in URL too
    }

    if (filters.city) params.set('city', filters.city);
    if (filters.datePosted) params.set('datePosted', filters.datePosted);

    if (filters.employmentType.length > 0) {
      params.set('employmentType', filters.employmentType.join(','));
    }

    if (filters.experience.length > 0) {
      params.set('experience', filters.experience.join(','));
    }

    if (filters.education.length > 0) {
      params.set('education', filters.education.join(','));
    }

    const queryString = params.toString();
    const url = queryString ? `?${queryString}` : '?';

    router.push(url, { scroll: false });
  };

  // const handleSearchClick = useCallback(async () => {
  //   const stateName = getStateName(
  //     localFilters.countryCode,
  //     localFilters.state,
  //   );

  //   const searchFilters: Partial<FilterState> = {
  //     query: localFilters.query,
  //     country: localFilters.country,
  //     countryCode: localFilters.countryCode,
  //     state: stateName, // backend gets name
  //     city: localFilters.city,
  //     datePosted: localFilters.datePosted,
  //     employmentType: [...localFilters.employmentType],
  //     experience: [...localFilters.experience],
  //     education: [...localFilters.education],
  //   };

  //   setIsSearching(true);
  //   try {
  //     pushFiltersToUrl({
  //       ...localFilters,
  //       state: localFilters.state, // still code here
  //       country: localFilters.country,
  //       countryCode: localFilters.countryCode,
  //     });

  //     await Promise.resolve(onSearchChange(searchFilters));
  //   } catch (error) {
  //     console.error('Search error:', error);
  //   } finally {
  //     setIsSearching(false);
  //   }
  // }, [localFilters, onSearchChange]);

  // const handleSearchClick = useCallback(async () => {
  //   setIsSearching(true);

  //   try {
  //     pushFiltersToUrl(localFilters);
  //     await Promise.resolve(onSearchChange(localFilters));
  //   } finally {
  //     setIsSearching(false);
  //   }
  // }, [localFilters, onSearchChange]);

  const handleSearchClick = useCallback(() => {
    if (isSearching) return;
    setIsSearching(true);

    const runSearch = async () => {
      try {
        pushFiltersToUrl(localFilters);
        await Promise.resolve(onSearchChangeRef.current(localFilters));
      } finally {
        setIsSearching(false);
      }
    };

    runSearch();
  }, [isSearching]);

  // Keep a stable ref to onSearchChange so the effect below doesn't re-run
  // just because the parent re-rendered and passed a new function reference.
  const onSearchChangeRef = useRef(onSearchChange);
  useEffect(() => {
    onSearchChangeRef.current = onSearchChange;
  }, [onSearchChange]);

  // useEffect(() => {
  //   if (!isSearching) return;

  //   const runSearch = async () => {
  //     try {
  //       pushFiltersToUrl(localFilters);
  //       await Promise.resolve(onSearchChangeRef.current(localFilters));
  //     } finally {
  //       setIsSearching(false);
  //     }
  //   };

  //   runSearch();
  //   // localFilters is captured at the moment isSearching turns true — that is intentional.
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isSearching]);

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
    <div className="p-2 md:p-1 mb-2 transition-all duration-300 animate-in fade-in slide-in-from-top-5 duration-500">
      {/* <div className="flex items-center justify-between gap-2 "> */}
      <div className="flex flex-col lg:flex-row gap-2 ">
        {/* <div className="flex justify-center items-center p-2  rounded-lg min-w-[250px] w-full "> */}
        <div className="relative w-full bg-white">
          {/* <Search className="w-4 h-4 input-search-icon " /> */}
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4 group-focus-within:text-blue-500 transition-colors" />
          <Input
            id="search-bar"
            type="text"
            placeholder="economist in New York, NY | system design in San Francisco, CA"
            value={localFilters.query}
            onChange={(e) => handleInputChange('query', e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all border-2"
            aria-label="Search jobs"
          />
        </div>
        {/* </div> */}

        <div className="grid grid-cols-2 md:grid-cols-2 gap-2">
          <button
            onClick={handleSearchClick}
            disabled={isSearching}
            className={`flex items-center bg-buttonPrimary text-white justify-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform ${
              isSearching ? ' cursor-not-allowed' : ' hover:scale-105  '
            }`}
          >
            {isSearching ? (
              <>
                <Loader2
                  className="w-10 h-6
                 animate-spin duration-300"
                />
              </>
            ) : (
              <>Search </>
            )}
          </button>

          <button
            onClick={onOpenFilterModal}
            className="flex items-center justify-center gap-2 bg-buttonPrimary hover:from-purple-600 hover:to-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-200/50"
          >
            <Filter className="w-10 h-4" />
            Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
