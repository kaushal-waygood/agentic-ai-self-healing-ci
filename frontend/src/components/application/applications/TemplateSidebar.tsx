import React from 'react';

import clsx from 'clsx';

export const resumeTemplates = [
  {
    id: 'classic',
    name: 'Classic',
    thumbnail: '/templates/classic.svg',
    className: 'resume-classic',
  },
  {
    id: 'modern',
    name: 'Modern',
    thumbnail: '/templates/modern.svg',
    className: 'resume-modern',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    thumbnail: '/templates/minimal.svg',
    className: 'resume-minimal',
  },
  {
    id: 'professional',
    name: 'Professional',
    thumbnail: '/templates/professional.svg',
    className: 'resume-professional',
  },
  {
    id: 'test',
    name: 'test',
    thumbnail: '/templates/professional.svg',
    className: 'resume-professional',
  },
];

// export const resumeTemplates = [
//   {
//     id: 'classic',
//     name: 'Classic',
//     thumbnail: 'https://placehold.co/300x420/ffffff/000000?text=Classic+Resume',
//     className: 'resume-classic',
//   },
//   {
//     id: 'modern',
//     name: 'Modern',
//     thumbnail: 'https://placehold.co/300x420/eff6ff/2563eb?text=Modern+Resume',
//     className: 'resume-modern',
//   },
//   {
//     id: 'minimal',
//     name: 'Minimal',
//     thumbnail: 'https://placehold.co/300x420/ffffff/111827?text=Minimal+Resume',
//     className: 'resume-minimal',
//   },
//   {
//     id: 'professional',
//     name: 'Professional',
//     thumbnail:
//       'https://placehold.co/300x420/f8fafc/0f172a?text=Professional+Resume',
//     className: 'resume-professional',
//   },
// ];

const TemplateSidebar = ({ activeTemplate, onSelect }) => {
  return (
    <div className="w-full lg:w-56 space-y-3">
      <h3 className="font-semibold text-sm text-gray-700">Resume Templates</h3>

      {resumeTemplates.map((template) => (
        <button
          key={template.id}
          onClick={() => onSelect(template)}
          className={clsx(
            'w-full rounded-lg border p-2 transition hover:shadow-md',
            activeTemplate?.id === template.id
              ? 'border-primary ring-2 ring-primary'
              : 'border-gray-200',
          )}
        >
          <img
            src={template.thumbnail}
            alt={template.name}
            className="w-full h-32 object-cover rounded-md"
          />
          <p className="mt-2 text-xs font-medium text-center">
            {template.name}
          </p>
        </button>
      ))}
    </div>
  );
};

export default TemplateSidebar;
