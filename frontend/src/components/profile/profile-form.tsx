'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2, X } from 'lucide-react';

import {
  AddEducation,
  AddExperience,
  AddProject,
  AddSkill,
} from './AddEducation';
import JobPreferencesForm from './components/JobPreference';
import { ProfileFormProps, useProfile } from '@/hooks/useProfile';
import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import apiInstance from '@/services/api';
import ProfileInfo from './ProfileInfo';
import { CareerDetailsComponent } from './CareerDetails';
import { useDispatch } from 'react-redux';
import { getStudentDetailsRequest } from '@/redux/reducers/studentReducer';

type DragEvt = React.DragEvent<HTMLDivElement>;
type InputChangeEvt = React.ChangeEvent<HTMLInputElement>;

/* ------------------------------
   Small helpers & local hook
   ------------------------------ */

const useFileUploadState = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = useCallback((selectedFile: File | null) => {
    if (selectedFile) setFile(selectedFile);
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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

  const handleDrop = useCallback((e: DragEvt, cb: (f: File) => void) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) cb(files[0]);
  }, []);

  return {
    file,
    setFile,
    isDragging,
    setIsDragging,
    fileInputRef,
    isUploading,
    setIsUploading,
    progress,
    setProgress,
    handleFileChange,
    handleRemoveFile,
    handleButtonClick,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  } as const;
};

/* ------------------------------
   Reusable UI pieces (local)
   ------------------------------ */

const ModalOverlay: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="w-full h-full z-[999] fixed top-0 left-0 bg-black bg-opacity-50">
    <div className="w-full max-w-3xl md:h-full max-h-[80vh] overflow-y-auto z-[1000] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 rounded-lg">
      {children}
    </div>
  </div>
);

const ConfirmDialog: React.FC<{
  title: string;
  body?: string;
  onCancel: () => void;
  onConfirm: () => void;
}> = ({ title, body, onCancel, onConfirm }) => (
  <div className="w-full z-[999] h-full fixed top-0 left-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
      <div className="relative p-6 pb-4">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>

        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{body}</p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-2">
        <p className="text-gray-600 leading-relaxed">
          {'This action cannot be undone.'}
        </p>
      </div>

      <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
        <Button onClick={onCancel} className="px-6">
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={onConfirm}
          className="px-6 flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </Button>
      </div>
    </div>
  </div>
);

/* ------------------------------
   Main component (refactored)
   ------------------------------ */

export function ProfileForm({ isOnboarding = false }: ProfileFormProps) {
  const {
    // state & setters — kept the exact names so existing consumers work unchanged
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

  const dispatch = useDispatch();

  // local file upload state + helpers extracted to hook above
  const fileState = useFileUploadState();
  const {
    file,
    setFile,
    isDragging,
    setIsDragging,
    fileInputRef,
    isUploading,
    setIsUploading,
    progress,
    setProgress,
    handleFileChange,
    handleRemoveFile,
    handleButtonClick,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  } = fileState;

  // small lifecycle log (kept from original)
  useEffect(() => {
    console.log('ProfileForm mounted');
    return () => console.log('ProfileForm unmounted');
  }, []);

  // upload handler — preserved behavior (same API path & progress handling)
  const uploadResume = useCallback(async () => {
    if (!file) return;

    setIsUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('cv', file);

    let rampTimer: ReturnType<typeof setInterval> | null = null;

    rampTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev < 95) {
          return Math.min(95, prev + Math.floor(Math.random() * 8 + 2));
        }
        if (rampTimer) {
          clearInterval(rampTimer);
          rampTimer = null;
        }
        return prev;
      });
    }, 800);

    try {
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
  }, [file, dispatch]);

  // Memoized edit payloads for child modals (prevents identity churn)
  const editEduData = useMemo(
    () => defaultValues?.education?.[editEduIndex] ?? undefined,
    [defaultValues, editEduIndex],
  );
  const editExpData = useMemo(
    () => defaultValues?.experience?.[editExpIndex] ?? undefined,
    [defaultValues, editExpIndex],
  );
  const editProjData = useMemo(
    () => defaultValues?.projects?.[editProjIndex] ?? undefined,
    [defaultValues, editProjIndex],
  );

  // stable close handlers
  const closeAddEdu = useCallback(() => setAddEdu(false), [setAddEdu]);
  const closeAddProj = useCallback(() => setAddProj(false), [setAddProj]);
  const closeAddExp = useCallback(() => setAddExp(false), [setAddExp]);
  const closeAddSkill = useCallback(() => setAddSkill(false), [setAddSkill]);

  const closeEditEdu = useCallback(() => setEditEdu(false), [setEditEdu]);
  const closeEditExp = useCallback(() => setEditExp(false), [setEditExp]);
  const closeEditProj = useCallback(() => setEditProj(false), [setEditProj]);
  const closeEditSkill = useCallback(() => setEditSkill(false), [setEditSkill]);

  const closeDeleteEdu = useCallback(() => setDeleteEdu(false), [setDeleteEdu]);
  const closeDeleteExp = useCallback(() => setDeleteExp(false), [setDeleteExp]);
  const closeDeleteProj = useCallback(
    () => setDeleteProj(false),
    [setDeleteProj],
  );
  const closeDeleteSkill = useCallback(
    () => setDeleteSkill(false),
    [setDeleteSkill],
  );

  // confirm delete actions
  const confirmDeleteEdu = useCallback(() => {
    deleteEducation(deleteEduIndex);
    setDeleteEdu(false);
  }, [deleteEducation, deleteEduIndex, setDeleteEdu]);

  const confirmDeleteExp = useCallback(() => {
    handleDeleteExp(deleteExpIndex);
    setDeleteExp(false);
  }, [handleDeleteExp, deleteExpIndex, setDeleteExp]);

  const confirmDeleteProj = useCallback(() => {
    handleDeleteProject(deleteProjIndex);
    setDeleteProj(false);
  }, [handleDeleteProject, deleteProjIndex, setDeleteProj]);

  const confirmDeleteSkill = useCallback(() => {
    handleDeleteSkills(deleteSkillIndex);
    setDeleteSkill(false);
  }, [handleDeleteSkills, deleteSkillIndex, setDeleteSkill]);

  // small debug identical to original to help track identity problems
  useEffect(() => {
    console.log(
      'defaultValues identity:',
      Boolean(defaultValues),
      'eduLen',
      defaultValues?.education?.length ?? 0,
      'expLen',
      defaultValues?.experience?.length ?? 0,
    );
  }, [defaultValues]);

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
        handleDrop={(e: DragEvt) => handleDrop(e, handleFileChange)}
        handleRemoveFile={handleRemoveFile}
        handleUpload={uploadResume}
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
        handleDrop={(e: DragEvt) => handleDrop(e, handleFileChange)}
        handleRemoveFile={handleRemoveFile}
        handleUpload={uploadResume}
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
        <ModalOverlay>
          <AddEducation onCancel={closeAddEdu} isEdit={false} />
        </ModalOverlay>
      )}

      {addProj && (
        <ModalOverlay>
          <AddProject onCancel={closeAddProj} />
        </ModalOverlay>
      )}

      {addExp && (
        <ModalOverlay>
          <AddExperience onCancel={closeAddExp} />
        </ModalOverlay>
      )}

      {addSkill && (
        <ModalOverlay>
          <AddSkill onCancel={closeAddSkill} />
        </ModalOverlay>
      )}

      {/* Edit modals */}
      {editEdu && (
        <ModalOverlay>
          <AddEducation onCancel={closeEditEdu} data={editEduData} isEdit />
        </ModalOverlay>
      )}

      {editExp && (
        <ModalOverlay>
          <AddExperience
            onCancel={closeEditExp}
            data={editExpData}
            index={editExpIndex}
            isEdit
          />
        </ModalOverlay>
      )}

      {editProj && (
        <ModalOverlay>
          <AddProject onCancel={closeEditProj} data={editProjData} isEdit />
        </ModalOverlay>
      )}

      {/* Delete dialogs */}
      {deleteEdu && (
        <ConfirmDialog
          title="Delete Education Entry"
          body="Are you sure you want to permanently delete this education entry?"
          onCancel={closeDeleteEdu}
          onConfirm={confirmDeleteEdu}
        />
      )}

      {deleteExp && (
        <ConfirmDialog
          title="Delete Experience Entry"
          body="Are you sure you want to permanently delete this experience entry?"
          onCancel={closeDeleteExp}
          onConfirm={confirmDeleteExp}
        />
      )}

      {deleteSkill && (
        <ConfirmDialog
          title="Delete Skill"
          body="Are you sure you want to permanently delete this skill?"
          onCancel={closeDeleteSkill}
          onConfirm={confirmDeleteSkill}
        />
      )}

      {deleteProj && (
        <ConfirmDialog
          title="Delete Project"
          body="Are you sure you want to permanently delete this project?"
          onCancel={closeDeleteProj}
          onConfirm={confirmDeleteProj}
        />
      )}
    </div>
  );
}
