'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMultiCompanyStore } from '@/store/multi-company.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Briefcase,
  Users,
  BarChart3,
  Settings,
  FileText,
  Calendar,
  Bell,
  Plus,
  ArrowRight,
  Building2,
  Mail,
  Phone,
  MapPin,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  TrendingUp,
  Clock,
  UserCheck,
  Download,
} from 'lucide-react';
import Link from 'next/link';

export default function CompanyDashboardPage() {
  const { id } = useParams();
  const router = useRouter();
  const { companies } = useMultiCompanyStore();

  const company = companies.find(c => c._id === id);

  if (!company) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold">Company not found</h1>
        <Button onClick={() => router.push('/dashboard/companies')} className="mt-4">
          Back to Companies
        </Button>
      </div>
    );
  }

  // Mock data - replace with actual API calls
  const stats = {
    activeJobs: company.jobCount || 0,
    teamMembers: company.memberCount || 0,
    totalCandidates: 142,
    interviewsScheduled: 8,
    applicationsThisWeek: 12,
    hiredThisMonth: 4,
  };

  const recentActivity = [
    { action: 'Job Posted', details: 'Senior Developer', user: 'John', time: '2 hours ago' },
    { action: 'Interview Scheduled', details: 'With Sarah', user: 'Mike', time: 'Yesterday' },
    { action: 'Candidate Hired', details: 'Frontend Role', user: 'Alice', time: '2 days ago' },
    { action: 'Team Member Added', details: 'New Recruiter', user: 'Admin', time: '3 days ago' },
  ];

  const quickActions = [
    {
      title: 'Post Job',
      icon: <Briefcase className="w-5 h-5" />,
      href: '/dashboard/post-job',
      bgColor: 'bg-gradient-to-br from-blue-50 to-white',
      iconBg: 'bg-white',
      borderColor: 'border-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Invite Team',
      icon: <Users className="w-5 h-5" />,
      href: '/dashboard/team',
      bgColor: 'bg-gradient-to-br from-purple-50 to-white',
      iconBg: 'bg-white',
      borderColor: 'border-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      title: 'View Candidates',
      icon: <UserCheck className="w-5 h-5" />,
      href: '/dashboard/candidates',
      bgColor: 'bg-gradient-to-br from-green-50 to-white',
      iconBg: 'bg-white',
      borderColor: 'border-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      href: '#',
      bgColor: 'bg-gradient-to-br from-amber-50 to-white',
      iconBg: 'bg-white',
      borderColor: 'border-amber-100',
      iconColor: 'text-amber-600'
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {company.logo ? (
            <img
              src={company.logo}
              alt={company.name}
              className="w-16 h-16 rounded-lg object-cover border"
            />
          ) : (
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold">{company.name} Dashboard</h1>
            <div className="flex items-center gap-3 mt-1">
              <Badge className="bg-blue-100 text-blue-800">{company.industry}</Badge>
              <Badge className={company.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {company.status}
              </Badge>
              <div className="text-sm text-gray-500">
                Created: {new Date(company.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/dashboard/companies/${id}`)}>
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
          <Button variant="outline" onClick={() => router.push(`/dashboard/companies/${id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Quick Action
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          title="Active Jobs"
          value={stats.activeJobs}
          icon={<Briefcase className="w-5 h-5" />}
          trend="+2"
          trendLabel="this month"
          color="blue"
        />
        <StatCard
          title="Team Members"
          value={stats.teamMembers}
          icon={<Users className="w-5 h-5" />}
          trend="+1"
          trendLabel="recently"
          color="green"
        />
        <StatCard
          title="Candidates"
          value={stats.totalCandidates}
          icon={<UserCheck className="w-5 h-5" />}
          trend="+12"
          trendLabel="this week"
          color="purple"
        />
        <StatCard
          title="Interviews"
          value={stats.interviewsScheduled}
          icon={<Calendar className="w-5 h-5" />}
          trend="3"
          trendLabel="scheduled"
          color="orange"
        />
        <StatCard
          title="Applications"
          value={stats.applicationsThisWeek}
          icon={<FileText className="w-5 h-5" />}
          trend="New"
          trendLabel="this week"
          color="pink"
        />
        <StatCard
          title="Hired"
          value={stats.hiredThisMonth}
          icon={<TrendingUp className="w-5 h-5" />}
          trend="+4"
          trendLabel="this month"
          color="teal"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Actions & Info */}
        <div className="space-y-6">
          {/* Quick Actions */}
          {/* Quick Actions - UPDATED UI */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action, idx) => (
                  <Link key={idx} href={action.href}>
                    <div className={`
            p-4 ${action.bgColor} rounded-lg border ${action.borderColor} 
            hover:shadow-md transition-all duration-300 group
          `}>
                      <div className="flex flex-col items-center text-center gap-3">
                        <div className={`
                p-2 ${action.iconBg} rounded-lg shadow-sm border ${action.borderColor}
                group-hover:scale-110 transition-transform duration-300
              `}>
                          <div className={action.iconColor}>
                            {action.icon}
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider group-hover:text-blue-600">
                          {action.title}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Company Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <div className="text-sm">
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium">{company.contactEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <div className="text-sm">
                  <p className="text-gray-500">Phone</p>
                  <p className="font-medium">{company.contactPhone || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <div className="text-sm">
                  <p className="text-gray-500">Location</p>
                  <p className="font-medium">
                    {[company.address.city, company.address.state, company.address.country]
                      .filter(Boolean)
                      .join(', ') || 'Not specified'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column: Activity & Jobs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Bell className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium">{activity.action}</p>
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                      <p className="text-sm text-gray-600">{activity.details}</p>
                      <p className="text-xs text-gray-500">By {activity.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Jobs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Recent Jobs
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Post Job
                </Button>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((job) => (
                  <div key={job} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Senior Frontend Developer</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Posted: 2 days ago</span>
                        <span>•</span>
                        <span>12 Applications</span>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">Active</Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, trendLabel, color }: any) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
    orange: 'text-orange-600 bg-orange-50',
    pink: 'text-pink-600 bg-pink-50',
    teal: 'text-teal-600 bg-teal-50',
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-600 font-medium">{trend}</span>
              <span className="text-xs text-gray-500">{trendLabel}</span>
            </div>
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}