import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import apiInstance from '@/services/api';

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
    <div className="w-56 border-r bg-white p-3 space-y-3 overflow-y-auto">
      <h3 className="font-semibold text-sm text-gray-700">Resume Templates</h3>

      {templates.map((template) => (
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
