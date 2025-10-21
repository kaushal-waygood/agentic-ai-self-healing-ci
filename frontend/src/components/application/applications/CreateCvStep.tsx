'use client';

import { motion } from 'framer-motion';
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
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Loader2, PlusCircle, Trash2, Wand2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { countries } from '@/lib/data/countries';

const CreateCvStep = ({
  createCvForm,
  handleCreateCvFormSubmit,
  eduFields,
  removeEdu,
  expFields,
  removeExp,
  appendEdu,
  appendExp,
  removeProject,
  projectFields,
  isLoading,
  navigateToStep,
  appendProject,
}: any) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        when: 'beforeChildren',
        staggerChildren: 0.1,
      },
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  const StyledCard = (props) => (
    <motion.div variants={containerVariants}>
      <Card
        className="bg-slate-900/80 border-slate-800 backdrop-blur-sm text-slate-50"
        {...props}
      />
    </motion.div>
  );

  return (
    <StyledCard>
      <CardHeader>
        <CardTitle>Create a New CV</CardTitle>
        <CardDescription>
          Fill out your professional details. This will be saved and used for
          this application.
        </CardDescription>
      </CardHeader>
      <Form {...createCvForm}>
        <form onSubmit={createCvForm.handleSubmit(handleCreateCvFormSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={createCvForm.control}
              name="targetJobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Target Job Title for this CV{' '}
                    <span className="text-red-400">*</span>
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
                    Professional Summary <span className="text-red-400">*</span>
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

            <div>
              <h3 className="text-lg font-medium mb-2">
                Education <span className="text-red-400">*</span>
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
                      control={createCvForm.control}
                      name={`education.${index}.fieldOfStudy`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Field of Study (Optional)</FormLabel>
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
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeEdu(index)}
                    className="absolute top-2 right-2"
                  >
                    <Trash2 className="h-4 w-4" /> Remove
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

            <div>
              <h3 className="text-lg font-medium mb-2">
                Work Experience <span className="text-red-400">*</span>
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
                              disabled={createCvForm.watch(
                                `experience.${index}.isCurrent`,
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={createCvForm.control}
                    name={`experience.${index}.isCurrent`}
                    render={({ field: f }) => (
                      <FormItem className="flex flex-row items-center space-x-2 pt-2">
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
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          I currently work here
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createCvForm.control}
                    name={`experience.${index}.responsibilities`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>Responsibilities (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your key responsibilities and achievements. Use separate lines for each point."
                            {...f}
                            value={f.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
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
                    <Trash2 className="h-4 w-4" /> Remove
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

            <div>
              <h3 className="text-lg font-medium mb-2">
                Projects / Research Work
              </h3>
              {projectFields.map((field, index) => (
                <Card
                  key={field.id}
                  className="p-4 mt-2 mb-4 space-y-4 relative"
                >
                  <FormField
                    control={createCvForm.control}
                    name={`projects.${index}.name`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., AI-Powered Chatbot"
                            {...f}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createCvForm.control}
                    name={`projects.${index}.description`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your project, its goals, and your role."
                            {...f}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createCvForm.control}
                      name={`projects.${index}.startDate`}
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
                      name={`projects.${index}.endDate`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
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
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={createCvForm.control}
                    name={`projects.${index}.isCurrent`}
                    render={({ field: f }) => (
                      <FormItem className="flex flex-row items-center space-x-2 pt-2">
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
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          I am currently working on this
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createCvForm.control}
                    name={`projects.${index}.technologies`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>Technologies Used (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., React, Python, TensorFlow"
                            {...f}
                            value={f.value ?? ''}
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
                    control={createCvForm.control}
                    name={`projects.${index}.link`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>Project Link (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://github.com/user/project"
                            {...f}
                            value={f.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
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
                    <Trash2 className="h-4 w-4" /> Remove
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
                    Skills <span className="text-red-400">*</span>
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
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigateToStep('cv')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="button"
                className="bg-purple-600 hover:bg-purple-700 text-white"
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
            </motion.div>
          </CardFooter>
        </form>
      </Form>
    </StyledCard>
  );
};

export default CreateCvStep;
