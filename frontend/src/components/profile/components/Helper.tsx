/** @format */
/* components/profile/ProfileModals.tsx */

'use client';

import React, { ReactNode } from 'react';
import { useForm } from 'react-hook-form';

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

import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react';

/* ---------------------------- Utilities ---------------------------------- */
const toMonth = (iso?: string) =>
  iso ? new Date(iso).toISOString().slice(0, 7) : '';

const monthToIso = (month?: string) =>
  month ? new Date(`${month}-01T00:00:00.000Z`).toISOString() : undefined;

/* ---------------------------- Shared UI pieces --------------------------- */

type ModalShellProps = {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClose: () => void;
  children: ReactNode;
};

const ModalShell: React.FC<ModalShellProps> = ({
  title,
  subtitle,
  icon: Icon,
  onClose,
  children,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-in fade-in-0 duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className={`bg-header-gradient-primary p-5 text-white relative`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                {Icon ? <Icon className="w-6 h-6" /> : null}
              </div>
              <div>
                <h2 className="text-xl font-bold">{title}</h2>
                {subtitle && (
                  <p className="text-white/80 text-sm">{subtitle}</p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="w-10 h-10 bg-white/20 rounded-full hover:bg-white/30 text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

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
    <div className="pt-4 flex justify-between items-center px-6 pb-6 bg-white">
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
