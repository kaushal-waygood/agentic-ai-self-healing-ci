'use client';

import { Button } from '@/components/ui/button';
import {
  Save,
  DollarSign,
  Settings as SettingsIcon,
  Briefcase,
  History,
  AlertTriangle,
  X,
  Trash2,
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
import JobPreferencesForm from './JobPreference';
import { ProfileFormProps, useProfile } from '@/hooks/useProfile';
import { useCallback, useRef, useState } from 'react';
import apiInstance from '@/services/api';
import ProfileInfo from './ProfileInfo';
import { CareerDetailsComponent } from './CareerDetails';

export function ProfileForm({ isOnboarding = false }: ProfileFormProps) {
  const {
    //state
    isNameEditable,
    isEmailEditable,
    isPhoneEditable,
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
    togglePhoneEdit,

    //form
    personalInfoForm,
    careerDetailsForm,
    narrativesForm,

    handleDeleteExp,

    //handlers
    handlePersonalInfoSubmit,
    handleCareerDetailsSubmit,
    handleNarrativesSubmit,
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
    <div className="">
      <ProfileInfo
        isNameEditable={isNameEditable}
        isEmailEditable={isEmailEditable}
        isPhoneEditable={isPhoneEditable}
        handleName={handleName}
        handleEmail={handleEmail}
        toggleNameEdit={toggleNameEdit}
        toggleEmailEdit={toggleEmailEdit}
        handlePersonalInfoSubmit={handlePersonalInfoSubmit}
        handlePersonalInfoEdit={handlePersonalInfoEdit}
        personalInfoForm={personalInfoForm}
        setHandleName={setHandleName}
        setHandleEmail={setHandleEmail}
        togglePhoneEdit={togglePhoneEdit}
      />

      {/* Career Details Card */}
      <CareerDetailsComponent
        fileInputRef={fileInputRef}
        file={file}
        isDragging={isDragging}
        isUploading={isUploading}
        isJobPrefEditable={isJobPrefEditable}
        careerDetailsForm={careerDetailsForm}
        expandedIndex={expandedIndex}
        defaultValues={defaultValues}
        handleFileChange={handleFileChange}
        handleButtonClick={handleButtonClick}
        handleDragEnter={handleDragEnter}
        handleDragLeave={handleDragLeave}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
        handleRemoveFile={handleRemoveFile}
        handleUpload={handleUpload}
        handleCareerDetailsSubmit={handleCareerDetailsSubmit}
        setIsJobPrefEditable={setIsJobPrefEditable}
        toggleExpand={toggleExpand}
        setAddEdu={setAddEdu}
        setEditEdu={setEditEdu}
        setEditEduIndex={setEditEduIndex}
        setDeleteEdu={setDeleteEdu}
        setDeleteEduIndex={setDeleteEduIndex}
        setAddProj={setAddProj}
        setEditProj={setEditProj}
        setEditProjIndex={setEditProjIndex}
        setDeleteProj={setDeleteProj}
        setDeleteProjIndex={setDeleteProjIndex}
        setAddExp={setAddExp}
        setEditExp={setEditExp}
        setEditExpIndex={setEditExpIndex}
        setDeleteExp={setDeleteExp}
        setDeleteExpIndex={setDeleteExpIndex}
        setAddSkill={setAddSkill}
        setDeleteSkill={setDeleteSkill}
        setDeleteSkillIndex={setDeleteSkillIndex}
        handleLevelChange={handleLevelChange}
      />

      {/* <Card id="narratives">
        <CardHeader>
          <CardTitle className="text-xl font-headline">
            Personalize Your AI Documents
          </CardTitle>
          <CardDescription>
            Share key experiences to help the AI tailor your CV and cover
            letters more effectively, making them unique to you.
          </CardDescription>
        </CardHeader>
      </Card> */}
      <div className="max-w-full mx-auto p-4 sm:p-6">
        <Card className="" id="search-prefs">
          <CardHeader>
            <CardTitle className=" text-xl font-headline flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Job Search Preferences
            </CardTitle>
            <CardDescription>
              Configure your default preferences for job searching.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <JobPreferencesForm />
          </CardContent>
        </Card>
      </div>

      {/* Account Management section */}
      {/* {!isOnboarding && (
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
      )} */}

      {/* add education, project, experience, skill */}
      {addEdu && (
        <div className="w-full h-full z-[999] fixed top-0 left-0 bg-black bg-opacity-50">
          <div className="w-full max-w-3xl md:h-full max-h-[80vh] overflow-y-auto z-[1000] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  p-4 rounded-lg">
            <AddEducation onCancel={() => setAddEdu(false)} isEdit={false} />
          </div>
        </div>
      )}

      {addProj && (
        <div className="w-full h-full z-[999] fixed top-0 left-0 bg-black bg-opacity-50">
          <div className="w-full max-w-3xl md:h-full max-h-[80vh] overflow-y-auto z-[1000] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 rounded-lg">
            <AddProject onCancel={() => setAddProj(false)} />
          </div>
        </div>
      )}

      {addExp && (
        <div className="w-full h-full z-[999] fixed top-0 left-0 bg-black bg-opacity-50">
          <div className="w-full max-w-3xl md:h-full max-h-[80vh] overflow-y-auto z-[1000] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  p-4 rounded-lg">
            <AddExperience onCancel={() => setAddExp(false)} />
          </div>
        </div>
      )}

      {addSkill && (
        <div className="w-full h-full z-[999] fixed top-0 left-0 bg-black bg-opacity-50">
          <div className="w-full max-w-3xl overflow-y-auto z-[1000] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 rounded-lg">
            <AddSkill onCancel={() => setAddSkill(false)} />
          </div>
        </div>
      )}

      {/* edit education, project, experience */}
      {editEdu && (
        <div className="w-full h-full z-[999] fixed top-0 left-0 bg-black bg-opacity-50">
          <div className="w-full max-w-3xl md:h-full max-h-[80vh] overflow-y-auto z-[1000] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  p-4 rounded-lg">
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
          <div className="w-full max-w-3xl md:h-full max-h-[80vh] overflow-y-auto z-[1000] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  p-4 rounded-lg">
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
          <div className="w-full max-w-3xl md:h-full max-h-[80vh] overflow-y-auto z-[1000] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  p-4 rounded-lg">
            <AddProject
              onCancel={() => setEditProj(false)}
              data={defaultValues.projects[editProjIndex]}
              isEdit={true}
            />
          </div>
        </div>
      )}

      {deleteEdu && (
        <div className="w-full z-[999] h-full fixed top-0 left-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="relative p-6 pb-4">
              <button
                onClick={() => setDeleteEdu(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>

              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Education Entry
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-2">
              <p className="text-gray-600 leading-relaxed">
                Are you sure you want to permanently delete this education
                entry? All associated information will be removed from your
                profile.
              </p>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <Button onClick={() => setDeleteEdu(false)} className="px-6">
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  deleteEducation(deleteEduIndex);
                  setDeleteEdu(false);
                }}
                className="px-6 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {deleteExp && (
        <div className="w-full z-[999] h-full fixed top-0 left-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="relative p-6 pb-4">
              <button
                onClick={() => setDeleteEdu(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>

              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Education Entry
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-2">
              <p className="text-gray-600 leading-relaxed">
                Are you sure you want to permanently delete this education
                entry? All associated information will be removed from your
                profile.
              </p>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <Button onClick={() => setDeleteExp(false)} className="px-6">
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDeleteExp(deleteExpIndex);
                  setDeleteExp(false);
                }}
                className="px-6 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {deleteSkill && (
        <div className="w-full z-[999] h-full fixed top-0 left-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="relative p-6 pb-4">
              <button
                onClick={() => setDeleteEdu(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>

              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Education Entry
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-2">
              <p className="text-gray-600 leading-relaxed">
                Are you sure you want to permanently delete this education
                entry? All associated information will be removed from your
                profile.
              </p>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <Button onClick={() => setDeleteSkill(false)} className="px-6">
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDeleteSkills(deleteSkillIndex);
                  setDeleteSkill(false);
                }}
                className="px-6 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {deleteProj && (
        <div className="w-full z-[999] h-full fixed top-0 left-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="relative p-6 pb-4">
              <button
                onClick={() => setDeleteEdu(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>

              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Education Entry
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-2">
              <p className="text-gray-600 leading-relaxed">
                Are you sure you want to permanently delete this education
                entry? All associated information will be removed from your
                profile.
              </p>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <Button onClick={() => setDeleteProj(false)} className="px-6">
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDeleteProject(deleteProjIndex);
                  setDeleteProj(false);
                }}
                className="px-6 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
