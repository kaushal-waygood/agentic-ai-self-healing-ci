import { Mail, Phone, Calendar, Briefcase, FileText } from 'lucide-react';
import { CommonDetailsModal } from '@/components/common/CommonDetailsModal';
import { Button } from '@/components/ui/button';

export function CandidateModal({ candidate, open, onOpenChange }: any) {
  if (!candidate) return null;

  const candidateDetails = [
    { icon: Mail, label: 'Email', value: candidate.student?.email },
    { icon: Phone, label: 'Phone', value: candidate.student?.phone },
    {
      icon: Calendar,
      label: 'Applied On',
      value: new Date(candidate.appliedAt).toLocaleDateString('en-GB'),
    },
    { icon: Briefcase, label: 'Method', value: candidate.applicationMethod },
  ];

  return (
    <CommonDetailsModal
      open={open}
      onOpenChange={onOpenChange}
      title={candidate.student?.fullName}
      description={`Application ID: ${candidate.applicationId}`}
      badgeContent={candidate.student?.fullName?.charAt(0)}
      details={candidateDetails}
      sections={
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <FileText size={16} className="text-indigo-600" /> Documents
          </h4>
          <div className="p-4 border rounded-xl bg-slate-50 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Resume / CV</p>
              <p className="text-xs text-slate-400">PDF/Docx</p>
            </div>
            <Button size="sm" variant="outline" asChild className="bg-white">
              <a href={candidate.cvLink} target="_blank">
                View File
              </a>
            </Button>
          </div>
        </div>
      }
      footerActions={
        <>
          <Button variant="destructive" size="sm">
            Reject
          </Button>
          <Button variant="outline" size="sm">
            Shortlist
          </Button>
        </>
      }
    />
  );
}
