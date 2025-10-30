import React, { useEffect } from 'react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Button } from '../ui/button';
import { countries } from '@/lib/data/countries';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { RootState } from '@/redux/rootReducer';
import { addEducation } from '@/services/api/student';
import {
  addStudentEducationRequest,
  addStudentExperienceRequest,
  addStudentProjectRequest,
  addStudentSkillRequest,
  updateStudentEducationRequest,
  updateStudentExperienceRequest,
  updateStudentProjectRequest,
} from '@/redux/reducers/studentReducer';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import {
  BookOpen,
  Briefcase,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Code,
  FileText,
  FolderOpen,
  GraduationCap,
  Link,
  MapPin,
  X,
} from 'lucide-react';
import { TechnologyInput } from '@/utils/TechnologyInput';
import { formatDateForMonthInput } from '@/utils/TechnologyInput';
import { useForm } from 'react-hook-form';
import { MonthYearSelector } from './MonthYearSelector';

const employmentTypes = [
  'Full-time',
  'Part-time',
  'Self-employed',
  'Freelance',
  'Contract',
  'Internship',
  'Apprenticeship',
];

const normalizeEmploymentType = (dbValue: string) => {
  if (!dbValue) return '';

  // Prepare the DB value for comparison: lowercase and remove separators
  const cleanDbValue = dbValue.toLowerCase().replace(/[-_]/g, '');

  // Find the matching type from our canonical list
  const foundType = employmentTypes.find((type) => {
    const cleanType = type.toLowerCase().replace(/[-_]/g, '');
    return cleanType === cleanDbValue;
  });

  return foundType || ''; // Return the found type (e.g., 'Full-time') or fallback
};

interface EducationFormData {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  country: string;
  gpa: string;
  startDate: string;
  endDate: string;
}

interface ProjectFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  technologies: string;
  link: string;
}

interface ExperienceFormData {
  company: string;
  jobTitle: string;
  employmentType: string;
  location: string;
  isCurrent: boolean;
  startDate: string;
  endDate: string;
  responsibilities: string;
}

const skillTypes = ['BIGINNER', 'INTERMEDIATE', 'EXPERT'];

interface SkillFormData {
  skill: string;
  level: string;
}

interface closeProps {
  onCancel: () => void;
  data?: any | null;
  isEdit?: boolean;
  index?: string;
}

interface education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  country: string;
  gpa: string;
  startDate: string;
  endDate: string;
}

const formatDateForInput = (dateString) => {
  if (!dateString || typeof dateString !== 'string') {
    return '';
  }
  // Takes "2022-09-01" and returns "2022-09"
  return dateString.slice(0, 7);
};

const DegreeSelector = ({ field }) => {
  const degreeTypes = [
    { value: "Bachelor's Degree", label: "Bachelor's", color: 'cyan' },
    { value: "Master's Degree", label: "Master's", color: 'purple' },
    { value: 'PhD', label: 'PhD', color: 'green' },
    { value: 'Associate Degree', label: 'Associate', color: 'blue' },
    { value: 'High School Diploma', label: 'High School', color: 'yellow' },
    { value: 'Certificate', label: 'Certificate', color: 'red' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {degreeTypes.map((degree) => (
        <div
          key={degree.value}
          onClick={() => field.onChange(degree.value)}
          className={`cursor-pointer p-4 rounded-xl border-2 text-center transition-all duration-300 transform hover:scale-105 ${
            field.value === degree.value
              ? `bg-${degree.color}-500 text-white border-${degree.color}-500 shadow-lg shadow-${degree.color}-500/30`
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          <div className="font-semibold">{degree.label}</div>
          {field.value === degree.value && (
            <Check className="w-5 h-5 mx-auto mt-1 text-white" />
          )}
        </div>
      ))}
    </div>
  );
};

export const AddEducation = ({ onCancel, isEdit, data }: any) => {
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm({
    defaultValues: {
      institution: data?.institution || '',
      degree: data?.degree || '',
      fieldOfStudy: data?.fieldOfStudy || '',
      country: data?.country || '',
      gpa: data?.gpa || '',
      startDate: data?.startDate || '',
      endDate: data?.endDate || '',
      _id: data?._id || '', // ✅ Add this line
    },
  });

  const dispatch = useDispatch();

  const { handleSubmit, control, reset, trigger } = form;

  const handleFormSubmit = (formData) => {
    const payload = { ...formData };

    if (isEdit) {
      dispatch(
        updateStudentEducationRequest({
          educationId: payload._id,
          eduData: payload,
        }),
      );
    } else {
      dispatch(addStudentEducationRequest(payload));
    }

    reset();
    onCancel();
  };

  const handleFormCancel = () => {
    reset();
    onCancel();
  };

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
      icon: BookOpen,
      fields: ['fieldOfStudy', 'country'],
    },
    {
      id: 'timeline',
      title: 'Dates & GPA',
      icon: Calendar,
      fields: ['startDate', 'gpa', 'endDate'],
    },
  ];

  const handleNextStep = async () => {
    const fields = steps[currentStep].fields;
    const isValid = await trigger(fields);

    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0  flex items-center justify-center p-4 z-50 animate-in fade-in-0 duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-white">
        {/* Header */}
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
              className="w-10 h-10 bg-white/20 rounded-full hover:bg-white/30 text-white hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    index <= currentStep
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 ${
                      index < currentStep ? 'bg-purple-500' : 'bg-gray-200'
                    }`}
                  ></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <Form {...form}>
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="space-y-6"
            >
              {/* Step 1: Basic Info */}
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
                        <DegreeSelector field={field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Step 2: Details */}
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
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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

              {/* Step 3: Timeline */}
              <div className={currentStep !== 2 ? 'hidden' : 'block'}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date*</FormLabel>
                        <FormControl>
                          {/* ✅ USE THE NEW COMPONENT HERE */}
                          <MonthYearSelector field={field} />
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
                          {/* ✅ AND HERE AS WELL */}
                          <MonthYearSelector field={field} />
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

              {/* Footer Actions - Placed outside the conditional blocks */}
              <div className="pt-4 flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                  disabled={currentStep === 0}
                  className="disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {currentStep < steps.length - 1 && (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}

                {currentStep === steps.length - 1 && (
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
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

export const AddProject = ({ onCancel, data, isEdit }: any) => {
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm({
    defaultValues: {
      projectName: data?.projectName || '',
      description: data?.description || '',
      startDate: formatDateForMonthInput(data?.startDate) || '',
      endDate: formatDateForMonthInput(data?.endDate) || '',
      isCurrent: data?.isCurrent || false,
      technologies: Array.isArray(data?.technologies)
        ? data.technologies
        : data?.technologies
        ? data.technologies
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      link: data?.link || '',
      _id: data?._id || '',
    },
  });

  const dispatch = useDispatch();

  const { handleSubmit, control, reset, watch, setValue, trigger } = form;

  const isCurrent = watch('isCurrent');

  useEffect(() => {
    if (isCurrent) {
      setValue('endDate', '');
    }
  }, [isCurrent, setValue]);

  const handleFormSubmit = (formData) => {
    const payload = { ...formData };

    if (isEdit) {
      dispatch(
        updateStudentProjectRequest({ data: payload, index: payload._id }),
      );
    } else {
      dispatch(addStudentProjectRequest(payload));
    }
    reset();
    onCancel();
  };

  const handleFormCancel = () => {
    reset();
    onCancel();
  };

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
  ];

  const handleNextStep = async () => {
    const fields = steps[currentStep].fields;
    const isValid = await trigger(fields);

    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0  flex items-center justify-center p-4 z-50 animate-in fade-in-0 duration-300">
      <div className=" rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-white">
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
              className="w-10 h-10 bg-white/20 rounded-full hover:bg-white/30 text-white hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    index <= currentStep
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 ${
                      index < currentStep ? 'bg-blue-500' : 'bg-gray-200'
                    }`}
                  ></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <Form {...form}>
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="space-y-6"
            >
              {/* Step 1: Core Details */}
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
                          {...field}
                          rows={5}
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Step 2: Timeline & Status */}
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
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">
                        I am currently working on this project
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              {/* Step 3: Tech & Links */}
              <div className={currentStep !== 2 ? 'hidden' : 'block'}>
                <FormField
                  control={control}
                  name="technologies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Technologies Used</FormLabel>
                      <FormControl>
                        <TechnologyInput field={field} />
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
                        <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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

              {/* Footer Actions */}
              <div className="pt-4 flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                  disabled={currentStep === 0}
                  className="disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {currentStep < steps.length - 1 && (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}

                {currentStep === steps.length - 1 && (
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
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

export const AddExperience = ({ onCancel, data, isEdit, index }: any) => {
  const [currentStep, setCurrentStep] = useState(0);

  console.log('🚀 ~ file: AddExperience.tsx:70 ~ AddExperience ~ data:', data);

  const form = useForm({
    // Add your Zod resolver if you use one
    defaultValues: {
      company: data?.company || '',
      designation: data?.title || '',
      employmentType: data?.employmentType || '',
      location: data?.location || '',
      isCurrent: data?.isCurrent || false,
      startDate: formatDateForMonthInput(data?.startDate) || '',
      endDate: formatDateForMonthInput(data?.endDate) || '',
      responsibilities: data?.description || '',
      _id: data?._id || '',
    },
  });

  const dispatch = useDispatch();
  const { experiences, error, loading } = useSelector(
    (state: RootState) => state.student,
  );

  const { handleSubmit, control, watch, setValue, trigger, reset } = form;
  const isCurrent = watch('isCurrent');

  useEffect(() => {
    if (isCurrent) {
      setValue('endDate', '');
    }
  }, [isCurrent, setValue]);

  const handleFormSubmit = (formData) => {
    if (isEdit) {
      dispatch(
        updateStudentExperienceRequest({ data: formData, index: formData._id }),
      );
    } else {
      dispatch(addStudentExperienceRequest(formData));
    }
    reset();
    onCancel();
  };

  const handleFormCancel = () => {
    reset();
    onCancel();
  };

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
  ];

  const handleNextStep = async () => {
    const fields = steps[currentStep].fields;
    const isValid = await trigger(fields);

    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0  flex items-center justify-center p-4 z-50 animate-in fade-in-0 duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-white">
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
              className="w-10 h-10 bg-white/20 rounded-full hover:bg-white/30 text-white hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    index <= currentStep
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 ${
                      index < currentStep ? 'bg-purple-500' : 'bg-gray-200'
                    }`}
                  ></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <Form {...form}>
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="space-y-6"
            >
              {/* Step 1: Company & Role */}
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
                          placeholder="e.g., Google, Microsoft"
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

              {/* Step 2: Type & Location */}
              <div className={currentStep !== 1 ? 'hidden' : 'block'}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={control}
                    name="employmentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employment Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          // ✅ Use the helper function to normalize the defaultValue
                          defaultValue={normalizeEmploymentType(field.value)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className=" bg-white z-[9999]">
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
                            placeholder="e.g. San Francisco, CA"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Step 3: Timeline & Responsibilities */}
              <div className={currentStep !== 2 ? 'hidden' : 'block'}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        {console.log('START DATE', field.value)}
                        <FormLabel>Start Date*</FormLabel>
                        <FormControl>
                          {/* ✅ USE THE NEW COMPONENT HERE */}
                          <MonthYearSelector field={field} />
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
                          {/* ✅ AND HERE AS WELL */}
                          <MonthYearSelector field={field} />
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
                          checked={field.value}
                          onCheckedChange={field.onChange}
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
                          {...field}
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-4 flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                  disabled={currentStep === 0}
                  className="disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {currentStep < steps.length - 1 && (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}

                {currentStep === steps.length - 1 && (
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
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

export const AddSkill = ({ onCancel }: closeProps) => {
  const form = useForm<SkillFormData>({
    defaultValues: {
      skill: '',
      level: '',
    },
  });

  const dispatch = useDispatch();
  const { skills, loading, error } = useSelector(
    (state: RootState) => state.student,
  );

  const { handleSubmit, control } = form;

  const handleFormSubmit = (data: SkillFormData) => {
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="z-[9999] max-h-[300px] bg-slate-200">
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
