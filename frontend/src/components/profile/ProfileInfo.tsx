import React, { useState } from 'react';

import {
  User,
  ChevronRight,
  Package,
  Heart,
  MapPin,
  GraduationCap,
  Briefcase,
  Code,
} from 'lucide-react';
import Education from './components/Education';
import Project from './components/Project';
import Experience from './components/Experience';
import Skills from './components/Skills';
import SideSectionProfile from './components/SideSectionProfile';
import JobSearchPreferences from './components/JobPreference';
import JobPreferencesForm from './components/JobPreference';
const navItems = [
  {
    id: 'education',
    label: 'Education',
    icon: GraduationCap,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'project',
    label: 'Project',
    icon: Package,
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'experience',
    label: 'Experience',
    icon: Briefcase,
    gradient: 'from-red-500 to-orange-500',
  },
  {
    id: 'skills',
    label: 'Skills',
    icon: Code,
    gradient: 'from-green-500 to-teal-500',
  },
  {
    id: 'jobPreferences',
    label: 'Job Preferences',
    icon: MapPin,
    gradient: 'from-blue-500 to-cyan-500',
  },
];
const ProfileInfo = ({
  personalInfoForm,
  handlePersonalInfoSubmit,
  isNameEditable,
  handlePersonalInfoEdit,
  toggleNameEdit,
  isEmailEditable,
  isPhoneEditable,
  toggleEmailEdit,
  setHandleName,
  handleCancelEdit,
  togglePhoneEdit,

  // careerDetailsForm,
  progress,

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
}: any) => {
  const [activeTab, setActiveTab] = useState('education');

  const ProfileSidebar = ({ activeTab, setActiveTab }) => {
    return (
      <SideSectionProfile
        personalInfoForm={personalInfoForm}
        fileInputRef={fileInputRef}
        file={file}
        isDragging={isDragging}
        isUploading={isUploading}
        handleFileChange={handleFileChange}
        handleButtonClick={handleButtonClick}
        handleDragEnter={handleDragEnter}
        handleDragLeave={handleDragLeave}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
        handleRemoveFile={handleRemoveFile}
        handleUpload={handleUpload}
        progress={progress}
        handlePersonalInfoEdit={handlePersonalInfoEdit}
        handlePersonalInfoSubmit={handlePersonalInfoSubmit}
        isNameEditable={isNameEditable}
        toggleNameEdit={toggleNameEdit}
        isEmailEditable={isEmailEditable}
        isPhoneEditable={isPhoneEditable}
        toggleEmailEdit={toggleEmailEdit}
        togglePhoneEdit={togglePhoneEdit}
        setHandleName={setHandleName}
        handleCancelEdit={handleCancelEdit}
      />
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'education':
        return (
          <div>
            {/* Education  */}
            <Education
              personalInfoForm={personalInfoForm}
              fileInputRef={fileInputRef}
              file={file}
              isDragging={isDragging}
              isUploading={isUploading}
              isJobPrefEditable={isJobPrefEditable}
              careerDetailsForm={careerDetailsForm}
              expandedIndex={expandedIndex}
              defaultValues={defaultValues} // THIS IS THE KEY ONE!
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
          </div>
        );
      case 'project':
        return (
          <div>
            <Project
              defaultValues={defaultValues}
              setAddProj={setAddProj}
              setEditProj={setEditProj}
              setEditProjIndex={setEditProjIndex}
              setDeleteProj={setDeleteProj}
              setDeleteProjIndex={setDeleteProjIndex}
            />
          </div>
        );
      case 'experience':
        return (
          <div>
            <Experience
              expandedIndex={expandedIndex}
              defaultValues={defaultValues}
              toggleExpand={toggleExpand}
              setAddExp={setAddExp}
              setEditExp={setEditExp}
              setEditExpIndex={setEditExpIndex}
              setDeleteExp={setDeleteExp}
              setDeleteExpIndex={setDeleteExpIndex}
            />
          </div>
        );

      case 'skills':
        return (
          <div>
            <Skills
              defaultValues={defaultValues}
              setAddSkill={setAddSkill}
              setDeleteSkill={setDeleteSkill}
              setDeleteSkillIndex={setDeleteSkillIndex}
              handleLevelChange={handleLevelChange}
            />
          </div>
        );

      case 'jobPreferences':
        return (
          <div>
            <JobPreferencesForm />
          </div>
        );
      default:
        return 'Try Again';
    }
  };

  return (
    <>
      <div className="relative  bg-gradient-to-br from-white via-slate-50 to-blue-50 py-6">
        <style jsx>{`
          @keyframes float {
            0%,
            100% {
              transform: translate(0, 0) rotate(0deg);
            }
            33% {
              transform: translate(30px, -30px) rotate(120deg);
            }
            66% {
              transform: translate(-30px, 30px) rotate(240deg);
            }
          }
        `}</style>

        <main className="flex flex-col  md:flex-row gap-5  max-w-7xl mx-auto p-1 sticky top-7  ">
          <div className="w-full md:w-1/3 lg:w-2/1 md:sticky md:top-7 md:self-start">
            <ProfileSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          <div className="flex-1  ">
            <div className=" mb-4 sticky top-7 z-10">
              <div className="relative bg-white p-3 sm:p-4 md:p-2 rounded-lg shadow-sm ">
                <nav className="flex flex-wrap justify-center sm:justify-start gap-3">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`group/btn flex items-center justify-between gap-3 w-full sm:w-auto px-4 py-2 text-left rounded-lg transition-all duration-300 ${
                        activeTab === item.id
                          ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg scale-105`
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center text-sm gap-2 sm:gap-3">
                        <item.icon
                          size={18}
                          className={
                            activeTab === item.id
                              ? ''
                              : 'group-hover/btn:scale-110 transition-transform'
                          }
                        />
                        <span>{item.label}</span>
                      </div>
                      {activeTab === item.id && (
                        <ChevronRight
                          size={16}
                          className="animate-pulse hidden sm:block"
                        />
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            <div className="flex flex-col gap-6 ">{renderContent()}</div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ProfileInfo;
