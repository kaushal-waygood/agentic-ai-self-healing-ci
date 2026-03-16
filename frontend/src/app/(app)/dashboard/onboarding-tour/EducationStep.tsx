// src/app/(app)/dashboard/onboarding-tour/EducationStep.tsx

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label'; // Assuming you have this, otherwise use standard <label>
import { PlusCircle, XCircle, CalendarIcon } from 'lucide-react';

// 1. Updated Type Definitions to match the fuller form
export type EducationEntry = {
  institute: string;
  degree: string;
  fieldOfStudy: string;
  country: string;
  startDate: string;
  endDate: string;
  grade: string;
};

const TEXT_ONLY_REGEX = /^[a-zA-Z\s\-'.,&]+$/;
const GRADE_REGEX = /^\d+(\.\d+)?$/;

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

const isEndDateAfterStartDate = (startDate?: string, endDate?: string) => {
  if (!startDate || !endDate) return true;
  if (!isValidMonth(startDate) || !isValidMonth(endDate)) return true;
  const [sy, sm] = startDate.split('-').map(Number);
  const [ey, em] = endDate.split('-').map(Number);
  const start = new Date(sy, sm - 1, 1).getTime();
  const end = new Date(ey, em - 1, 1).getTime();
  return end >= start;
};

export const getEducationEntryErrors = (
  edu?: Partial<EducationEntry> | null,
): Partial<Record<keyof EducationEntry, string>> => {
  const errors: Partial<Record<keyof EducationEntry, string>> = {};
  const institute = (edu?.institute ?? '').trim();
  const degree = (edu?.degree ?? '').trim();
  const fieldOfStudy = (edu?.fieldOfStudy ?? '').trim();
  const country = (edu?.country ?? '').trim();
  const startDate = (edu?.startDate ?? '').trim();
  const endDate = (edu?.endDate ?? '').trim();
  const grade = (edu?.grade ?? '').trim();

  if (!institute) errors.institute = 'Institution is required';
  else if (!TEXT_ONLY_REGEX.test(institute)) {
    errors.institute = 'Only letters, spaces, and basic punctuation allowed';
  }

  if (!degree) errors.degree = 'Degree is required';
  else if (!TEXT_ONLY_REGEX.test(degree)) {
    errors.degree = 'Only letters, spaces, and basic punctuation allowed';
  }

  if (!fieldOfStudy) errors.fieldOfStudy = 'Field of Study is required';
  else if (!TEXT_ONLY_REGEX.test(fieldOfStudy)) {
    errors.fieldOfStudy = 'Only letters and spaces allowed';
  }

  if (!startDate) errors.startDate = 'Start date is required';
  else if (!isValidMonth(startDate)) errors.startDate = 'Invalid date';
  else if (isMonthInFuture(startDate)) {
    errors.startDate = 'Start date cannot be in the future';
  }

  if (!endDate) errors.endDate = 'End date is required';
  else if (!isValidMonth(endDate)) errors.endDate = 'Invalid date';
  else if (!isEndDateAfterStartDate(startDate, endDate)) {
    errors.endDate = 'End date must be after start date';
  }

  if (!country) errors.country = 'Country is required';
  else if (!TEXT_ONLY_REGEX.test(country)) {
    errors.country = 'Only letters, spaces, and basic punctuation allowed';
  }

  if (!grade) errors.grade = 'Grade is required';
  else if (!GRADE_REGEX.test(grade)) {
    errors.grade = 'Only digits and decimal points are allowed';
  }

  return errors;
};

export const isEducationEntryValid = (edu?: Partial<EducationEntry> | null) => {
  const errors = getEducationEntryErrors(edu);
  return Object.keys(errors).length === 0;
};

interface EducationStepProps {
  education: EducationEntry[];
  // Updated field key type
  onchange: (index: number, field: keyof EducationEntry, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  attemptedNext: boolean;
}

const EducationStep: React.FC<EducationStepProps> = ({
  education,
  onchange,
  onAdd,
  onRemove,
  attemptedNext,
}) => {
  const safeTrim = (value: unknown) =>
    typeof value === 'string' ? value.trim() : '';

  const isFilled = (edu?: EducationEntry) => {
    if (!edu || typeof edu !== 'object') return false;
    return Object.values(edu).some((v) => safeTrim(v));
  };
  const getMonthValue = (dateVal: string | Date | undefined) => {
    if (!dateVal) return '';

    // Handle Date Object
    if (dateVal instanceof Date) {
      if (isNaN(dateVal.getTime())) return '';
      const year = dateVal.getFullYear();
      const month = String(dateVal.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    }

    // Handle String
    return dateVal.slice(0, 7);
  };
  /**
   * Validate if:
   * - User clicked Next
   * - AND (this card is filled OR it's the first card)
   */
  const shouldValidate = (edu?: EducationEntry, index?: number) =>
    attemptedNext && (isFilled(edu) || index === 0);

  // const showError = (value?: string, edu?: EducationEntry, index?: number) =>
  //   shouldValidate(edu, index) && !safeTrim(value);

  const getError = (
    field: keyof EducationEntry,
    edu?: EducationEntry,
    index?: number,
  ) => {
    if (!shouldValidate(edu, index)) return '';
    const errors = getEducationEntryErrors(edu);
    return errors[field] ?? '';
  };

  return (
    <div className="space-y-6">
      {education.map((edu, index) => {
        const instituteError = getError('institute', edu, index);
        const degreeError = getError('degree', edu, index);
        const fieldOfStudyError = getError('fieldOfStudy', edu, index);
        const startDateError = getError('startDate', edu, index);
        const endDateError = getError('endDate', edu, index);
        const countryError = getError('country', edu, index);
        const gradeError = getError('grade', edu, index);

        return (
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
                value={edu?.institute || ''}
                onChange={(e) => onchange(index, 'institute', e.target.value)}
                className={`h-11 bg-white ${
                  //  showError(edu?.institute, edu, index)
                  instituteError
                    ? 'border-red-500 focus-visible:ring-red-500'
                    : ''
                }`}
              />

              {/* {showError(edu?.institute, edu, index) && ( */}
              {instituteError && (
                <p className="text-xs text-red-500 mt-1">{instituteError}</p>
              )}
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
                  className={`h-11 bg-white ${
                    // showError(edu?.degree, edu, index) ? 'border-red-500 ' : ''
                    degreeError ? 'border-red-500 ' : ''
                  }`}
                />

                {/* {showError(edu?.degree, edu, index) && ( */}
                {degreeError && (
                  <p className="text-xs text-red-500 mt-1">{degreeError}</p>
                )}
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
                  className={`h-11 bg-white ${
                    // showError(edu?.fieldOfStudy, edu, index)
                    fieldOfStudyError ? 'border-red-500 ' : ''
                  }`}
                />
                {/* {showError(edu?.fieldOfStudy, edu, index) && ( */}
                {fieldOfStudyError && (
                  <p className="text-xs text-red-500 mt-1">
                    {fieldOfStudyError}
                  </p>
                )}
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
                    value={getMonthValue(edu.startDate || '')}
                    onChange={(e) =>
                      onchange(index, 'startDate', e.target.value)
                    }
                    className={`h-11 bg-white ${
                      //  showError(edu?.startDate, edu, index)
                      startDateError ? 'border-red-500 ' : ''
                    }`}
                  />

                  {/* {showError(edu?.startDate, edu, index) && ( */}
                  {startDateError && (
                    <p className="text-xs text-red-500 mt-1">
                      {startDateError}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  End Date{' '}
                  <span className="text-gray-400 font-normal">
                    (or expected)
                  </span>
                </Label>
                <div className="relative">
                  <Input
                    type="month"
                    value={getMonthValue(edu.endDate || '')}
                    onChange={(e) => onchange(index, 'endDate', e.target.value)}
                    className={`h-11 bg-white ${
                      // showError(edu?.endDate, edu, index) ? 'border-red-500 ' : ''
                      endDateError ? 'border-red-500 ' : ''
                    }`}
                  />
                  {/* {showError(edu?.endDate, edu, index) && ( */}
                  {endDateError && (
                    <p className="text-xs text-red-500 mt-1">{endDateError}</p>
                  )}
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
                  className={`h-11 bg-white ${
                    // showError(edu?.country, edu, index) ? 'border-red-500 ' : ''
                    countryError ? 'border-red-500 ' : ''
                  }`}
                />
                {/* {showError(edu?.country, edu, index) && ( */}
                {countryError && (
                  <p className="text-xs text-red-500 mt-1">{countryError}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Grade / GPA
                </Label>
                <Input
                  value={edu.grade || ''}
                  onChange={(e) => onchange(index, 'grade', e.target.value)}
                  placeholder="e.g. 3.8/4.0"
                  className={`h-11 bg-white ${
                    // showError(edu?.grade, edu, index) ? 'border-red-500 ' : ''
                    gradeError ? 'border-red-500 ' : ''
                  }`}
                />
                {/* {showError(edu?.grade, edu, index) && ( */}
                {gradeError && (
                  <p className="text-xs text-red-500 mt-1">{gradeError}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}

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
