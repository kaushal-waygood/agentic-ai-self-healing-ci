'use client';

import { useJobStore } from '@/store/job.store';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Eye,
  MousePointerClick,
  FileText,
  MapPin,
  Briefcase,
  Clock,
  Pencil,
  X,
  Save,
  CheckCircle2,
  HelpCircle,
  ClipboardList,
  FileUp,
  Mail,
  Globe,
  Banknote,
  Building2,
  CalendarDays,
} from 'lucide-react';
import { timeAgo } from '@/utils/TimeAgo';
import QuillJs from '@/components/rich-text/QuillJs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { FRONTEND_BASE_URL } from '@/services/api';

const Page = () => {
  const { id } = useParams<{ id: string }>();
  const { job, getSingleHostedJobs, updateJobDescription, loading } =
    useJobStore();

  const [isEditing, setIsEditing] = useState(false);
  const [draftDescription, setDraftDescription] = useState('');

  useEffect(() => {
    if (!id) return;
    getSingleHostedJobs(id);
  }, [id, getSingleHostedJobs]);

  useEffect(() => {
    if (job?.description) {
      setDraftDescription(job.description);
    }
  }, [job?.description]);

  if (loading)
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-purple-500 rounded-full border-t-transparent"></div>
      </div>
    );
  if (!job)
    return <div className="p-8 text-center text-gray-500">Job not found</div>;

  const handleSave = async () => {
    await updateJobDescription(job._id, draftDescription);
    setIsEditing(false);
  };

  // Helper to format currency
  const formatSalary = (min?: number, max?: number, period?: string) => {
    if (!min && !max) return 'Not Disclosed';
    const p = period ? `/${period.toLowerCase()}` : '';
    if (min && max)
      return `$${min.toLocaleString()} - $${max.toLocaleString()}${p}`;
    if (min) return `From $${min.toLocaleString()}${p}`;
    if (max) return `Up to $${max.toLocaleString()}${p}`;
    return 'Not Disclosed';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-gray-50/30 min-h-screen">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
            <Badge
              variant={job.isActive ? 'default' : 'destructive'}
              className={
                job.isActive
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : ''
              }
            >
              {job.isActive ? 'Active' : 'Closed'}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Building2 className="w-4 h-4" />
            <span className="font-medium">{job.company}</span>
            <span>•</span>
            <span className="text-sm">Posted {timeAgo(job.createdAt)}</span>
          </div>
        </div>

        <Link href={`${FRONTEND_BASE_URL}/jobs/${job.slug}`} target="_blank">
          {job.slug}
        </Link>

        {/* KPI Stats */}
        <div className="flex gap-4">
          <StatBadge
            label="Impressions"
            value={job.impressions}
            icon={<Eye className="w-4 h-4" />}
          />
          <StatBadge
            label="Views"
            value={job.jobViews}
            icon={<MousePointerClick className="w-4 h-4" />}
          />
          <StatBadge
            label="Applied"
            value={job.appliedCount}
            icon={<FileText className="w-4 h-4" />}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. LEFT COLUMN: MAIN CONTENT */}
        <div className="lg:col-span-2 space-y-8">
          {/* DESCRIPTION */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
            <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-500" /> Job Description
              </h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 text-sm text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-md transition-colors font-medium"
                >
                  <Pencil size={14} /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setDraftDescription(job.description);
                      setIsEditing(false);
                    }}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-md"
                  >
                    <X size={16} />
                  </button>
                  <button
                    onClick={handleSave}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                  >
                    <Save size={16} />
                  </button>
                </div>
              )}
            </div>
            <div className="p-6">
              {!isEditing ? (
                <div
                  className="prose prose-purple max-w-none text-gray-600"
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              ) : (
                <QuillJs
                  content={draftDescription}
                  onContentChange={setDraftDescription}
                />
              )}
            </div>
          </div>

          {/* REQUIREMENTS LISTS */}
          {(job.responsibilities?.length > 0 ||
            job.qualifications?.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {job.responsibilities?.length > 0 && (
                <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-6">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-500" />{' '}
                    Responsibilities
                  </h3>
                  <ul className="space-y-2">
                    {job.responsibilities.map((item: string, i: number) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-600"
                      >
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />{' '}
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {job.qualifications?.length > 0 && (
                <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-6">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />{' '}
                    Qualifications
                  </h3>
                  <ul className="space-y-2">
                    {job.qualifications.map((item: string, i: number) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-600"
                      >
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />{' '}
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* SCREENING QUESTIONS */}
          {job.screeningQuestions && job.screeningQuestions.length > 0 && (
            <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
              <div className="p-5 border-b border-gray-50 bg-purple-50/30">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-purple-600" /> Screening
                  Questions
                </h2>
              </div>
              <div className="p-6 grid gap-4">
                {job.screeningQuestions.map((q: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100"
                  >
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    <div className="space-y-1">
                      <p className="font-medium text-gray-800">{q.question}</p>
                      <div className="flex gap-3 text-xs text-gray-500">
                        <span className="uppercase bg-gray-200 px-2 py-0.5 rounded text-[10px] tracking-wide">
                          {q.type}
                        </span>
                        {q.required && (
                          <span className="text-red-500 font-medium">
                            Required
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CANDIDATE ASSIGNMENT */}
          {job.assignment && job.assignment.isEnabled && (
            <div className="bg-white border border-blue-100 shadow-sm rounded-xl overflow-hidden">
              <div className="p-5 border-b border-blue-50 bg-blue-50/30">
                <h2 className="font-semibold text-blue-900 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-blue-600" /> Candidate
                  Assignment
                </h2>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-medium text-gray-500">
                    Submission Type:
                  </span>
                  <Badge
                    variant="outline"
                    className="border-blue-200 text-blue-700 bg-blue-50"
                  >
                    {job.assignment.type === 'MANUAL'
                      ? 'Written Answer'
                      : 'File Upload'}
                  </Badge>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {job.assignment.instruction || 'No instructions provided.'}
                  </p>
                </div>

                {job.assignment.fileUrl && (
                  <div className="mt-4 flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition cursor-pointer">
                    <FileUp className="w-8 h-8 text-red-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Assignment Brief.pdf
                      </p>
                      <p className="text-xs text-gray-500">Click to download</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. RIGHT COLUMN: META SIDEBAR */}
        <div className="space-y-6">
          {/* Info Card */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-6 space-y-6">
            <h3 className="font-semibold text-gray-800 mb-4">Job Details</h3>

            <SidebarItem
              icon={<Briefcase className="w-5 h-5 text-gray-400" />}
              label="Job Type"
              value={
                job.jobTypes
                  ?.map((t: string) => t.replace('_', ' '))
                  .join(', ') || 'Not specified'
              }
            />

            <SidebarItem
              icon={<Banknote className="w-5 h-5 text-gray-400" />}
              label="Salary"
              value={formatSalary(
                job.salary?.min,
                job.salary?.max,
                job.salary?.period,
              )}
            />

            <SidebarItem
              icon={<MapPin className="w-5 h-5 text-gray-400" />}
              label="Location"
              value={
                job.remote
                  ? 'Remote'
                  : `${job.location?.city || ''}, ${
                      job.location?.state || job.country || ''
                    }`
              }
            />

            {job.jobTypes?.includes('CONTRACT') &&
              job.contractLength?.value && (
                <SidebarItem
                  icon={<CalendarDays className="w-5 h-5 text-gray-400" />}
                  label="Contract Duration"
                  value={`${
                    job.contractLength.value
                  } ${job.contractLength.type.toLowerCase()}`}
                />
              )}

            <Separator />

            <div>
              <h4 className="text-xs font-semibold uppercase text-gray-400 mb-3 tracking-wider">
                Application Method
              </h4>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {job.applyMethod?.method === 'EMAIL' ? (
                  <Mail className="w-5 h-5 text-purple-500" />
                ) : (
                  <Globe className="w-5 h-5 text-blue-500" />
                )}
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {job.applyMethod?.method === 'EMAIL'
                      ? job.applyMethod.email
                      : 'External URL'}
                  </p>
                  <p className="text-xs text-gray-500">
                    via{' '}
                    {job.applyMethod?.method === 'EMAIL' ? 'Email' : 'Website'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm pt-2">
              <span className="text-gray-500">Resume Required?</span>
              <Badge variant={job.resumeRequired ? 'default' : 'secondary'}>
                {job.resumeRequired ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>

          {/* Tags Card */}
          {job.tags && job.tags.length > 0 && (
            <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag: string, i: number) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full border border-gray-200 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* --- Helpers --- */

const StatBadge = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm min-w-[80px]">
    <div className="text-purple-600 mb-1">{icon}</div>
    <span className="text-lg font-bold text-gray-800 leading-none">
      {value ?? 0}
    </span>
    <span className="text-[10px] uppercase text-gray-400 font-semibold tracking-wide">
      {label}
    </span>
  </div>
);

const SidebarItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5">{icon}</div>
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-900 capitalize">{value}</p>
    </div>
  </div>
);

export default Page;
