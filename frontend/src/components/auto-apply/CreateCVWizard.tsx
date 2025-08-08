import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
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
import { countries } from '@/lib/data/countries';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Button } from '../ui/button';
import { ArrowLeft, Loader2, PlusCircle, Trash2, Wand2 } from 'lucide-react';
import { useFieldArray } from 'react-hook-form';
import { Textarea } from '../ui/textarea';

const employmentTypes = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
] as const;

const CreateCVWizard = ({
  createCvForm,
  setWizardStep,
  handleCreateCvFormSubmit,
  isLoading,
}: any) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New CV for the Agent</CardTitle>
        <CardDescription>
          Fill in your details. The AI will craft a CV, save it, and select it
          for the agent.
        </CardDescription>
      </CardHeader>
      <Form {...createCvForm}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            createCvForm.handleSubmit(handleCreateCvFormSubmit)();
          }}
        >
          <CardContent className="space-y-6 pt-6">
            <FormField
              control={createCvForm.control}
              name="targetJobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Target Job Title <span className="text-destructive">*</span>
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
                      placeholder="A brief summary of your career..."
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <h3 className="text-lg font-medium mb-2">
                Education <span className="text-destructive">*</span>
              </h3>
              {eduFields.map((field, index) => (
                <Card
                  key={field.id}
                  className="p-4 mt-2 mb-4 space-y-4 relative"
                >
                  <FormField
                    control={createCvForm.control}
                    name={`education.${index}.institution`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>Institution</FormLabel>
                        <FormControl>
                          <Input {...f} value={f.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createCvForm.control}
                    name={`education.${index}.degree`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>Degree</FormLabel>
                        <FormControl>
                          <Input {...f} value={f.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createCvForm.control}
                    name={`education.${index}.fieldOfStudy`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>Field of Study</FormLabel>
                        <FormControl>
                          <Input {...f} value={f.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createCvForm.control}
                      name={`education.${index}.country`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <Select
                            onValueChange={f.onChange}
                            defaultValue={f.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectContent>
                                {countries.map((c) => (
                                  <SelectItem key={c.code} value={c.name}>
                                    {c.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createCvForm.control}
                      name={`education.${index}.gpa`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>GPA (Optional)</FormLabel>
                          <FormControl>
                            <Input {...f} value={f.value ?? ''} />
                          </FormControl>
                          <FormMessage />
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
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="month" {...f} value={f.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createCvForm.control}
                      name={`education.${index}.endDate`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input
                              type="month"
                              placeholder="or 'Present'"
                              {...f}
                              value={f.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {eduFields.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeEdu(index)}
                      className="absolute top-2 right-2"
                    >
                      <Trash2 className="h-4 w-4" /> Remove
                    </Button>
                  )}
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
            <div>
              <h3 className="text-lg font-medium mb-2">
                Experience <span className="text-destructive">*</span>
              </h3>
              {expFields.map((field, index) => (
                <Card
                  key={field.id}
                  className="p-4 mt-2 mb-4 space-y-4 relative"
                >
                  <FormField
                    control={createCvForm.control}
                    name={`experience.${index}.company`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <Input {...f} value={f.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createCvForm.control}
                    name={`experience.${index}.jobTitle`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input {...f} value={f.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createCvForm.control}
                      name={`experience.${index}.employmentType`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Employment Type</FormLabel>
                          <Select
                            onValueChange={f.onChange}
                            defaultValue={f.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectContent>
                                {employmentTypes.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createCvForm.control}
                      name={`experience.${index}.location`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. San Francisco, CA"
                              {...f}
                              value={f.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createCvForm.control}
                      name={`experience.${index}.startDate`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="month" {...f} value={f.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createCvForm.control}
                      name={`experience.${index}.endDate`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input
                              type="month"
                              placeholder="or 'Present'"
                              {...f}
                              value={f.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={createCvForm.control}
                    name={`experience.${index}.responsibilities`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>Responsibilities</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your key responsibilities..."
                            {...f}
                            value={f.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {expFields.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeExp(index)}
                      className="absolute top-2 right-2"
                    >
                      <Trash2 className="h-4 w-4" /> Remove
                    </Button>
                  )}
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
                    employmentType: undefined,
                    location: '',
                    responsibilities: '',
                    startDate: '',
                    endDate: '',
                  })
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Experience
              </Button>
            </div>
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
                      placeholder="e.g., JavaScript, Project Management..."
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormDescription>Comma-separated list.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setWizardStep('cv')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              type="button"
              onClick={createCvForm.handleSubmit(handleCreateCvFormSubmit)}
              disabled={isLoading}
            >
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
};

export default CreateCVWizard;
