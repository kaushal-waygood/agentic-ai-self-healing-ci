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

const PROJECT_NAME_REGEX = /^[a-zA-Z0-9\s\-'.,&!?()]+$/;

export const getProjectEntryErrors = (
  proj?: Partial<ProjectEntry> | null,
): Partial<Record<keyof ProjectEntry, string>> => {
  const errors: Partial<Record<keyof ProjectEntry, string>> = {};
  const projectName = (proj?.projectName ?? '').trim();
  const description = (proj?.description ?? '').trim();
  const technologies = (proj?.technologies ?? '').trim();
  const link = (proj?.link ?? '').trim();

  if (!projectName) errors.projectName = 'Project name is required';
  else if (!PROJECT_NAME_REGEX.test(projectName)) {
    errors.projectName =
      'Only letters, numbers, spaces, and basic punctuation allowed';
  }

  if (!description) errors.description = 'Description is required';

  if (!technologies) errors.technologies = 'Technologies used is required';

  if (link) {
    if (!/^https?:\/\//.test(link)) {
      errors.link = 'URL must start with http:// or https://';
    } else {
      try {
        // eslint-disable-next-line no-new
        new URL(link);
      } catch {
        errors.link =
          'Please enter a valid URL starting with http:// or https://';
      }
    }
  }

  return errors;
};

export const isProjectEntryValid = (proj?: Partial<ProjectEntry> | null) =>
  Object.keys(getProjectEntryErrors(proj)).length === 0;

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

  //   const showError = (
  //   value?: string,
  //   obj?: Record<string, unknown>,
  //   index?: number,
  // ) => shouldValidate(obj, index) && !safeTrim(value);

  const getError = (
    index: number,
    field: keyof ProjectEntry,
    obj?: Record<string, unknown>,
  ) => {
    if (!shouldValidate(obj, index)) return '';
    const errors = getProjectEntryErrors(projects[index]);
    return errors[field] ?? '';
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {projects.map((proj, index) => {
          const projectNameError = getError(index, 'projectName', proj);
          const descriptionError = getError(index, 'description', proj);
          const technologiesError = getError(index, 'technologies', proj);
          const linkError = getError(index, 'link', proj);

          return (
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
                  //  showError(proj.projectName, proj, index)
                  projectNameError ? 'border-red-500 ' : ''
                }`}
              />

              {/* {showError(proj.projectName, proj, index) && ( */}
              {projectNameError && (
                <p className="text-xs text-red-500">{projectNameError}</p>
              )}

              <Textarea
                value={proj.description}
                onChange={(e) => onchange(index, 'description', e.target.value)}
                placeholder="Project description..."
                className={`h-11 ${
                  // showError(proj.description, proj, index)
                  descriptionError ? 'border-red-500 ' : ''
                }`}
              />
              {/* {showError(proj.description, proj, index) && ( */}
              {descriptionError && (
                <p className="text-xs text-red-500">{descriptionError}</p>
              )}
              <Textarea
                value={proj.technologies}
                onChange={(e) =>
                  onchange(index, 'technologies', e.target.value)
                }
                placeholder="Technologies used (comma-separated), e.g., React, Node.js, AWS"
                className={`h-11 ${
                  // showError(proj.technologies, proj, index)
                  technologiesError ? 'border-red-500 ' : ''
                }`}
              />
              {/* {showError(proj.technologies, proj, index) && ( */}
              {technologiesError && (
                <p className="text-xs text-red-500">{technologiesError}</p>
              )}
              <Input
                value={proj.link}
                onChange={(e) => onchange(index, 'link', e.target.value)}
                placeholder="https://github.com/your-repo"
                className={`h-11 text-base ${linkError ? 'border-red-500 ' : ''}`}
              />
              {linkError && <p className="text-xs text-red-500">{linkError}</p>}
            </div>
          );
        })}
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
