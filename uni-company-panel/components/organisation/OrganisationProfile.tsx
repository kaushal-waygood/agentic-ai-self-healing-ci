'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useOrganisationStore } from '@/store/organisation.store';
import {
  Pencil,
  Check,
  X,
  Globe,
  Mail,
  Phone,
  Building2,
  ShieldCheck,
  MapPin,
  Users,
  Camera,
  Loader2,
  TrendingUp,
  Briefcase,
  UserCheck,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

// --- Types for better safety ---
interface OrgProfile {
  industry: string;
  size: string;
  website: string;
  description: string;
  address: string;
  logo?: string;
}

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

// Reusable Input Component for consistent styling
const EditableInput = ({
  value,
  onChange,
  className = '',
  multiline = false,
}: {
  value: string;
  onChange: (e: any) => void;
  className?: string;
  multiline?: boolean;
}) => {
  const baseClasses =
    'w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all';

  if (multiline) {
    return (
      <textarea
        className={`${baseClasses} min-h-[120px] resize-none ${className}`}
        value={value}
        onChange={onChange}
      />
    );
  }
  return (
    <input
      type="text"
      className={`${baseClasses} ${className}`}
      value={value}
      onChange={onChange}
    />
  );
};

const OrganizationProfilePage = () => {
  const {
    organisation,
    orgStats,
    loading,
    getOrganisationProfile,
    updateProfile,
    uploadLogo,
    getOrgStats,
    rejectCandidateApplication,
    acceptCandidateApplication,
  } = useOrganisationStore();

  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [tempData, setTempData] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getOrganisationProfile();
    getOrgStats();
  }, []);

  // --- Actions ---
  const handleLogoClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    await uploadLogo(file);
    setIsUploading(false);
  };

  const startEditing = (section: string) => {
    setActiveSection(section);
    setTempData({
      name: organisation?.name || '',
      profile: {
        industry: organisation?.profile?.industry || '',
        size: organisation?.profile?.size || '',
        website: organisation?.profile?.website || '',
        description: organisation?.profile?.description || '',
        address: organisation?.profile?.address || '',
      },
      contactInfo: {
        // name: organisation?.contactInfo?.name || '',
        email: organisation?.contactInfo?.email || '',
        phone: organisation?.contactInfo?.phone || '',
      },
      betaFeaturesEnabled: organisation?.betaFeaturesEnabled || false,
    });
  };

  const handleSave = async () => {
    if (activeSection === 'contact') {
      if (tempData?.contactInfo?.email && !validateEmail(tempData.contactInfo.email)) {
        toast.error('Please enter a valid email address ');
        return;
      }

      if (tempData?.contactInfo?.phone && !validatePhone(tempData.contactInfo.phone)) {
        toast.error('Please enter a valid 10-digit phone number');
        return;
      }
    }
    const payload = {
      name: tempData.name,
      // profile: tempData.profile,
      // contactInfo: tempData.contactInfo,
      profile: activeSection === 'profile' ? tempData.profile : organisation?.profile || {},
      contactInfo: activeSection === 'contact' ? tempData.contactInfo : organisation?.contactInfo || {},
      betaFeaturesEnabled: tempData.betaFeaturesEnabled,
    };

    const success = await updateProfile(payload);
    if (success) setActiveSection(null);
  };

  if (loading && !organisation)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBFBFB]">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 className="animate-spin" size={32} />
          <span className="text-xs font-mono uppercase tracking-widest">
            Loading Profile...
          </span>
        </div>
      </div>
    );

  if (!organisation)
    return <div className="p-10 text-center">Organization not found.</div>;

  // --- Components ---
  const SectionHeader = ({ title, id }: { title: string; id: string }) => (
    <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-50">
      <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
        {title}
      </h2>
      {activeSection === id ? (
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSection(null)}
            className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 transition"
          >
            <X size={16} />
          </button>
          <button
            onClick={handleSave}
            className="p-1.5 rounded-full bg-black text-white hover:bg-green-600 transition"
          >
            <Check size={16} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => startEditing(id)}
          className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-black transition"
          title="Edit Section"
        >
          <Pencil size={14} />
        </button>
      )}
    </div>
  );

  return (
    <div className=" mx-auto p-4 md:p-8 bg-[#FBFBFB] min-h-screen font-sans">
      {/* 1. TOP BRAND CARD */}
      <div className="bg-white rounded-lg p-6 md:p-8 shadow-sm border border-gray-200/60 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6 w-full animate-in fade-in slide-in-from-top-4 duration-300">
          {/* Logo Uploadable Avatar */}
          <div
            onClick={handleLogoClick}
            className="group relative h-24 w-24 bg-white border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-300 shadow-sm cursor-pointer overflow-hidden transition-all hover:border-blue-400"
          >
            {organisation.profile?.logo ? (
              <Image
                src={organisation.profile.logo}
                alt="Org Logo"
                fill
                className="object-contain p-2 group-hover:opacity-50 transition-opacity"
              />
            ) : (
              <span className="text-4xl font-black text-gray-100 group-hover:text-gray-200">
                {organisation.name?.charAt(0).toUpperCase()}
              </span>
            )}

            {/* Overlay Icon */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5">
              {isUploading ? (
                <Loader2 className="animate-spin text-black" />
              ) : (
                <Camera size={24} className="text-gray-600" />
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
          </div>

          <div className="flex-1">
            {activeSection === 'header' ? (
              <div className="flex items-center gap-2">
                <input
                  className="text-2xl md:text-3xl font-black border-b-2 border-blue-500 focus:outline-none bg-transparent w-full md:w-auto"
                  value={tempData?.name}
                  autoFocus
                  onChange={(e) =>
                    setTempData({ ...tempData, name: e.target.value })
                  }
                />
                <button
                  onClick={handleSave}
                  className="p-2 bg-black text-white rounded-full hover:bg-green-600"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => setActiveSection(null)}
                  className="p-2 bg-gray-100 rounded-full hover:bg-red-500 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="group flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                  {organisation.name || 'Untitled Organization'}
                </h1>
                <button
                  onClick={() => startEditing('header')}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 transition-opacity"
                >
                  <Pencil size={14} />
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md uppercase tracking-wider">
                {organisation.type || 'Company'}
              </span>
              <span
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${organisation.status === 'VERIFIED' ? 'bg-green-50 text-green-700' : 'bg-green-50 text-green-700'}`}
              >
                <ShieldCheck size={12} />
                {organisation.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: INFORMATION */}
        <div className="lg:col-span-2 space-y-8 ">
          {/* PROFILE SECTION */}
          <div
            className={`bg-white rounded-lg p-6 border transition-all duration-300 shadow-sm animate-in fade-in slide-in-from-left-4 duration-300 ${activeSection === 'profile' ? 'border-blue-500 ring-2 ring-blue-50' : 'border-gray-200'}`}
          >
            <SectionHeader title="Company Details" id="profile" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Industry */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">
                  Industry
                </label>
                {activeSection === 'profile' ? (
                  <EditableInput
                    value={tempData?.profile?.industry}
                    onChange={(e) =>
                      setTempData({
                        ...tempData,
                        profile: {
                          ...tempData.profile,
                          industry: e.target.value,
                        },
                      })
                    }
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 p-2.5 bg-gray-50/50 rounded-lg">
                    <Building2 size={16} className="text-gray-400" />
                    {organisation.profile?.industry || (
                      <span className="text-gray-400 italic">
                        Not specified
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Website */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">
                  Website
                </label>
                {activeSection === 'profile' ? (
                  <EditableInput
                    value={tempData?.profile?.website}
                    onChange={(e) =>
                      setTempData({
                        ...tempData,
                        profile: {
                          ...tempData.profile,
                          website: e.target.value,
                        },
                      })
                    }
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 p-2.5 bg-gray-50/50 rounded-lg">
                    <Globe size={16} className="text-gray-400" />
                    {organisation.profile?.website ? (
                      <a
                        href={organisation.profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate"
                      >
                        {organisation.profile.website}
                      </a>
                    ) : (
                      <span className="text-gray-400 italic">
                        Not specified
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Size */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">
                  Company Size
                </label>
                {activeSection === 'profile' ? (
                  <EditableInput
                    value={tempData?.profile?.size}
                    onChange={(e) =>
                      setTempData({
                        ...tempData,
                        profile: { ...tempData.profile, size: e.target.value },
                      })
                    }
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 p-2.5 bg-gray-50/50 rounded-lg">
                    <Users size={16} className="text-gray-400" />
                    {organisation.profile?.size || (
                      <span className="text-gray-400 italic">
                        Not specified
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">
                  Headquarters
                </label>
                {activeSection === 'profile' ? (
                  <EditableInput
                    value={tempData?.profile?.address}
                    onChange={(e) =>
                      setTempData({
                        ...tempData,
                        profile: {
                          ...tempData.profile,
                          address: e.target.value,
                        },
                      })
                    }
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 p-2.5 bg-gray-50/50 rounded-lg">
                    <MapPin size={16} className="text-gray-400" />
                    {organisation.profile?.address || (
                      <span className="text-gray-400 italic">
                        Not specified
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="md:col-span-2 space-y-1.5 mt-2">
                <label className="text-xs font-semibold text-gray-500">
                  About
                </label>
                {activeSection === 'profile' ? (
                  <EditableInput
                    multiline
                    value={tempData?.profile?.description}
                    onChange={(e) =>
                      setTempData({
                        ...tempData,
                        profile: {
                          ...tempData.profile,
                          description: e.target.value,
                        },
                      })
                    }
                  />
                ) : (
                  <div className="text-sm text-gray-600 leading-relaxed p-4 bg-gray-50/50 rounded-lg">
                    {organisation.profile?.description || (
                      <span className="text-gray-400 italic">
                        No description provided yet.
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CONTACT INFO */}
          <div
            className={`bg-white rounded-lg p-6 border transition-all duration-300 shadow-sm ${activeSection === 'contact' ? 'border-blue-500 ring-2 ring-blue-50' : 'border-gray-200'}`}
          >
            <SectionHeader title="Contact Information" id="contact" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
              {[
                // {
                //   label: 'Point of Contact',
                //   key: 'name',
                //   icon: <UserCheck size={16} className="text-gray-400" />,
                //   disabled: true,
                //   validation: null,
                // },
                {
                  label: 'Official Email',
                  key: 'email',
                  icon: <Mail size={16} className="text-gray-400" />,
                  validation: validateEmail,
                },
                {
                  label: 'Phone Number',
                  key: 'phone',
                  icon: <Phone size={16} className="text-gray-400" />,
                  validation: validatePhone,
                },
              ].map((field) => (
                <div key={field.label} className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500">
                    {field.label}
                  </label>
                  {activeSection === 'contact' ? (
                    //   <EditableInput
                    //   value={tempData?.contactInfo?.[field.key]}
                    //   onChange={(e) =>
                    //     setTempData({
                    //       ...tempData,
                    //       contactInfo: {
                    //         ...tempData.contactInfo,
                    //         [field.key]: e.target.value,
                    //       },
                    //     })
                    //   }
                    // />
                    <>
                      <EditableInput
                        value={tempData?.contactInfo?.[field.key] || ''}
                        onChange={(e) =>
                          setTempData({
                            ...tempData,
                            contactInfo: {
                              ...tempData.contactInfo,
                              [field.key]: e.target.value,
                            },
                          })
                        }
                      />
                      {field.validation && tempData?.contactInfo?.[field.key] && !field.validation(tempData.contactInfo[field.key]) && (
                        <p className="text-xs text-red-500 mt-1">
                          {field.key === 'email'
                            ? 'Please enter a valid email address (e.g., name@company.com)'
                            : 'Please enter a valid 10-digit phone number'}
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900 p-2.5 bg-gray-50/50 rounded-lg truncate">
                      {field.icon}
                      {organisation.contactInfo?.[
                        field.key as keyof ContactInfo
                      ] || <span className="text-gray-400 italic">—</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ANALYTICS & BETA */}
        <div className="space-y-6">
          {/* STATS CARD (Added to fill empty space) */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-600" /> Performance
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Active Jobs
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {orgStats?.activeJobs || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                    <Users size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Total Candidates
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {orgStats?.totalCandidates || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest">
                Updated Today
              </p>
            </div>
          </div>

          {/* BETA CARD (Restyled) */}
          {/* <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-yellow-500/20 text-yellow-400 rounded-md">
                    <Zap size={16} fill="currentColor" />
                  </div>
                  <h3 className="font-bold text-lg tracking-tight">
                    Beta Features
                  </h3>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={organisation.betaFeaturesEnabled}
                    onChange={async (e) =>
                      await updateProfile({
                        betaFeaturesEnabled: e.target.checked,
                      })
                    }
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed pr-4">
                Opt-in to experimental recruiting AI modules and advanced
                analytics dashboard.
              </p>
            </div>

            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none"></div>
          </div> */}

          <div className="bg-gray-50 rounded-lg p-4 border border-dashed border-gray-200">
            <p className="text-[10px] text-gray-400 font-mono text-center">
              ORG_ID:{' '}
              <span className="text-gray-600 select-all">
                {organisation._id}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationProfilePage;
