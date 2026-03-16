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

const TEXT_ONLY_REGEX = /^[a-zA-Z\s\-'.,&]+$/;

const isValidMonth = (value: string) => {
  if (!value) return false;
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return false;
  const month = Number(match[2]);
  return month >= 1 && month <= 12;
};

const isMonthInFuture = (value: string) => {
  if (!isValidMonth(value)) return false;
  const [year, month] = value.split('-').map(Number);
  const candidate = new Date(year, month - 1, 1).getTime();
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  return candidate > currentMonth;
};

const isEndMonthAfterStartMonth = (start?: string, end?: string) => {
  if (!start || !end) return true;
  if (!isValidMonth(start) || !isValidMonth(end)) return true;
  const [sy, sm] = start.split('-').map(Number);
  const [ey, em] = end.split('-').map(Number);
  const startTime = new Date(sy, sm - 1, 1).getTime();
  const endTime = new Date(ey, em - 1, 1).getTime();
  return endTime >= startTime;
};

export const getSkillEntryErrors = (
  skills: SkillEntry[],
  index: number,
): Partial<Record<keyof SkillEntry, string>> => {
  const errors: Partial<Record<keyof SkillEntry, string>> = {};
  const current = skills[index];
  const skill = (current?.skill ?? '').trim();
  const level = (current?.level ?? '').trim();

  if (!skill) errors.skill = 'Skill is required';
  else if (!TEXT_ONLY_REGEX.test(skill)) {
    errors.skill = 'Only letters, spaces, and basic punctuation allowed';
  } else {
    const lower = skill.toLowerCase();
    const firstIndex = skills.findIndex(
      (s) => (s?.skill ?? '').trim().toLowerCase() === lower,
    );
    if (firstIndex !== -1 && firstIndex !== index) {
      errors.skill = 'This skill has already been added';
    }
  }

  if (!level) errors.level = 'Level is required';

  return errors;
};

export const isSkillsListValid = (skills: SkillEntry[]) =>
  skills.every(
    (_, idx) => Object.keys(getSkillEntryErrors(skills, idx)).length === 0,
  );

export const getExperienceEntryErrors = (
  exp?: Partial<ExperienceEntry> | null,
): Partial<Record<keyof ExperienceEntry | 'startDate' | 'endDate', string>> => {
  const errors: Partial<
    Record<keyof ExperienceEntry | 'startDate' | 'endDate', string>
  > = {};
  const company = (exp?.company ?? '').trim();
  const titleVal = (exp?.title ?? '').trim();
  const duration = (exp?.duration ?? '').trim();
  const { start, end } = parseDuration(duration);

  if (!company) errors.company = 'Company name is required';
  else if (!TEXT_ONLY_REGEX.test(company)) {
    errors.company = 'Only letters, spaces, and basic punctuation allowed';
  }

  if (!titleVal) errors.title = 'Title is required';
  else if (!TEXT_ONLY_REGEX.test(titleVal)) {
    errors.title = 'Only letters, spaces, and basic punctuation allowed';
  }

  if (!start) errors.startDate = 'Start date is required';
  else if (!isValidMonth(start)) errors.startDate = 'Invalid date';
  else if (isMonthInFuture(start)) {
    errors.startDate = 'Start date cannot be in the future';
  }

  if (!end) errors.endDate = 'End date is required';
  else if (!isValidMonth(end)) errors.endDate = 'Invalid date';
  else if (isMonthInFuture(end)) {
    errors.endDate = 'End date cannot be in the future';
  } else if (!isEndMonthAfterStartMonth(start, end)) {
    errors.endDate = 'End date cannot be before start date';
  }

  if (!duration) errors.duration = 'Duration is required';

  return errors;
};

export const isExperienceEntryValid = (exp?: Partial<ExperienceEntry> | null) =>
  Object.keys(getExperienceEntryErrors(exp)).length === 0;

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

  const shouldValidate = (obj?: Record<string, unknown>, index?: number) =>
    attemptedNext && (isFilled(obj) || index === 0);

  //  const showError = (
  //    value?: string,
  //    obj?: Record<string, unknown>,
  //    index?: number,
  //  ) => shouldValidate(obj, index) && !safeTrim(value);

  const getSkillError = (
    index: number,
    field: keyof SkillEntry,
    obj?: Record<string, unknown>,
  ) => {
    if (!shouldValidate(obj, index)) return '';
    const errors = getSkillEntryErrors(skills, index);
    return errors[field] ?? '';
  };

  const getExpError = (
    index: number,
    field: keyof ExperienceEntry | 'startDate' | 'endDate',
    obj?: Record<string, unknown>,
  ) => {
    if (!shouldValidate(obj, index)) return '';
    const errors = getExperienceEntryErrors(experience[index]);
    return errors[field] ?? '';
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-md font-semibold text-gray-800 mb-2">
          Your Skills
        </h3>
        <div className="space-y-3">
          {skills.map((skill, index) => {
            const skillError = getSkillError(index, 'skill', skill);

            return (
              <div
                key={index}
                className="flex items-center gap-3 p-3 border-2 border-gray-100 rounded-xl bg-white/60"
              >
                <div className="flex-1">
                  <Input
                    value={skill.skill}
                    onChange={(e) =>
                      onSkillChange(index, 'skill', e.target.value)
                    }
                    placeholder="e.g., JavaScript"
                    className={`h-11 ${skillError ? 'border-red-500 ' : ''}`}
                  />

                  {/* {showError(skill.skill, skill, index) && ( */}
                  {skillError && (
                    <p className="text-xs text-red-500 mt-1">{skillError}</p>
                  )}
                </div>

                <Select
                  value={skill.level}
                  onValueChange={(value) =>
                    onSkillChange(index, 'level', value)
                  }
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
            );
          })}
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
          {experience.map((exp, index) => {
            const companyError = getExpError(index, 'company', exp);
            const titleError = getExpError(index, 'title', exp);

            return (
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
                  className={`h-11 ${companyError ? 'border-red-500 ' : ''}`}
                />

                {companyError && (
                  <p className="text-xs text-red-500">{companyError}</p>
                )}

                <div className="grid grid-cols-1  gap-3">
                  <Input
                    value={exp.title}
                    onChange={(e) =>
                      onExperienceChange(index, 'title', e.target.value)
                    }
                    placeholder="Job Title"
                    className={`h-11 ${titleError ? 'border-red-500 ' : ''}`}
                  />
                  {titleError && (
                    <p className="text-xs text-red-500">{titleError}</p>
                  )}
                </div>

                {(() => {
                  const { start, end } = parseDuration(exp.duration);
                  const startError = getExpError(index, 'startDate', exp);
                  const endError = getExpError(index, 'endDate', exp);

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
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
                            startError ? 'border-red-500 ' : ''
                          }`}
                        />
                        {startError && (
                          <p className="text-xs text-red-500 mt-1">
                            {startError}
                          </p>
                        )}
                      </div>

                      <div>
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
                          className={`h-11 ${endError ? 'border-red-500 ' : ''}`}
                        />
                        {endError && (
                          <p className="text-xs text-red-500 mt-1">
                            {endError}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })()}
                <Textarea
                  value={exp.description}
                  onChange={(e) =>
                    onExperienceChange(index, 'description', e.target.value)
                  }
                  placeholder="Describe your role and accomplishments..."
                  className="h-20"
                />
              </div>
            );
          })}
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
