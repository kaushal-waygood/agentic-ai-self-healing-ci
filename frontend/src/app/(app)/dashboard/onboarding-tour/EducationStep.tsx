// src/app/(app)/dashboard/onboarding-tour/EducationStep.tsx

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label'; // Assuming you have this, otherwise use standard <label>
import { PlusCircle, XCircle, CalendarIcon } from 'lucide-react';

// 1. Updated Type Definitions to match the fuller form
export type EducationEntry = {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  country: string;
  startDate: string;
  endDate: string;
  grade: string;
};

interface EducationStepProps {
  education: EducationEntry[];
  // Updated field key type
  onchange: (index: number, field: keyof EducationEntry, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

const EducationStep: React.FC<EducationStepProps> = ({
  education,
  onchange,
  onAdd,
  onRemove,
}) => {
  return (
    <div className="space-y-6">
      {education.map((edu, index) => (
        <div
          key={index}
          className="space-y-4 p-5 border-2 border-purple-100 rounded-xl relative bg-white/60 shadow-sm transition-all hover:border-purple-200"
        >
          {/* Remove Button */}
          {education.length > 1 && (
            <Button
              type="button"
              onClick={() => onRemove(index)}
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 rounded-full z-10"
            >
              <XCircle className="w-5 h-5" />
            </Button>
          )}

          {/* Row 1: Institution */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Institution
            </Label>
            <Input
              value={edu.institution || ''}
              onChange={(e) => onchange(index, 'institution', e.target.value)}
              placeholder="e.g. University of Technology"
              className="h-11 text-base bg-white"
            />
          </div>

          {/* Row 2: Degree & Field of Study */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Degree
              </Label>
              <Input
                value={edu.degree || ''}
                onChange={(e) => onchange(index, 'degree', e.target.value)}
                placeholder="e.g. Bachelor's"
                className="h-11 text-base bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Field of Study
              </Label>
              <Input
                value={edu.fieldOfStudy || ''}
                onChange={(e) =>
                  onchange(index, 'fieldOfStudy', e.target.value)
                }
                placeholder="e.g. Computer Science"
                className="h-11 text-base bg-white"
              />
            </div>
          </div>

          {/* Row 3: Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Start Date
              </Label>
              <div className="relative">
                <Input
                  type="month"
                  value={edu.startDate || ''}
                  onChange={(e) => onchange(index, 'startDate', e.target.value)}
                  className="h-11 text-base bg-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                End Date{' '}
                <span className="text-gray-400 font-normal">(or expected)</span>
              </Label>
              <div className="relative">
                <Input
                  type="month"
                  value={edu.endDate || ''}
                  onChange={(e) => onchange(index, 'endDate', e.target.value)}
                  className="h-11 text-base bg-white"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Country & Grade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Country
              </Label>
              {/* Note: You can replace this Input with your Select component if you have the countries list available here */}
              <Input
                value={edu.country || ''}
                onChange={(e) => onchange(index, 'country', e.target.value)}
                placeholder="e.g. United States"
                className="h-11 text-base bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Grade / GPA
              </Label>
              <Input
                value={edu.grade || ''}
                onChange={(e) => onchange(index, 'grade', e.target.value)}
                placeholder="e.g. 3.8/4.0"
                className="h-11 text-base bg-white"
              />
            </div>
          </div>
        </div>
      ))}

      <Button
        type="button"
        onClick={onAdd}
        variant="outline"
        className="w-full h-14 border-dashed border-2 border-blue-200 text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all text-base font-medium"
      >
        <PlusCircle className="w-5 h-5 mr-2" />
        Add Education
      </Button>
    </div>
  );
};

export default EducationStep;
