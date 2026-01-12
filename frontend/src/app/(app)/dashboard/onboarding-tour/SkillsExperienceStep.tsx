// src/app/(app)/dashboard/onboarding-tour/SkillsExperienceStep.tsx

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, XCircle } from 'lucide-react';
import { title } from 'process';

// Define Prop Types
type SkillEntry = { skill: string; level: string };
type ExperienceEntry = {
  company: string;
  title: string;
  duration: string;
  description: string;
};

// ✅ FIX: Update the props interface to accept individual props
interface SkillsExperienceStepProps {
  skills: SkillEntry[];
  experience: ExperienceEntry[];
  onSkillChange: (
    index: number,
    field: keyof SkillEntry,
    value: string,
  ) => void;
  onAddSkill: () => void;
  onRemoveSkill: (index: number) => void;
  onExperienceChange: (
    index: number,
    field: keyof ExperienceEntry,
    value: string,
  ) => void;
  onAddExperience: () => void;
  onRemoveExperience: (index: number) => void;
  attemptedNext: boolean;
}
const monthMap = {
  Jan: '01',
  Feb: '02',
  Mar: '03',
  Apr: '04',
  May: '05',
  Jun: '06',
  Jul: '07',
  Aug: '08',
  Sep: '09',
  Oct: '10',
  Nov: '11',
  Dec: '12',
};

const parseDuration = (value: string) => {
  if (!value) return { start: '', end: '' };

  const [start, end] = value.split(' - ');

  const parse = (v: string) => {
    if (!v || v === 'Present') return '';
    const [mon, yr] = v.split(' ');
    return `${yr}-${monthMap[mon as keyof typeof monthMap]}`;
  };

  return {
    start: parse(start),
    end: end === 'Present' ? '' : parse(end),
  };
};

const formatMonth = (v: string) =>
  new Date(v + '-01').toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

const SkillsExperienceStep: React.FC<SkillsExperienceStepProps> = ({
  skills,
  experience,
  onSkillChange,
  onAddSkill,
  onRemoveSkill,
  onExperienceChange,
  onAddExperience,
  onRemoveExperience,
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
   * - AND (this row is filled OR it's the first row)
   */
  const shouldValidate = (obj?: Record<string, unknown>, index?: number) =>
    attemptedNext && (isFilled(obj) || index === 0);

  const showError = (
    value?: string,
    obj?: Record<string, unknown>,
    index?: number,
  ) => shouldValidate(obj, index) && !safeTrim(value);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-md font-semibold text-gray-800 mb-2">
          Your Skills
        </h3>
        <div className="space-y-3">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 border-2 border-gray-100 rounded-xl bg-white/60"
            >
              <Input
                value={skill.skill}
                onChange={(e) => onSkillChange(index, 'skill', e.target.value)}
                placeholder="e.g., JavaScript"
                className={`h-11 ${
                  showError(skill.skill, skill, index) ? 'border-red-500 ' : ''
                }`}
              />

              {showError(skill.skill, skill, index) && (
                <p className="text-xs text-red-500">Skill name is required</p>
              )}

              <Select
                value={skill.level}
                onValueChange={(value) => onSkillChange(index, 'level', value)}
              >
                <SelectTrigger className="w-[180px] h-11 ">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="BEGINNER">Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                  <SelectItem value="EXPERT">Expert</SelectItem>
                </SelectContent>
              </Select>
              {/* ✅ FIX: Use the 'skills' prop directly */}
              {skills.length > 1 && (
                <Button
                  type="button"
                  onClick={() => onRemoveSkill(index)}
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:bg-red-100 rounded-full"
                >
                  <XCircle className="w-5 h-5" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button
          type="button"
          onClick={onAddSkill}
          variant="outline"
          className="w-full mt-4 h-12 border-dashed"
        >
          <PlusCircle className="w-5 h-5 mr-2" /> Add Skill
        </Button>
      </div>

      {/* Experience Section */}
      <div>
        <h3 className="text-md font-semibold text-gray-800 mb-2">
          Work Experience
        </h3>
        <div className="space-y-4">
          {/* ✅ FIX: Use the 'experience' prop directly */}
          {experience.map((exp, index) => (
            <div
              key={index}
              className="space-y-3 p-4 border-2 border-purple-100 rounded-xl relative bg-white/60"
            >
              {/* ✅ FIX: Use the 'experience' prop directly */}
              {experience.length > 1 && (
                <Button
                  type="button"
                  onClick={() => onRemoveExperience(index)}
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-red-500 hover:bg-red-100 rounded-full h-8 w-8"
                >
                  <XCircle className="w-5 h-5" />
                </Button>
              )}
              <Input
                value={exp.company}
                onChange={(e) =>
                  onExperienceChange(index, 'company', e.target.value)
                }
                placeholder="Company Name"
                className={`h-11 ${
                  showError(exp.company, exp, index) ? 'border-red-500 ' : ''
                }`}
              />

              {showError(exp.company, exp, index) && (
                <p className="text-xs text-red-500">Company name is required</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  value={exp.title}
                  onChange={(e) =>
                    onExperienceChange(index, 'title', e.target.value)
                  }
                  placeholder="Job Title"
                  className={`h-11 ${
                    showError(exp.title, exp, index) ? 'border-red-500 ' : ''
                  }`}
                />
                {showError(exp.title, exp, index) && (
                  <p className="text-xs text-red-500">title is required</p>
                )}

                {(() => {
                  const { start, end } = parseDuration(exp.duration);

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        type="month"
                        value={start}
                        onChange={(e) => {
                          const newStart = e.target.value;
                          const newEnd = end;

                          const formatted =
                            newStart && newEnd
                              ? `${formatMonth(newStart)} - ${formatMonth(
                                  newEnd,
                                )}`
                              : newStart
                              ? `${formatMonth(newStart)} - Present`
                              : '';

                          onExperienceChange(index, 'duration', formatted);
                        }}
                        className={`h-11 ${
                          showError(start, exp, index) ? 'border-red-500 ' : ''
                        }`}
                      />
                      {showError(start, exp, index) && (
                        <p className="text-xs text-red-500">
                          Start date is required
                        </p>
                      )}

                      <Input
                        type="month"
                        value={end}
                        onChange={(e) => {
                          const newEnd = e.target.value;
                          const newStart = start;

                          const formatted =
                            newStart && newEnd
                              ? `${formatMonth(newStart)} - ${formatMonth(
                                  newEnd,
                                )}`
                              : newStart
                              ? `${formatMonth(newStart)} - Present`
                              : '';

                          onExperienceChange(index, 'duration', formatted);
                        }}
                        className={`h-11 ${
                          showError(end, exp, index) ? 'border-red-500 ' : ''
                        }`}
                      />
                      {showError(end, exp, index) && (
                        <p className="text-xs text-red-500">
                          End date is required
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>
              <Textarea
                value={exp.description}
                onChange={(e) =>
                  onExperienceChange(index, 'description', e.target.value)
                }
                placeholder="Describe your role and accomplishments..."
                className="h-20"
              />
            </div>
          ))}
        </div>
        <Button
          type="button"
          onClick={onAddExperience}
          variant="outline"
          className="w-full mt-4 h-12 border-dashed"
        >
          <PlusCircle className="w-5 h-5 mr-2" /> Add Experience
        </Button>
      </div>
    </div>
  );
};
export default SkillsExperienceStep;
