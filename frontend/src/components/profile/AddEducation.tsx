import React from 'react';
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
import { useForm } from 'react-hook-form';
import { countries } from '@/lib/data/countries';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { RootState } from '@/redux/rootReducer';
import { addEducation } from '@/services/api/student';
import {
  addStudentEducationRequest,
  addStudentExperienceRequest,
  addStudentSkillRequest,
  updateStudentEducationRequest,
  updateStudentExperienceRequest,
} from '@/redux/reducers/studentReducer';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';

const employmentTypes = [
  'Full-time',
  'Part-time',
  'Self-employed',
  'Freelance',
  'Contract',
  'Internship',
  'Apprenticeship',
];

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

export const AddEducation = ({ onCancel, isEdit, data, index }: closeProps) => {
  const form = useForm<EducationFormData>({
    defaultValues: data || {
      institution: '',
      degree: '',
      fieldOfStudy: '',
      country: '',
      gpa: '',
      startDate: '',
      endDate: '',
    },
  });

  console.log('data', data);

  const { educations, loading, error } = useSelector(
    (state: RootState) => state.student,
  );

  const dispatch = useDispatch();

  const { handleSubmit, control, reset } = form;

  const handleFormSubmit = (eduData: void | EducationFormData) => {
    console.log(eduData);
    if (!eduData) return;

    if (isEdit) {
      dispatch(
        updateStudentEducationRequest({
          educationId: data.educationId,
          eduData,
        }),
      );
    } else {
      dispatch(addStudentEducationRequest(eduData));
    }

    reset();
    onCancel();
  };

  const handleFormCancel = () => {
    reset();
    onCancel();
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={control}
          name="institution"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Institution*</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Name of Institution" required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="degree"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Degree*</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Bachelor's Degree" required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="fieldOfStudy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Field of Study</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Computer Science" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country*</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="z-[9999] max-h-[300px]">
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

          <FormField
            control={control}
            name="gpa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GPA</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="4.0"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Input type="month" {...field} placeholder="Present" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={handleFormCancel}>
            Cancel
          </Button>
          <Button type="submit">{isEdit ? 'Edit' : 'Save'} Education</Button>
        </div>
      </form>
    </Form>
  );
};

export const AddProject = ({ onCancel }: closeProps) => {
  const form = useForm<ProjectFormData>({
    defaultValues: {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      technologies: '',
      link: '',
    },
  });

  const { handleSubmit, control, reset, watch, setValue } = form;

  const isCurrent = watch('isCurrent');

  const handleFormSubmit = (data: ProjectFormData) => {
    console.log(data);
    reset();
    onCancel();
  };

  const handleFormCancel = () => {
    reset();
    onCancel();
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., AI-Powered Chatbot" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your project, its goals, and your role."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="month" {...field} />
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
                    value={field.value ?? ''}
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
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    if (checked) {
                      setValue('endDate', '');
                    }
                  }}
                />
              </FormControl>
              <FormLabel>I am currently working on this</FormLabel>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="technologies"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Technologies Used</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., React, Python, TensorFlow"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Comma-separated list of technologies.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Link</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://github.com/user/project"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleFormCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Project</Button>
        </div>
      </form>
    </Form>
  );
};

export const AddExperience = ({
  onCancel,
  data,
  index,
  isEdit,
}: closeProps) => {
  console.log('data AddExperience', data);
  const form = useForm<ExperienceFormData>({
    defaultValues: {
      company: data?.company || '',
      designation: data?.designation || '',
      employmentType: data?.employmentType || '',
      location: data?.location || '',
      isCurrent: data?.isCurrent || false,
      startDate: data?.startDate || '',
      endDate: data?.endDate || '',
      responsibilities: data?.responsibilities || '',
      _id: data?._id || '',
    },
  });

  const dispatch = useDispatch();
  const { experiences, error, loading } = useSelector(
    (state: RootState) => state.student,
  );

  const { handleSubmit, control, watch, setValue } = form;
  const isCurrent = watch('isCurrent');

  const handleFormSubmit = (data: ExperienceFormData) => {
    if (isEdit) {
      dispatch(updateStudentExperienceRequest({ data, index: data._id }));
    } else {
      dispatch(addStudentExperienceRequest(data));
    }
    onCancel();
  };

  const handleFormCancel = () => {
    onCancel();
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="border p-4 mt-2 mb-4 space-y-4 relative rounded-lg">
          <FormField
            control={control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company*</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Company name" required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="designation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Designation*</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Your position" required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="employmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employment Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="z-[9999] max-h-[300px]">
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
                  <FormLabel>Location (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. San Francisco, CA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      placeholder="or 'Present'"
                      {...field}
                      disabled={isCurrent}
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
              <FormItem className="flex flex-row items-center space-x-2 pt-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      setValue('endDate', '');
                    }}
                  />
                </FormControl>
                <FormLabel className="font-normal">
                  I currently work here
                </FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="responsibilities"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Responsibilities / Achievements (Optional)
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your key responsibilities. Use separate lines for each point."
                    {...field}
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={handleFormCancel}>
              Cancel
            </Button>
            <Button type="submit">Save Project</Button>
          </div>
        </div>
      </form>
    </Form>
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
    console.log(data);
    dispatch(addStudentSkillRequest(data));
    console.log('students', students);
    onCancel();
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
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
                  <SelectContent className="z-[9999] max-h-[300px]">
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
