'use client'; // Added as per the provided EditableMaterial code

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import htmlDocx from 'html-docx-js/dist/html-docx'; // Imported as required by EditableMaterial
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

const planTierOrder = { free: 0, plus: 1, pro: 2 };
const mockUserProfile = {
  organizationId: 'org1',
  currentPlanId: 'free',
  personalPlanId: 'plus',
  role: 'OrgMember',
};
const mockOrganizations = [{ id: 'org1', planId: 'pro' }];
const cn = (...classes: string[]) => classes.filter(Boolean).join(' '); // Explicitly typed for clarity
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

// --- MOCK/PLACEHOLDER UI COMPONENTS (for EditableMaterial) ---
// These components are specifically for the internal use of EditableMaterial
// and do not conflict with the Button/Card components used in ResultStep.
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
// This Button is internal to EditableMaterial, not the one from '@/components/ui/button'
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
      'px-3 py-1.5', // approx size="sm"
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
const Separator = () => <hr className="my-6 border-slate-200" />;

// --- YOUR ACTUAL EditableMaterial COMPONENT (as provided) ---
export function EditableMaterial({
  content,
  setContent,
  title,
  editorId,
  isHtml = false,
  className,
}: {
  content: string;
  setContent: (value: string) => void;
  title: string;
  editorId: string;
  isHtml?: boolean;
  className?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [canUsePremiumFeatures, setCanUsePremiumFeatures] = useState(false);

  useEffect(() => {
    const user = mockUserProfile;
    const org = user.organizationId
      ? mockOrganizations.find((o) => o.id === user.organizationId)
      : null;
    let basePlanId = user.currentPlanId;
    if (user.role === 'OrgMember' && org) {
      basePlanId = org.planId;
    }
    const effectivePlanId =
      user.personalPlanId &&
      planTierOrder[user.personalPlanId as keyof typeof planTierOrder] >
        planTierOrder[basePlanId as keyof typeof planTierOrder]
        ? user.personalPlanId
        : basePlanId;

    setCanUsePremiumFeatures(
      planTierOrder[effectivePlanId as keyof typeof planTierOrder] >=
        planTierOrder['plus'],
    );
  }, []);

  const handleInput = () => {
    if (isHtml && editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
        toast({ title: `${title} updated.` });
      }
    }
    setIsEditing(!isEditing);
  };

  useEffect(() => {
    if (
      isHtml &&
      editorRef.current &&
      editorRef.current.innerHTML !== content
    ) {
      editorRef.current.innerHTML = content;
    }
  }, [content, isHtml]);

  const handleCopy = () => {
    if (!content) return;
    const textToCopy = isHtml
      ? editorRef.current?.innerText || content
      : content;
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: `${title} Copied!`,
      description: `${title} content (as text) copied to clipboard.`,
    });
  };

  const handleDownloadPdf = async () => {
    const contentToPrint = editorRef.current;
    if (!contentToPrint) return;

    setIsLoading(true);
    toast({ title: 'Generating PDF...' });

    try {
      const response = await fetch(
        'http://localhost:8080/api/v1/students/pdf/generate-pdf',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // Send the full HTML of the editor
            html: contentToPrint.innerHTML,
            // Also send the title for the filename
            title: title,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`PDF generation failed: ${response.statusText}`);
      }

      // Get the PDF data as a blob
      const blob = await response.blob();

      // Create a temporary URL and link to trigger the download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zobsai_${title.replace(/ /g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();

      // Clean up the temporary link and URL
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF Download Error:', error);
      toast({ variant: 'destructive', title: 'PDF Download Failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      className={`shadow-sm border-slate-200 h-full flex flex-col bg-white rounded-xl overflow-hidden ${className}`}
    >
      <CardContent className="p-4 pt-2 flex-grow flex flex-col">
        <p className="text-xs text-slate-500 mb-2">
          {isEditing
            ? "Editing is active. Click 'Save Edits' when done."
            : "Click 'Edit' to make changes."}
        </p>
        {isHtml ? (
          <div
            id={editorId}
            ref={editorRef}
            contentEditable={isEditing}
            suppressContentEditableWarning={true}
            className={cn(
              'flex-grow border rounded-md bg-white p-4 h-full min-h-[300px] overflow-y-auto focus-visible:outline-none prose prose-slate max-w-none',
              isEditing && 'ring-2 ring-purple-500 shadow-inner',
            )}
            onInput={handleInput}
            aria-label={title}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <Textarea
            id={editorId}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-grow resize-none border rounded-md focus-visible:ring-purple-500 text-sm min-h-[200px]"
            aria-label={title}
            placeholder={`Content for ${title.toLowerCase()} will appear here.`}
          />
        )}
        <div className="mt-3 flex gap-2 shrink-0 flex-wrap">
          <InternalEditableMaterialButton
            variant="outline"
            size="sm"
            onClick={handleEditToggle}
            disabled={!content || isLoading}
          >
            <Edit3 className="mr-2 h-4 w-4" />
            {isEditing ? 'Save Edits' : 'Edit'}
          </InternalEditableMaterialButton>
          <InternalEditableMaterialButton
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={!content || isLoading}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Text
          </InternalEditableMaterialButton>
          <InternalEditableMaterialButton
            variant="default"
            size="sm"
            onClick={handleDownloadPdf}
            disabled={!isHtml || !content || isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download PDF
            {!canUsePremiumFeatures && (
              <ShieldCheck className="ml-2 h-4 w-4 text-yellow-300" />
            )}
          </InternalEditableMaterialButton>
          <InternalEditableMaterialButton
            variant="default"
            size="sm"
            // onClick={handleDownloadDocx}
            disabled={!isHtml || !content || isLoading}
          >
            <Download className="mr-2 h-4 w-4" />
            Download DOCX
            {!canUsePremiumFeatures && (
              <ShieldCheck className="ml-2 h-4 w-4 text-yellow-300" />
            )}
          </InternalEditableMaterialButton>
        </div>
      </CardContent>
    </Card>
  );
}

// --- PROPS INTERFACE for ResultStep ---
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
// Renamed from SleekResultsStep to ResultStep to match original component name
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
  const [savedSections, setSavedSections] = useState(new Set()); // For visual feedback

  // This Button is from '@/components/ui/button' and is used in ResultStep's main actions
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
      title: 'Application Email', // Changed title slightly for clarity
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

  // Helper component for consistent section layout
  const DocumentSection = ({
    icon: Icon,
    title,
    children,
    iconColor = 'text-cyan-700',
    bgColor = 'from-cyan-100 to-blue-100',
  }: {
    icon: React.ElementType;
    title: string;
    children: React.ReactNode;
    iconColor?: string;
    bgColor?: string;
  }) => (
    <div className="p-6 sm:p-8">
      <motion.div
        className="flex items-center gap-4 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className={`w-12 h-12 flex items-center justify-center bg-gradient-to-br ${bgColor} rounded-xl`}
        >
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <h3 className="font-bold text-2xl text-slate-800">{title}</h3>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {children}
      </motion.div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4 font-sans">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
          Application Complete!
        </h1>

        {/* Simple Progress Indicator (Visual, as per generated code) */}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 p-2 bg-slate-100 rounded-2xl shadow-inner">
        {sections.map((section, index) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          const isSaved = savedSections.has(section.id);

          return (
            <CustomButton // Using CustomButton to match the original Button's style from the generated code
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

              {/* Separator from original code, adjusted for new design */}
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
                    onClick={() => console.log('Download Cover Letter clicked')} // Placeholder
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
                    onClick={() => console.log('Preview Email clicked')} // Placeholder
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
                isHtml={true} /* Changed to true for HTML email */
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 bg-white rounded-2xl shadow-lg border border-slate-200">
        <CustomButton
          variant="ghost"
          onClick={() => setWizardStep('generate')} // Original functionality
          className="flex items-center space-x-2 px-6 py-3 text-slate-600 hover:text-slate-900 transition-colors duration-200 rounded-xl hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Back to Generate</span>
        </CustomButton>

        {/* Group of action buttons on the right */}
        <div className="flex items-center flex-wrap justify-end gap-3">
          <CustomButton
            onClick={handleSendEmailWithLoading}
            disabled={isProcessing}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 disabled:opacity-75 disabled:scale-100"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                <span>Send Email</span>
              </>
            )}
          </CustomButton>

          <CustomButton
            onClick={handleStartNew}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-600 to-slate-700 text-white rounded-lg font-medium shadow-md hover:bg-slate-700 transition-all duration-300 hover:scale-105"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Applications</span>
          </CustomButton>

          <CustomButton
            onClick={handleSaveAndFinish}
            className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
            <Save className="w-5 h-5 z-10" />
            <span className="z-10">Save Application</span>
            <Sparkles className="w-4 h-4 animate-pulse z-10" />
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
