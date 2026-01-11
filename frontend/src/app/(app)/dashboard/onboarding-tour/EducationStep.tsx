// src/app/(app)/dashboard/onboarding-tour/EducationStep.tsx

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, XCircle } from 'lucide-react';

// Define the types for the props
type EducationEntry = {
  institute: string;
  degree: string;
  graduationYear: string;
  grade: string;
};

interface EducationStepProps {
  education: EducationEntry[];
  onchange: (index: number, field: keyof EducationEntry, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

const EducationStep: React.FC<EducationStepProps> = ({
  education, // Destructure the props directly
  onchange,
  onAdd,
  onRemove,
}) => {
  return (
    <div className="space-y-6">
      {education.map((edu, index) => (
        <div
          key={index}
          className="space-y-4 p-4 border-2 border-purple-100 rounded-xl relative bg-white/60"
        >
          {education.length > 1 && (
            <Button
              type="button"
              onClick={() => onRemove(index)}
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-red-500 hover:bg-red-100 h-8 w-8 rounded-full"
            >
              <XCircle className="w-5 h-5" />
            </Button>
          )}
          <Input
            value={edu.institute || ''}
            onChange={(e) => onchange(index, 'institute', e.target.value)}
            placeholder="College/University Name"
            className="h-11 text-base"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2  gap-4">
            <Input
              value={edu.degree || ''}
              onChange={(e) => onchange(index, 'degree', e.target.value)}
              placeholder="Degree"
              className="h-11 text-base"
            />
            <Input
              type="month"
              value={edu.graduationYear ? `${edu.graduationYear}-01` : ''}
              onChange={(e) => {
                const year = e.target.value.split('-')[0]; // extract year
                onchange(index, 'graduationYear', year);
              }}
              className="h-11 text-base"
            />
          </div>
          <Input
            value={edu.grade || ''}
            onChange={(e) => onchange(index, 'grade', e.target.value)}
            placeholder="CGPA/Percentage"
            className="h-11 text-base"
          />
        </div>
      ))}
      <Button
        type="button"
        onClick={onAdd}
        variant="outline"
        className="w-full h-12 border-dashed border-blue-300 text-blue-600"
      >
        <PlusCircle className="w-5 h-5 mr-2" />
        Add Another Education
      </Button>
    </div>
  );
};

export default EducationStep;
