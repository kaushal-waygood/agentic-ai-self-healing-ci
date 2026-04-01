// // Components/jobs/FilterPills.tsx (or inside JobsPage)
// import { X } from 'lucide-react';

// export const FilterPills = ({
//   filters,
//   onRemove,
// }: {
//   filters: any;
//   onRemove: (key: string, value?: any) => void;
// }) => {
//   const activeFilters: { key: string; label: string; value?: any }[] = [];

//   // 1. Check for Country/State
//   if (filters.country)
//     activeFilters.push({
//       key: 'country',
//       label: `Country: ${filters.country}`,
//     });
//   if (filters.state)
//     activeFilters.push({ key: 'state', label: `State: ${filters.state}` });

//   // 2. Check for Date Posted
//   if (filters.datePosted) {
//     const labels: any = {
//       day: 'Past 24h',
//       week: 'Past Week',
//       month: 'Past Month',
//     };
//     activeFilters.push({
//       key: 'datePosted',
//       label: labels[filters.datePosted],
//     });
//   }

//   // 3. Check for Employment Types (Arrays)
//   filters.employmentType?.forEach((type: string) => {
//     activeFilters.push({
//       key: 'employmentType',
//       label: type.toLowerCase().replace(/_/g, ' '),
//       value: type,
//     });
//   });

//   if (activeFilters.length === 0) return null;

//   return (
//     <div className="flex flex-wrap gap-2 px-4 mb-4">
//       {activeFilters.map((filter, index) => (
//         <div
//           key={`${filter.key}-${index}`}
//           className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-full text-xs font-medium"
//         >
//           <span className="capitalize">{filter.label}</span>
//           <button
//             onClick={() => onRemove(filter.key, filter.value)}
//             className="hover:text-blue-900 transition-colors"
//           >
//             <X size={14} />
//           </button>
//         </div>
//       ))}
//       <button
//         onClick={() => onRemove('clearAll')}
//         className="text-xs text-gray-500 hover:text-red-500 underline ml-2"
//       >
//         Clear All
//       </button>
//     </div>
//   );
// };

// import { X, MapPin, Calendar, Briefcase, Trash2 } from 'lucide-react';

// export const FilterPills = ({
//   filters,
//   onRemove,
// }: {
//   filters: any;
//   onRemove: (key: string, value?: any) => void;
// }) => {
//   const activeFilters: {
//     key: string;
//     label: string;
//     icon: any;
//     value?: any;
//   }[] = [];

//   // 1. Locations
//   if (filters.country)
//     activeFilters.push({
//       key: 'country',
//       label: filters.country,
//       icon: MapPin,
//     });
//   if (filters.state)
//     activeFilters.push({ key: 'state', label: filters.state, icon: MapPin });

//   // 2. Date Posted
//   if (filters.datePosted) {
//     const labels: Record<string, string> = {
//       day: 'Past 24h',
//       week: 'Past Week',
//       month: 'Past Month',
//     };
//     activeFilters.push({
//       key: 'datePosted',
//       label: labels[filters.datePosted] || filters.datePosted,
//       icon: Calendar,
//     });
//   }

//   // 3. Employment Types
//   if (Array.isArray(filters.employmentType)) {
//     filters.employmentType.forEach((type: string) => {
//       activeFilters.push({
//         key: 'employmentType',
//         label: type.toLowerCase().replace(/_/g, ' '),
//         icon: Briefcase,
//         value: type,
//       });
//     });
//   }

//   if (activeFilters.length === 0) return null;

//   return (
//     <div className="mx-auto mb-6 flex w-full max-w-[900px] flex-wrap items-center gap-2 px-2 animate-in fade-in slide-in-from-top-2 duration-300">
//       {activeFilters.map((filter, index) => (
//         <div
//           key={`${filter.key}-${index}`}
//           className="group flex items-center gap-1.5 rounded-lg border border-indigo-100 bg-indigo-50/80 px-3 py-1.5 transition-all hover:border-indigo-200 hover:bg-indigo-100/80"
//         >
//           <filter.icon size={14} className="text-indigo-500" />
//           <span className="text-[13px] font-semibold capitalize tracking-tight text-indigo-700">
//             {filter.label}
//           </span>
//           <button
//             onClick={() => onRemove(filter.key, filter.value)}
//             className="ml-0.5 rounded-full p-0.5 text-indigo-400 transition-colors hover:bg-indigo-200 hover:text-indigo-700"
//             aria-label={`Remove ${filter.label} filter`}
//           >
//             <X size={14} className="stroke-[2.5px]" />
//           </button>
//         </div>
//       ))}

//       {/* Clear All Button */}
//       <button
//         type="button"
//         onClick={(e) => {
//           e.preventDefault(); // Prevent any form submission
//           onRemove('clearAll');
//         }}
//         className="ml-2 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-bold text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700"
//       >
//         <Trash2 size={14} />
//         Clear All
//       </button>
//     </div>
//   );
// };
import { X, MapPin, Calendar, Briefcase, Clock, Trash2 } from 'lucide-react';

export const FilterPills = ({
  filters,
  onRemove,
}: {
  filters: any;
  onRemove: (key: string, value?: any) => void;
}) => {
  const activeFilters: {
    key: string;
    label: string;
    icon: any;
    value?: any;
  }[] = [];

  // 1. Locations
  if (filters.country)
    activeFilters.push({
      key: 'country',
      label: filters.country,
      icon: MapPin,
    });
  if (filters.state)
    activeFilters.push({ key: 'state', label: filters.state, icon: MapPin });

  // 2. Date Posted
  if (filters.datePosted) {
    const labels: Record<string, string> = {
      day: 'Past 24h',
      week: 'Past Week',
      month: 'Past Month',
    };
    activeFilters.push({
      key: 'datePosted',
      label: labels[filters.datePosted] || filters.datePosted,
      icon: Calendar,
    });
  }

  // 3. Employment Types
  if (Array.isArray(filters.employmentType)) {
    filters.employmentType.forEach((type: string) => {
      activeFilters.push({
        key: 'employmentType',
        label: type.toLowerCase().replace(/_/g, ' '),
        icon: Briefcase,
        value: type,
      });
    });
  }

  if (Array.isArray(filters.experience)) {
    filters.experience.forEach((level: string) => {
      activeFilters.push({
        key: 'experience',
        label: level,
        icon: Clock,
        value: level,
      });
    });
  }

  if (activeFilters.length === 0) return null;

  return (
    <div className="mx-auto mb-5 flex w-full max-w-[900px] flex-wrap items-center gap-2 px-2 animate-in fade-in slide-in-from-top-2 duration-300 ">
      <div className="flex flex-wrap items-center gap-2">
        {activeFilters.map((filter, index) => (
          <div
            key={`${filter.key}-${index}`}
            className="group flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
          >
            <filter.icon
              size={13}
              className="text-slate-400"
              strokeWidth={2.5}
            />
            <span className="text-[15px] font-medium capitalize tracking-tight text-slate-600">
              {filter.label}
            </span>
            <button
              onClick={() => onRemove(filter.key, filter.value)}
              className="ml-0.5 rounded-full p-0.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
              aria-label={`Remove ${filter.label} filter`}
            >
              <X size={14} className="stroke-[2.5px]" />
            </button>
          </div>
        ))}

        {/* Clear All Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onRemove('clearAll');
          }}
          className="ml-2 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 size={13} strokeWidth={2.5} />
          Clear All
        </button>
      </div>
    </div>
  );
};
