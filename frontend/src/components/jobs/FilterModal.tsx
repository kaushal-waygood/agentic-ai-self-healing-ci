'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Globe, MapPin, X, Briefcase, Clock, CalendarDays } from 'lucide-react';
import CountrySelector from '../common/CountrySelector';
import StateSelector from '../common/StateSelector';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  employmentTypes: string[];
  experienceLevels: string[];
  filters: any;
  handleFilterChange: (newFilters: any) => void;
}

const datePostedOptions = [
  { id: 'day', label: 'Past 24 hours' },
  { id: 'week', label: 'Past week' },
  { id: 'month', label: 'Past month' },
];

const FilterTag = ({
  label,
  isSelected,
  onClick,
}: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    role="checkbox"
    aria-checked={isSelected}
    className={`px-4 py-2.5 text-[13px] rounded-xl border transition-all duration-200 capitalize whitespace-nowrap flex items-center justify-center ${
      isSelected
        ? 'bg-blue-600 text-white border-blue-600 shadow-[0_4px_12px_rgba(37,99,235,0.25)] font-bold hover:bg-blue-700'
        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-semibold shadow-sm'
    }`}
  >
    {label}
  </button>
);

const EducationTag = ({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) => (
  <div className="flex items-center gap-1.5 bg-slate-100 text-slate-700 text-[12px] font-bold px-2.5 py-1.5 rounded-lg border border-slate-200">
    <span>{label}</span>
    <button
      onClick={onRemove}
      className="text-slate-400 hover:text-red-500 transition-colors"
    >
      <X size={14} />
    </button>
  </div>
);

export const FilterModal = ({
  isOpen,
  onClose,
  employmentTypes,
  experienceLevels,
  filters,
  handleFilterChange,
}: FilterModalProps) => {
  const [localFilters, setLocalFilters] = useState<any>({
    ...filters,
    education: filters?.education || [],
  });

  const [educationInput, setEducationInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLocalFilters({
        ...filters,
        education: filters.education || [],
      });
    }
  }, [isOpen]);

  const handleSelectionChange = (
    filterKey: 'employmentType' | 'experience',
    value: string,
  ) => {
    const currentValues: string[] = localFilters[filterKey] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];
    setLocalFilters((prev: any) => ({ ...prev, [filterKey]: newValues }));
  };

  const handleDatePostedChange = (value: string) => {
    setLocalFilters((prev: any) => ({
      ...prev,
      datePosted: prev.datePosted === value ? '' : value,
    }));
  };

  const handleEducationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = educationInput.trim();
      if (newTag && !localFilters.education?.includes(newTag)) {
        setLocalFilters((prev: any) => ({
          ...prev,
          education: [...(prev.education || []), newTag],
        }));
      }
      setEducationInput('');
    }
  };

  const handleRemoveEducationTag = (tagToRemove: string) => {
    setLocalFilters((prev: any) => ({
      ...prev,
      education: prev.education.filter((tag: string) => tag !== tagToRemove),
    }));
  };

  const handleApply = () => {
    onClose();
    setTimeout(() => {
      handleFilterChange(localFilters);
    }, 100);
  };

  const handleReset = () => {
    const resetState = {
      query: filters.query || '',
      country: '',
      countryCode: '',
      city: '',
      state: '',
      datePosted: '',
      employmentType: [],
      experience: [],
      education: [],
    };
    setLocalFilters(resetState);
    handleFilterChange(resetState);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Premium overriding of Shadcn defaults for a custom look */}
      <DialogContent className="w-[95vw] sm:max-w-[760px] bg-white p-0 rounded-[24px] border-slate-200/80 shadow-2xl gap-0 overflow-hidden flex flex-col font-['Plus_Jakarta_Sans']">
        {/* Header */}
        <DialogHeader className="px-8 pt-8 pb-6 border-b border-slate-100 bg-white shrink-0 text-left">
          <DialogTitle className="text-[24px] font-black text-slate-900 tracking-tight">
            Advanced Filters
          </DialogTitle>
          <DialogDescription className="text-[13.5px] text-slate-500 font-medium mt-1">
            Refine your job search parameters to find the perfect match.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto max-h-[65vh] p-8 bg-slate-50/50 space-y-8 custom-scrollbar">
          {/* Location Section */}
          <div>
            <h4 className="text-[13.5px] font-extrabold text-slate-900 flex items-center gap-2 mb-4">
              <Globe className="w-4 h-4 text-blue-500" strokeWidth={2.5} />
              Location Preferences
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all shadow-sm hover:border-slate-300 h-12">
                <Globe
                  className="w-[18px] h-[18px] text-slate-400 mr-2 shrink-0"
                  strokeWidth={2}
                />
                <CountrySelector
                  value={localFilters.country || ''}
                  onChange={(countryCode: string) =>
                    setLocalFilters((prev: any) => ({
                      ...prev,
                      country: countryCode,
                      state: '',
                    }))
                  }
                  className="w-full bg-transparent border-none focus:ring-0 text-[13.5px] font-semibold text-slate-900 outline-none p-0"
                />
              </div>

              <div
                className={`relative flex items-center border rounded-xl px-4 py-2 transition-all h-12 shadow-sm ${localFilters.country ? 'bg-white border-slate-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 hover:border-slate-300' : 'bg-slate-100 border-slate-200 opacity-60'}`}
              >
                <MapPin
                  className="w-[18px] h-[18px] text-slate-400 mr-2 shrink-0"
                  strokeWidth={2}
                />
                <StateSelector
                  countryCode={localFilters.country}
                  value={localFilters.state}
                  onChange={(stateCode: string) =>
                    setLocalFilters((prev: any) => ({
                      ...prev,
                      state: stateCode,
                    }))
                  }
                  disabled={!localFilters.country}
                  className="w-full bg-transparent border-none focus:ring-0 text-[13.5px] font-semibold text-slate-900 outline-none p-0"
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-slate-200/60"></div>

          {/* Grid for Tags (Employment & Experience) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-[13.5px] font-extrabold text-slate-900 flex items-center gap-2">
                <Briefcase
                  className="w-4 h-4 text-blue-500"
                  strokeWidth={2.5}
                />
                Employment Type
              </h4>
              <div className="flex flex-wrap gap-2.5">
                {employmentTypes
                  ?.filter((type) => typeof type === 'string')
                  .map((type) => (
                    <FilterTag
                      key={type}
                      label={type.toLowerCase().replace(/_/g, ' ')}
                      isSelected={localFilters.employmentType?.includes(type)}
                      onClick={() =>
                        handleSelectionChange('employmentType', type)
                      }
                    />
                  ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[13.5px] font-extrabold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" strokeWidth={2.5} />
                Experience Level
              </h4>
              <div className="flex flex-wrap gap-2.5">
                {experienceLevels
                  ?.filter((level) => typeof level === 'string')
                  .map((level) => (
                    <FilterTag
                      key={level}
                      label={level.toLowerCase().replace(/_/g, ' ')}
                      isSelected={localFilters.experience?.includes(level)}
                      onClick={() => handleSelectionChange('experience', level)}
                    />
                  ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-slate-200/60"></div>

          {/* Date Posted */}
          <div className="space-y-4">
            <h4 className="text-[13.5px] font-extrabold text-slate-900 flex items-center gap-2">
              <CalendarDays
                className="w-4 h-4 text-blue-500"
                strokeWidth={2.5}
              />
              Date Posted
            </h4>
            <div className="flex flex-wrap gap-2.5">
              {datePostedOptions.map((option) => (
                <FilterTag
                  key={option.id}
                  label={option.label}
                  isSelected={localFilters.datePosted === option.id}
                  onClick={() => handleDatePostedChange(option.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="px-8 py-5 border-t border-slate-100 bg-white sm:justify-between items-center shrink-0">
          <button
            onClick={handleReset}
            className="px-5 py-2.5 text-slate-500 hover:text-slate-800 text-[13.5px] font-bold transition-colors w-full sm:w-auto mb-3 sm:mb-0 text-center"
          >
            Reset Filters
          </button>
          <button
            onClick={handleApply}
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[14px] font-extrabold shadow-[0_4px_16px_rgba(37,99,235,0.25)] transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            Apply Filters
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// 'use client';

// import { useState, useEffect, useMemo } from 'react';
// import { Button } from '@/components/ui/button';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';
// import { Globe, Loader, MapPin, X } from 'lucide-react';
// import CountrySelector from '../common/CountrySelector';
// import StateSelector from '../common/StateSelector';

// interface FilterModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   employmentTypes: string[];
//   experienceLevels: string[];
//   filters: any;
//   handleFilterChange: (newFilters: any) => void;
// }

// const datePostedOptions = [
//   { id: 'day', label: 'Past 24 hours' },
//   { id: 'week', label: 'Past week' },
//   { id: 'month', label: 'Past month' },
// ];

// const FilterTag = ({
//   label,
//   isSelected,
//   onClick,
// }: {
//   label: string;
//   isSelected: boolean;
//   onClick: () => void;
// }) => (
//   <button
//     onClick={onClick}
//     role="checkbox"
//     aria-checked={isSelected}
//     className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full border transition-all duration-200 capitalize whitespace-nowrap ${
//       isSelected
//         ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
//         : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
//     }`}
//   >
//     {label}
//   </button>
// );

// const EducationTag = ({
//   label,
//   onRemove,
// }: {
//   label: string;
//   onRemove: () => void;
// }) => (
//   <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs sm:text-sm font-medium px-2 py-1 rounded-md">
//     <span>{label}</span>
//     <button
//       onClick={onRemove}
//       className="text-gray-500 hover:text-gray-800 transition-colors"
//     >
//       <X size={14} />
//     </button>
//   </div>
// );

// export const FilterModal = ({
//   isOpen,
//   onClose,
//   employmentTypes,
//   experienceLevels,
//   filters,
//   handleFilterChange,
// }: FilterModalProps) => {
//   const [localFilters, setLocalFilters] = useState<any>({
//     ...filters,
//     education: filters?.education || [],
//   });

//   const [educationInput, setEducationInput] = useState('');

//   useEffect(() => {
//     if (isOpen) {
//       setLocalFilters({
//         ...filters,
//         education: filters.education || [],
//       });
//     }
//   }, [isOpen]);

//   const handleSelectionChange = (
//     filterKey: 'employmentType' | 'experience',
//     value: string,
//   ) => {
//     const currentValues: string[] = localFilters[filterKey] || [];
//     const newValues = currentValues.includes(value)
//       ? currentValues.filter((item) => item !== value)
//       : [...currentValues, value];
//     setLocalFilters((prev: any) => ({ ...prev, [filterKey]: newValues }));
//   };

//   const handleDatePostedChange = (value: string) => {
//     setLocalFilters((prev: any) => ({
//       ...prev,
//       datePosted: prev.datePosted === value ? '' : value,
//     }));
//   };

//   const handleEducationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter' || e.key === ',') {
//       e.preventDefault();
//       const newTag = educationInput.trim();
//       if (newTag && !localFilters.education?.includes(newTag)) {
//         setLocalFilters((prev: any) => ({
//           ...prev,
//           education: [...(prev.education || []), newTag],
//         }));
//       }
//       setEducationInput('');
//     }
//   };

//   const handleRemoveEducationTag = (tagToRemove: string) => {
//     setLocalFilters((prev: any) => ({
//       ...prev,
//       education: prev.education.filter((tag: string) => tag !== tagToRemove),
//     }));
//   };

//   const handleApply = () => {
//     onClose();

//     setTimeout(() => {
//       handleFilterChange(localFilters);
//     }, 100);
//   };
//   const handleReset = () => {
//     const resetState = {
//       query: filters.query || '',
//       country: '',
//       countryCode: '',
//       city: '',
//       state: '',
//       datePosted: '',
//       employmentType: [],
//       experience: [],
//       education: [],
//     };
//     setLocalFilters(resetState);
//     handleFilterChange(resetState);
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       {/* sm:max-w-2xl sets the desktop width, w-[95vw] ensures it doesn't touch screen edges on mobile */}
//       <DialogContent className="w-[95vw] sm:max-w-2xl bg-white p-4 sm:p-6 rounded-xl max-h-[90vh] flex flex-col">
//         <DialogHeader className="space-y-1">
//           <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900">
//             More Filters
//           </DialogTitle>
//           <DialogDescription className="text-sm">
//             Refine your job search to find the perfect fit.
//           </DialogDescription>
//         </DialogHeader>

//         {/* Scrollable Area */}
//         <div className="flex-1 overflow-y-auto my-4 pr-2 -mr-2 scrollbar-thin">
//           <div className="space-y-6">
//             {/* Location Section */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//               <div className="relative flex items-center border rounded-lg px-3 py-2 bg-gray-50">
//                 <Globe className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
//                 <CountrySelector
//                   value={localFilters.country || ''}
//                   onChange={(countryCode: string) =>
//                     setLocalFilters((prev: any) => ({
//                       ...prev,
//                       country: countryCode,
//                       state: '',
//                     }))
//                   }
//                   className="w-full bg-transparent border-none focus:ring-0 text-sm"
//                 />
//               </div>

//               <div className="relative flex items-center border rounded-lg px-3 py-2 bg-gray-50">
//                 <MapPin className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
//                 <StateSelector
//                   countryCode={localFilters.country}
//                   value={localFilters.state}
//                   onChange={(stateCode: string) =>
//                     setLocalFilters((prev: any) => ({
//                       ...prev,
//                       state: stateCode,
//                     }))
//                   }
//                   disabled={!localFilters.country}
//                   className="w-full bg-transparent border-none focus:ring-0 text-sm"
//                 />
//               </div>
//             </div>

//             {/* Employment & Experience - Stacked on mobile, Grid on Tablet/Desktop */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="space-y-3">
//                 <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
//                   Employment Type
//                 </h4>
//                 <div className="flex flex-wrap gap-2">
//                   {employmentTypes
//                     ?.filter((type) => typeof type === 'string')
//                     .map((type) => (
//                       <FilterTag
//                         key={type}
//                         label={type.toLowerCase().replace(/_/g, ' ')}
//                         isSelected={localFilters.employmentType?.includes(type)}
//                         onClick={() =>
//                           handleSelectionChange('employmentType', type)
//                         }
//                       />
//                     ))}
//                 </div>
//               </div>

//               <div className="space-y-3">
//                 <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
//                   Experience Level
//                 </h4>
//                 <div className="flex flex-wrap gap-2">
//                   {experienceLevels
//                     ?.filter((level) => typeof level === 'string')
//                     .map((level) => (
//                       <FilterTag
//                         key={level}
//                         label={level.toLowerCase().replace(/_/g, ' ')}
//                         isSelected={localFilters.experience?.includes(level)}
//                         onClick={() =>
//                           handleSelectionChange('experience', level)
//                         }
//                       />
//                     ))}
//                 </div>
//               </div>
//             </div>

//             {/* Education Tag Input */}
//             {/* <div className="space-y-3">
//               <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
//                 Education
//               </h4>
//               <div className="flex flex-wrap items-center gap-2 w-full p-2 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-blue-100 transition-all">
//                 {localFilters.education?.map((tag: string) => (
//                   <EducationTag
//                     key={tag}
//                     label={tag}
//                     onRemove={() => handleRemoveEducationTag(tag)}
//                   />
//                 ))}
//                 <input
//                   type="text"
//                   value={educationInput}
//                   onChange={(e) => setEducationInput(e.target.value)}
//                   onKeyDown={handleEducationKeyDown}
//                   placeholder="e.g., Bachelors..."
//                   className="flex-1 min-w-[100px] text-sm bg-transparent outline-none p-1"
//                 />
//               </div>
//             </div> */}

//             {/* Date Posted */}
//             <div className="space-y-3">
//               <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
//                 Date Posted
//               </h4>
//               <div className="flex flex-wrap gap-2">
//                 {datePostedOptions.map((option) => (
//                   <FilterTag
//                     key={option.id}
//                     label={option.label}
//                     isSelected={localFilters.datePosted === option.id}
//                     onClick={() => handleDatePostedChange(option.id)}
//                   />
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Action Buttons - Sticky at bottom */}
//         <DialogFooter className="flex-row gap-2 pt-2 sm:pt-4 border-t mt-auto">
//           <Button
//             variant="outline"
//             onClick={handleReset}
//             className="flex-1 text-gray-500 font-medium"
//           >
//             Reset
//           </Button>
//           <Button
//             onClick={handleApply}
//             className="flex-2 sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-md"
//           >
//             Apply Filters
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// };
