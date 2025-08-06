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
  UploadCloud,
  File,
  X,
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
import { useCallback, useRef, useState } from 'react';
import apiInstance from '@/services/api';

export function ProfileForm({ isOnboarding = false }: ProfileFormProps) {
  const {
    //state
    isNameEditable,
    isEmailEditable,
    isJobPrefEditable,
    setIsJobPrefEditable,
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
    handleDeleteProject,

    //form
    personalInfoForm,
    careerDetailsForm,
    narrativesForm,
    jobSearchForm,
    educationForm,
    handleDeleteExp,

    //handlers
    handlePersonalInfoSubmit,
    handleCareerDetailsSubmit,
    handleNarrativesSubmit,
    // handleJobSearchSubmit,
    handleDeleteSkills,
    onCancel,
    deleteEducation,
    handleLevelChange,
    toggleExpand,
    handleEdit,
    toggleNameEdit,
    toggleEmailEdit,
    defaultValues,
    handlePersonalInfoEdit,
  } = useProfile();

  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (selectedFile) => {
    if (selectedFile) {
      setFile(selectedFile);
      console.log('Selected file:', selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('cv', file);

    try {
      const response = await apiInstance.post(
        '/students/resume/extract',
        formData,
      );
      console.log('File uploaded successfully:', response.data);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileChange(files[0]);
    }
  }, []);

  return (
    <div className="space-y-6">
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
                            value={field.value || ''} // Ensure value is never undefined
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
                        )}{' '}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                            value={field.value || ''} // Ensure value is never undefined
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
                        </Button>{' '}
                      </div>
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
        <div className="flex items-center justify-center flex-col gap-4 mt-4">
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
          />

          {/* Drag and drop area */}
          <div
            className={`w-1/2 h-40 p-4 border-2 flex items-center justify-center border-dashed rounded-lg text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={handleButtonClick}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <UploadCloud className="w-6 h-6 text-gray-500" />
              <p className="text-sm text-gray-600">
                {isDragging
                  ? 'Drop your file here'
                  : 'Drag & drop your file here'}
              </p>
              <p className="text-xs text-gray-500">or click to browse</p>
            </div>
          </div>

          {/* Selected file preview and actions */}
          {file && (
            <div className="mt-2 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-md">
                <File className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-800 truncate max-w-xs">
                  {file.name}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFile}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </Button>
              </div>

              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="gap-2"
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-4 w-4" />
                    Process CV
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
        <CardHeader className="flex items-center justify-between p-6">
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
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., Software Engineer, Product Manager"
                            readOnly={!isJobPrefEditable} // Add this state variable
                          />
                        </FormControl>
                        <Button
                          type="button"
                          size="icon"
                          onClick={() => {
                            if (isJobPrefEditable) {
                              // Save logic here if needed
                              careerDetailsForm.handleSubmit(
                                handleCareerDetailsSubmit,
                              )();
                            }
                            setIsJobPrefEditable(!isJobPrefEditable);
                          }}
                          variant="outline"
                        >
                          {isJobPrefEditable ? (
                            <Check size={16} />
                          ) : (
                            <Edit size={16} />
                          )}
                        </Button>
                      </div>
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

              <div>
                {defaultValues.education?.map((edu, index) => (
                  <div
                    key={edu._id}
                    className="rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-semibold">{edu.degree}</h4>
                        <p className="text-muted-foreground">
                          {edu.institution}
                        </p>
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
                            console.log('edu', edu);
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
                            setEditProj(true);
                            setEditProjIndex(index);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteProj(true);
                            setDeleteProjIndex(proj._id);
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
                            setEditExp(true);
                            setEditExpIndex(index); // use index instead of _id
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            // handleDelete(index);
                            setDeleteExp(true);
                            setDeleteExpIndex(exp._id);
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
                            setDeleteSkillIndex(skill._id);
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

      {/* add education, project, experience, skill */}
      {addEdu && (
        <div className="w-full h-full z-[999] fixed top-0 left-0 bg-black bg-opacity-50">
          <div className="w-full max-w-3xl md:h-full max-h-[80vh] overflow-y-auto z-[1000] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg">
            <AddEducation onCancel={() => setAddEdu(false)} isEdit={false} />
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

      {/* edit education, project, experience */}
      {editEdu && (
        <div className="w-full h-full z-[999] fixed top-0 left-0 bg-black bg-opacity-50">
          {console.log('editEdu', defaultValues.education)}
          <div className="w-full max-w-3xl md:h-full max-h-[80vh] overflow-y-auto z-[1000] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg">
            <AddEducation
              onCancel={() => setEditEdu(false)}
              data={defaultValues.education[editEduIndex]}
              isEdit={true}
            />
          </div>
        </div>
      )}

      {editExp && (
        <div className="w-full h-full z-[999] fixed top-0 left-0 bg-black bg-opacity-50">
          <div className="w-full max-w-3xl md:h-full max-h-[80vh] overflow-y-auto z-[1000] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg">
            <AddExperience
              onCancel={() => setEditExp(false)}
              data={defaultValues.experience[editExpIndex]}
              index={editExpIndex}
              isEdit={true}
            />
          </div>
        </div>
      )}

      {editProj && (
        <div className="w-full h-full z-[999] fixed top-0 left-0 bg-black bg-opacity-50">
          {console.log('editProj', defaultValues.projects)}

          <div className="w-full max-w-3xl md:h-full max-h-[80vh] overflow-y-auto z-[1000] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg">
            <AddProject
              onCancel={() => setEditProj(false)}
              data={defaultValues.projects[editProjIndex]}
              isEdit={true}
            />
          </div>
        </div>
      )}

      {deleteEdu && (
        <div className="w-full z-[999] h-full fixed top-0 left-0 bg-black bg-opacity-50">
          <div className="w-full max-w-3xl  overflow-y-auto z-[1000] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg">
            <p>Are you sure you want to delete this education entry?</p>
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

      {deleteExp && (
        <div className="w-full z-[999] h-full fixed top-0 left-0 bg-black bg-opacity-50">
          <div className="w-full max-w-3xl  overflow-y-auto z-[1000] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg">
            <p>Are you sure you want to delete this experience entry?</p>
            <div className="flex justify-end gap-4 mt-4">
              <Button onClick={() => setDeleteExp(false)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDeleteExp(deleteExpIndex);
                  setDeleteExp(true);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {deleteSkill && (
        <div className="w-full z-[999] h-full fixed top-0 left-0 bg-black bg-opacity-50">
          <div className="w-full max-w-3xl  overflow-y-auto z-[1000] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg">
            <p>Are you sure you want to delete this skill entry?</p>
            <div className="flex justify-end gap-4 mt-4">
              <Button onClick={() => setDeleteSkill(false)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDeleteSkills(deleteSkillIndex);
                  setDeleteSkill(false);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {deleteProj && (
        <div className="w-full z-[999] h-full fixed top-0 left-0 bg-black bg-opacity-50">
          <div className="w-full max-w-3xl  overflow-y-auto z-[1000] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg">
            <p>Are you sure you want to delete this project entry?</p>
            <div className="flex justify-end gap-4 mt-4">
              <Button onClick={() => setDeleteProj(false)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDeleteProject(deleteProjIndex);
                  setDeleteProj(false);
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
