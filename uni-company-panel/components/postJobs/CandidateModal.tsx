import {
  Mail,
  Phone,
  Calendar,
  FileText,
  Paperclip,
  AlertCircle,
  ExternalLink,
  Workflow,
  FileUser,
  Loader2,
} from 'lucide-react';
import { CommonDetailsModal } from '@/components/common/CommonDetailsModal';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';
import { toast } from 'sonner';
import { useOrganisationStore } from '@/store/organisation.store';

export function CandidateModal({ candidate, open, onOpenChange }: any) {
  // State to handle the previewer
  const { rejectCandidateApplication, acceptCandidateApplication } =
    useOrganisationStore();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState('');

  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  if (!candidate) return null;

  const handlePreview = (url: string, title: string) => {
    setPreviewUrl(url);
    setPreviewTitle(title);
  };

  const candidateDetails = [
    { icon: Mail, label: 'Email', value: candidate.student?.email },
    { icon: Phone, label: 'Phone', value: candidate.student?.phone },
    {
      icon: Calendar,
      label: 'Applied On',
      value: new Date(candidate.appliedAt).toLocaleDateString('en-GB'),
    },
    { icon: Workflow, label: 'Method', value: candidate.applicationMethod },
  ];

  return (
    <>
      <CommonDetailsModal
        open={open}
        onOpenChange={onOpenChange}
        title={candidate.student?.fullName}
        description={`Application ID: ${candidate._id}`}
        badgeContent={candidate.student?.fullName?.charAt(0)}
        details={candidateDetails}
        sections={
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <FileUser size={16} className="text-slate-400" /> Documents
            </h4>
            <div className="p-4 border rounded-xl bg-slate-50 space-y-3">
              {[
                { label: 'Resume / CV', link: candidate.cvLink },
                { label: 'Cover Letter', link: candidate.coverLetterLink },
              ].map((doc, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <FileText className="w-4 h-4 text-slate-400" />
                    {doc.label}
                  </div>

                  {doc.link ? (
                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      className="bg-white h-8 shadow-sm"
                      onClick={() => handlePreview(doc.link, doc.label)}
                    >
                      <Paperclip className="w-3 h-3" />
                      View
                    </Button>
                  ) : (
                    <span className="text-xs text-slate-400 italic flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Not attached
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        }
        footerActions={
          <>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                setLoadingAction('REJECT');
                await rejectCandidateApplication(candidate._id);
                toast.success(
                  `Candidate Rejected ${candidate.student?.fullName}`,
                );
                setLoadingAction(null);
              }}
              disabled={
                candidate.status === 'REJECTED' || loadingAction === 'REJECT'
              }
            >
              {loadingAction === 'REJECT' && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Reject
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                setLoadingAction('SHORTLIST');
                await acceptCandidateApplication(candidate._id);
                toast.success(
                  `Candidate Shortlisted ${candidate.student?.fullName}`,
                );
                setLoadingAction(null);
              }}
              disabled={
                candidate.status === 'INTERVIEW' ||
                loadingAction === 'SHORTLIST'
              }
            >
              {loadingAction === 'SHORTLIST' && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Shortlist
            </Button>
          </>
        }
      />

      {/* --- Preview Modal --- */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-5xl  w-[90vw] sm:max-w-[90vw] lg:max-w-[1200px] h-[90vh] p-0 flex flex-col gap-0 overflow-hidden">
          <div className="p-4 border-b flex gap-2 items-center ">
            <DialogTitle className="text-base font-semibold">
              {previewTitle}
            </DialogTitle>
            <div className="">
              <Button variant="ghost" size="icon" asChild>
                <a href={previewUrl!} target="_blank" rel="noreferrer">
                  <ExternalLink size={18} />
                </a>
              </Button>
            </div>
          </div>

          <div className="flex-1 bg-slate-100">
            {previewUrl && (
              <iframe
                src={`${previewUrl}#view=FitH&embedded=true`}
                className="w-full h-full border-2 border-put-200 "
                title="Document Preview"
              />

              // google docs iframe

              // <iframe
              //   src={`https://docs.google.com/viewer?url=${encodeURIComponent(previewUrl)}&embedded=true`}
              //   className="w-full h-full border-none"
              //   title="Document Preview"
              // />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
