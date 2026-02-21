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
import { X, MapPin, Calendar, Briefcase, Trash2 } from 'lucide-react';

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
    colorClass: string;
    value?: any;
  }[] = [];

  // 1. Locations (Blue Theme)
  if (filters.country)
    activeFilters.push({
      key: 'country',
      label: filters.country,
      icon: MapPin,
      colorClass: 'bg-blue-50 text-blue-700 border-blue-200',
    });
  if (filters.state)
    activeFilters.push({
      key: 'state',
      label: filters.state,
      icon: MapPin,
      colorClass: 'bg-blue-50 text-blue-700 border-blue-200',
    });

  // 2. Date Posted (Amber/Yellow Theme)
  if (filters.datePosted) {
    const labels: any = {
      day: 'Past 24h',
      week: 'Past Week',
      month: 'Past Month',
    };
    activeFilters.push({
      key: 'datePosted',
      label: labels[filters.datePosted],
      icon: Calendar,
      colorClass: 'bg-amber-50 text-amber-700 border-amber-200',
    });
  }

  // 3. Employment Types (Indigo Theme)
  filters.employmentType?.forEach((type: string) => {
    activeFilters.push({
      key: 'employmentType',
      label: type.toLowerCase().replace(/_/g, ' '),
      icon: Briefcase,
      colorClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      value: type,
    });
  });

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-3 mb-2 animate-in fade-in slide-in-from-top-1 duration-300">
      <div className="flex flex-wrap gap-2 items-center">
        {activeFilters.map((filter, index) => (
          <div
            key={`${filter.key}-${index}`}
            className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg border shadow-sm transition-all hover:shadow-md ${filter.colorClass}`}
          >
            <filter.icon size={13} className="opacity-70" />
            <span className="text-[13px] font-semibold capitalize tracking-tight">
              {filter.label}
            </span>
            <button
              onClick={() => onRemove(filter.key, filter.value)}
              className="ml-1 p-0.5 rounded-full hover:bg-black/5 transition-colors"
              aria-label={`Remove ${filter.label} filter`}
            >
              <X size={14} className="stroke-[2.5px]" />
            </button>
          </div>
        ))}
      </div>

      {/* Clear All Button */}
      <button
        onClick={() => onRemove('clearAll')}
        className="flex items-center gap-1.5 ml-2 px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
      >
        <Trash2 size={13} />
        Clear All
      </button>
    </div>
  );
};
