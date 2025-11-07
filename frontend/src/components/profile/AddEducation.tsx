/** @format */
/* components/profile/ProfileModals.tsx */

'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

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

/* ------------------------------------------------------------------ */
/* Helpers: month <-> ISO conversions                                  */
/* ------------------------------------------------------------------ */
const toMonth = (iso?: string) =>
  iso ? new Date(iso).toISOString().slice(0, 7) : '';

const monthToIso = (month?: string) =>
  month ? new Date(`${month}-01T00:00:00.000Z`).toISOString() : undefined;

/* ------------------------------------------------------------------ */
/* DegreeSelector: avoid dynamic Tailwind classes getting purged       */
/* ------------------------------------------------------------------ */
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
                ? `text-white shadow-lg ${colorMap[degree.color]}`
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="font-semibold">{degree.label}</div>
            {selected && <Check className="w-5 h-5 mx-auto mt-1 text-white" />}
          </div>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* TechnologyInput: RHF string[] binding via comma separated input     */
/* ------------------------------------------------------------------ */
const TechnologyInput: React.FC<{
  field: { value: string[]; onChange: (v: string[]) => void };
}> = ({ field }) => {
  return (
    <Input
      placeholder="comma separated e.g. React, Node.js, MongoDB"
      value={(field.value || []).join(', ')}
      onChange={(e) =>
        field.onChange(
          e.target.value
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        )
      }
    />
  );
};

/* ================================================================== */
/* AddEducation                                                        */
/* ================================================================== */
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
    startDate: string;
    endDate: string;
  }>;
}> = ({ onCancel, isEdit, data }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm({
    defaultValues: {
      _id: data?._id || '',
      institution: data?.institution || '',
      degree: data?.degree || '',
      fieldOfStudy: data?.fieldOfStudy || '',
      country: data?.country || '',
      gpa: data?.gpa || '',
      startDate: toMonth(data?.startDate),
      endDate: toMonth(data?.endDate),
    },
    mode: 'onSubmit',
  });

  const dispatch = useDispatch();
  const { handleSubmit, control, reset, trigger } = form;

  const steps = [
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
      fields: ['startDate', 'gpa', 'endDate'],
    },
  ] as const;

  const handleFormSubmit = (formData: any) => {
    const payload = {
      ...formData,
      startDate: monthToIso(formData.startDate)!,
      endDate: formData.endDate ? monthToIso(formData.endDate) : undefined,
    };

    console.log(payload);
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

  const handleNextStep = async () => {
    const fields = steps[currentStep].fields as string[];
    const ok = await trigger(fields);
    if (ok && currentStep < steps.length - 1) setCurrentStep((s) => s + 1);
  };

  const handlePrevStep = () => currentStep > 0 && setCurrentStep((s) => s - 1);

  const handleFormCancel = () => {
    reset();
    onCancel();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-in fade-in-0 duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-purple-500 to-cyan-500 p-5 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {isEdit ? 'Edit Education' : 'Add Education'}
                </h2>
                <p className="text-white/80 text-sm">
                  Step {currentStep + 1}: {steps[currentStep].title}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFormCancel}
              className="w-10 h-10 bg-white/20 rounded-full hover:bg-white/30 text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center">
            {steps.map((step, idx) => (
              <React.Fragment key={step.id}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    idx <= currentStep
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {idx < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 ${
                      idx < currentStep ? 'bg-purple-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="p-6 overflow-y-auto flex-1">
          <Form {...form}>
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="space-y-6"
            >
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
                      <FormMessage />
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
                      <FormMessage />
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
                        <Input
                          {...field}
                          placeholder="e.g., Computer Science"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="country"
                  render={({ field }) => (
                    <FormItem className="mt-6">
                      <FormLabel>Country*</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
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
                          <Input type="month" {...field} required />
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
                          <Input
                            type="month"
                            {...field}
                            placeholder="Present"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={control}
                  name="gpa"
                  render={({ field }) => (
                    <FormItem className="mt-6">
                      <FormLabel>Overall Grades (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., 3.8"
                          type="number"
                          step="0.1"
                          min="0"
                          max="4"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Footer */}
              <div className="pt-4 flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                </Button>
                {currentStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Next <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />{' '}
                    {isEdit ? 'Update Education' : 'Save Education'}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

/* ================================================================== */
/* AddProject                                                          */
/* ================================================================== */
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
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm({
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

  const steps = [
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
  ] as const;

  const handleFormSubmit = (formData: any) => {
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

  const handleNextStep = async () => {
    const fields = steps[currentStep].fields as string[];
    const ok = await trigger(fields);
    if (ok && currentStep < steps.length - 1) setCurrentStep((s) => s + 1);
  };

  const handlePrevStep = () => currentStep > 0 && setCurrentStep((s) => s - 1);

  const handleFormCancel = () => {
    reset();
    onCancel();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-in fade-in-0 duration-300">
      <div className="rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-5 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <FolderOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {isEdit ? 'Edit Project' : 'Add Project'}
                </h2>
                <p className="text-white/80 text-sm">
                  Step {currentStep + 1}: {steps[currentStep].title}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFormCancel}
              className="w-10 h-10 bg-white/20 rounded-full hover:bg-white/30 text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center">
            {steps.map((step, idx) => (
              <React.Fragment key={step.id}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    idx <= currentStep
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {idx < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 ${
                      idx < currentStep ? 'bg-blue-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="p-6 overflow-y-auto flex-1">
          <Form {...form}>
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="space-y-6"
            >
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
                      <FormMessage />
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
                      <FormMessage />
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
                          <Input type="month" {...field} required />
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
                          <Input
                            type="month"
                            {...field}
                            disabled={isCurrent}
                            value={isCurrent ? '' : field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Footer */}
              <div className="pt-4 flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                </Button>
                {currentStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Next <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />{' '}
                    {isEdit ? 'Update Project' : 'Save Project'}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

/* ================================================================== */
/* AddExperience                                                       */
/* ================================================================== */
const employmentTypes = [
  'Full-time',
  'Part-time',
  'Self-employed',
  'Freelance',
  'Contract',
  'Internship',
  'Apprenticeship',
] as const;

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
    startDate: string;
    endDate: string;
    responsibilities: string;
  }>;
}> = ({ onCancel, data, isEdit }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm({
    defaultValues: {
      _id: data?._id || '',
      company: data?.company || '',
      designation: data?.designation || '',
      employmentType: data?.employmentType || '',
      location: data?.location || '',
      isCurrent: Boolean(data?.isCurrent),
      startDate: toMonth(data?.startDate),
      endDate: toMonth(data?.endDate),
      responsibilities: data?.responsibilities || '',
    },
    mode: 'onSubmit',
  });

  const dispatch = useDispatch();
  const { handleSubmit, control, watch, setValue, trigger, reset } = form;
  const isCurrent = watch('isCurrent');

  useEffect(() => {
    if (isCurrent) setValue('endDate', '');
  }, [isCurrent, setValue]);

  const steps = [
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
      fields: ['startDate', 'endDate', 'isCurrent', 'responsibilities'],
    },
  ] as const;

  const handleFormSubmit = (formData: any) => {
    const payload = {
      ...formData,
      startDate: monthToIso(formData.startDate)!,
      endDate: formData.isCurrent ? undefined : monthToIso(formData.endDate),
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

  const handleNextStep = async () => {
    const fields = steps[currentStep].fields as string[];
    const ok = await trigger(fields);
    if (ok && currentStep < steps.length - 1) setCurrentStep((s) => s + 1);
  };

  const handlePrevStep = () => currentStep > 0 && setCurrentStep((s) => s - 1);

  const handleFormCancel = () => {
    reset();
    onCancel();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-in fade-in-0 duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-5 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {isEdit ? 'Edit Experience' : 'Add Experience'}
                </h2>
                <p className="text-white/80 text-sm">
                  Step {currentStep + 1}: {steps[currentStep].title}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFormCancel}
              className="w-10 h-10 bg-white/20 rounded-full hover:bg-white/30 text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center">
            {steps.map((step, idx) => (
              <React.Fragment key={step.id}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    idx <= currentStep
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {idx < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 ${
                      idx < currentStep ? 'bg-purple-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="p-6 overflow-y-auto flex-1">
          <Form {...form}>
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="space-y-6"
            >
              {/* Step 1 */}
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
                      <FormMessage />
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Step 2 */}
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
                          <Input type="month" {...field} required />
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
                          <Input
                            type="month"
                            {...field}
                            disabled={isCurrent}
                            value={isCurrent ? '' : field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
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
                        I am currently working here
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="responsibilities"
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

              {/* Footer */}
              <div className="pt-4 flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                </Button>
                {currentStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Next <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />{' '}
                    {isEdit ? 'Update Experience' : 'Save Experience'}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

/* ================================================================== */
/* AddSkill                                                            */
/* ================================================================== */
const skillTypes = ['BEGINNER', 'INTERMEDIATE', 'EXPERT'] as const;

export const AddSkill: React.FC<{ onCancel: () => void }> = ({ onCancel }) => {
  const form = useForm<{ skill: string; level: string }>({
    defaultValues: { skill: '', level: '' },
    mode: 'onSubmit',
  });

  const dispatch = useDispatch();
  useSelector((state: RootState) => state.student); // if you need loading/error, wire it here

  const { handleSubmit, control } = form;

  const handleFormSubmit = (data: { skill: string; level: string }) => {
    dispatch(addStudentSkillRequest(data));
    onCancel();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-8 bg-white p-4 rounded-lg"
      >
        <div className="space-y-4">
          <FormField
            control={control}
            name="skill"
            rules={{ required: 'Skill is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Skill*</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Your skill" required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="level"
            rules={{ required: 'Level is required' }}
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
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Skill</Button>
        </div>
      </form>
    </Form>
  );
};
