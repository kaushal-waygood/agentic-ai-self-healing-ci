'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Save,
  DollarSign,
  Settings as SettingsIcon,
  Briefcase,
  PlusCircle,
  Trash2,
  Pencil,
  ChevronDown,
  ChevronUp,
  Check,
  Edit,
  History,
} from 'lucide-react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Separator } from '@/components/ui/separator';

import {
  AddEducation,
  AddExperience,
  AddProject,
  AddSkill,
} from './AddEducation';
import { JobPref, Narratives } from './AddProject';
import { ProfileFormProps, useProfile } from '@/hooks/useProfile';

export function ProfileForm({ isOnboarding = false }: ProfileFormProps) {
  const {
    //state
    isNameEditable,
    isEmailEditable,
    addEdu,
    addExp,
    addProj,
    addSkill,
    editProjIndex,
    expandedIndex,
    deleteEdu,
    deleteExp,
    deleteProj,
    deleteSkill,
    deleteEduIndex,
    deleteExpIndex,
    deleteProjIndex,
    deleteSkillIndex,
    editEdu,
    editExp,
    editProj,
    editSkill,
    editEduIndex,
    editExpIndex,
    editSkillIndex,
    setEditEdu,
    setEditExp,
    setEditProj,
    setEditSkill,
    setDeleteEdu,
    setDeleteExp,
    setDeleteProj,
    setDeleteSkill,
    setAddEdu,
    setAddExp,
    setAddProj,
    setAddSkill,
    setExpandedIndex,
    setDeleteEduIndex,
    setDeleteExpIndex,
    setDeleteProjIndex,
    setDeleteSkillIndex,
    setEditEduIndex,
    setEditExpIndex,
    setEditProjIndex,
    setEditSkillIndex,
    handleName,
    setHandleName,
    handleEmail,
    setHandleEmail,

    //form
    personalInfoForm,
    careerDetailsForm,
    narrativesForm,
    jobSearchForm,
    educationForm,

    //handlers
    handlePersonalInfoSubmit,
    handleCareerDetailsSubmit,
    handleNarrativesSubmit,
    // handleJobSearchSubmit,
    onCancel,
    deleteEducation,
    handleLevelChange,
    toggleExpand,
    handleEdit,
    handleDelete,
    toggleNameEdit,
    toggleEmailEdit,
    defaultValues,
    handlePersonalInfoEdit,
  } = useProfile();

  return (
    <div className="space-y-6">
      {/* Personal Information Card */}
      <Card id="personal-info">
        <CardHeader>
          <CardTitle className="text-xl font-headline">
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...personalInfoForm}>
            <form
              onSubmit={personalInfoForm.handleSubmit(handlePersonalInfoSubmit)}
            >
              <div className="space-y-4">
                <FormField
                  control={personalInfoForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Your full name"
                            readOnly={!isNameEditable}
                            onChange={(e) => {
                              field.onChange(e);
                              setHandleName(e.target.value);
                            }}
                          />
                        </FormControl>

                        {isNameEditable ? (
                          <Button
                            type="button"
                            size="icon"
                            onClick={() => handlePersonalInfoEdit('fullName')}
                            variant="outline"
                          >
                            <Check size={16} />
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            size="icon"
                            onClick={toggleNameEdit}
                            variant="outline"
                          >
                            <Edit size={16} />
                          </Button>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email Field */}
                <FormField
                  control={personalInfoForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="your.email@example.com"
                            readOnly={!isEmailEditable}
                            value={defaultValues.email}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          size="icon"
                          onClick={toggleEmailEdit}
                          variant="outline"
                        >
                          {isEmailEditable ? (
                            <Check size={16} />
                          ) : (
                            <Edit size={16} />
                          )}
                        </Button>
                      </div>
                      <FormDescription>
                        Your email address is used for login and may not be
                        changed frequently.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Career Details Card */}
      <Card id="career-details">
        <CardHeader>
          <CardTitle className="text-xl font-headline">
            Career & CV Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...careerDetailsForm}>
            <form
              onSubmit={careerDetailsForm.handleSubmit(
                handleCareerDetailsSubmit,
              )}
            >
              <div className="space-y-4">
                <FormField
                  control={careerDetailsForm.control}
                  name="jobPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Job Role You're Seeking</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Software Engineer, Product Manager"
                          value={defaultValues.jobPreference}
                          readOnly
                        />
                      </FormControl>
                      <FormDescription>
                        This helps us tailor job recommendations and AI
                        assistance.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>

          <Separator />

          {/* Experience section */}
          <div id="education">
            <h3 className="text-lg font-medium mb-4">Education</h3>

            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddEdu(true)}
                className="mb-4"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Education
              </Button>

              {defaultValues.education?.map((edu, index) => (
                <div
                  key={index}
                  className="rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-semibold">{edu.degree}</h4>
                      <p className="text-muted-foreground">{edu.institution}</p>
                      {edu.fieldOfStudy && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Field of Study: {edu.fieldOfStudy}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditEdu(true);
                          setEditEduIndex(index);
                        }}
                        className="h-8 px-3"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDeleteEdu(true);
                          setDeleteEduIndex(edu.educationId);
                        }}
                        className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Dates</p>
                      <p>
                        {edu.startDate} - {edu.endDate || 'Present'}
                      </p>
                    </div>
                    {edu.gpa && (
                      <div>
                        <p className="text-muted-foreground">GPA</p>
                        <p>{edu.gpa}</p>
                      </div>
                    )}
                    {edu.country && (
                      <div>
                        <p className="text-muted-foreground">Location</p>
                        <p>{edu.country}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Project / Research Work section */}
          <div id="projects">
            <h3 className="text-lg font-medium mb-2">Projects</h3>
            <div className="mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddProj(true)}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Project
              </Button>
            </div>

            <div className="space-y-4">
              {defaultValues.projects?.map((proj, index) => {
                const isExpanded = expandedIndex === index;

                return (
                  <div
                    key={index}
                    className="border rounded-md p-4 shadow-sm hover:shadow transition duration-200"
                  >
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => toggleExpand(index)}
                    >
                      <div>
                        <h4 className="text-lg font-semibold">{proj.name}</h4>
                        <p className="text-muted-foreground text-sm line-clamp-2">
                          {proj.description}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(index);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(index);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Expandable Content */}
                    {isExpanded && (
                      <div className="mt-4 text-sm grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-muted-foreground">Dates</p>
                          <p>
                            {proj.startDate} - {proj.endDate || 'Present'}
                          </p>
                        </div>
                        {proj.country && (
                          <div>
                            <p className="text-muted-foreground">Location</p>
                            <p>{proj.country}</p>
                          </div>
                        )}
                        {proj.technologies && (
                          <div className="sm:col-span-2">
                            <p className="text-muted-foreground">
                              Technologies Used
                            </p>
                            <p>{proj.technologies.join(', ')}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          <div id="experience">
            <h3 className="text-lg font-medium mb-2">Experiences</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAddExp(true)}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Experience
                </Button>
              </div>
            </div>

            <div className="space-y-4 mt-4">
              {defaultValues.experience?.map((exp, index) => {
                const isExpanded = expandedIndex === index;

                return (
                  <div
                    key={index}
                    className="border rounded-md p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => toggleExpand(index)}
                    >
                      <div>
                        <p className="text-lg font-semibold">{exp.company}</p>
                      </div>

                      <div className="flex gap-2 items-center">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(index);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(index);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 text-sm grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-muted-foreground">Dates</p>
                          <p>
                            {exp.startDate} - {exp.endDate || 'Present'}
                          </p>
                        </div>
                        {exp.location && (
                          <div>
                            <p className="text-muted-foreground">Location</p>
                            <p>{exp.location}</p>
                          </div>
                        )}
                        {exp.technologies && (
                          <div className="sm:col-span-2">
                            <p className="text-muted-foreground">
                              Technologies Used
                            </p>
                            <p>{exp.technologies.join(', ')}</p>
                          </div>
                        )}
                        {exp.description && (
                          <div className="sm:col-span-2">
                            <p className="text-muted-foreground">Description</p>
                            <p>{exp.description}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          <div id="skills">
            <h3 className="text-lg font-medium mb-2">Skills</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAddSkill(true)}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Skills
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {defaultValues.skills?.map((skill, index) => (
                  <div
                    key={index}
                    className="rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-lg font-semibold">{skill.skill}</h4>
                      </div>
                      <div>
                        <select
                          value={skill.level}
                          onChange={(e) =>
                            handleLevelChange(skill.skillId, e.target.value)
                          }
                          className="mt-1 block w-full rounded border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring focus:border-blue-300"
                        >
                          <option value="BEGINNER">BEGINNER</option>
                          <option value="INTERMEDIATE">INTERMEDIATE</option>
                          <option value="EXPERT">EXPERT</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setDeleteSkill(true);
                            setDeleteSkillIndex(index);
                          }}
                          className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="narratives">
        <CardHeader>
          <CardTitle className="text-xl font-headline">
            Personalize Your AI Documents
          </CardTitle>
          <CardDescription>
            Share key experiences to help the AI tailor your CV and cover
            letters more effectively, making them unique to you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Narratives
            narrativesForm={narrativesForm}
            handleNarrativesSubmit={handleNarrativesSubmit}
          />
        </CardContent>
      </Card>

      <Card id="search-prefs">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Job Search Preferences
          </CardTitle>
          <CardDescription>
            Configure your default preferences for job searching.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <JobPref />
        </CardContent>
      </Card>

      {!isOnboarding && (
        <>
          <Separator />
          <div>
            <h3 className="text-lg font-medium mb-3 font-headline">
              Account Management
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Button variant="outline" asChild>
                <Link href="/subscriptions">
                  <DollarSign className="mr-2 h-4 w-4" /> Manage Subscription
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/applications">
                  <History className="mr-2 h-4 w-4" /> View Application History
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/settings">
                  <SettingsIcon className="mr-2 h-4 w-4" /> Account Settings
                </Link>
              </Button>
            </div>
          </div>
        </>
      )}

      {addEdu && (
        <div className="w-full h-full z-[999] fixed top-0 left-0 bg-black bg-opacity-50">
          <div className="w-full max-w-3xl md:h-full max-h-[80vh] overflow-y-auto z-[1000] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg">
            <AddEducation onCancel={() => setAddEdu(false)} />
          </div>
        </div>
      )}

      {addProj && (
        <div className="w-full h-full z-[999] fixed top-0 left-0 bg-black bg-opacity-50">
          <div className="w-full max-w-3xl md:h-full max-h-[80vh] overflow-y-auto z-[1000] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg">
            <AddProject onCancel={() => setAddProj(false)} />
          </div>
        </div>
      )}

      {addExp && (
        <div className="w-full h-full z-[999] fixed top-0 left-0 bg-black bg-opacity-50">
          <div className="w-full max-w-3xl md:h-full max-h-[80vh] overflow-y-auto z-[1000] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg">
            <AddExperience onCancel={() => setAddExp(false)} />
          </div>
        </div>
      )}

      {addSkill && (
        <div className="w-full h-full z-[999] fixed top-0 left-0 bg-black bg-opacity-50">
          <div className="w-full max-w-3xl overflow-y-auto z-[1000] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg">
            <AddSkill onCancel={() => setAddSkill(false)} />
          </div>
        </div>
      )}

      {editEdu && (
        <div className="w-full h-full z-[999] fixed top-0 left-0 bg-black bg-opacity-50">
          <div className="w-full max-w-3xl md:h-full max-h-[80vh] overflow-y-auto z-[1000] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg">
            <AddEducation
              onCancel={() => setEditEdu(false)}
              data={defaultValues.education[editEduIndex]}
              index={editEduIndex}
              isEdit={true}
            />
          </div>
        </div>
      )}

      {deleteEdu && (
        <div className="w-full z-[999] fixed top-0 left-0 bg-black bg-opacity-50">
          <div className="w-full max-w-3xl md:h-full max-h-[80vh] overflow-y-auto z-[1000] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg">
            <p>Are you sure you want to delete this education entry?</p>
            <p className="text-red-500">This action cannot be undone. </p>
            <div className="flex justify-end gap-4 mt-4">
              <Button onClick={() => setDeleteEdu(false)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => {
                  deleteEducation(deleteEduIndex);
                  setDeleteEdu(false);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
