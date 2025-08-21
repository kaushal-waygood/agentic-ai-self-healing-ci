'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cvDetailsSchema, CvDetailsValues } from '../schemas';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Loader2, PlusCircle, Trash2, Wand2 } from 'lucide-react';
import { countries } from '@/lib/data/countries'; // Adjust import path as needed

type CreateCvStepProps = {
  isLoading: boolean;
  jobTitle: string;
  defaultValues: Partial<CvDetailsValues>;
  onSubmit: (data: CvDetailsValues) => void;
  onBack: () => void;
};

export function CreateCvStep({
  isLoading,
  jobTitle,
  defaultValues,
  onSubmit,
  onBack,
}: CreateCvStepProps) {
  const createCvForm = useForm<CvDetailsValues>({
    resolver: zodResolver(cvDetailsSchema),
    defaultValues: { ...defaultValues, targetJobTitle: jobTitle },
  });

  const {
    fields: eduFields,
    append: appendEdu,
    remove: removeEdu,
  } = useFieldArray({ control: createCvForm.control, name: 'education' });
  const {
    fields: expFields,
    append: appendExp,
    remove: removeExp,
  } = useFieldArray({ control: createCvForm.control, name: 'experience' });
  const {
    fields: projectFields,
    append: appendProject,
    remove: removeProject,
  } = useFieldArray({ control: createCvForm.control, name: 'projects' });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New CV</CardTitle>
        <CardDescription>
          Fill out your professional details. This will be saved and used for
          this application.
        </CardDescription>
      </CardHeader>
      <Form {...createCvForm}>
        <form onSubmit={createCvForm.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={createCvForm.control}
              name="targetJobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Target Job Title for this CV{' '}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Senior Product Manager"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={createCvForm.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Professional Summary{' '}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A brief professional summary of your career and goals."
                      {...field}
                      value={field.value ?? ''}
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator />

            {/* Education Section */}
            <div>
              <h3 className="text-lg font-medium mb-2">
                Education <span className="text-destructive">*</span>
              </h3>
              {eduFields.map((field, index) => (
                <Card
                  key={field.id}
                  className="p-4 mt-2 mb-4 space-y-4 relative"
                >
                  {/* Form fields for institution, degree, country, etc. */}
                  <FormField
                    control={createCvForm.control}
                    name={`education.${index}.institution`}
                    render={({ field: f }) => (
                      <FormItem>
                        {' '}
                        <FormLabel>Institution</FormLabel>{' '}
                        <FormControl>
                          <Input {...f} value={f.value ?? ''} />
                        </FormControl>{' '}
                        <FormMessage />{' '}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createCvForm.control}
                    name={`education.${index}.degree`}
                    render={({ field: f }) => (
                      <FormItem>
                        {' '}
                        <FormLabel>Degree</FormLabel>{' '}
                        <FormControl>
                          <Input {...f} value={f.value ?? ''} />
                        </FormControl>{' '}
                        <FormMessage />{' '}
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createCvForm.control}
                      name={`education.${index}.country`}
                      render={({ field: f }) => (
                        <FormItem>
                          {' '}
                          <FormLabel>Country</FormLabel>{' '}
                          <Select
                            onValueChange={f.onChange}
                            defaultValue={f.value}
                          >
                            {' '}
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                            </FormControl>{' '}
                            <SelectContent>
                              {' '}
                              {countries.map((c) => (
                                <SelectItem key={c.code} value={c.name}>
                                  {c.name}
                                </SelectItem>
                              ))}{' '}
                            </SelectContent>{' '}
                          </Select>{' '}
                          <FormMessage />{' '}
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createCvForm.control}
                      name={`education.${index}.fieldOfStudy`}
                      render={({ field: f }) => (
                        <FormItem>
                          {' '}
                          <FormLabel>Field of Study (Optional)</FormLabel>{' '}
                          <FormControl>
                            <Input {...f} value={f.value ?? ''} />
                          </FormControl>{' '}
                          <FormMessage />{' '}
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createCvForm.control}
                      name={`education.${index}.startDate`}
                      render={({ field: f }) => (
                        <FormItem>
                          {' '}
                          <FormLabel>Start Date</FormLabel>{' '}
                          <FormControl>
                            <Input type="month" {...f} value={f.value ?? ''} />
                          </FormControl>{' '}
                          <FormMessage />{' '}
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createCvForm.control}
                      name={`education.${index}.endDate`}
                      render={({ field: f }) => (
                        <FormItem>
                          {' '}
                          <FormLabel>End Date</FormLabel>{' '}
                          <FormControl>
                            <Input
                              type="month"
                              placeholder="or 'Present'"
                              {...f}
                              value={f.value ?? ''}
                            />
                          </FormControl>{' '}
                          <FormMessage />{' '}
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeEdu(index)}
                    className="absolute top-2 right-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendEdu({
                    institution: '',
                    degree: '',
                    fieldOfStudy: '',
                    country: '',
                    gpa: '',
                    startDate: '',
                    endDate: '',
                  })
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Education
              </Button>
            </div>

            <Separator />

            {/* Work Experience Section */}
            <div>
              <h3 className="text-lg font-medium mb-2">
                Work Experience <span className="text-destructive">*</span>
              </h3>
              {expFields.map((field, index) => (
                <Card
                  key={field.id}
                  className="p-4 mt-2 mb-4 space-y-4 relative"
                >
                  {/* Form fields for company, jobTitle, dates, etc. */}
                  <FormField
                    control={createCvForm.control}
                    name={`experience.${index}.company`}
                    render={({ field: f }) => (
                      <FormItem>
                        {' '}
                        <FormLabel>Company</FormLabel>{' '}
                        <FormControl>
                          <Input {...f} value={f.value ?? ''} />
                        </FormControl>{' '}
                        <FormMessage />{' '}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createCvForm.control}
                    name={`experience.${index}.jobTitle`}
                    render={({ field: f }) => (
                      <FormItem>
                        {' '}
                        <FormLabel>Job Title</FormLabel>{' '}
                        <FormControl>
                          <Input {...f} value={f.value ?? ''} />
                        </FormControl>{' '}
                        <FormMessage />{' '}
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createCvForm.control}
                      name={`experience.${index}.startDate`}
                      render={({ field: f }) => (
                        <FormItem>
                          {' '}
                          <FormLabel>Start Date</FormLabel>{' '}
                          <FormControl>
                            <Input type="month" {...f} value={f.value ?? ''} />
                          </FormControl>{' '}
                          <FormMessage />{' '}
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createCvForm.control}
                      name={`experience.${index}.endDate`}
                      render={({ field: f }) => (
                        <FormItem>
                          {' '}
                          <FormLabel>End Date</FormLabel>{' '}
                          <FormControl>
                            <Input
                              type="month"
                              placeholder="or 'Present'"
                              {...f}
                              value={f.value ?? ''}
                              disabled={createCvForm.watch(
                                `experience.${index}.isCurrent`,
                              )}
                            />
                          </FormControl>{' '}
                          <FormMessage />{' '}
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={createCvForm.control}
                    name={`experience.${index}.isCurrent`}
                    render={({ field: f }) => (
                      <FormItem className="flex flex-row items-center space-x-2 pt-2">
                        {' '}
                        <FormControl>
                          <Checkbox
                            checked={f.value}
                            onCheckedChange={(checked) => {
                              f.onChange(checked);
                              createCvForm.setValue(
                                `experience.${index}.endDate`,
                                checked ? 'Present' : '',
                              );
                            }}
                          />{' '}
                        </FormControl>{' '}
                        <FormLabel className="font-normal">
                          I currently work here
                        </FormLabel>{' '}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createCvForm.control}
                    name={`experience.${index}.responsibilities`}
                    render={({ field: f }) => (
                      <FormItem>
                        {' '}
                        <FormLabel>Responsibilities (Optional)</FormLabel>{' '}
                        <FormControl>
                          <Textarea
                            placeholder="Describe your key responsibilities and achievements. Use separate lines for each point."
                            {...f}
                            value={f.value ?? ''}
                          />
                        </FormControl>{' '}
                        <FormMessage />{' '}
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeExp(index)}
                    className="absolute top-2 right-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendExp({
                    company: '',
                    jobTitle: '',
                    location: '',
                    employmentType: undefined,
                    responsibilities: '',
                    startDate: '',
                    endDate: '',
                    isCurrent: false,
                  })
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Experience
              </Button>
            </div>

            <Separator />

            {/* Projects Section */}
            <div>
              <h3 className="text-lg font-medium mb-2">
                Projects / Research Work
              </h3>
              {projectFields.map((field, index) => (
                <Card
                  key={field.id}
                  className="p-4 mt-2 mb-4 space-y-4 relative"
                >
                  {/* Form fields for project name, description, link, etc. */}
                  <FormField
                    control={createCvForm.control}
                    name={`projects.${index}.name`}
                    render={({ field: f }) => (
                      <FormItem>
                        {' '}
                        <FormLabel>Project Name</FormLabel>{' '}
                        <FormControl>
                          <Input
                            placeholder="e.g., AI-Powered Chatbot"
                            {...f}
                          />
                        </FormControl>{' '}
                        <FormMessage />{' '}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createCvForm.control}
                    name={`projects.${index}.description`}
                    render={({ field: f }) => (
                      <FormItem>
                        {' '}
                        <FormLabel>Description</FormLabel>{' '}
                        <FormControl>
                          <Textarea
                            placeholder="Describe your project, its goals, and your role."
                            {...f}
                          />
                        </FormControl>{' '}
                        <FormMessage />{' '}
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createCvForm.control}
                      name={`projects.${index}.startDate`}
                      render={({ field: f }) => (
                        <FormItem>
                          {' '}
                          <FormLabel>Start Date</FormLabel>{' '}
                          <FormControl>
                            <Input type="month" {...f} value={f.value ?? ''} />
                          </FormControl>{' '}
                          <FormMessage />{' '}
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createCvForm.control}
                      name={`projects.${index}.endDate`}
                      render={({ field: f }) => (
                        <FormItem>
                          {' '}
                          <FormLabel>End Date</FormLabel>{' '}
                          <FormControl>
                            <Input
                              type="month"
                              placeholder="or 'Present'"
                              {...f}
                              value={f.value ?? ''}
                              disabled={createCvForm.watch(
                                `projects.${index}.isCurrent`,
                              )}
                            />
                          </FormControl>{' '}
                          <FormMessage />{' '}
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={createCvForm.control}
                    name={`projects.${index}.isCurrent`}
                    render={({ field: f }) => (
                      <FormItem className="flex flex-row items-center space-x-2 pt-2">
                        {' '}
                        <FormControl>
                          <Checkbox
                            checked={f.value}
                            onCheckedChange={(checked) => {
                              f.onChange(checked);
                              createCvForm.setValue(
                                `projects.${index}.endDate`,
                                checked ? 'Present' : '',
                              );
                            }}
                          />{' '}
                        </FormControl>{' '}
                        <FormLabel className="font-normal">
                          I am currently working on this
                        </FormLabel>{' '}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createCvForm.control}
                    name={`projects.${index}.technologies`}
                    render={({ field: f }) => (
                      <FormItem>
                        {' '}
                        <FormLabel>Technologies Used (Optional)</FormLabel>{' '}
                        <FormControl>
                          <Input
                            placeholder="e.g., React, Python, TensorFlow"
                            {...f}
                            value={f.value ?? ''}
                          />
                        </FormControl>{' '}
                        <FormDescription>
                          Comma-separated list of technologies.
                        </FormDescription>{' '}
                        <FormMessage />{' '}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createCvForm.control}
                    name={`projects.${index}.link`}
                    render={({ field: f }) => (
                      <FormItem>
                        {' '}
                        <FormLabel>Project Link (Optional)</FormLabel>{' '}
                        <FormControl>
                          <Input
                            placeholder="https://github.com/user/project"
                            {...f}
                            value={f.value ?? ''}
                          />
                        </FormControl>{' '}
                        <FormMessage />{' '}
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeProject(index)}
                    className="absolute top-2 right-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendProject({
                    name: '',
                    description: '',
                    technologies: '',
                    link: '',
                    startDate: '',
                    endDate: '',
                    isCurrent: false,
                  })
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Project
              </Button>
            </div>

            <Separator />
            <FormField
              control={createCvForm.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Skills <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., React, Node.js, Project Management"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Comma-separated list of your top skills.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="ghost" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Create & Use this CV
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
