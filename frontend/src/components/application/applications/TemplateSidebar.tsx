// import React, { useEffect, useState } from 'react';
// import clsx from 'clsx';
// import apiInstance from '@/services/api';

// const TEMPLATE_THUMBNAILS: Record<string, string> = {
//   classic: 'https://placehold.co/300x420?text=Classic',
//   modern: 'https://placehold.co/300x420?text=Modern',
//   minimal: 'https://placehold.co/300x420?text=Minimal',
//   executive: 'https://placehold.co/300x420?text=Executive',
//   compact: 'https://placehold.co/300x420?text=Compact',
//   academic: 'https://placehold.co/300x420?text=Academic',
//   tech: 'https://placehold.co/300x420?text=Tech',
//   government: 'https://placehold.co/300x420?text=Government',
//   sales: 'https://placehold.co/300x420?text=Sales',
//   legal: 'https://placehold.co/300x420?text=Legal',
//   student: 'https://placehold.co/300x420?text=Student',
// };

// export interface ResumeTemplate {
//   id: string;
//   name: string;
//   style: string;
//   thumbnail: string;
// }

// interface Props {
//   activeTemplate: ResumeTemplate | null;
//   onSelect: (template: ResumeTemplate) => void;
// }

// const TemplateSidebar: React.FC<Props> = ({ activeTemplate, onSelect }) => {
//   const [templates, setTemplates] = useState<ResumeTemplate[]>([]);

//   useEffect(() => {
//     const fetchTemplates = async () => {
//       try {
//         const { data } = await apiInstance.get('/students/templates');

//         const normalized = Object.entries(data).map(
//           ([key, style]: [string, any]) => ({
//             id: key,
//             name: key.charAt(0).toUpperCase() + key.slice(1),
//             style,
//             thumbnail:
//               TEMPLATE_THUMBNAILS[key] ||
//               'https://placehold.co/300x420?text=Template',
//           }),
//         );

//         setTemplates(normalized);

//         if (!activeTemplate && normalized.length > 0) {
//           const classic =
//             normalized.find((t) => t.id.toLowerCase() === 'classic') ||
//             normalized[0];
//           onSelect(classic);
//         }
//       } catch (err) {
//         console.error('Failed to fetch templates', err);
//       }
//     };

//     fetchTemplates();
//   }, []);

//   return (
//     <div className="w-56 border-r bg-white p-3 space-y-3 overflow-y-auto">
//       <h3 className="font-semibold text-sm text-gray-700">Resume Templates</h3>

//       {templates.map((template) => (
//         <button
//           key={template.id}
//           onClick={() => onSelect(template)}
//           className={clsx(
//             'w-full rounded-lg border p-2 transition hover:shadow-md',
//             activeTemplate?.id === template.id
//               ? 'border-primary ring-2 ring-primary'
//               : 'border-gray-200',
//           )}
//         >
//           <img
//             src={template.thumbnail}
//             alt={template.name}
//             className="w-full h-32 object-cover rounded-md"
//           />
//           <p className="mt-2 text-xs font-medium text-center">
//             {template.name}
//           </p>
//         </button>
//       ))}
//     </div>
//   );
// };

// export default TemplateSidebar;

import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import apiInstance from '@/services/api';
import {
  FileText,
  Layout,
  Minimize,
  Briefcase,
  Grid,
  BookOpen,
  Code,
  Building2,
  TrendingUp,
  Scale,
  GraduationCap,
} from 'lucide-react';

const TEMPLATE_THUMBNAILS: Record<string, string> = {
  classic: 'https://placehold.co/300x420?text=Classic',
  modern: 'https://placehold.co/300x420?text=Modern',
  minimal: 'https://placehold.co/300x420?text=Minimal',
  executive: 'https://placehold.co/300x420?text=Executive',
  compact: 'https://placehold.co/300x420?text=Compact',
  academic: 'https://placehold.co/300x420?text=Academic',
  tech: 'https://placehold.co/300x420?text=Tech',
  government: 'https://placehold.co/300x420?text=Government',
  sales: 'https://placehold.co/300x420?text=Sales',
  legal: 'https://placehold.co/300x420?text=Legal',
  student: 'https://placehold.co/300x420?text=Student',
};

const TEMPLATE_ICONS: Record<string, React.ElementType> = {
  classic: FileText,
  modern: Layout,
  minimal: Minimize,
  executive: Briefcase,
  compact: Grid,
  academic: BookOpen,
  tech: Code,
  government: Building2,
  sales: TrendingUp,
  legal: Scale,
  student: GraduationCap,
};

export interface ResumeTemplate {
  id: string;
  name: string;
  style: string;
  thumbnail: string;
}

interface Props {
  activeTemplate: ResumeTemplate | null;
  onSelect: (template: ResumeTemplate) => void;
}

const TemplateSidebar: React.FC<Props> = ({ activeTemplate, onSelect }) => {
  const [templates, setTemplates] = useState<ResumeTemplate[]>([]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { data } = await apiInstance.get('/students/templates');
        const normalized = Object.entries(data).map(
          ([key, style]: [string, any]) => ({
            id: key,
            name: key.charAt(0).toUpperCase() + key.slice(1),
            style,
            thumbnail:
              TEMPLATE_THUMBNAILS[key] ||
              'https://placehold.co/300x420?text=Template',
          }),
        );
        setTemplates(normalized);
        if (!activeTemplate && normalized.length > 0) {
          const classic =
            normalized.find((t) => t.id.toLowerCase() === 'classic') ||
            normalized[0];
          onSelect(classic);
        }
      } catch (err) {
        console.error('Failed to fetch templates', err);
      }
    };
    fetchTemplates();
  }, []);

  return (
    <div className="w-60 border-r bg-slate-50 p-4 space-y-4 overflow-y-auto h-full shadow-inner">
      <h3 className="font-bold text-xs tracking-widest text-slate-400 mb-2 px-1">
        Resume Templates
      </h3>

      <div className="grid grid-cols-1 gap-5">
        {templates.map((template) => {
          const IconComponent =
            TEMPLATE_ICONS[template.id.toLowerCase()] || FileText;
          const isActive = activeTemplate?.id === template.id;

          return (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              className={clsx(
                'group relative flex flex-col items-center w-full rounded-lg transition-all duration-500 ease-in-out p-1.5',
                'hover:-translate-y-1',
                isActive ? 'bg-blue-50' : 'bg-transparent hover:bg-blue-50',
              )}
            >
              {/* Image & Icon Container */}
              <div className="relative w-full h-20 overflow-hidden rounded-lg bg-slate-100">
                <img
                  src={template.thumbnail}
                  alt={template.name}
                  className={clsx(
                    'w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:blur-[2px]',
                    isActive
                      ? 'opacity-100'
                      : 'opacity-70 group-hover:opacity-90',
                  )}
                />

                {/* Centered Floating Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={clsx(
                      'p-4 rounded-full backdrop-blur-md transition-all duration-500 transform shadow-sm', // Removed border
                      isActive
                        ? 'bg-blue-600 text-white scale-110 shadow-blue-200' // Removed border
                        : 'bg-white/90 text-slate-500 scale-100 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:scale-125 group-hover:shadow-md', // Removed border
                    )}
                  >
                    <IconComponent className="w-4 h-4" strokeWidth={2} />
                  </div>
                </div>

                {/* Status Badge for Active */}
                {isActive && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-[10px] text-white font-bold px-1 py-1 rounded-full uppercase tracking-tighter"></div>
                )}
              </div>

              {/* Template Label */}
              <span
                className={clsx(
                  'mt-3 mb-1 text-[13px] font-bold tracking-tight transition-colors duration-300',
                  isActive
                    ? 'text-blue-700'
                    : 'text-slate-500 group-hover:text-blue-600',
                )}
              >
                {template.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TemplateSidebar;
