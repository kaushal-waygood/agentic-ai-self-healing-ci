/** @format */
/* components/profile/ProfileModals.tsx */

'use client';

import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Code,
  Calendar,
  FileText,
  FolderOpen,
  GraduationCap,
  Link as LinkIcon,
  Briefcase,
  MapPin,
  X,
} from 'lucide-react';

import { RootState } from '@/redux/rootReducer';
import {
  addStudentEducationRequest,
  updateStudentEducationRequest,
  addStudentProjectRequest,
  updateStudentProjectRequest,
  addStudentExperienceRequest,
  updateStudentExperienceRequest,
  addStudentSkillRequest,
  getStudentDetailsRequest,
} from '@/redux/reducers/studentReducer';

import { countries } from '@/lib/data/countries';
import ModalPortal from '../ui/modalPortal';
import { MonthYearPicker } from '../ui/advanced-calendar';
import { validateEndDate } from '@/utils/dateValidation';

/* ---------------------------- Utilities ---------------------------------- */
const toMonth = (iso?: string) =>
  iso ? new Date(iso).toISOString().slice(0, 7) : '';

const monthToIso = (month?: string) =>
  month ? new Date(`${month}-01T00:00:00.000Z`).toISOString() : undefined;

/* ---------------------------- Shared UI pieces --------------------------- */

function useLockScroll() {
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);
}

type ModalShellProps = {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClose: () => void;
  children: ReactNode;
};

const ModalShell = ({
  title,
  subtitle,
  icon: Icon,
  onClose,
  children,
}: any) => {
  useLockScroll();

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[9999]">
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 " onClick={onClose} />

        {/* Modal */}
        <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
          <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                {Icon && (
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h2 className="font-semibold text-lg">{title}</h2>
                  {subtitle && (
                    <p className="text-white/80 text-sm">{subtitle}</p>
                  )}
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {children}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

// const ModalShell = ({
//   title,
//   subtitle,
//   icon: Icon,
//   onClose,
//   children,
// }: any) => {
//   useLockScroll();

//   return (
//     <div className="fixed inset-0 z-[9999]">
//       {/* Overlay */}
//       <div className="absolute inset-0  backdrop-blur-sm" onClick={onClose} />

//       {/* Modal */}
//       <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
//         <div
//           className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in"
//           onClick={(e) => e.stopPropagation()}
//         >
//           {/* Header */}
//           <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-5 text-white flex justify-between items-center">
//             <div className="flex items-center gap-3">
//               {Icon && (
//                 <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
//                   <Icon className="w-5 h-5" />
//                 </div>
//               )}
//               <div>
//                 <h2 className="font-semibold text-lg">{title}</h2>
//                 {subtitle && (
//                   <p className="text-white/80 text-sm">{subtitle}</p>
//                 )}
//               </div>
//             </div>

//             <button
//               onClick={onClose}
//               className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
//             >
//               ✕
//             </button>
//           </div>

//           {children}
//         </div>
//       </div>
//     </div>
//   );
// };

type StepDef = {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: string[];
};

const Stepper: React.FC<{
  steps: StepDef[];
  current: number;
}> = ({ steps, current }) => {
  return (
    <div className="px-6 py-4 bg-gray-50">
      <div className="flex items-center">
        {steps.map((step, idx) => (
          <React.Fragment key={step.id}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                idx <= current
                  ? `bg-blue-500 text-white`
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {idx < current ? (
                <Check className="w-5 h-5" />
              ) : (
                <step.icon className="w-5 h-5" />
              )}
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 ${
                  idx < current ? `bg-blue-500` : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const FormFooter: React.FC<{
  currentStep: number;
  stepsLength: number;
  onPrev: () => void;
  onNext: () => void;
  onSubmitLabel?: string;
  onCancel?: () => void;
  isLast?: boolean;
}> = ({
  currentStep,
  stepsLength,
  onPrev,
  onNext,
  onSubmitLabel,
  onCancel,
  isLast,
}) => {
  return (
    <div className="pt-4 flex flex-wrap gap-2 justify-between items-center px-6 pb-6 bg-white">
      <Button
        type="button"
        variant="outline"
        onClick={onPrev}
        disabled={currentStep === 0}
      >
        <ChevronLeft className="w-4 h-4 mr-2" /> Previous
      </Button>
      {!isLast ? (
        <Button type="button" onClick={onNext} className="hover:bg-blue-700">
          Next <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      ) : (
        <div className="flex gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" className="hover:bg-blue-700">
            <Check className="w-4 h-4 mr-2" /> {onSubmitLabel || 'Save'}
          </Button>
        </div>
      )}
    </div>
  );
};

/* ---------------------------- Small helpers -------------------------------- */

/**
 * Hook to manage step index and step validation via react-hook-form's trigger.
 * Keeps step-handling DRY.
 */
const useStepControls = (initial = 0) => {
  const [currentStep, setCurrentStep] = useState(initial);

  const next = async (
    trigger: (names?: string | string[]) => Promise<boolean>,
    fields: string[],
  ) => {
    const ok = await trigger(fields);
    if (ok) setCurrentStep((s) => s + 1);
    return ok;
  };

  const prev = () => setCurrentStep((s) => Math.max(0, s - 1));

  const goto = (i: number) => setCurrentStep(i);

  return { currentStep, next, prev, goto, setCurrentStep };
};

export function useLockBodyScroll(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = original;
    };
  }, [active]);
}

/* ---------------------------- UI bits left alone --------------------------- */

type DegreeField = { value: string; onChange: (v: string) => void };

const colorMap: Record<string, string> = {
  cyan: 'bg-cyan-500 border-cyan-500 shadow-cyan-500/30',
  purple: 'bg-purple-500 border-purple-500 shadow-purple-500/30',
  green: 'bg-green-500 border-green-500 shadow-green-500/30',
  blue: 'bg-blue-500 border-blue-500 shadow-blue-500/30',
  yellow: 'bg-yellow-500 border-yellow-500 shadow-yellow-500/30',
  red: 'bg-red-500 border-red-500 shadow-red-500/30',
};

const DegreeSelector: React.FC<{ field: DegreeField }> = ({ field }) => {
  const degreeTypes = [
    { value: "Bachelor's Degree", label: "Bachelor's", color: 'cyan' },
    { value: "Master's Degree", label: "Master's", color: 'purple' },
    { value: 'PhD', label: 'PhD', color: 'green' },
    { value: 'Associate Degree', label: 'Associate', color: 'blue' },
    { value: 'High School Diploma', label: 'High School', color: 'yellow' },
    { value: 'Certificate', label: 'Certificate', color: 'red' },
  ] as const;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {degreeTypes.map((degree) => {
        const selected = field.value === degree.value;
        return (
          <div
            key={degree.value}
            onClick={() => field.onChange(degree.value)}
            className={`cursor-pointer p-4 rounded-xl border-2 text-center transition-all duration-300 transform hover:scale-105 ${
              selected
                ? `border-blue-400`
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="font-semibold">{degree.label}</div>
          </div>
        );
      })}
    </div>
  );
};

const splitToTags = (s: string) =>
  s
    .split(/[,\s]+/) // split on comma or any whitespace
    .map((t) => t.trim())
    .filter(Boolean);

const uniq = (arr: string[]) => Array.from(new Set(arr));

const SeparatorKeys = new Set(['Enter', ',', ' ']);

const TechnologyInput: React.FC<{
  field: { value: string[]; onChange: (v: string[]) => void };
}> = ({ field }) => {
  const [input, setInput] = useState('');
  const isComposing = useRef(false);

  // Keep local input synced when external value changes (e.g. reset / edit)
  useEffect(() => {
    // don't overwrite while user is typing; only sync if input is empty
    if (!input) {
      setInput('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field.value.join(',')]);

  const commit = (raw: string) => {
    const newTags = splitToTags(raw);
    if (newTags.length === 0) return;
    const merged = uniq([...(field.value || []), ...newTags]);
    field.onChange(merged);
  };

  const flushInput = () => {
    if (!input.trim()) {
      setInput('');
      return;
    }
    commit(input);
    setInput('');
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (isComposing.current) return; // IME in progress
    if (SeparatorKeys.has(e.key)) {
      e.preventDefault();
      // If user typed a separator but input is empty and separator is space/comma, do nothing
      if (input.trim()) flushInput();
    } else if (e.key === 'Backspace' && !input && (field.value || []).length) {
      // nice UX: backspace when input empty removes last tag
      const next = (field.value || []).slice(0, -1);
      field.onChange(next);
    }
  };

  const handlePaste: React.ClipboardEventHandler<HTMLInputElement> = (e) => {
    const text = e.clipboardData.getData('text');
    if (!text) return;
    e.preventDefault();
    commit(text);
    setInput('');
  };

  const removeTag = (tag: string) => {
    field.onChange((field.value || []).filter((t) => t !== tag));
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap gap-2 p-2 border rounded-md">
        {(field.value || []).map((tag, i) => (
          <span
            key={i}
            className="flex items-center gap-2 px-2 py-1 bg-gray-100 rounded"
          >
            <span className="text-sm">{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remove ${tag}`}
              className="text-xs"
            >
              ×
            </button>
          </span>
        ))}

        <input
          className="flex-1 min-w-[120px] outline-none p-1"
          placeholder="Type tech and press Enter, comma or space"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={() => flushInput()}
          onCompositionStart={() => (isComposing.current = true)}
          onCompositionEnd={() => {
            isComposing.current = false;
            // IME commit: flush if separators present
            if (/[,\s]/.test(input)) flushInput();
          }}
        />
      </div>
      <small className="text-xs text-gray-500 mt-1">
        Separate by comma, space, or press Enter. Backspace (empty) removes last
        tag.
      </small>
    </div>
  );
};

/* ---------------------------- Education Validation Schema ------------------------- */
const educationSchema = z
  .object({
    _id: z.string().optional(),
    institution: z
      .string()
      .min(1, 'Institution is required')
      .regex(
        /^[a-zA-Z\s\-'.,&]+$/,
        'Only letters, spaces, and basic punctuation allowed',
      ),
    degree: z.string().min(1, 'Degree is required'),
    fieldOfStudy: z
      .string()
      .regex(/^[a-zA-Z\s\-'.,&]*$/, 'Only letters and spaces allowed')
      .optional()
      .nullable(),
    country: z.string().optional(),
    gpa: z.string().optional(),
    startDate: z.string().min(1, 'Required'),
    endDate: z.string().optional(),
    isCurrent: z.boolean().optional(),
  })
  .superRefine(validateEndDate);

/* ---------------------------- AddEducation (refactored) ------------------------- */
export const AddEducation: React.FC<{
  onCancel: () => void;
  isEdit?: boolean;
  data?: Partial<{
    _id: string;
    institution: string;
    degree: string;
    fieldOfStudy: string;
    country: string;
    gpa: string;
    grade: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    isCurrentlyStudying: boolean;
  }>;
}> = ({ onCancel, isEdit, data }) => {
  const inferredIsCurrent =
    // Boolean(data?.isCurrent) || (!data?.endDate && !!data?._id);
    Boolean(data?.isCurrentlyStudying ?? data?.isCurrent) ||
    (!data?.endDate && !!data?._id);
  const form = useForm({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      _id: data?._id || '',
      institution: data?.institute || '',
      degree: data?.degree || '',
      fieldOfStudy: data?.fieldOfStudy || '',
      country: data?.country || '',
      // gpa: data?.gpa || '',
      gpa: data?.gpa ?? data?.grade ?? '',
      startDate: toMonth(data?.startDate),
      //  endDate: toMonth(data?.endDate),
      endDate: inferredIsCurrent ? '' : toMonth(data?.endDate),
      isCurrent: inferredIsCurrent,
    },
    mode: 'onSubmit',
  });

  const dispatch = useDispatch();
  // const { handleSubmit, control, reset, trigger } = form;
  const { handleSubmit, control, reset, trigger, watch, setValue } = form;
  const isCurrent = watch('isCurrent');

  useEffect(() => {
    if (isCurrent) setValue('endDate', '');
  }, [isCurrent, setValue]);

  const steps: StepDef[] = [
    {
      id: 'basic',
      title: 'Institution & Degree',
      icon: GraduationCap,
      fields: ['institution', 'degree'],
    },
    {
      id: 'details',
      title: 'Field of Study & Location',
      icon: Code,
      fields: ['fieldOfStudy', 'country'],
    },
    {
      id: 'timeline',
      title: 'Dates & GPA',
      icon: Calendar,
      // fields: ['startDate', 'gpa', 'endDate'],
      fields: ['startDate', 'gpa', 'endDate', 'isCurrent'],
    },
  ];

  const { currentStep, next, prev } = useStepControls(0);

  const onSubmit = (formData: any) => {
    const { isCurrent, ...rest } = formData;

    //  const payload = {
    //    ...formData,
    //    isCurrent: Boolean(formData.isCurrent),
    //    startDate: monthToIso(formData.startDate)!,
    //    // endDate: formData.endDate ? monthToIso(formData.endDate) : undefined,
    //    endDate: formData.isCurrent
    //      ? null
    //      : formData.endDate
    //        ? monthToIso(formData.endDate)
    //        : undefined,
    //  };

    const payload = {
      ...rest,
      isCurrentlyStudying: Boolean(isCurrent),
      startDate: monthToIso(rest.startDate)!,
      // endDate: formData.endDate ? monthToIso(formData.endDate) : undefined,
      endDate: isCurrent
        ? null
        : rest.endDate
          ? monthToIso(rest.endDate)
          : undefined,
    };

    if (isEdit && payload._id) {
      dispatch(
        updateStudentEducationRequest({ data: payload, index: payload._id }),
      );
    } else {
      dispatch(addStudentEducationRequest(payload));
    }

    reset();
    onCancel();
  };

  const handleNext = async () => {
    await next(trigger, steps[currentStep].fields);
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  return (
    <ModalShell
      title={isEdit ? 'Edit Education' : 'Add Education'}
      subtitle={`Step ${currentStep + 1}: ${steps[currentStep].title}`}
      icon={GraduationCap}
      onClose={handleCancel}
      headerGradient="from-purple-500 to-cyan-500"
    >
      <Stepper steps={steps} current={currentStep} activeColor="purple" />
      <div className="p-6 overflow-y-auto flex-1">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1 */}
            <div className={currentStep !== 0 ? 'hidden' : 'block'}>
              <FormField
                control={control}
                name="institution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution*</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., University of Technology"
                        required
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-600 mt-1" />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="degree"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <FormLabel>Degree*</FormLabel>
                    <FormControl>
                      <DegreeSelector field={field as any} />
                    </FormControl>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )}
              />
            </div>

            {/* Step 2 */}
            <div className={currentStep !== 1 ? 'hidden' : 'block'}>
              <FormField
                control={control}
                name="fieldOfStudy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Field of Study</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Computer Science" />
                    </FormControl>
                    <FormMessage className="text-xs text-red-600 mt-1" />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="country"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <FormLabel>Country*</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white z-[9999]">
                        {countries.map((c) => (
                          <SelectItem key={c.code} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Step 3 */}
            <div className={currentStep !== 2 ? 'hidden' : 'block'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date*</FormLabel>
                      <FormControl>
                        {/* <Input type="month" {...field} required /> */}
                        <MonthYearPicker
                          date={
                            field.value
                              ? new Date(field.value + '-01')
                              : undefined
                          }
                          setDate={(date) =>
                            field.onChange(date ? format(date, 'yyyy-MM') : '')
                          }
                          placeholder="Select start month & year"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        {/* <Input type="month" {...field} placeholder="Present" /> */}
                        <MonthYearPicker
                          date={
                            isCurrent
                              ? undefined
                              : field.value
                                ? new Date(field.value + '-01')
                                : undefined
                          }
                          setDate={(date) =>
                            field.onChange(date ? format(date, 'yyyy-MM') : '')
                          }
                          placeholder="Select end month & year"
                          disabled={isCurrent}
                          maxDate={new Date()}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500 mt-1" />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={control}
                name="isCurrent"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 mt-6">
                    <FormControl>
                      <Checkbox
                        checked={!!field.value}
                        onCheckedChange={(v) => field.onChange(v === true)}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">
                      I am currently studying
                    </FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="gpa"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <FormLabel>Percentage/CGPA (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., 7.8"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormFooter
              currentStep={currentStep}
              stepsLength={steps.length}
              onPrev={prev}
              onNext={handleNext}
              onCancel={handleCancel}
              isLast={currentStep === steps.length - 1}
              onSubmitLabel={isEdit ? 'Update Education' : 'Save Education'}
            />
          </form>
        </Form>
      </div>
    </ModalShell>
  );
};
/* ---------------------------- Project Validation Schema ------------------------- */
const projectSchema = z.object({
  _id: z.string().optional(),
  projectName: z
    .string()
    .min(1, 'Project name is required')
    .regex(
      /^[a-zA-Z0-9\s\-'.,&!?()]+$/,
      'Only letters, numbers, spaces, and basic punctuation allowed',
    ),
  description: z.string().min(1, 'Description is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  isCurrent: z.boolean().optional(),
  technologies: z.array(z.string()).optional(),
  // link: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  link: z
    .union([
      z
        .string()
        .url('Please enter a valid URL starting with http:// or https://')
        .regex(/^https?:\/\//, 'URL must start with http:// or https://'),
      z.literal(''),
    ])
    .optional(),
});
/* ---------------------------- AddProject (refactored) ------------------------- */

export const AddProject: React.FC<{
  onCancel: () => void;
  isEdit?: boolean;
  data?: Partial<{
    _id: string;
    projectName: string;
    description: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    technologies: string[] | string;
    link: string;
  }>;
}> = ({ onCancel, data, isEdit }) => {
  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      _id: data?._id || '',
      projectName: data?.projectName || '',
      description: data?.description || '',
      startDate: toMonth(data?.startDate),
      endDate: data?.isCurrent ? '' : toMonth(data?.endDate),
      isCurrent: Boolean(data?.isCurrent),
      technologies: Array.isArray(data?.technologies)
        ? (data?.technologies as string[])
        : typeof data?.technologies === 'string'
          ? data!.technologies
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      link: data?.link || '',
    },
    mode: 'onSubmit',
  });

  const dispatch = useDispatch();
  const { handleSubmit, control, reset, watch, setValue, trigger } = form;
  const isCurrent = watch('isCurrent');

  useEffect(() => {
    if (isCurrent) setValue('endDate', '');
  }, [isCurrent, setValue]);

  const steps: StepDef[] = [
    {
      id: 'core',
      title: 'Core Details',
      icon: FileText,
      fields: ['projectName', 'description'],
    },
    {
      id: 'timeline',
      title: 'Timeline & Status',
      icon: Calendar,
      fields: ['startDate', 'endDate', 'isCurrent'],
    },
    {
      id: 'tech',
      title: 'Tech & Links',
      icon: Code,
      fields: ['technologies', 'link'],
    },
  ];

  const { currentStep, next, prev } = useStepControls(0);

  const onSubmit = (formData: any) => {
    const payload = {
      ...formData,
      startDate: monthToIso(formData.startDate)!,
      endDate: formData.isCurrent ? undefined : monthToIso(formData.endDate),
      technologies: Array.isArray(formData.technologies)
        ? formData.technologies
        : [],
    };

    if (isEdit && payload._id) {
      dispatch(
        updateStudentProjectRequest({ data: payload, index: payload._id }),
      );
    } else {
      dispatch(addStudentProjectRequest(payload));
    }

    reset();
    onCancel();
  };

  const handleNext = async () => {
    await next(trigger, steps[currentStep].fields);
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  return (
    <ModalShell
      title={isEdit ? 'Edit Project' : 'Add Project'}
      subtitle={`Step ${currentStep + 1}: ${steps[currentStep].title}`}
      icon={FolderOpen}
      onClose={handleCancel}
      headerGradient="from-blue-500 to-teal-500"
    >
      <Stepper steps={steps} current={currentStep} activeColor="blue" />
      <div className="p-6 overflow-y-auto flex-1">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1 */}
            <div className={currentStep !== 0 ? 'hidden' : 'block'}>
              <FormField
                control={control}
                name="projectName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name*</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., AI-Powered Chatbot"
                        {...field}
                        required
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="description"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <FormLabel>Description*</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your project, its goals, and your role."
                        rows={5}
                        {...field}
                        required
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )}
              />
            </div>

            {/* Step 2 */}
            <div className={currentStep !== 1 ? 'hidden' : 'block'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date*</FormLabel>
                      <FormControl>
                        {/* <Input type="month" {...field} required /> */}
                        <MonthYearPicker
                          date={
                            field.value
                              ? new Date(field.value + '-01')
                              : undefined
                          }
                          setDate={(date) =>
                            field.onChange(date ? format(date, 'yyyy-MM') : '')
                          }
                          placeholder="Select start month & year"
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-600" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        {/* <Input
                          type="month"
                          {...field}
                          disabled={isCurrent}
                          value={isCurrent ? '' : (field.value ?? '')}
                        /> */}
                        <MonthYearPicker
                          date={
                            field.value
                              ? new Date(field.value + '-01')
                              : undefined
                          }
                          setDate={(date) =>
                            field.onChange(date ? format(date, 'yyyy-MM') : '')
                          }
                          placeholder="Select end month & year"
                          disabled={isCurrent}
                          maxDate={new Date()}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500 mt-1" />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={control}
                name="isCurrent"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 mt-6">
                    <FormControl>
                      <Checkbox
                        checked={!!field.value}
                        onCheckedChange={(v) => field.onChange(v === true)}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">
                      I am currently working on this project
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>

            {/* Step 3 */}
            <div className={currentStep !== 2 ? 'hidden' : 'block'}>
              <FormField
                control={control}
                name="technologies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Technologies Used</FormLabel>
                    <FormControl>
                      <TechnologyInput field={field as any} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="link"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <FormLabel>Project Link (Optional)</FormLabel>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <FormControl>
                        <Input
                          placeholder="https://github.com/user/project"
                          {...field}
                          className="pl-9"
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="text-xs text-red-500 mt-1" />
                  </FormItem>
                )}
              />
            </div>

            <FormFooter
              currentStep={currentStep}
              stepsLength={steps.length}
              onPrev={prev}
              onNext={handleNext}
              onCancel={handleCancel}
              isLast={currentStep === steps.length - 1}
              onSubmitLabel={isEdit ? 'Update Project' : 'Save Project'}
            />
          </form>
        </Form>
      </div>
    </ModalShell>
  );
};

/* ---------------------------- AddExperience (refactored) ------------------------- */
const employmentTypes = [
  'Full-time',
  'Part-time',
  'Self-employed',
  'Freelance',
  'Contract',
  'Internship',
  'Apprenticeship',
] as const;
const experienceSchema = z
  .object({
    _id: z.string().optional(),
    company: z.string().min(1, 'Company is required'),
    designation: z.string().min(1, 'Designation is required'),
    employmentType: z.string().optional(),
    location: z.string().optional(),
    // isCurrent: z.boolean().optional(),
    currentlyWorking: z.boolean().optional(),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional(),
    description: z.string().optional(),
  })
  .superRefine(validateEndDate);
export const AddExperience: React.FC<{
  onCancel: () => void;
  isEdit?: boolean;
  data?: Partial<{
    _id: string;
    company: string;
    designation: string;
    employmentType: string;
    location: string;
    isCurrent: boolean;
    currentlyWorking: boolean;
    startDate: string;
    endDate: string;
    responsibilities: string;
    description: string;
  }>;
}> = ({ onCancel, data, isEdit }) => {
  const form = useForm({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      _id: data?._id || '',
      company: data?.company || '',
      designation: data?.designation || '',
      employmentType: data?.employmentType || '',
      location: data?.location || '',
      // isCurrent: Boolean(data?.isCurrent),
      currentlyWorking: Boolean(data?.currentlyWorking ?? data?.isCurrent),
      startDate: toMonth(data?.startDate),
      endDate: toMonth(data?.endDate),
      responsibilities: data?.responsibilities || '',
      description: data?.description || '',
    },
    mode: 'onSubmit',
  });

  const dispatch = useDispatch();
  const { handleSubmit, control, watch, setValue, trigger, reset } = form;
  // const isCurrent = watch('isCurrent');
  const currentlyWorking = watch('currentlyWorking');

  useEffect(() => {
    //       if (isCurrent) setValue('endDate', '');
    if (currentlyWorking) setValue('endDate', '');
    // }, [isCurrent, setValue]);
  }, [currentlyWorking, setValue]);

  const steps: StepDef[] = [
    {
      id: 'role',
      title: 'Company & Role',
      icon: Briefcase,
      fields: ['company', 'designation'],
    },
    {
      id: 'details',
      title: 'Type & Location',
      icon: MapPin,
      fields: ['employmentType', 'location'],
    },
    {
      id: 'timeline',
      title: 'Timeline & Responsibilities',
      icon: Calendar,
      // fields: ['startDate', 'endDate', 'isCurrent', 'responsibilities'],
      fields: ['startDate', 'endDate', 'currentlyWorking', 'responsibilities'],
    },
  ];

  const { currentStep, next, prev } = useStepControls(0);

  const onSubmit = (formData: any) => {
    const payload = {
      ...formData,
      startDate: monthToIso(formData.startDate)!,
      // endDate: formData.isCurrent ? undefined : monthToIso(formData.endDate),
      endDate: formData.currentlyWorking ? null : monthToIso(formData.endDate),
    };

    if (isEdit && payload._id) {
      dispatch(
        updateStudentExperienceRequest({ data: payload, index: payload._id }),
      );
    } else {
      dispatch(addStudentExperienceRequest(payload));
    }
    dispatch(getStudentDetailsRequest());

    reset();
    onCancel();
  };

  const handleNext = async () => {
    await next(trigger, steps[currentStep].fields);
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  return (
    <ModalShell
      title={isEdit ? 'Edit Experience' : 'Add Experience'}
      subtitle={`Step ${currentStep + 1}: ${steps[currentStep].title}`}
      icon={Briefcase}
      onClose={handleCancel}
      headerGradient="from-purple-500 to-indigo-500"
    >
      <Stepper steps={steps} current={currentStep} activeColor="purple" />
      <div className="p-6 overflow-y-auto flex-1">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className={currentStep !== 0 ? 'hidden' : 'block'}>
              <FormField
                control={control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company*</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Company Inc."
                        required
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="designation"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <FormLabel>Designation*</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Software Engineer"
                        required
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )}
              />
            </div>

            <div className={currentStep !== 1 ? 'hidden' : 'block'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={control}
                  name="employmentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employment Type</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white z-[9999]">
                          {employmentTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., San Francisco, CA"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className={currentStep !== 2 ? 'hidden' : 'block'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date*</FormLabel>
                      <FormControl>
                        {/* <Input type="month" {...field} required /> */}
                        <MonthYearPicker
                          date={
                            field.value
                              ? new Date(field.value + '-01')
                              : undefined
                          }
                          setDate={(date) =>
                            field.onChange(date ? format(date, 'yyyy-MM') : '')
                          }
                          placeholder="Select start month & year"
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-600" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        {/* <Input
                          type="month"
                          {...field}
                          required
                          disabled={isCurrent}
                          value={isCurrent ? '' : (field.value ?? '')}
                        /> */}
                        <MonthYearPicker
                          date={
                            field.value
                              ? new Date(field.value + '-01')
                              : undefined
                          }
                          setDate={(date) =>
                            field.onChange(date ? format(date, 'yyyy-MM') : '')
                          }
                          placeholder="Select end month & year"
                          // disabled={isCurrent}
                          disabled={currentlyWorking}
                          maxDate={new Date()}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500 mt-1" />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={control}
                name="currentlyWorking"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 mt-6">
                    <FormControl>
                      <Checkbox
                        checked={!!field.value}
                        onCheckedChange={(v) => field.onChange(v === true)}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">
                      I am currently working here
                    </FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="description"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <FormLabel>Responsibilities (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your key responsibilities and achievements."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormFooter
              currentStep={currentStep}
              stepsLength={steps.length}
              onPrev={prev}
              onNext={handleNext}
              onCancel={handleCancel}
              isLast={currentStep === steps.length - 1}
              onSubmitLabel={isEdit ? 'Update Experience' : 'Save Experience'}
            />
          </form>
        </Form>
      </div>
    </ModalShell>
  );
};

/* ---------------------------- AddSkill (unchanged behaviour, small cleanup) ------------------------- */

export const AddSkill: React.FC<{
  onCancel: () => void;
  isEdit?: boolean;
  existingSkills?: Array<{ skill: string; level: string }>;
  skillCount?: number;
  maxSkillLimit?: number;
}> = ({
  onCancel,
  isEdit,
  existingSkills = [],
  skillCount = 0,
  maxSkillLimit = 20,
}) => {
  const skillTypes = ['BEGINNER', 'INTERMEDIATE', 'EXPERT'] as const;

  // Check if max limit reached
  const [limitError, setLimitError] = useState<string>('');

  useEffect(() => {
    if (skillCount >= maxSkillLimit) {
      setLimitError(
        `You have reached the maximum allowed skills (${maxSkillLimit}). Please delete some skills to add new ones.`,
      );
    } else {
      setLimitError('');
    }
  }, [skillCount, maxSkillLimit]);
  const skillSchema = z
    .object({
      skill: z.string().min(1, 'Skill is required'),
      level: z.string().min(1, 'Level is required'),
    })
    .superRefine((data, ctx) => {
      const isDuplicate = existingSkills.some(
        (s) => s.skill.toLowerCase() === data.skill.toLowerCase(),
      );

      if (isDuplicate) {
        ctx.addIssue({
          code: 'custom',
          message: 'This skill has already been added',
          path: ['skill'],
        });
      }
    });

  const form = useForm<{ skill: string; level: string }>({
    resolver: zodResolver(skillSchema),
    defaultValues: { skill: '', level: '' },
    mode: 'onSubmit',
  });

  const dispatch = useDispatch();
  useSelector((state: RootState) => state.student);

  const { handleSubmit, control } = form;

  const handleFormSubmit = (data: { skill: string; level: string }) => {
    if (skillCount >= maxSkillLimit) {
      return;
    }
    dispatch(addStudentSkillRequest(data));
    onCancel();
  };

  if (skillCount >= maxSkillLimit) {
    return (
      <ModalShell
        title="Add Skills"
        icon={Briefcase}
        onClose={onCancel}
        headerGradient="from-purple-500 to-indigo-500"
      >
        <div className="p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 font-medium"> Limit Reached</p>
            <p className="text-yellow-700 text-sm mt-1">
              You have reached the maximum allowed skills ({maxSkillLimit}).
              Please delete some skills to add new ones.
            </p>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={onCancel}>
              Close
            </Button>
          </div>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell
      title={isEdit ? 'Edit Skills' : 'Add Skills'}
      icon={Briefcase}
      onClose={onCancel}
      headerGradient="from-purple-500 to-indigo-500"
    >
      <div className="p-6 overflow-y-auto flex-1">
        <Form {...form}>
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="space-y-8 bg-white p-4 rounded-lg"
          >
            <div className="space-y-4">
              <FormField
                control={control}
                name="skill"
                // rules={{ required: 'Skill is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skill*</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Your skill" required />
                    </FormControl>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="level"
                // rules={{ required: 'Level is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level*</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-[9999] max-h-[300px] bg-white">
                        {skillTypes.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )}
              />
            </div>

            {limitError && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {limitError}
              </div>
            )}

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">Save Skill</Button>
            </div>
          </form>
        </Form>
      </div>
    </ModalShell>
  );
};
