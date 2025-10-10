import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  UploadCloud,
  File,
  X,
  Edit,
  Check,
  PlusCircle,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  Briefcase,
  GraduationCap,
  FolderOpen,
  Code,
  Target,
  Sparkles,
  Calendar,
  MapPin,
  Award,
} from 'lucide-react';
import { formatDateForMonthInput } from '@/utils/TechnologyInput';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import { useProfile } from '@/hooks/useProfile';

export function CareerDetailsComponent({
  // Pass all your state and handlers as props
  fileInputRef,
  file,
  isDragging,
  isUploading,
  isJobPrefEditable,
  careerDetailsForm,
  expandedIndex,
  defaultValues,
  handleFileChange,
  handleButtonClick,
  handleDragEnter,
  handleDragLeave,
  handleDragOver,
  handleDrop,
  handleRemoveFile,
  handleUpload,
  handleCareerDetailsSubmit,
  setIsJobPrefEditable,
  toggleExpand,
  setAddEdu,
  setEditEdu,
  setEditEduIndex,
  setDeleteEdu,
  setDeleteEduIndex,
  setAddProj,
  setEditProj,
  setEditProjIndex,
  setDeleteProj,
  setDeleteProjIndex,
  setAddExp,
  setEditExp,
  setEditExpIndex,
  setDeleteExp,
  setDeleteExpIndex,
  setAddSkill,
  setDeleteSkill,
  setDeleteSkillIndex,
  handleLevelChange,
}: any) {
  const { handlePersonalInfoEdit, toggleJobPrefEdit } = useProfile();
  const getSkillBadgeColor = (level) => {
    switch (level) {
      case 'EXPERT':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'INTERMEDIATE':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'BEGINNER':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="max-w-full mx-auto p-4 md:p-6 bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20 min-h-screen">
      <Card
        id="career-details"
        className="relative overflow-hidden shadow-2xl border-0 bg-white/90 backdrop-blur-sm"
      >
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-cyan-400/20 rounded-full -translate-y-20 translate-x-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full translate-y-16 -translate-x-16"></div>

        <CardHeader className="relative border-b border-purple-100 bg-gradient-to-r from-purple-500/5 to-blue-500/5 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl shadow-lg">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent">
                Career & CV Details
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Build your professional profile to stand out.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative p-4 md:p-8 space-y-8">
          {/* CV Upload Section */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-200">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mb-4">
                <UploadCloud className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Upload Your CV
              </h3>
              <p className="text-gray-600">
                Let AI analyze and populate your profile details.
              </p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
            />

            <div
              className={`relative w-full h-48 p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-300 ${
                isDragging
                  ? 'border-cyan-500 bg-cyan-100 shadow-lg scale-105'
                  : 'border-gray-300 hover:border-cyan-400 hover:bg-cyan-50 hover:shadow-md'
              }`}
              onClick={handleButtonClick}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center gap-3 h-full">
                <div
                  className={`p-4 rounded-full transition-colors duration-300 ${
                    isDragging
                      ? 'bg-cyan-500 text-white'
                      : 'bg-cyan-100 text-cyan-600'
                  }`}
                >
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-700 mb-1">
                    {isDragging
                      ? 'Drop your file here'
                      : 'Drag & drop your CV here'}
                  </p>
                  <p className="text-sm text-gray-500">or click to browse</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Supports PDF, DOC, DOCX, TXT
                  </p>
                </div>
              </div>
            </div>

            {file && (
              <div className="mt-6 flex flex-col items-center gap-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-md border border-gray-200 w-full max-w-md">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <File className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-medium text-gray-800 truncate">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFile}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 h-9 w-9 flex-shrink-0"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-base"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Process CV
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Job Preference */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Target className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Primary Job Role
              </h3>
            </div>
            <Form {...careerDetailsForm}>
              <form
                onSubmit={careerDetailsForm.handleSubmit(
                  handleCareerDetailsSubmit,
                )}
              >
                <FormField
                  control={careerDetailsForm.control}
                  name="jobPreference"
                  render={({ field }) => (
                    <FormItem>
                      <div
                        className={`flex items-center gap-3 p-1 pr-2 rounded-xl border-2 transition-all duration-300 ${
                          isJobPrefEditable
                            ? 'border-purple-400 bg-white shadow-md ring-2 ring-purple-100'
                            : 'border-gray-200 bg-gray-50 group-hover:border-purple-300'
                        }`}
                      >
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., Software Engineer"
                            readOnly={!isJobPrefEditable}
                            className={`flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-800 placeholder-gray-400 font-medium ${
                              isJobPrefEditable ? 'text-purple-800' : ''
                            }`}
                          />
                        </FormControl>

                        {/* --- CORRECTED BUTTON LOGIC --- */}
                        <div className="flex items-center gap-1">
                          {isJobPrefEditable ? (
                            // In Edit Mode: Show Cancel and Save buttons
                            <>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  // You can add cancel logic for this form too
                                  careerDetailsForm.reset();
                                  setIsJobPrefEditable(false);
                                }}
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                onClick={() =>
                                  handlePersonalInfoEdit('jobPreference')
                                }
                                className="h-8 w-8 bg-green-500 hover:bg-green-600 text-white rounded-full"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            // Not in Edit Mode: Show Edit button
                            <Button
                              type="button"
                              size="icon"
                              onClick={toggleJobPrefEdit} // <-- Use the new toggle function here
                              variant="outline"
                              className="h-8 w-8 bg-white/50 rounded-full border-gray-300 group-hover:border-purple-400 group-hover:text-purple-500"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <FormDescription className="mt-2 ml-1">
                        This helps us tailor job recommendations for you.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>

          <Separator />

          <Accordion
            type="multiple"
            className="w-full space-y-2"
            defaultValue="education"
          >
            {/* ========= EDUCATION SECTION ========= */}

            <AccordionItem value="education" className="border rounded-lg">
              {/* Added 'group' for the icon animation */}
              <AccordionTrigger className="group px-4 py-3 hover:no-underline">
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl">
                      <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Education
                    </h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent accordion from toggling
                        setAddEdu(true);
                      }}
                      className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <PlusCircle className="mr-2 h-5 w-5" />
                      Add Education
                    </Button>
                    {/* Added consistent chevron icon */}
                    <ChevronDown className="h-5 w-5 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="p-4 border-t">
                <div
                  id="education"
                  className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200"
                >
                  <div className="space-y-4">
                    {defaultValues.education &&
                    defaultValues.education.length > 0 ? (
                      defaultValues.education.map((edu, index) => (
                        <div
                          key={edu._id}
                          className="bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h4 className="text-lg font-bold text-gray-800 mb-1">
                                {edu.degree}
                              </h4>
                              <p className="text-blue-600 font-medium">
                                {edu.institution}
                              </p>
                              {edu.fieldOfStudy && (
                                <p className="text-sm text-gray-500 mt-1">
                                  Field: {edu.fieldOfStudy}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => {
                                  setEditEdu(true);
                                  setEditEduIndex(index);
                                }}
                                className="text-blue-600 border-blue-300 hover:bg-blue-50 h-9 w-9"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => {
                                  setDeleteEdu(true);
                                  setDeleteEduIndex(edu.educationId);
                                }}
                                className="text-red-600 border-red-300 hover:bg-red-50 h-9 w-9"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span>
                                {edu.startDate} - {edu.endDate || 'Present'}
                              </span>
                            </div>
                            {edu.gpa && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Award className="h-4 w-4 text-gray-400" />
                                <span>GPA: {edu.gpa}</span>
                              </div>
                            )}
                            {edu.country && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span>{edu.country}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500  italic">
                        No data
                      </div>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="projects" className="border rounded-lg">
              <AccordionTrigger className="group px-4 py-3 hover:no-underline">
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl">
                      {/* FIXED: Icon is now FolderOpen */}
                      <FolderOpen className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Projects
                    </h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddProj(true);
                      }}
                      className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <PlusCircle className="mr-2 h-5 w-5" />
                      {/* FIXED: Button text is now correct */}
                      Add Project
                    </Button>
                    <ChevronDown className="h-5 w-5 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 border-t">
                <div
                  id="projects"
                  className="bg-gradient-to-r from-cyan-50 to-purple-50 rounded-2xl p-6 border border-cyan-200"
                >
                  {/* REMOVED: Redundant header was here */}
                  <div className="space-y-4">
                    {defaultValues.projects?.map((proj, index) => {
                      const isExpanded = expandedIndex === index;
                      return (
                        <div
                          key={proj._id}
                          className="bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border border-cyan-100"
                        >
                          <div
                            className="flex justify-between items-center cursor-pointer"
                            onClick={() => toggleExpand(index)}
                          >
                            <div className="flex-1 pr-4">
                              <h4 className="text-lg font-bold text-gray-800">
                                {proj.name}
                              </h4>
                              {!isExpanded && (
                                <p className="text-gray-600 line-clamp-1 mt-1">
                                  {proj.description}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2 items-center">
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditProj(true);
                                  setEditProjIndex(index);
                                }}
                                className="text-cyan-600 border-cyan-300 hover:bg-cyan-50 h-9 w-9"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteProj(true);
                                  setDeleteProjIndex(proj._id);
                                }}
                                className="text-red-600 border-red-300 hover:bg-red-50 h-9 w-9"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-5 w-5" />
                                ) : (
                                  <ChevronDown className="h-5 w-5" />
                                )}
                              </Button>
                            </div>
                          </div>
                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-gray-100 space-y-4 animate-in slide-in-from-top duration-300">
                              <p className="text-gray-600 leading-relaxed">
                                {proj.description}
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <span className="whitespace-nowrap font-bold">
                                    {formatDateForMonthInput(proj.startDate)} to{' '}
                                    {formatDateForMonthInput(proj.endDate) ||
                                      'Present'}
                                  </span>
                                </div>
                                {proj.country && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span>{proj.country}</span>
                                  </div>
                                )}
                              </div>
                              {proj.technologies?.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium text-gray-700 mb-2">
                                    Technologies:
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {proj.technologies.map((tech) => (
                                      <span
                                        key={tech}
                                        className="px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-xs font-medium"
                                      >
                                        {tech}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="experience" className="border rounded-lg">
              <AccordionTrigger className="group px-4 py-3 hover:no-underline">
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl">
                      <Briefcase className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Experience
                    </h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddExp(true);
                      }}
                      className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <PlusCircle className="mr-2 h-5 w-5" />
                      Add Experience
                    </Button>
                    <ChevronDown className="h-5 w-5 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 border-t">
                <div
                  id="experience"
                  className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200"
                >
                  <div className="space-y-4">
                    {defaultValues.experience?.map((exp, index) => {
                      const isExpanded = expandedIndex === index;
                      return (
                        <div
                          key={exp._id}
                          className="bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100"
                        >
                          <div
                            className="flex justify-between items-center cursor-pointer"
                            onClick={() => toggleExpand(index)}
                          >
                            <div className="flex-1 pr-4">
                              <h4 className="text-lg font-bold text-gray-800">
                                {exp.company}
                              </h4>
                              {!isExpanded && (
                                <p className="text-purple-600 font-medium line-clamp-1 mt-1">
                                  {exp.position}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2 items-center">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditExp(true);
                                  setEditExpIndex(index);
                                }}
                                className="text-purple-600 border-purple-300 hover:bg-purple-50 h-9 w-9"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteExp(true);
                                  setDeleteExpIndex(exp._id);
                                }}
                                className="text-red-600 border-red-300 hover:bg-red-50 h-9 w-9"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-5 w-5" />
                                ) : (
                                  <ChevronDown className="h-5 w-5" />
                                )}
                              </Button>
                            </div>
                          </div>
                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-gray-100 space-y-4 animate-in slide-in-from-top duration-300">
                              <p className="text-purple-600 font-medium">
                                {exp.position}
                              </p>
                              <p className="text-gray-600 leading-relaxed">
                                {exp.description}
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <span>
                                    {exp.startDate} - {exp.endDate || 'Present'}
                                  </span>
                                </div>
                                {exp.location && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span>{exp.location}</span>
                                  </div>
                                )}
                              </div>
                              {exp.technologies?.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium text-gray-700 mb-2">
                                    Technologies:
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {exp.technologies.map((tech) => (
                                      <span
                                        key={tech}
                                        className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium"
                                      >
                                        {tech}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="skills" className="border rounded-lg">
              <AccordionTrigger className="group px-4 py-3 hover:no-underline">
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-cyan-600 rounded-xl">
                      <Code className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Skills</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddSkill(true);
                      }}
                      className="bg-gradient-to-r from-green-500 to-cyan-600 hover:from-green-600 hover:to-cyan-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <PlusCircle className="mr-2 h-5 w-5" />
                      Add Skill
                    </Button>
                    <ChevronDown className="h-5 w-5 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 border-t">
                <div
                  id="skills"
                  className="bg-gradient-to-r from-green-50 to-cyan-50 rounded-2xl p-6 border border-green-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {defaultValues.skills?.map((skill) => (
                      <div
                        key={skill._id}
                        className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100"
                      >
                        <div className="flex justify-between items-center gap-3">
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-gray-800">
                              {skill.skill}
                            </h4>
                            <span
                              className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${getSkillBadgeColor(
                                skill.level,
                              )}`}
                            >
                              {skill.level}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={skill.level}
                              onChange={(e) =>
                                handleLevelChange(skill.skillId, e.target.value)
                              }
                              className="w-full rounded border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                              <option value="BEGINNER">Beginner</option>
                              <option value="INTERMEDIATE">Intermediate</option>
                              <option value="EXPERT">Expert</option>
                            </select>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setDeleteSkill(true);
                                setDeleteSkillIndex(skill._id);
                              }}
                              className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300 flex-shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
