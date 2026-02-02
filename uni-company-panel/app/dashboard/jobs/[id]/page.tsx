'use client';

import { useJobStore } from '@/store/job.store';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  MousePointerClick,
  FileText,
  MapPin,
  Briefcase,
  Pencil,
  X,
  Save,
  CheckCircle2,
  HelpCircle,
  ClipboardList,
  Mail,
  Globe,
  Banknote,
  Building2,
  ArrowRight,
  Edit,
  Plus,
  Trash2,
} from 'lucide-react';
import { timeAgo } from '@/utils/TimeAgo';
import QuillJs from '@/components/rich-text/QuillJs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const Page = () => {
  const { id } = useParams<{ id: string }>();
  const { job, getSingleHostedJobs, updateJobDescription, loading } =
    useJobStore();
  const router = useRouter();

  // --- EDIT MODES ---
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isEditingRequirements, setIsEditingRequirements] = useState(false);
  const [isEditingQuestions, setIsEditingQuestions] = useState(false);

  // --- DRAFT STATES ---
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [draftResponsibilities, setDraftResponsibilities] = useState('');
  const [draftQualifications, setDraftQualifications] = useState('');
  const [draftQuestions, setDraftQuestions] = useState<any[]>([]);
  const [draftDetails, setDraftDetails] = useState({
    salary: { min: 0, max: 0, period: 'YEARLY' },
    remote: false,
    location: { city: '', state: '' },
    resumeRequired: false,
    jobTypes: [],
  });

  useEffect(() => {
    if (!id) return;
    getSingleHostedJobs(id);
  }, [id, getSingleHostedJobs]);

  useEffect(() => {
    if (job) {
      setDraftTitle(job.title || '');
      setDraftDescription(job.description || '');
      setDraftResponsibilities(job.responsibilities?.join('\n') || '');
      setDraftQualifications(job.qualifications?.join('\n') || '');
      setDraftQuestions(job.screeningQuestions || []);
      setDraftDetails({
        salary: job.salary || { min: 0, max: 0, period: 'YEARLY' },
        remote: job.remote || false,
        location: job.location || { city: '', state: '' },
        resumeRequired: job.resumeRequired || false,
        jobTypes: job.jobTypes || [],
      });
    }
  }, [job]);

  if (loading && !job)
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  if (!job)
    return <div className="p-8 text-center text-gray-500">Job not found</div>;

  // --- SAVE HANDLERS ---
  const handleSaveTitle = async () => {
    if (draftTitle.trim()) {
      await updateJobDescription(job._id, { title: draftTitle });
      setIsEditingTitle(false);
    }
  };
  const handleSaveDescription = async () => {
    await updateJobDescription(job._id, { description: draftDescription });
    setIsEditingDescription(false);
  };
  const handleSaveDetails = async () => {
    await updateJobDescription(job._id, {
      salary: draftDetails.salary,
      remote: draftDetails.remote,
      location: draftDetails.location,
      resumeRequired: draftDetails.resumeRequired,
    });
    setIsEditingDetails(false);
  };
  const handleSaveRequirements = async () => {
    const respArray = draftResponsibilities
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const qualArray = draftQualifications
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    await updateJobDescription(job._id, {
      responsibilities: respArray,
      qualifications: qualArray,
    });
    setIsEditingRequirements(false);
  };

  const handleSaveQuestions = async () => {
    await updateJobDescription(job._id, { screeningQuestions: draftQuestions });
    setIsEditingQuestions(false);
  };

  // --- QUESTION HANDLERS ---
  const addQuestion = () => {
    setDraftQuestions([
      ...draftQuestions,
      { question: '', type: 'SHORT_ANSWER', required: true },
    ]);
  };

  const updateQuestion = (index: number, fields: any) => {
    const updated = [...draftQuestions];
    updated[index] = { ...updated[index], ...fields };
    setDraftQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setDraftQuestions(draftQuestions.filter((_, i) => i !== index));
  };

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
    <div className="p-6 mx-auto space-y-8 min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  className="text-3xl font-bold text-blue-500 border-b-2 border-blue-500 outline-none bg-transparent"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSaveTitle}
                  className="text-green-600"
                >
                  <CheckCircle2 className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingTitle(false)}
                  className="text-red-500"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-blue-500">
                  {job.title}
                </h1>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingTitle(true)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </>
            )}
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
            <Button variant="link" className="p-0 h-auto text-gray-500" asChild>
              <Link
                href={`https://zobsai.com/jobs/${job.slug}`}
                target="_blank"
              >
                View on Page <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex gap-4">
          <StatBadge
            label="Views"
            value={job.jobViews}
            icon={<MousePointerClick className="w-4 h-4" />}
          />
          <StatBadge
            label="Applied"
            value={job.appliedCount}
            icon={<FileText className="w-4 h-4" />}
            onClick={() =>
              router.push(`/dashboard/jobs/${job.slug}/applications`)
            }
            clickable
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* DESCRIPTION */}
          <div className="bg-white border border-gray-300 shadow-sm rounded-lg overflow-hidden">
            <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" /> Job Description
              </h2>
              {!isEditingDescription ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingDescription(true)}
                  className="text-blue-600"
                >
                  <Pencil size={14} className="mr-1.5" /> Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingDescription(false)}
                    className="text-gray-500"
                  >
                    <X size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveDescription}
                    className="text-green-600"
                  >
                    <Save size={16} />
                  </Button>
                </div>
              )}
            </div>
            <div className="p-6">
              {!isEditingDescription ? (
                <div
                  className="prose prose-blue max-w-none text-gray-600"
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              ) : (
                <div className="min-h-[400px]">
                  <QuillJs
                    content={draftDescription}
                    onContentChange={setDraftDescription}
                  />
                </div>
              )}
            </div>
          </div>

          {/* REQUIREMENTS LISTS */}
          <div className="bg-white border border-gray-300 shadow-sm rounded-lg overflow-hidden">
            <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-blue-500" /> Requirements
                & Qualifications
              </h2>
              {!isEditingRequirements ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingRequirements(true)}
                  className="text-blue-600"
                >
                  <Pencil size={14} className="mr-1.5" /> Edit Lists
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingRequirements(false)}
                    className="text-gray-500"
                  >
                    <X size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveRequirements}
                    className="text-green-600"
                  >
                    <Save size={16} />
                  </Button>
                </div>
              )}
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Responsibilities
                </h4>
                {!isEditingRequirements ? (
                  <ul className="space-y-2">
                    {job.responsibilities?.map((item: string, i: number) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-600"
                      >
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />{' '}
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <textarea
                    className="w-full min-h-[200px] p-3 text-sm border rounded focus:ring-1 ring-blue-500 outline-none"
                    value={draftResponsibilities}
                    onChange={(e) => setDraftResponsibilities(e.target.value)}
                    placeholder="One per line..."
                  />
                )}
              </div>
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Qualifications
                </h4>
                {!isEditingRequirements ? (
                  <ul className="space-y-2">
                    {job.qualifications?.map((item: string, i: number) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-600"
                      >
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />{' '}
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <textarea
                    className="w-full min-h-[200px] p-3 text-sm border rounded focus:ring-1 ring-green-500 outline-none"
                    value={draftQualifications}
                    onChange={(e) => setDraftQualifications(e.target.value)}
                    placeholder="One per line..."
                  />
                )}
              </div>
            </div>
          </div>

          {/* SCREENING QUESTIONS */}
          <div className="bg-white border border-gray-300 shadow-sm rounded-lg overflow-hidden">
            <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-500" /> Screening
                Questions
              </h2>
              {!isEditingQuestions ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingQuestions(true)}
                  className="text-blue-600"
                >
                  <Pencil size={14} className="mr-1.5" /> Edit Questions
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingQuestions(false)}
                    className="text-gray-500"
                  >
                    <X size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveQuestions}
                    className="text-green-600"
                  >
                    <Save size={16} />
                  </Button>
                </div>
              )}
            </div>
            <div className="p-6 space-y-4">
              {!isEditingQuestions ? (
                draftQuestions.length > 0 ? (
                  draftQuestions.map((q, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100"
                    >
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold shrink-0">
                        {i + 1}
                      </span>
                      <div className="space-y-1">
                        <p className="font-medium text-gray-800">
                          {q.question}
                        </p>
                        <div className="flex gap-3 text-xs text-gray-500">
                          <span className="uppercase bg-gray-200 px-2 py-0.5 rounded text-[10px] tracking-wide">
                            {q.type.replace('_', ' ')}
                          </span>
                          {q.required && (
                            <span className="text-red-500 font-medium">
                              Required
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic text-center py-4">
                    No screening questions added.
                  </p>
                )
              ) : (
                <div className="space-y-4">
                  {draftQuestions.map((q, i) => (
                    <div
                      key={i}
                      className="p-4 border rounded-lg bg-white shadow-sm space-y-3 relative group"
                    >
                      <button
                        onClick={() => removeQuestion(i)}
                        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-400">
                          Question {i + 1}
                        </label>
                        <input
                          type="text"
                          className="w-full p-2 border rounded text-sm"
                          value={q.question}
                          onChange={(e) =>
                            updateQuestion(i, { question: e.target.value })
                          }
                          placeholder="Enter question text..."
                        />
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-gray-400">
                            Response Type
                          </label>
                          <select
                            className="p-2 border rounded text-sm bg-white min-w-[140px]"
                            value={q.type}
                            onChange={(e) =>
                              updateQuestion(i, { type: e.target.value })
                            }
                          >
                            <option value="text">Short Answer</option>
                            <option value="boolean">Yes/No</option>
                            <option value="number">Number</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                          <input
                            type="checkbox"
                            id={`req-${i}`}
                            checked={q.required}
                            onChange={(e) =>
                              updateQuestion(i, { required: e.target.checked })
                            }
                          />
                          <label
                            htmlFor={`req-${i}`}
                            className="text-xs font-medium text-gray-600"
                          >
                            Required field
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-dashed border-gray-300 text-gray-500 hover:text-blue-500"
                    onClick={addQuestion}
                  >
                    <Plus size={16} className="mr-2" /> Add New Question
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-300 shadow-sm rounded-lg p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Job Details</h3>
              {!isEditingDetails ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingDetails(true)}
                >
                  <Pencil className="w-4 h-4 text-blue-500" />
                </Button>
              ) : (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveDetails}
                    className="text-green-600"
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingDetails(false)}
                    className="text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
            {!isEditingDetails ? (
              <div className="space-y-6">
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
                      : `${job.location?.city || ''}, ${job.location?.state || job.country || ''}`
                  }
                />
                <div className="flex items-center justify-between text-sm pt-2">
                  <span className="text-gray-500">Resume Required?</span>
                  <Badge variant={job.resumeRequired ? 'default' : 'secondary'}>
                    {job.resumeRequired ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase">
                    Salary Range & Period
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      className="w-full p-2 border rounded text-sm"
                      value={draftDetails.salary.min}
                      onChange={(e) =>
                        setDraftDetails({
                          ...draftDetails,
                          salary: {
                            ...draftDetails.salary,
                            min: Number(e.target.value),
                          },
                        })
                      }
                    />
                    <input
                      type="number"
                      className="w-full p-2 border rounded text-sm"
                      value={draftDetails.salary.max}
                      onChange={(e) =>
                        setDraftDetails({
                          ...draftDetails,
                          salary: {
                            ...draftDetails.salary,
                            max: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                  <select
                    className="w-full p-2 border rounded text-sm bg-white"
                    value={draftDetails.salary.period}
                    onChange={(e) =>
                      setDraftDetails({
                        ...draftDetails,
                        salary: {
                          ...draftDetails.salary,
                          period: e.target.value,
                        },
                      })
                    }
                  >
                    <option value="YEARLY">Yearly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="HOURLY">Hourly</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase">
                    Location
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="remote-edit"
                      checked={draftDetails.remote}
                      onChange={(e) =>
                        setDraftDetails({
                          ...draftDetails,
                          remote: e.target.checked,
                        })
                      }
                    />
                    <label htmlFor="remote-edit" className="text-sm">
                      Remote Work
                    </label>
                  </div>
                  {!draftDetails.remote && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="City"
                        className="w-full p-2 border rounded text-sm"
                        value={draftDetails.location.city}
                        onChange={(e) =>
                          setDraftDetails({
                            ...draftDetails,
                            location: {
                              ...draftDetails.location,
                              city: e.target.value,
                            },
                          })
                        }
                      />
                      <input
                        type="text"
                        placeholder="State"
                        className="w-full p-2 border rounded text-sm"
                        value={draftDetails.location.state}
                        onChange={(e) =>
                          setDraftDetails({
                            ...draftDetails,
                            location: {
                              ...draftDetails.location,
                              state: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between p-2 border rounded bg-gray-50">
                  <span className="text-sm font-medium">Require Resume?</span>
                  <input
                    type="checkbox"
                    checked={draftDetails.resumeRequired}
                    onChange={(e) =>
                      setDraftDetails({
                        ...draftDetails,
                        resumeRequired: e.target.checked,
                      })
                    }
                  />
                </div>
              </div>
            )}
            <Separator />
            <div>
              <h4 className="text-xs font-semibold uppercase text-gray-400 mb-3 tracking-wider">
                Application Method
              </h4>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {job.applyMethod?.method === 'EMAIL' ? (
                  <Mail className="w-5 h-5 text-blue-500" />
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
          </div>
        </div>
      </div>
    </div>
  );
};

const StatBadge = ({ label, value, icon, onClick, clickable }: any) => (
  <div
    onClick={onClick}
    className={`flex flex-col items-center justify-center bg-white px-4 py-2 rounded-lg border border-gray-300 shadow-sm min-w-[100px] ${clickable ? 'cursor-pointer hover:bg-gray-50 transition' : ''}`}
  >
    <div className="text-blue-600 mb-1">{icon}</div>
    <span className="text-lg font-bold text-gray-800 leading-none">
      {value ?? 0}
    </span>
    <span className="text-[10px] uppercase text-gray-400 font-bold mt-1 tracking-wider">
      {label}
    </span>
  </div>
);

const SidebarItem = ({ icon, label, value }: any) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5">{icon}</div>
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-900 capitalize">{value}</p>
    </div>
  </div>
);

export default Page;
