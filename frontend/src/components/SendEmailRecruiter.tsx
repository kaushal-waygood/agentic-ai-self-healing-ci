import { Loader2, Search, Sparkles } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

interface SendEmailDialogProps {
  isSendEmailDialogOpen: boolean;
  setIsSendEmailDialogOpen: (open: boolean) => void;
  sendEmailHint: string;
  recruiterEmailInput: string;
  setRecruiterEmailInput: (email: string) => void;
  subjectInput: string;
  setSubjectInput: (subject: string) => void;
  bodyInput: string;
  setBodyInput: (body: string) => void;
  isSendingEmail: boolean;
  handleSendEmailConfirm: () => void;
  companyName: string;
  /** Controls whether the "Find" button is rendered */
  showFindEmail: boolean;
  handleFindEmail: () => void;
  isFindingEmail: boolean;
  canGenerateDraft: boolean;
  handleGenerateEmailDraft: () => void;
  isGeneratingDraft: boolean;
}

const SendEmailDialog: FC<SendEmailDialogProps> = ({
  isSendEmailDialogOpen,
  setIsSendEmailDialogOpen,
  sendEmailHint,
  recruiterEmailInput,
  setRecruiterEmailInput,
  subjectInput,
  setSubjectInput,
  bodyInput,
  setBodyInput,
  isSendingEmail,
  handleSendEmailConfirm,
  showFindEmail,
  handleFindEmail,
  isFindingEmail,
  canGenerateDraft,
  handleGenerateEmailDraft,
  isGeneratingDraft,
}: SendEmailDialogProps) => {
  return (
    <AlertDialog
      open={isSendEmailDialogOpen}
      onOpenChange={setIsSendEmailDialogOpen}
    >
      <AlertDialogContent className="rounded-xl max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Send Email to Recruiter</AlertDialogTitle>
          <AlertDialogDescription>
            Enter the recruiter&apos;s email and edit the draft.{' '}
            {sendEmailHint && `(${sendEmailHint})`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 py-2">
          {/* To */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">
              To
            </label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="recruiter@company.com"
                value={recruiterEmailInput}
                onChange={(e) => setRecruiterEmailInput(e.target.value)}
                disabled={isSendingEmail}
                className="flex-1"
              />
              {showFindEmail && (
                <button
                  type="button"
                  onClick={handleFindEmail}
                  disabled={isFindingEmail || isSendingEmail}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  title="Find recruitment email by company and location"
                >
                  {isFindingEmail ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Search size={16} />
                  )}
                  Find
                </button>
              )}
            </div>
          </div>

          {/* Subject */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <label className="text-sm font-medium text-slate-700">
                Subject
              </label>
              {canGenerateDraft && (
                <button
                  type="button"
                  onClick={handleGenerateEmailDraft}
                  disabled={isGeneratingDraft || isSendingEmail}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-violet-100 text-violet-700 hover:bg-violet-200 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  title="Generate subject and message with AI"
                >
                  {isGeneratingDraft ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <Sparkles size={14} />
                  )}
                  Generate Email Draft
                </button>
              )}
            </div>
            <Input
              placeholder="Job Application"
              value={subjectInput}
              onChange={(e) => setSubjectInput(e.target.value)}
              disabled={isSendingEmail}
            />
          </div>

          {/* Message */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">
              Message
            </label>
            <Textarea
              placeholder="Please find my application attached."
              value={bodyInput}
              onChange={(e) => setBodyInput(e.target.value)}
              disabled={isSendingEmail}
              rows={5}
              className="resize-y min-h-[100px]"
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-lg" disabled={isSendingEmail}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleSendEmailConfirm();
            }}
            disabled={isSendingEmail}
            className="bg-emerald-600 hover:bg-emerald-700 rounded-lg"
          >
            {isSendingEmail ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Sending...
              </>
            ) : (
              'Send'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SendEmailDialog;
