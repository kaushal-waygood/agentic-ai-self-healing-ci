import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Check,
  Edit,
  Mail,
  User,
  X,
  Lock,
  Unlock,
  Phone,
  Award,
  LogOut,
  ChevronRight,
  Package,
  Heart,
  MapPin,
  Settings,
  Sparkles,
  TrendingUp,
  ShoppingCart,
  Truck,
  CheckCircle,
  Clock,
  Star,
  GraduationCap,
  PlusCircle,
  ChevronDown,
  Pencil,
  Trash2,
  Calendar,
  FolderOpen,
  Briefcase,
  Code,
  UploadCloud,
} from 'lucide-react';

const dummyUser = {
  name: 'Alex Rider',
  email: 'alex.rider@example.com',
  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Alex+Rider',
  memberSince: 'October 2024',
  totalOrders: 12,
  totalSpent: 24567,
  rewardPoints: 450,
};

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
  const { fullName, email, phone } = personalInfoForm.control._formValues;

  const [activeTab, setActiveTab] = useState('education');
  const ProfileSidebar = ({ activeTab, setActiveTab }) => {
    return (
      <aside className="w-full lg:w-80 space-y-6">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>

          <div className="relative bg-white p-8 rounded-3xl shadow-xl">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="relative mb-4">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-50"></div>
                <img
                  src={dummyUser.avatar}
                  alt="Avatar"
                  className="relative w-24 h-24 rounded-full border-4 border-white shadow-lg"
                />
                <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform">
                  <Edit size={14} />
                </button>
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-1">
                {fullName}
              </h2>
              <p className="text-sm text-gray-600 mb-4">{email}</p>
              {/* <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-sm font-bold shadow-lg">
                <Award size={16} />
                <span>{dummyUser.rewardPoints} Points</span>
              </div> */}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <p className="text-2xl font-black text-blue-600">
                  {dummyUser.totalOrders}
                </p>
                <p className="text-xs text-gray-600 font-semibold">
                  Total Orders
                </p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-xl">
                <p className="text-2xl font-black text-purple-600">
                  ₹{(dummyUser.totalSpent / 1000).toFixed(1)}k
                </p>
                <p className="text-xs text-gray-600 font-semibold">
                  Total Spent
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    );
  };

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
  const navItems = [
    {
      id: 'education',
      label: 'Education',
      icon: User,
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
      icon: Heart,
      gradient: 'from-red-500 to-orange-500',
    },
    {
      id: 'skills',
      label: 'Skills',
      icon: MapPin,
      gradient: 'from-green-500 to-teal-500',
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'education':
        return (
          <div>
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Education</h3>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAddEdu(true);
                  }}
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Add Education
                </Button>
                <ChevronDown className="h-5 w-5 transition-transform duration-300 group-data-[state=open]:rotate-180" />
              </div>
            </div>

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
                  <div className=" text-gray-500  italic">No data</div>
                )}
              </div>
            </div>
          </div>
        );
      case 'project':
        return (
          <div>
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl">
                  {/* FIXED: Icon is now FolderOpen */}
                  <FolderOpen className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Projects</h3>
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

            <div className="bg-gradient-to-r from-cyan-50 to-purple-50 rounded-2xl p-6 border border-cyan-200">
              {/* REMOVED: Redundant header was here */}
              <div className="space-y-4">
                {defaultValues.project && defaultValues.project.length > 0 ? (
                  defaultValues.projects?.map((proj, index) => {
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
                  })
                ) : (
                  <div className=" text-gray-500  italic">No data</div>
                )}
              </div>
            </div>
          </div>
        );
      case 'experience':
        return (
          <div>
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Experience</h3>
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

            <div
              id="experience"
              className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200"
            >
              <div className="space-y-4">
                {defaultValues.experience &&
                defaultValues.experience.length > 0 ? (
                  defaultValues.experience?.map((exp, index) => {
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
                  })
                ) : (
                  <div className=" text-gray-500  italic">No data</div>
                )}
              </div>
            </div>
          </div>
        );

      case 'skills':
        return (
          <div>
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
            <div className="bg-gradient-to-r from-green-50 to-cyan-50 rounded-2xl p-6 border border-green-200">
              <div className=" grid grid-cols-1 md:grid-cols-2 gap-4">
                {defaultValues.skills && defaultValues.skills.length > 0 ? (
                  defaultValues.skills?.map((skill) => (
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
                          <button
                            onClick={() => {
                              setDeleteSkill(true);
                              setDeleteSkillIndex(skill._id);
                            }}
                            className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300 flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className=" text-gray-500  italic">No data</div>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return 'abc';
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50 py-12">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-gradient-to-br from-blue-400/10 to-purple-400/10 blur-2xl"
              style={{
                width: `${Math.random() * 200 + 100}px`,
                height: `${Math.random() * 200 + 100}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${
                  Math.random() * 15 + 10
                }s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

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

        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-6">
          {/* Sidebar Section */}
          <div className="w-full lg:w-1/4 flex flex-col">
            <ProfileSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
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
          </div>

          {/* Main Content */}
          <div className="flex-1 text-white">
            {/* Navigation Card */}
            <div className="relative mb-4">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur opacity-10"></div>
              <div className="relative bg-white p-2 sm:p-5 md:p-2 rounded-2xl shadow-lg">
                <nav className="flex flex-wrap md:flex-row gap-3">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`group/btn flex items-center justify-between gap-3 w-full md:w-auto px-4 py-2 text-left  rounded-2xl transition-all duration-300 ${
                        activeTab === item.id
                          ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg scale-105`
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center text-sm  gap-3">
                        <item.icon
                          size={20}
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
                          size={18}
                          className="animate-pulse hidden sm:block"
                        />
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">{renderContent()}</div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ProfileInfo;
