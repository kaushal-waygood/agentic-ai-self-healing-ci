'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Briefcase,
  FileText,
  FileCheck2,
  Mail,
  PlusCircle,
  Award,
  Send,
  Copy,
  Edit3,
  Download,
  Loader2,
  ShieldCheck,
  Sparkles,
  CheckCircle,
  Eye,
} from 'lucide-react';
import EditableMaterial from '@/components/application/editable-material';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/rootReducer';
import { useRouter } from 'next/navigation';

const planTierOrder = { free: 0, plus: 1, pro: 2 };
const mockUserProfile = {
  organizationId: 'org1',
  currentPlanId: 'free',
  personalPlanId: 'plus',
  role: 'OrgMember',
};
const mockOrganizations = [{ id: 'org1', planId: 'pro' }];
const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');
const useToast = () => ({
  toast: ({
    title,
    description,
    variant,
  }: {
    title: string;
    description?: string;
    variant?: string;
  }) => {
    console.log('Toast:', title, description, variant);
  },
});

// --- MOCK/PLACEHOLDER UI COMPONENTS ---
const Card = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <div className={cn('bg-white border rounded-lg', className)}>{children}</div>
);
const CardContent = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => <div className={cn('p-4', className)}>{children}</div>;

const InternalEditableMaterialButton = ({
  variant,
  size,
  onClick,
  disabled,
  children,
  className,
}: {
  variant: string;
  size: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none',
      'px-3 py-1.5',
      variant === 'outline'
        ? 'border bg-transparent hover:bg-slate-100'
        : 'bg-slate-900 text-white hover:bg-slate-700',
      className,
    )}
  >
    {children}
  </button>
);
const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...props} />
);

interface ResultStepProps {
  jobContext: any;
  refinedCv: string;
  setRefinedCv: (content: string) => void;
  tailoredCl: string;
  setTailoredCl: (content: string) => void;
  emailDraft: string;
  setEmailDraft: (content: string) => void;
  setWizardStep: (step: string) => void;
  handleSendEmail: () => void;
  handleStartNew: () => void;
  handleSaveAndFinish: () => void;
}

// --- MAIN ResultStep COMPONENT ---
const ResultStep = ({
  jobContext,
  refinedCv,
  setRefinedCv,
  tailoredCl,
  setTailoredCl,
  emailDraft,
  setEmailDraft,
  setWizardStep,
  handleSendEmail,
  handleStartNew,
  handleSaveAndFinish,
}: ResultStepProps) => {
  const [activeSection, setActiveSection] = useState('job');
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedSections, setSavedSections] = useState(new Set());
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  const CustomButton = ({
    variant,
    onClick,
    disabled,
    children,
    className,
  }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none',
        'px-6 py-3',
        variant === 'ghost'
          ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          : '',
        className,
      )}
    >
      {children}
    </button>
  );

  const sections = [
    {
      id: 'job',
      title: 'Job Details',
      icon: Briefcase,
      color: 'from-purple-500 to-purple-600',
      description: "Review the job you're applying for",
    },
    {
      id: 'cv',
      title: 'Tailored CV',
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      description: 'Your customized resume',
    },
    {
      id: 'cover',
      title: 'Cover Letter',
      icon: FileCheck2,
      color: 'from-cyan-500 to-cyan-600',
      description: 'Personalized cover letter',
    },
    {
      id: 'email',
      title: 'Application Email',
      icon: Mail,
      color: 'from-purple-500 to-cyan-500',
      description: 'Ready-to-send application email',
    },
  ];

  const handleSaveSectionVisual = (sectionId: string) => {
    setSavedSections((prev) => new Set([...prev, sectionId]));
    setTimeout(() => {
      setSavedSections((prev) => {
        const newSet = new Set(prev);
        newSet.delete(sectionId);
        return newSet;
      });
    }, 2000);
  };

  const handleSendEmailWithLoading = async () => {
    setIsProcessing(true);
    try {
      await handleSendEmail();
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4 font-sans">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 p-2 bg-slate-100 rounded-2xl shadow-inner">
        {sections.map((section, index) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          const isSaved = savedSections.has(section.id);

          return (
            <CustomButton
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 transform ${
                isActive
                  ? `bg-gradient-to-r ${section.color} text-white shadow-lg scale-105`
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-sm'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {isSaved && (
                  <CheckCircle className="absolute -top-1 -right-1 w-3 h-3 text-green-500 animate-bounce" />
                )}
              </div>
              <span className="hidden sm:inline">{section.title}</span>
            </CustomButton>
          );
        })}
      </div>

      {/* Content Sections */}
      <div className="space-y-6">
        {/* Job Details Section */}
        {activeSection === 'job' && jobContext && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6">
              <div className="flex items-center space-x-3 text-white">
                <Briefcase className="w-6 h-6" />
                <h2 className="text-2xl font-bold">Job Details</h2>
              </div>
              <p className="text-purple-100 mt-2">
                This is the job you are creating an application for.
              </p>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {jobContext.jobTitle}
                </h3>
                <p className="text-lg text-slate-600">
                  {jobContext.companyName}
                </p>
              </div>

              <div className="w-full h-px bg-slate-200 my-4" />

              <div className="h-64 overflow-y-auto p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                <div
                  className="prose max-w-none text-slate-700"
                  dangerouslySetInnerHTML={{
                    __html: jobContext.jobDescription,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tailored CV Section */}
        {activeSection === 'cv' && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 justify-center text-white">
                  <FileText className="w-6 h-6" />
                  <h2 className="text-2xl font-bold bg-transparent text-white">
                    Tailored CV
                  </h2>
                </div>
              </div>
            </div>

            <div className="p-8">
              <EditableMaterial
                editorId="cv-editor"
                title="CV Content"
                content={refinedCv}
                setContent={setRefinedCv}
                isHtml={true}
              />
            </div>
          </div>
        )}

        {/* Tailored Cover Letter Section */}
        {activeSection === 'cover' && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-white">
                  <FileCheck2 className="w-6 h-6" />
                  <h2 className="text-2xl font-bold">Tailored Cover Letter</h2>
                </div>
                <div className="flex space-x-2">
                  <InternalEditableMaterialButton
                    variant="ghost"
                    size="icon"
                    className="bg-white/20 text-white hover:bg-white/30"
                  >
                    <Download className="w-5 h-5" />
                  </InternalEditableMaterialButton>
                  <InternalEditableMaterialButton
                    variant="ghost"
                    size="icon"
                    className="bg-white/20 text-white hover:bg-white/30"
                    onClick={() => handleSaveSectionVisual('cover')}
                  >
                    <Save className="w-5 h-5" />
                  </InternalEditableMaterialButton>
                </div>
              </div>
              <p className="text-cyan-100 mt-2">
                Personalized cover letter highlighting your relevant experience.
              </p>
            </div>

            <div className="p-8">
              <EditableMaterial
                editorId="cl-editor"
                title="Cover Letter"
                content={tailoredCl}
                setContent={setTailoredCl}
                isHtml={true}
              />
            </div>
          </div>
        )}

        {/* Application Email Draft Section */}
        {activeSection === 'email' && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="bg-gradient-to-r from-purple-500 to-cyan-500 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-white">
                  <Mail className="w-6 h-6" />
                  <h2 className="text-2xl font-bold">
                    Application Email Draft
                  </h2>
                </div>
                <div className="flex space-x-2">
                  <InternalEditableMaterialButton
                    variant="ghost"
                    size="icon"
                    className="bg-white/20 text-white hover:bg-white/30"
                  >
                    <Eye className="w-5 h-5" />
                  </InternalEditableMaterialButton>
                  <InternalEditableMaterialButton
                    variant="ghost"
                    size="icon"
                    className="bg-white/20 text-white hover:bg-white/30"
                    onClick={() => handleSaveSectionVisual('email')}
                  >
                    <Save className="w-5 h-5" />
                  </InternalEditableMaterialButton>
                </div>
              </div>
              <p className="text-purple-100 mt-2">
                Ready-to-send email for your application submission.
              </p>
            </div>

            <div className="p-8">
              <EditableMaterial
                editorId="email-editor"
                title="Email Draft"
                content={emailDraft}
                setContent={setEmailDraft}
                isHtml={true}
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 bg-white rounded-2xl shadow-lg border border-slate-200">
        <CustomButton
          variant="ghost"
          onClick={() => setWizardStep('generate')}
          className="flex items-center space-x-2 px-6 py-3 text-slate-600 hover:text-slate-900 transition-colors duration-200 rounded-xl hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Back to Generate</span>
        </CustomButton>

        <div className="flex items-center flex-wrap justify-end gap-3">
          {user?.googleAuth ? (
            <CustomButton
              onClick={handleStartNew}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-black rounded-lg font-medium shadow-md hover:bg-slate-700 transition-all duration-300 hover:scale-105"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Send Application</span>
            </CustomButton>
          ) : (
            <CustomButton
              onClick={() => router.push('/dashboard/settings')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-700 text-white rounded-lg font-medium"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Connect Google</span>
            </CustomButton>
          )}

          <CustomButton
            onClick={() => router.push('/dashboard/apply')}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-600 to-slate-700 text-white rounded-lg font-medium "
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Applications</span>
          </CustomButton>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ResultStep;
