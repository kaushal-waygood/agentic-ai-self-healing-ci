// const page = () => {
//   return <div>DashBoard</div>;
// };

// export default page;

'use client';

import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  DollarSign,
  UserPlus,
  Activity,
  Briefcase,
  FileText,
  Users,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

const DashboardPage = () => {
  const router = useRouter();
  const stats = [
    {
      title: 'Total Jobs Posted',
      value: '247',
      change: '+12.5%',
      trending: 'up',
      icon: Briefcase,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Candidates',
      value: '1,856',
      change: '+8.2%',
      trending: 'up',
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: 'Companies',
      value: '89',
      change: '+5.1%',
      trending: 'up',
      icon: Building2,
      color: 'bg-purple-500',
    },
    {
      title: 'Applications',
      value: '3,247',
      change: '+18.7%',
      trending: 'up',
      icon: FileText,
      color: 'bg-orange-500',
    },
  ];

  const recentActivities = [
    {
      company: 'Google Inc.',
      action: 'posted Software Engineer position',
      time: '5 min ago',
      type: 'job',
    },
    {
      candidate: 'John Doe',
      action: 'applied for Frontend Developer',
      time: '15 min ago',
      type: 'application',
    },
    {
      company: 'Microsoft Corp.',
      action: 'updated company profile',
      time: '1 hour ago',
      type: 'company',
    },
    {
      candidate: 'Sarah Wilson',
      action: 'completed profile verification',
      time: '2 hours ago',
      type: 'candidate',
    },
    {
      company: 'Amazon',
      action: 'posted Product Manager role',
      time: '3 hours ago',
      type: 'job',
    },
  ];

  const topCategories = [
    { name: 'Software Development', jobs: 84, percentage: 100 },
    { name: 'Product Management', jobs: 62, percentage: 74 },
    { name: 'Data Science', jobs: 45, percentage: 54 },
    { name: 'UI/UX Design', jobs: 38, percentage: 45 },
    { name: 'DevOps', jobs: 28, percentage: 33 },
  ];

  const pendingActions = [
    {
      title: 'New Job Applications',
      count: 45,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      title: 'Pending Approvals',
      count: 12,
      color: 'bg-yellow-100 text-yellow-700',
    },
    {
      title: 'Profile Reviews',
      count: 23,
      color: 'bg-purple-100 text-purple-700',
    },
    { title: 'Messages', count: 8, color: 'bg-green-100 text-green-700' },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-500">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening on your platform today.
          </p>
        </div>
        <Button
          onClick={() => {
            router.push('dashboard/post-job');
          }}
          className="bg-blue-500 hover:bg-blue-700 text-white"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add New Job
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </h3>
                  <div className="flex items-center mt-2">
                    {stat.trending === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span
                      className={`text-sm font-medium ${stat.trending === 'up' ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">
                      vs last month
                    </span>
                  </div>
                </div>
                <div
                  className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Actions */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {pendingActions.map((action, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {action.title}
              </span>
              <span
                className={`${action.color} px-3 py-1 rounded-full text-sm font-semibold`}
              >
                {action.count}
              </span>
            </div>
          </div>
        ))}
      </div> */}

      {/* Main Content Grid */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0 hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activity.type === 'job'
                        ? 'bg-blue-100'
                        : activity.type === 'application'
                          ? 'bg-green-100'
                          : activity.type === 'company'
                            ? 'bg-purple-100'
                            : 'bg-orange-100'
                    }`}
                  >
                    {activity.type === 'job' ? (
                      <Briefcase className="w-5 h-5 text-blue-600" />
                    ) : activity.type === 'application' ? (
                      <FileText className="w-5 h-5 text-green-600" />
                    ) : activity.type === 'company' ? (
                      <Building2 className="w-5 h-5 text-purple-600" />
                    ) : (
                      <Users className="w-5 h-5 text-orange-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.company || activity.candidate}
                    </p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              Top Job Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {topCategories.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {category.name}
                    </span>
                    <span className="text-sm font-semibold text-gray-600">
                      {category.jobs}
                    </span>
                  </div>
                  <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Quick Stats Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">
                  Active Job Listings
                </p>
                <h3 className="text-3xl font-bold mt-2">189</h3>
                <p className="text-blue-100 text-xs mt-2">Updated 1 hour ago</p>
              </div>
              <Briefcase className="w-12 h-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">
                  Successful Placements
                </p>
                <h3 className="text-3xl font-bold mt-2">342</h3>
                <p className="text-green-100 text-xs mt-2">This month</p>
              </div>
              <Users className="w-12 h-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">
                  Average Response Time
                </p>
                <h3 className="text-3xl font-bold mt-2">2.4h</h3>
                <p className="text-purple-100 text-xs mt-2">
                  -30% from last week
                </p>
              </div>
              <Activity className="w-12 h-12 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Quick Actions */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <Briefcase className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-medium">Post a Job</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center space-y-2 hover:bg-green-50 hover:border-green-300 transition-colors"
            >
              <Users className="w-6 h-6 text-green-600" />
              <span className="text-sm font-medium">View Candidates</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center space-y-2 hover:bg-purple-50 hover:border-purple-300 transition-colors"
            >
              <Building2 className="w-6 h-6 text-purple-600" />
              <span className="text-sm font-medium">Manage Companies</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center space-y-2 hover:bg-orange-50 hover:border-orange-300 transition-colors"
            >
              <FileText className="w-6 h-6 text-orange-600" />
              <span className="text-sm font-medium">Generate Report</span>
            </Button>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
};

export default DashboardPage;
