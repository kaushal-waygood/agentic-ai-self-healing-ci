'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2, X } from 'lucide-react';
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
import JobPreferencesForm from './components/JobPreference';
import { ProfileFormProps, useProfile } from '@/hooks/useProfile';
import { useCallback, useRef, useState } from 'react';
import apiInstance from '@/services/api';
import ProfileInfo from './ProfileInfo';
import { CareerDetailsComponent } from './CareerDetails';
import { useDispatch } from 'react-redux';
import { getStudentDetailsRequest } from '@/redux/reducers/studentReducer';

type DragEvt = React.DragEvent<HTMLDivElement>;
type InputChangeEvt = React.ChangeEvent<HTMLInputElement>;

export function ProfileForm({ isOnboarding = false }: ProfileFormProps) {
  const {
    // state
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

    // forms
    personalInfoForm,
    careerDetailsForm,
    narrativesForm,

    handleDeleteExp,

    // handlers
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

  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const dispatch = useDispatch();

  const handleFileChange = useCallback((selectedFile: File | null) => {
    if (selectedFile) setFile(selectedFile);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!file) return;

    setIsUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('cv', file);

    let rampTimer: ReturnType<typeof setInterval> | null = null;

    // Smooth ramp up to ~95%
    rampTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev < 95) {
          return Math.min(95, prev + Math.floor(Math.random() * 8 + 2)); // +2..+10
        }
        if (rampTimer) {
          clearInterval(rampTimer);
          rampTimer = null;
        }
        return prev;
      });
    }, 800);

    try {
      // tiny delay for UX
      await new Promise((r) => setTimeout(r, 300));

      await apiInstance.post('/students/resume/extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event: ProgressEvent) => {
          if (event.total) {
            const percent = Math.round((event.loaded * 100) / event.total);
            if (percent < 95) setProgress(percent);
          }
        },
      });

      if (rampTimer) {
        clearInterval(rampTimer);
        rampTimer = null;
      }

      // finish to 100 smoothly
      let finishTimer: ReturnType<typeof setInterval> | null = setInterval(
        () => {
          setProgress((prev) => {
            if (prev >= 100) {
              if (finishTimer) clearInterval(finishTimer);
              finishTimer = null;
              return 100;
            }
            return prev + 1;
          });
        },
        20,
      );

      dispatch(getStudentDetailsRequest());
    } catch (error) {
      if (rampTimer) clearInterval(rampTimer);
      // eslint-disable-next-line no-console
      console.error('Error uploading file:', error);
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
      }, 1000);
    }
  }, [file]);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleDragEnter = useCallback((e: DragEvt) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvt) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvt) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvt) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        handleFileChange(files[0]);
      }
    },
    [handleFileChange],
  );

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
        // career details + upload
        fileInputRef={fileInputRef}
        file={file}
        isDragging={isDragging}
        isUploading={isUploading}
        progress={progress}
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

      {/* Add modals */}
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

      {/* Edit modals (guarded with optional chaining to avoid undefined indices) */}
      {editEdu && (
        <div className="w-full h-full z-[999] fixed top-0 left-0 bg-black bg-opacity-50">
          <div className="w-full max-w-3xl md:h-full max-h-[80vh] overflow-y-auto z-[1000] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  p-4 rounded-lg">
            <AddEducation
              onCancel={() => setEditEdu(false)}
              data={defaultValues?.education?.[editEduIndex]}
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
              data={defaultValues?.experience?.[editExpIndex]}
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
              data={defaultValues?.projects?.[editProjIndex]}
              isEdit={true}
            />
          </div>
        </div>
      )}

      {/* Delete dialogs — all close buttons now call the correct setter */}
      {deleteEdu && (
        <div className="w-full z-[999] h-full fixed top-0 left-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
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

            <div className="px-6 pb-2">
              <p className="text-gray-600 leading-relaxed">
                Are you sure you want to permanently delete this education
                entry?
              </p>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <Button onClick={() => setDeleteEdu(false)} className="px-6">
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  console.log(deleteEduIndex);
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
            <div className="relative p-6 pb-4">
              <button
                onClick={() => setDeleteExp(false)}
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
                    Delete Experience Entry
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 pb-2">
              <p className="text-gray-600 leading-relaxed">
                Are you sure you want to permanently delete this experience
                entry?
              </p>
            </div>

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
            <div className="relative p-6 pb-4">
              <button
                onClick={() => setDeleteSkill(false)}
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
                    Delete Skill
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 pb-2">
              <p className="text-gray-600 leading-relaxed">
                Are you sure you want to permanently delete this skill?
              </p>
            </div>

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
            <div className="relative p-6 pb-4">
              <button
                onClick={() => setDeleteProj(false)}
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
                    Delete Project
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 pb-2">
              <p className="text-gray-600 leading-relaxed">
                Are you sure you want to permanently delete this project?
              </p>
            </div>

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
