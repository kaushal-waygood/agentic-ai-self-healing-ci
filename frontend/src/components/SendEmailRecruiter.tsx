import React, { FC, useState, useEffect } from 'react';
import {
  Loader2,
  Search,
  Sparkles,
  Mail,
  FileText,
  X,
  Plus,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScheduledSendOptions {
  /** e.g. "2025-06-10T09:00:00[Asia/Kolkata]" — backend resolves to UTC */
  scheduledAt: string;
  /** IANA tz name e.g. "Asia/Kolkata" */
  timezone: string;
  /** Human label e.g. "UTC+5:30 IST" */
  timezoneLabel: string;
}

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
  /**
   * Optional: implement on the parent to enqueue a delayed send.
   * If not provided the "Schedule Send" button is hidden.
   */
  handleScheduledSend?: (options: ScheduledSendOptions) => void | Promise<void>;
  companyName: string;
  cvFileName?: string;
  showFindEmail: boolean;
  handleFindEmail: () => void;
  isFindingEmail: boolean;
  canGenerateDraft: boolean;
  handleGenerateEmailDraft: () => void;
  isGeneratingDraft: boolean;
  onCoverLetterChange?: (content: string) => void;
}

// ─── Timezone list ────────────────────────────────────────────────────────────

const TIMEZONES = [
  { label: 'UTC+5:30 IST', iana: 'Asia/Kolkata' },
  { label: 'UTC+0:00 GMT', iana: 'Europe/London' },
  { label: 'UTC-5:00 EST', iana: 'America/New_York' },
  { label: 'UTC-6:00 CST', iana: 'America/Chicago' },
  { label: 'UTC-7:00 MST', iana: 'America/Denver' },
  { label: 'UTC-8:00 PST', iana: 'America/Los_Angeles' },
  { label: 'UTC+1:00 CET', iana: 'Europe/Paris' },
  { label: 'UTC+8:00 SGT', iana: 'Asia/Singapore' },
  { label: 'UTC+9:00 JST', iana: 'Asia/Tokyo' },
  { label: 'UTC+10:00 AEST', iana: 'Australia/Sydney' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, '0');

const dateStr = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const nextMondayStr = () => {
  const d = new Date();
  const dow = d.getDay();
  d.setDate(d.getDate() + (dow === 0 ? 1 : 8 - dow));
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const QUICK_PICKS = [
  { label: 'Tomorrow 9 am', getDate: () => dateStr(1), time: '09:00' },
  { label: 'Tomorrow 2 pm', getDate: () => dateStr(1), time: '14:00' },
  { label: 'Mon 9 am', getDate: () => nextMondayStr(), time: '09:00' },
  { label: 'Next week', getDate: () => dateStr(7), time: '09:00' },
];

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatPreview(date: string, time: string, tzLabel: string): string {
  if (!date || !time) return '';
  const [y, mo, dy] = date.split('-').map(Number);
  const [hr, mn] = time.split(':').map(Number);
  const d = new Date(y, mo - 1, dy);
  const ampm = hr >= 12 ? 'pm' : 'am';
  const h12 = hr % 12 || 12;
  return `${DAYS[d.getDay()]} ${MONTHS[mo - 1]} ${dy}, ${h12}:${pad(mn)} ${ampm} · ${tzLabel}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

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
  handleScheduledSend,
  companyName,
  cvFileName = 'CV.pdf',
  showFindEmail,
  handleFindEmail,
  isFindingEmail,
  canGenerateDraft,
  handleGenerateEmailDraft,
  isGeneratingDraft,
  onCoverLetterChange,
}) => {
  // ── Cover letter ───────────────────────────────────────────────────────────
  const [coverLetterContent, setCoverLetterContent] = useState('');
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const hasCoverLetter = !!coverLetterContent;

  const updateCoverLetter = (value: string) => {
    setCoverLetterContent(value);
    onCoverLetterChange?.(value);
  };

  const handleGenerateCoverLetter = async () => {
    setIsGeneratingCoverLetter(true);
    await new Promise((r) => setTimeout(r, 1200));
    updateCoverLetter(
      `Dear Hiring Manager,\n\nI am writing to express my strong interest in the position at ${companyName || 'your company'}. With my background and skills, I believe I would be a great fit for this role.\n\nI look forward to discussing how my experience aligns with your needs.\n\nSincerely,\n[Your Name]`,
    );
    setIsGeneratingCoverLetter(false);
  };

  // ── Scheduling ─────────────────────────────────────────────────────────────
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(dateStr(1));
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [selectedTz, setSelectedTz] = useState(TIMEZONES[0]);
  const [isScheduling, setIsScheduling] = useState(false);

  const schedulePreview = scheduleEnabled
    ? formatPreview(scheduleDate, scheduleTime, selectedTz.label)
    : '';

  // Auto-detect local timezone
  useEffect(() => {
    try {
      const localIana = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const match = TIMEZONES.find((tz) => tz.iana === localIana);
      if (match) setSelectedTz(match);
    } catch {
      /* keep default */
    }
  }, []);

  // ── Open / close ───────────────────────────────────────────────────────────
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setCoverLetterContent('');
      onCoverLetterChange?.('');
      setScheduleEnabled(false);
    }
    setIsSendEmailDialogOpen(open);
  };

  // ── Schedule confirm ───────────────────────────────────────────────────────
  const handleScheduleConfirm = async () => {
    if (!handleScheduledSend || !scheduleDate || !scheduleTime) return;
    setIsScheduling(true);
    try {
      await handleScheduledSend({
        scheduledAt: `${scheduleDate}T${scheduleTime}:00[${selectedTz.iana}]`,
        timezone: selectedTz.iana,
        timezoneLabel: selectedTz.label,
      });
      handleOpenChange(false);
    } finally {
      setIsScheduling(false);
    }
  };

  const busy = isSendingEmail || isScheduling;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <AlertDialog open={isSendEmailDialogOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="rounded-2xl max-w-2xl p-0 overflow-hidden gap-0">
        {/* Header */}
        <AlertDialogHeader className="px-6 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Mail className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <AlertDialogTitle className="text-base font-bold text-gray-800 leading-tight">
                Send to Recruiter
              </AlertDialogTitle>
              {sendEmailHint && (
                <AlertDialogDescription className="text-xs text-gray-400 mt-0.5">
                  {sendEmailHint}
                </AlertDialogDescription>
              )}
            </div>
          </div>
        </AlertDialogHeader>

        {/* Body */}
        <div className="px-6 pb-4 space-y-4">
          {/* To */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              To
            </label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="recruiter@company.com"
                value={recruiterEmailInput}
                onChange={(e) => setRecruiterEmailInput(e.target.value)}
                disabled={busy}
                className="flex-1 rounded-xl border-gray-200 focus:border-violet-400 focus:ring-violet-200"
              />
              {showFindEmail && (
                <button
                  type="button"
                  onClick={handleFindEmail}
                  disabled={isFindingEmail || busy}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 transition-colors"
                >
                  {isFindingEmail ? (
                    <Loader2 className="animate-spin" size={15} />
                  ) : (
                    <Search size={15} />
                  )}
                  Find
                </button>
              )}
            </div>
          </div>

          {/* Subject */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Subject
              </label>
              {canGenerateDraft && (
                <button
                  type="button"
                  onClick={handleGenerateEmailDraft}
                  disabled={isGeneratingDraft || busy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isGeneratingDraft ? (
                    <Loader2 className="animate-spin" size={13} />
                  ) : (
                    <Sparkles size={13} />
                  )}
                  Generate Draft
                </button>
              )}
            </div>
            <Input
              placeholder="Job Application"
              value={subjectInput}
              onChange={(e) => setSubjectInput(e.target.value)}
              disabled={busy}
              className="rounded-xl border-gray-200 focus:border-violet-400 focus:ring-violet-200"
            />
          </div>

          {/* Message */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Message
            </label>
            <Textarea
              placeholder="Please find my application attached."
              value={bodyInput}
              onChange={(e) => setBodyInput(e.target.value)}
              disabled={busy}
              rows={4}
              className="resize-y min-h-[100px] rounded-xl border-gray-200 focus:border-violet-400 focus:ring-violet-200"
            />
          </div>
        </div>

        {/* Attachments */}
        <div className="px-6 pb-4">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
            Attachments
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {/* CV chip */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200">
              <div className="w-7 h-7 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                <FileText className="w-3.5 h-3.5 text-red-500" />
              </div>
              <span className="max-w-[140px] truncate text-gray-700 text-xs font-semibold">
                {cvFileName}
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            </div>

            {/* Cover letter chip */}
            {hasCoverLetter && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-50 border border-violet-200">
                <div className="w-7 h-7 rounded-lg bg-violet-100 border border-violet-200 flex items-center justify-center shrink-0">
                  <FileText className="w-3.5 h-3.5 text-violet-600" />
                </div>
                <span className="text-xs font-semibold text-violet-700">
                  Cover Letter
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <button
                  type="button"
                  onClick={() => updateCoverLetter('')}
                  className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-violet-200 transition-colors ml-0.5"
                >
                  <X className="w-3 h-3 text-violet-500" />
                </button>
              </div>
            )}

            {/* Add / generate cover letter */}
            {!hasCoverLetter && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    updateCoverLetter(
                      'Dear Hiring Manager,\n\nI am writing to express my interest in the position.\n\nSincerely,\n[Your Name]',
                    )
                  }
                  disabled={busy || isGeneratingCoverLetter}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-dashed border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Cover Letter
                </button>
                {canGenerateDraft && (
                  <button
                    type="button"
                    onClick={handleGenerateCoverLetter}
                    disabled={busy || isGeneratingCoverLetter}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-sm hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isGeneratingCoverLetter ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    {isGeneratingCoverLetter
                      ? 'Generating…'
                      : 'Generate with AI'}
                  </button>
                )}
              </div>
            )}
          </div>

          {hasCoverLetter && (
            <div className="mt-3">
              <Textarea
                value={coverLetterContent}
                onChange={(e) => updateCoverLetter(e.target.value)}
                rows={5}
                className="resize-y min-h-[120px] rounded-xl border-violet-100 focus:border-violet-400 focus:ring-violet-200 text-sm leading-relaxed bg-violet-50/40"
              />
            </div>
          )}
        </div>

        {/* ── Schedule Send Panel ── */}
        <div className="px-6 pb-4">
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            {/* Toggle row */}
            <button
              type="button"
              onClick={() => setScheduleEnabled((p) => !p)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Clock size={14} className="text-gray-500 shrink-0" />
                <span className="text-sm font-semibold text-gray-700 shrink-0">
                  Schedule send
                </span>
                {scheduleEnabled && schedulePreview && (
                  <span className="text-xs text-blue-600 font-medium ml-1 truncate hidden sm:block">
                    · {schedulePreview}
                  </span>
                )}
              </div>
              {/* Toggle pill */}
              <div
                className={`w-9 h-5 rounded-full relative transition-colors duration-200 shrink-0 ml-2 ${
                  scheduleEnabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${
                    scheduleEnabled ? 'left-[18px]' : 'left-0.5'
                  }`}
                />
              </div>
            </button>

            {/* Expanded fields */}
            {scheduleEnabled && (
              <div className="px-4 pt-3 pb-4 space-y-3 border-t border-gray-100">
                {/* Date / Time / Timezone */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1 block">
                      Date
                    </label>
                    <Input
                      type="date"
                      value={scheduleDate}
                      min={dateStr(0)}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      disabled={busy}
                      className="rounded-lg text-sm w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1 block">
                      Time
                    </label>
                    <Input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      disabled={busy}
                      className="rounded-lg text-sm w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1 block">
                      Timezone
                    </label>
                    <select
                      value={selectedTz.iana}
                      onChange={(e) => {
                        const tz = TIMEZONES.find(
                          (t) => t.iana === e.target.value,
                        );
                        if (tz) setSelectedTz(tz);
                      }}
                      disabled={busy}
                      className="w-full h-9 rounded-lg border border-gray-200 bg-white px-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-violet-400 focus:border-violet-400"
                    >
                      {TIMEZONES.map((tz) => (
                        <option key={tz.iana} value={tz.iana}>
                          {tz.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quick picks */}
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1.5 block">
                    Quick picks
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {QUICK_PICKS.map((q) => (
                      <button
                        key={q.label}
                        type="button"
                        onClick={() => {
                          setScheduleDate(q.getDate());
                          setScheduleTime(q.time);
                        }}
                        disabled={busy}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50"
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview banner */}
                {schedulePreview && (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-blue-50 border border-blue-100">
                    <Clock size={13} className="text-blue-500 shrink-0" />
                    <p className="text-xs text-blue-700 font-medium">
                      Will be sent on {schedulePreview}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-3 border-t border-gray-100 flex items-center justify-end gap-2 bg-gray-50/60">
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            disabled={busy}
            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 font-semibold text-gray-700 text-sm transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          {/* Schedule Send button — only when toggled on and handler exists */}
          {scheduleEnabled && handleScheduledSend && (
            <button
              type="button"
              onClick={handleScheduleConfirm}
              disabled={busy || !scheduleDate || !scheduleTime}
              className="flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isScheduling ? (
                <>
                  <Loader2 className="animate-spin" size={15} /> Scheduling…
                </>
              ) : (
                <>
                  <Clock size={15} /> Schedule Send
                </>
              )}
            </button>
          )}

          {/* Send Now — always visible */}
          <button
            type="button"
            onClick={handleSendEmailConfirm}
            disabled={busy}
            className="flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSendingEmail ? (
              <>
                <Loader2 className="animate-spin" size={15} /> Sending…
              </>
            ) : (
              <>
                <Mail size={15} /> Send Now
              </>
            )}
          </button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SendEmailDialog;
