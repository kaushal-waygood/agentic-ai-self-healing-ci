import React, { FC, useState } from 'react';
import {
  Copy,
  Edit3,
  Download,
  Loader2,
  Save,
  Eye,
  Maximize2,
  Minimize2,
  FileText,
  Mail,
  Sparkles,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Input } from '../ui/input';
import EditorToolbar from './EditorToolbar';
import { useEditableMaterial } from './useEditableMat';
import SendEmailDialog from '../SendEmailRecruiter';

/** Shared send-email options — must match DocumentPage's SendEmailOptions */
export interface SendEmailOptions {
  subject: string;
  bodyHtml: string;
  coverLetterHtml?: string; // plain-text cover letter converted to HTML by this component
}

interface EditableMaterialProps {
  template?: any;
  content: string;
  setContent: (value: string) => void;
  title: string;
  isHtml?: boolean;
  className?: string;
  type?: 'resume' | 'coverletter';
  editorId?: string;
  onSendEmail?: (
    recruiterEmail: string,
    options: SendEmailOptions,
  ) => void | Promise<void>;
  sendEmailHint?: string;
  defaultSubject?: string;
  defaultBodyHtml?: string;
  companyName?: string;
  location?: string | { city?: string; state?: string; country?: string };
  jobId?: string;
  jobTitle?: string;
  jobDescription?: string;
}

const EditableMaterial: FC<EditableMaterialProps> = ({
  content,
  setContent,
  title,
  template,
  type = 'resume',
  className = '',
  onSendEmail,
  sendEmailHint,
  defaultSubject = '',
  defaultBodyHtml = '',
  companyName,
  location,
  jobId,
  jobTitle,
  jobDescription,
}) => {
  const [isSendEmailDialogOpen, setIsSendEmailDialogOpen] = useState(false);
  const [recruiterEmailInput, setRecruiterEmailInput] = useState('');
  const [subjectInput, setSubjectInput] = useState('');
  const [bodyInput, setBodyInput] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isFindingEmail, setIsFindingEmail] = useState(false);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [generatedSubject, setGeneratedSubject] = useState<string | null>(null);
  const [generatedBodyHtml, setGeneratedBodyHtml] = useState<string | null>(
    null,
  );

  /**
   * Plain-text cover letter kept in sync via SendEmailDialog's onCoverLetterChange.
   * Converted to self-contained HTML just before the API call.
   */
  const [coverLetterText, setCoverLetterText] = useState('');

  const { editorRef, containerRef, state, actions } = useEditableMaterial({
    content,
    setContent,
    title,
    type,
    template,
  });

  const stripHtml = (html: string) => {
    if (typeof document === 'undefined') return html;
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || html;
  };

  /** Wrap plain-text cover letter in minimal HTML for the PDF pipeline */
  const coverLetterToHtml = (text: string): string => {
    if (!text.trim()) return '';
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<html><body><pre style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;white-space:pre-wrap;padding:40px;">${escaped}</pre></body></html>`;
  };

  const handleCopy = async () => {
    const text = editorRef.current?.innerText || '';
    await navigator.clipboard.writeText(text);
    toast({ title: 'Copied plain text' });
  };

  const handleSendEmailClick = () => {
    setRecruiterEmailInput('');
    setSubjectInput(generatedSubject ?? defaultSubject);
    setBodyInput(
      generatedBodyHtml
        ? stripHtml(generatedBodyHtml)
        : defaultBodyHtml
          ? stripHtml(defaultBodyHtml)
          : '',
    );
    setCoverLetterText('');
    setIsSendEmailDialogOpen(true);
  };

  const canGenerateDraft = Boolean(
    onSendEmail && (jobId || (companyName?.trim() && jobTitle?.trim())),
  );

  const handleGenerateEmailDraft = async () => {
    if (!canGenerateDraft) return;
    if (!jobId && (!companyName?.trim() || !jobTitle?.trim())) {
      toast({
        variant: 'destructive',
        title:
          'Company name and job title are required to generate email draft',
      });
      return;
    }
    setIsGeneratingDraft(true);
    try {
      const { generateEmailDraft } = await import('@/services/api/ai');
      const result = await generateEmailDraft({
        ...(jobId ? { jobId } : {}),
        ...(!jobId && companyName && jobTitle
          ? { jobTitle, companyName, jobDescription }
          : {}),
      });
      const draft = result?.emailDraft ?? result;
      if (draft?.bodyHtml) {
        setContent(draft.bodyHtml);
        setGeneratedSubject(draft.subject ?? null);
        setGeneratedBodyHtml(draft.bodyHtml);
        setSubjectInput(draft.subject ?? '');
        setBodyInput(stripHtml(draft.bodyHtml));
        toast({ title: 'Email draft generated' });
      } else {
        toast({
          variant: 'destructive',
          title: 'Could not generate email draft',
        });
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Failed to generate email draft',
      });
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const handleFindEmail = async () => {
    if (!companyName?.trim()) {
      toast({
        variant: 'destructive',
        title: 'Company name is required to find email',
      });
      return;
    }
    setIsFindingEmail(true);
    try {
      const { scrapeRecruitmentEmail } = await import('@/services/api/job');
      const { email } = await scrapeRecruitmentEmail({
        company: companyName.trim(),
        location: location ?? undefined,
      });
      if (email) {
        setRecruiterEmailInput(email);
        toast({ title: 'Email found' });
      } else {
        toast({
          variant: 'destructive',
          title: 'Could not find recruitment email',
        });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Failed to find email' });
    } finally {
      setIsFindingEmail(false);
    }
  };

  const handleSendEmailConfirm = async () => {
    const email = recruiterEmailInput.trim();
    if (!email) {
      toast({ variant: 'destructive', title: 'Please enter recruiter email' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        variant: 'destructive',
        title: 'Please enter a valid email address',
      });
      return;
    }

    const subject = subjectInput.trim() || 'Job Application';
    const bodyHtml = bodyInput.trim()
      ? bodyInput.replace(/\n/g, '<br/>')
      : 'Please find my application attached.';

    // Only include coverLetterHtml in the payload when the user actually wrote one
    const coverLetterHtml = coverLetterText.trim()
      ? coverLetterToHtml(coverLetterText)
      : undefined;

    if (!onSendEmail) return;
    setIsSendingEmail(true);
    try {
      await onSendEmail(email, { subject, bodyHtml, coverLetterHtml });
      toast({ title: 'Email sent successfully' });
      setIsSendEmailDialogOpen(false);
    } catch {
      toast({ variant: 'destructive', title: 'Failed to send email' });
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`bg-gray-100 flex flex-col transition-all border border-gray-200 ${
        state.isFullscreen ? 'fixed inset-0 z-50' : 'relative rounded-xl'
      } ${className}`}
    >
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-4 sm:px-6 py-3.5 bg-white rounded-t-xl sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          {state.isEditing ? (
            <Edit3 className="w-5 h-5 text-blue-500 shrink-0" />
          ) : (
            <Eye className="w-5 h-5 text-gray-500 shrink-0" />
          )}
          <h3 className="font-bold text-gray-700">{title}</h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {state.isEditing && (
            <div className="hidden xl:block border-r border-gray-200 pr-4 mr-1">
              <EditorToolbar
                onFontFamily={(f) => actions.execCommand('fontName', f)}
                onFontSize={(n) => actions.applyFontSize(String(n))}
                onTextColor={(c) => actions.execCommand('foreColor', c)}
                onHighlight={(c) => actions.execCommand('hiliteColor', c)}
                onBold={() => actions.execCommand('bold')}
                onItalic={() => actions.execCommand('italic')}
                onUnderline={() => actions.execCommand('underline')}
                onAlignLeft={() => actions.execCommand('justifyLeft')}
                onAlignCenter={() => actions.execCommand('justifyCenter')}
                onAlignRight={() => actions.execCommand('justifyRight')}
                onAlignJustify={() => actions.execCommand('justifyFull')}
                onBulletList={() => actions.execCommand('insertUnorderedList')}
                onNumberList={() => actions.execCommand('insertOrderedList')}
                onClear={() => actions.execCommand('removeFormat')}
              />
            </div>
          )}

          <button
            onClick={actions.toggleEdit}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors active:scale-[0.98] ${
              state.isEditing
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                : 'bg-slate-800 text-white hover:bg-slate-900 shadow-sm'
            }`}
          >
            {state.isEditing ? 'Confirm Edits' : 'Edit Document'}
          </button>

          <div className="h-6 w-px bg-gray-200 hidden sm:block" />

          <button
            onClick={actions.toggleImages}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              state.showImages
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Eye
              size={16}
              className={state.showImages ? 'opacity-100' : 'opacity-60'}
            />
            <span className="hidden sm:inline">Show Profile Image</span>
          </button>

          <button
            onClick={() => actions.setIsNamingDialogDisplayed(true)}
            disabled={!state.hasChanges || state.isLoading}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              state.hasChanges
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Save size={16} /> Final Save
          </button>

          <div className="h-6 w-px bg-gray-200 hidden sm:block" />

          <button
            onClick={() => actions.exportFile('pdf')}
            disabled={!!state.loadingType || state.isEditing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {state.loadingType === 'pdf' ? (
              <Loader2 className="animate-spin shrink-0" size={16} />
            ) : (
              <Download size={16} className="shrink-0" />
            )}
            PDF
          </button>

          <button
            onClick={() => actions.exportFile('docx')}
            disabled={!!state.loadingType || state.isEditing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {state.loadingType === 'docx' ? (
              <Loader2 className="animate-spin shrink-0" size={16} />
            ) : (
              <FileText size={16} className="shrink-0" />
            )}
            DOCX
          </button>

          {onSendEmail && (
            <>
              <div className="h-6 w-px bg-gray-200 hidden sm:block" />
              {canGenerateDraft && (
                <button
                  onClick={handleGenerateEmailDraft}
                  disabled={state.isEditing || isGeneratingDraft}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingDraft ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Sparkles size={16} />
                  )}
                  <span className="hidden sm:inline">Generate Email Draft</span>
                </button>
              )}
              <button
                onClick={handleSendEmailClick}
                disabled={state.isEditing}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Mail size={16} />
                <span className="hidden sm:inline">Send to Recruiter</span>
              </button>
            </>
          )}

          <div className="h-6 w-px bg-gray-200 hidden sm:block" />

          <button
            onClick={actions.toggleFullscreen}
            className="p-2.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-lg transition-colors"
          >
            {state.isFullscreen ? (
              <Minimize2 size={18} />
            ) : (
              <Maximize2 size={18} />
            )}
          </button>
        </div>
      </header>

      {/* Canvas */}
      <main className="flex-grow overflow-y-auto p-4 md:p-8 bg-gray-200/50 custom-scrollbar">
        <style
          dangerouslySetInnerHTML={{
            __html: `.resume-editor-canvas { font-family: Arial, Helvetica, "Segoe UI", sans-serif; }`,
          }}
        />
        {template?.style && (
          <style dangerouslySetInnerHTML={{ __html: template.style }} />
        )}
        <div
          ref={editorRef}
          contentEditable={state.isEditing}
          onInput={actions.handleInput}
          onKeyDown={state.isEditing ? actions.handleEditorKeyDown : undefined}
          suppressContentEditableWarning
          className={`resume-editor-canvas mx-auto bg-white shadow-sm transition-all duration-300 ${
            state.isEditing ? 'ring-2 ring-blue-200 ring-offset-2' : ''
          } ${!state.showImages ? 'hide-editor-images' : ''} w-full max-w-[210mm] focus:outline-none p-[15mm] md:p-[20mm] min-h-[297mm]`}
        />
      </main>

      {/* Footer */}
      <footer className="px-4 py-3 border-t border-gray-200 bg-white flex flex-wrap items-center justify-between gap-4 rounded-b-xl">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {state.wordCount} Words
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm font-medium"
        >
          <Copy size={16} /> Copy
        </button>
      </footer>

      {/* Send Email Dialog */}
      <SendEmailDialog
        isSendEmailDialogOpen={isSendEmailDialogOpen}
        setIsSendEmailDialogOpen={setIsSendEmailDialogOpen}
        sendEmailHint={sendEmailHint ?? ''}
        recruiterEmailInput={recruiterEmailInput}
        setRecruiterEmailInput={setRecruiterEmailInput}
        subjectInput={subjectInput}
        setSubjectInput={setSubjectInput}
        bodyInput={bodyInput}
        setBodyInput={setBodyInput}
        isSendingEmail={isSendingEmail}
        handleSendEmailConfirm={handleSendEmailConfirm}
        companyName={companyName ?? ''}
        showFindEmail={Boolean(companyName && onSendEmail)}
        handleFindEmail={handleFindEmail}
        isFindingEmail={isFindingEmail}
        canGenerateDraft={canGenerateDraft}
        handleGenerateEmailDraft={handleGenerateEmailDraft}
        isGeneratingDraft={isGeneratingDraft}
        onCoverLetterChange={setCoverLetterText}
      />

      {/* Save Dialog */}
      <AlertDialog
        open={state.isNamingDialogDisplayed}
        onOpenChange={actions.setIsNamingDialogDisplayed}
      >
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Permanent Save</AlertDialogTitle>
            <AlertDialogDescription>
              Save this version to your profile. Edits will be final for this
              name.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            placeholder="e.g., Google Resume v1"
            value={state.cvNameInput}
            onChange={(e) => actions.setCvNameInput(e.target.value)}
            className="my-2"
          />
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={actions.saveToDatabase}
              className="bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              Confirm Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditableMaterial;
