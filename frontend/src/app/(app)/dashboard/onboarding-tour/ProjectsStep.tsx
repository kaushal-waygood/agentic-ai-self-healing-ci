// ProjectsStep.tsx

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, XCircle } from 'lucide-react';

// Define Prop Types
type ProjectEntry = {
  projectName: string;
  description: string;
  technologies: string;
  link: string;
};

interface ProjectsStepProps {
  projects: ProjectEntry[];
  onchange: (index: number, field: keyof ProjectEntry, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  attemptedNext: boolean;
}

const ProjectsStep: React.FC<ProjectsStepProps> = ({
  projects,
  onchange,
  onAdd,
  onRemove,
  attemptedNext,
}) => {
  const safeTrim = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

  const isFilled = (obj?: Record<string, unknown>) => {
    if (!obj || typeof obj !== 'object') return false;
    return Object.values(obj).some((v) => safeTrim(v));
  };

  /**
   * Validate if:
   * - user clicked Next
   * - AND (this project is filled OR it's the first project)
   */
  const shouldValidate = (obj?: Record<string, unknown>, index?: number) =>
    attemptedNext && (isFilled(obj) || index === 0);

  const showError = (
    value?: string,
    obj?: Record<string, unknown>,
    index?: number,
  ) => shouldValidate(obj, index) && !safeTrim(value);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {projects.map((proj, index) => (
          <div
            key={index}
            className="space-y-3 p-4 border-2 border-purple-100 rounded-xl relative bg-white/60"
          >
            {projects.length > 1 && (
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
              value={proj.projectName}
              onChange={(e) => onchange(index, 'projectName', e.target.value)}
              placeholder="Project Name"
              className={`h-11 ${
                showError(proj.projectName, proj, index)
                  ? 'border-red-500 '
                  : ''
              }`}
            />

            {showError(proj.projectName, proj, index) && (
              <p className="text-xs text-red-500">Project name is required</p>
            )}

            <Textarea
              value={proj.description}
              onChange={(e) => onchange(index, 'description', e.target.value)}
              placeholder="Project description..."
              className={`h-11 ${
                showError(proj.description, proj, index)
                  ? 'border-red-500 '
                  : ''
              }`}
            />
            {showError(proj.description, proj, index) && (
              <p className="text-xs text-red-500">
                Project description is required
              </p>
            )}
            <Textarea
              value={proj.technologies}
              onChange={(e) => onchange(index, 'technologies', e.target.value)}
              placeholder="Technologies used (comma-separated), e.g., React, Node.js, AWS"
              className={`h-11 ${
                showError(proj.technologies, proj, index)
                  ? 'border-red-500 '
                  : ''
              }`}
            />
            {showError(proj.technologies, proj, index) && (
              <p className="text-xs text-red-500">
                Project description is required
              </p>
            )}
            <Input
              value={proj.link}
              onChange={(e) => onchange(index, 'link', e.target.value)}
              placeholder="https://github.com/your-repo"
              className="h-11 text-base"
            />
          </div>
        ))}
      </div>
      <Button
        type="button"
        onClick={onAdd}
        variant="outline"
        className="w-full h-12 border-2 border-dashed border-blue-300 text-blue-600 font-semibold"
      >
        <PlusCircle className="w-5 h-5 mr-2" />
        Add Another Project
      </Button>
    </div>
  );
};

export default ProjectsStep;
