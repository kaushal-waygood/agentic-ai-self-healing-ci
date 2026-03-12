'use client';

import React, { useState } from 'react';

import {
  Save,
  Briefcase,
  FileText,
  FileCheck2,
  Mail,
  PlusCircle,
  Download,
  CheckCircle,
  Eye,
  Sparkles,
  X,
  Loader2,
} from 'lucide-react';
import EditableMaterial from '@/components/application/editable-material';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/rootReducer';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import TemplateSidebar from '../../../TemplateSidebar';

const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

const InternalEditableMaterialButton = ({
  variant,
  onClick,
  disabled,
  children,
  className,
}: {
  variant: string;
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
      className ?? '',
    )}
  >
    {children}
  </button>
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
  handleSendEmail: (
    recruiterEmail: string,
    options?: {
      mode?: 'cv' | 'cl' | 'tailored';
      subject?: string;
      bodyHtml?: string;
    },
  ) => void | Promise<void>;
  handleStartNew: () => void;
  handleSaveAndFinish: () => void;
}

export const resumeTemplates = [
  {
    id: 'classic',
    name: 'Classic',
    thumbnail: '/templates/classic.png',
    className: 'resume-classic',
  },
  {
    id: 'modern',
    name: 'Modern',
    thumbnail: '/templates/modern.png',
    className: 'resume-modern',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    thumbnail: '/templates/minimal.png',
    className: 'resume-minimal',
  },
  {
    id: 'professional',
    name: 'Professional',
    thumbnail: '/templates/professional.png',
    className: 'resume-professional',
  },
];
export interface ResumeTemplate {
  id: string;
  name: string;
  style: string;
  thumbnail: string;
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
  handleSendEmail,
}: ResultStepProps) => {
  const [activeSection, setActiveSection] = useState('job');
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedSections, setSavedSections] = useState(new Set());
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  // const [selectedTemplate, setSelectedTemplate] = useState(resumeTemplates[0]);
  interface Props {
    activeTemplate: ResumeTemplate | null;
    onSelect: (template: ResumeTemplate) => void;
  }
  const [selectedTemplate, setSelectedTemplate] =
    useState<ResumeTemplate | null>(null);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
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
        'flex justify-center items-center border-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none',
        'px-6 py-3',
        variant === 'ghost'
          ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          : '',
        className ?? '',
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
      color: 'tabPrimary',
      description: "Review the job you're applying for",
    },
    {
      id: 'cv',
      title: 'Tailored CV',
      icon: FileText,
      color: 'tabPrimary',
      description: 'Your customized resume',
    },
    {
      id: 'cover',
      title: 'Cover Letter',
      icon: FileCheck2,
      color: 'tabPrimary',
      description: 'Personalized cover letter',
    },
    {
      id: 'email',
      title: 'Email',
      icon: Mail,
      color: 'tabPrimary',
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


  return (
    <div className="max-w-6xl mx-auto sm:p-6 p-1 space-y-4 font-sans">
      {/* Navigation Tabs */}

      <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-2 mb-4 justify-center p-2 bg-slate-100 rounded-lg">
        {sections.map((section, index) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          const isSaved = savedSections.has(section.id);

          return (
            <CustomButton
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex-col sm:flex-row items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 transform ${
                isActive
                  ? `bg-${section.color} text-white scale-105 `
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white '
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative">
                <Icon className=" w-5 h-5" />
                {isSaved && (
                  <CheckCircle className="absolute -top-1 -right-1 w-3 h-3 text-green-500 animate-bounce" />
                )}
              </div>
              <span className={` ${isActive ? '' : 'hidden sm:inline '} `}>
                {section.title}
              </span>
            </CustomButton>
          );
        })}
      </div>

      {/* Content Sections */}
      <div className="space-y-6 ">
        {/* Job Details Section */}
        {activeSection === 'job' && jobContext && (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="bg-header-gradient-primary p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 justify-center text-white">
                  <Briefcase className="hidden sm:inline w-6 h-6" />
                  <h2 className="text-2xl font-bold bg-transparent text-white">
                    Job Details
                  </h2>
                </div>
              </div>
              <p className=" text-slate-100">
                This is the job you are creating an application for.
              </p>
            </div>

            <div className="p-4">
              <div className="mb-2">
                <h3 className="text-lg sm:text-2xl font-bold text-slate-900 ">
                  {jobContext.jobTitle}
                </h3>
                <p className="text-md sm:text-lg text-slate-600">
                  {jobContext.companyName}
                </p>
              </div>

              <p className="text-sm leading-relaxed">
                {jobContext.jobDescription.split('\n').map((line: string, i: number) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>
            </div>
          </div>
        )}

        {/* Tailored CV Section */}
        {activeSection === 'cv' && (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="bg-header-gradient-primary p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 justify-center text-white">
                  <FileText className="hidden sm:inline w-6 h-6" />
                  <h2 className="text-2xl font-bold bg-transparent text-white">
                    Tailored CV
                  </h2>
                </div>
              </div>
              <p className=" text-slate-100">
                Personalized resume aligned with your target role.
              </p>
            </div>

            <div className="flex relative">
              {/* Desktop Sidebar */}
              <div className="hidden h-[calc(100vh-140px)] lg:relative lg:flex lg:flex-shrink-0">
                <TemplateSidebar
                  activeTemplate={selectedTemplate}
                  onSelect={setSelectedTemplate}
                />
              </div>
              <div className="flex-1 overflow-y-auto p-2 md:p-4">
                {/* Mobile Template Trigger */}
                <div className="lg:hidden flex justify-end mb-2">
                  <button
                    onClick={() => setIsTemplateOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white text-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    Templates
                  </button>
                </div>
                <EditableMaterial
                  editorId="cv-editor"
                  title="CV Content"
                  content={refinedCv}
                  setContent={setRefinedCv}
                  isHtml={true}
                  template={selectedTemplate}
                  onSendEmail={(email, { subject, bodyHtml }) =>
                    handleSendEmail(email, { mode: 'cv', subject, bodyHtml })
                  }
                  defaultSubject={
                    jobContext && 'jobTitle' in jobContext
                      ? `Job Application - ${jobContext.jobTitle}`
                      : 'Job Application'
                  }
                  defaultBodyHtml="Please find my CV attached."
                  sendEmailHint="CV only"
                  companyName={jobContext && 'companyName' in jobContext ? jobContext.companyName : undefined}
                  location={jobContext && 'location' in jobContext ? jobContext.location : undefined}
                  jobId={jobContext?.mode === 'select' ? jobContext.jobId : undefined}
                  jobTitle={jobContext && 'jobTitle' in jobContext ? jobContext.jobTitle : undefined}
                  jobDescription={jobContext && 'jobDescription' in jobContext ? jobContext.jobDescription : undefined}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tailored Cover Letter Section */}
        {activeSection === 'cover' && (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="bg-header-gradient-primary p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 justify-center text-white">
                  <FileCheck2 className="hidden sm:inline w-6 h-6" />
                  <h2 className="text-2xl font-bold bg-transparent text-white">
                    Tailored Cover Letter
                  </h2>
                </div>
              </div>
              <p className="text-purple-100">
                Personalized cover letter highlighting your relevant experience.
              </p>
            </div>

            <div className="">
              <EditableMaterial
                editorId="cl-editor"
                title="Cover Letter"
                content={tailoredCl}
                setContent={setTailoredCl}
                template={null}
                isHtml={true}
                onSendEmail={(email, { subject, bodyHtml }) =>
                  handleSendEmail(email, { mode: 'cl', subject, bodyHtml })
                }
                defaultSubject={
                  jobContext && 'jobTitle' in jobContext
                    ? `Job Application - ${jobContext.jobTitle}`
                    : 'Job Application'
                }
                defaultBodyHtml="Please find my cover letter attached."
                sendEmailHint="Cover letter only"
                companyName={jobContext && 'companyName' in jobContext ? jobContext.companyName : undefined}
                location={jobContext && 'location' in jobContext ? jobContext.location : undefined}
                jobId={jobContext?.mode === 'select' ? jobContext.jobId : undefined}
                jobTitle={jobContext && 'jobTitle' in jobContext ? jobContext.jobTitle : undefined}
                jobDescription={jobContext && 'jobDescription' in jobContext ? jobContext.jobDescription : undefined}
              />
            </div>
          </div>
        )}
        {/* Mobile Template Drawer */}
        {isTemplateOpen && (
          <div className="fixed inset-0 bg-black/40 z-50 lg:hidden">
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl p-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between mb-4">
                <h3 className="font-semibold">Choose Template</h3>
                <button onClick={() => setIsTemplateOpen(false)}>
                  <X />
                </button>
              </div>
              <TemplateSidebar
                activeTemplate={selectedTemplate}
                onSelect={(t) => {
                  setSelectedTemplate(t);
                  setIsTemplateOpen(false);
                }}
              />
            </div>
          </div>
        )}
        {/* Application Email Draft Section */}
        {activeSection === 'email' && (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="bg-header-gradient-primary p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 justify-center text-white">
                  <Mail className="hidden sm:inline w-6 h-6" />
                  <h2 className="text-2xl font-bold bg-transparent text-white">
                    Application Email Draft
                  </h2>
                </div>
              </div>
              <p className="text-purple-100">
                Ready-to-send email for your application submission.
              </p>
            </div>

            <div className="">
              <EditableMaterial
                editorId="email-editor"
                title="Email Draft"
                content={emailDraft}
                setContent={setEmailDraft}
                template={null}
                isHtml={true}
                onSendEmail={(email, { subject, bodyHtml }) =>
                  handleSendEmail(email, { mode: 'tailored', subject, bodyHtml })
                }
                defaultSubject={
                  jobContext && 'jobTitle' in jobContext
                    ? `Job Application - ${jobContext.jobTitle}`
                    : 'Job Application'
                }
                defaultBodyHtml={emailDraft}
                sendEmailHint="CV + Cover Letter + Email draft"
                companyName={jobContext && 'companyName' in jobContext ? jobContext.companyName : undefined}
                location={jobContext && 'location' in jobContext ? jobContext.location : undefined}
                jobId={jobContext?.mode === 'select' ? jobContext.jobId : undefined}
                jobTitle={jobContext && 'jobTitle' in jobContext ? jobContext.jobTitle : undefined}
                jobDescription={jobContext && 'jobDescription' in jobContext ? jobContext.jobDescription : undefined}
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-white rounded-lg shadow-lg border border-slate-200">
        <div className="flex items-center flex-wrap justify-end gap-3">
          <Button
            onClick={() => router.push('/dashboard/apply')}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium "
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Applications</span>
          </Button>
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
