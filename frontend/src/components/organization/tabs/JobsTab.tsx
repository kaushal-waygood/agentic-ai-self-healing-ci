'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Edit,
  Briefcase,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  Plus,
  Sparkles,
  Power,
} from 'lucide-react';
import {
  getAllJobPostsByOrgAdminRequest,
  updateJobStatusRequest,
} from '@/redux/reducers/jobReducer';
import { RootState } from '@/redux/rootReducer';
import { formatDate } from '@/utils/formatDate';

export default function JobsTab() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { jobs: jobsList } = useSelector((state: RootState) => state.jobs);

  useEffect(() => {
    dispatch(getAllJobPostsByOrgAdminRequest());
  }, [dispatch]);

  const handleStatusToggle = (id: string) => {
    if (confirm("Are you sure you want to update this job's status?")) {
      dispatch(updateJobStatusRequest(id));
    }
  };

  // Theme Constants (Matching the previous component)
  const THEME = {
    glassCard:
      'bg-white/90 backdrop-blur-xl border-0 shadow-2xl shadow-purple-500/10',
    gradientText:
      'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent',
    gradientBtn:
      'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/30 border-0',
    hoverRow:
      'hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-colors duration-200',
  };

  return (
    <Card className={`${THEME.glassCard} overflow-hidden`}>
      <CardHeader className="space-y-4 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                <Briefcase className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle
                className={`text-2xl font-bold tracking-tight ${THEME.gradientText}`}
              >
                Job Postings
              </CardTitle>
            </div>
            <CardDescription className="text-gray-500 ml-1">
              Manage your active listings and track their status.
            </CardDescription>
          </div>

          <Button
            onClick={() => router.push('/dashboard/posted-jobs/new')}
            className={`${THEME.gradientBtn} transition-all duration-300 transform hover:scale-105`}
          >
            <Plus className="mr-2 h-4 w-4" /> Post New Job
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="border-gray-100 hover:bg-transparent">
                <TableHead className="font-semibold text-gray-600 pl-6">
                  Job Title
                </TableHead>
                <TableHead className="font-semibold text-gray-600">
                  Location
                </TableHead>
                <TableHead className="font-semibold text-gray-600">
                  Date Posted
                </TableHead>
                <TableHead className="font-semibold text-gray-600">
                  Status
                </TableHead>
                <TableHead className="text-right font-semibold text-gray-600 pr-6">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobsList.map((job) => (
                <TableRow
                  key={job._id}
                  className={`${THEME.hoverRow} border-gray-100 cursor-pointer group`}
                >
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-gray-900">
                        {job.title}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {job.location.city}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {formatDate(job.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {job.isActive ? (
                      <Badge className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200 hover:bg-green-100 px-3 py-1">
                        <CheckCircle2 className="w-3 h-3 mr-1.5" /> Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-gray-100 text-gray-500 hover:bg-gray-200 px-3 py-1"
                      >
                        <XCircle className="w-3 h-3 mr-1.5" /> Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-purple-600 hover:bg-purple-50"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => handleStatusToggle(job._id)}
                          className="cursor-pointer focus:bg-purple-50 focus:text-purple-700 mb-1"
                        >
                          <Power
                            className={`mr-2 h-4 w-4 ${
                              job.isActive
                                ? 'text-orange-500'
                                : 'text-green-500'
                            }`}
                          />
                          {job.isActive ? 'Deactivate Job' : 'Activate Job'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/organization/jobs/${job._id}/edit`)
                          }
                          className="cursor-pointer focus:bg-blue-50 focus:text-blue-700"
                        >
                          <Edit className="mr-2 h-4 w-4 text-blue-500" /> Edit
                          Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}

              {jobsList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 blur-xl opacity-20"></div>
                        <div className="h-16 w-16 bg-white rounded-2xl shadow-sm flex items-center justify-center relative z-10 border border-gray-100">
                          <Briefcase className="h-8 w-8 text-gray-300" />
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mt-2">
                        No jobs posted yet
                      </h3>
                      <p className="text-gray-500 text-sm max-w-xs mb-4">
                        Create your first job listing to start finding great
                        candidates.
                      </p>
                      <Button
                        onClick={() => router.push('/organization/new-job')}
                        variant="outline"
                        className="border-dashed border-2 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50"
                      >
                        <Sparkles className="mr-2 h-4 w-4" /> Create First Job
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
