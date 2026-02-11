'use client';

import React, { useEffect } from 'react';
import { useMultiCompanyStore } from '@/store/multi-company.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2,
  Users,
  Briefcase,
  BarChart3,
  TrendingUp,
  DollarSign,
  Target,
  Globe,
  ChevronRight,
  Crown,
  Plus,
  Download,
  Filter,
  Eye,
  ExternalLink,
  PieChart,
  LineChart,
  Calendar,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ParentDashboardPage() {
  const router = useRouter();
  const { 
    companies, 
    allCompaniesTree, 
    getCompanies, 
    buildCompanyTree,
    getParentCompanies,
    loading 
  } = useMultiCompanyStore();
  
  useEffect(() => {
    getCompanies();
  }, []);
  
  // Calculate consolidated stats
  const consolidatedStats = {
    totalCompanies: companies.length,
    parentCompanies: getParentCompanies().length,
    childCompanies: companies.filter(c => c.type === 'CHILD').length,
    
    totalJobs: companies.reduce((sum, comp) => sum + (comp.jobCount || 0), 0),
    totalTeamMembers: companies.reduce((sum, comp) => sum + (comp.memberCount || 0), 0),
    activeJobs: companies.reduce((sum, comp) => sum + (comp.jobCount || 0), 0) * 0.8, // Mock
    
    totalCandidates: 142, // Mock - get from API
    interviewsThisWeek: 8,
    hiresThisMonth: 4,
    
    revenueThisMonth: 24500, // Mock
    activeSubscriptions: 3,
  };
  
  // Company performance metrics
  const companyPerformance = companies.map(company => ({
    ...company,
    performance: Math.floor(Math.random() * 30) + 70, // Mock 70-100%
    growth: Math.floor(Math.random() * 20) - 5, // Mock -5 to +15%
    candidateConversion: Math.floor(Math.random() * 30) + 10, // Mock
  }));
  
  // Recent activities across all companies
  const recentActivities = [
    { company: 'HappyTech', action: 'New job posted', details: 'Senior Developer', time: '2 hours ago' },
    { company: 'HelpStudy', action: 'Candidate hired', details: 'Marketing Manager', time: '5 hours ago' },
    { company: 'Zobs', action: 'Team member added', details: 'New Recruiter', time: '1 day ago' },
    { company: 'HappyTech', action: 'Interview scheduled', details: 'With Sarah Johnson', time: '2 days ago' },
    { company: 'HelpStudy', action: 'Job published', details: 'Content Writer', time: '3 days ago' },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Crown className="w-8 h-8 text-yellow-600" />
            <h1 className="text-3xl font-bold">Parent Organization Dashboard</h1>
          </div>
          <p className="text-gray-600">
            Consolidated overview of all your companies and their performance
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          {/* <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button> */}
          <Button onClick={() => router.push('/dashboard/companies')}>
            <Building2 className="w-4 h-4 mr-2" />
            Manage Companies
          </Button>
        </div>
      </div>
      
      {/* Consolidated Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Companies"
          value={consolidatedStats.totalCompanies}
          icon={<Building2 className="w-5 h-5" />}
          description={`${consolidatedStats.parentCompanies} parent, ${consolidatedStats.childCompanies} child`}
          trend="+2"
          trendLabel="this quarter"
          color="blue"
        />
        
        <StatCard
          title="Active Jobs"
          value={consolidatedStats.activeJobs}
          icon={<Briefcase className="w-5 h-5" />}
          description={`${consolidatedStats.totalJobs} total posted`}
          trend="+12%"
          trendLabel="vs last month"
          color="green"
        />
        
        <StatCard
          title="Team Members"
          value={consolidatedStats.totalTeamMembers}
          icon={<Users className="w-5 h-5" />}
          description="Across all companies"
          trend="+5"
          trendLabel="new hires"
          color="purple"
        />
        
        <StatCard
          title="Total Candidates"
          value={consolidatedStats.totalCandidates}
          icon={<Users className="w-5 h-5" />}
          description="In pipeline"
          trend="+24"
          trendLabel="this week"
          color="orange"
        />
        
        <StatCard
          title="Monthly Revenue"
          value={`$${consolidatedStats.revenueThisMonth.toLocaleString()}`}
          icon={<DollarSign className="w-5 h-5" />}
          description="From all subscriptions"
          trend="+8.5%"
          trendLabel="growth"
          color="teal"
        />
        
        <StatCard
          title="Conversion Rate"
          value="32%"
          icon={<Target className="w-5 h-5" />}
          description="Interview to hire"
          trend="+2.4%"
          trendLabel="improvement"
          color="pink"
        />
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="companies">
            <Building2 className="w-4 h-4 mr-2" />
            Companies
          </TabsTrigger>
          <TabsTrigger value="performance">
            <TrendingUp className="w-4 h-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="reports">
            <PieChart className="w-4 h-4 mr-2" />
            Reports
          </TabsTrigger>
        </TabsList>
        
        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Company Hierarchy Tree */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Company Hierarchy
                </CardTitle>
                <CardDescription>
                  Parent-child relationship structure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CompanyTree tree={allCompaniesTree} />
              </CardContent>
            </Card>
            
            {/* Company Performance */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Company Performance
                  </CardTitle>
                  <CardDescription>
                    Key metrics across all companies
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {companyPerformance.map(company => (
                    <div key={company._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {company.logo ? (
                          <img src={company.logo} alt={company.name} className="w-10 h-10 rounded" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-gray-600" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{company.name}</p>
                            {company.type === 'PARENT' && (
                              <Badge className="bg-blue-100 text-blue-800 text-xs">
                                <Crown className="w-3 h-3 mr-1" />
                                Parent
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{company.industry}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-lg font-bold">{company.performance}%</p>
                          <p className="text-xs text-gray-500">Performance</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${company.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {company.growth >= 0 ? '+' : ''}{company.growth}%
                          </p>
                          <p className="text-xs text-gray-500">Growth</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/companies/${company._id}/dashboard`)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Activity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest actions across all companies
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((activity, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="font-medium">{activity.company}</span>
                          <span>•</span>
                          <span>{activity.details}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* COMPANIES TAB */}
        <TabsContent value="companies">
          <Card>
            <CardHeader>
              <CardTitle>All Companies Management</CardTitle>
              <CardDescription>
                Manage and view all companies under your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companies.map(company => (
                  <Card key={company._id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-4">
                        {company.logo ? (
                          <img src={company.logo} alt={company.name} className="w-12 h-12 rounded" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-gray-600" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{company.name}</h3>
                            {company.type === 'PARENT' && (
                              <Badge className="bg-blue-100 text-blue-800 text-xs">
                                Parent
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{company.industry}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <p className="text-lg font-bold">{company.jobCount || 0}</p>
                          <p className="text-xs text-gray-500">Jobs</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <p className="text-lg font-bold">{company.memberCount || 0}</p>
                          <p className="text-xs text-gray-500">Team</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => router.push(`/dashboard/companies/${company._id}/dashboard`)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => router.push(`/dashboard/companies/${company._id}`)}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Add New Company Card */}
                <Card className="border-dashed border-2 hover:border-blue-500 cursor-pointer">
                  <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px]">
                    <div
                      onClick={() => router.push('/dashboard/companies')}
                      className="flex flex-col items-center gap-3 text-center"
                    >
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Plus className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Add New Company</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Create new sub-company
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* PERFORMANCE TAB */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Cross-Company Performance Analytics</CardTitle>
              <CardDescription>
                Compare performance metrics across all companies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Performance Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard title="Total Applications" value="1,245" trend="+12%" />
                  <MetricCard title="Interview Rate" value="68%" trend="+5%" />
                  <MetricCard title="Hiring Rate" value="32%" trend="+2.4%" />
                  <MetricCard title="Avg. Time to Hire" value="24 days" trend="-3" />
                </div>
                
                {/* Company Comparison Table */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3">Company</th>
                        <th className="text-left p-3">Jobs</th>
                        <th className="text-left p-3">Candidates</th>
                        <th className="text-left p-3">Hires</th>
                        <th className="text-left p-3">Conversion</th>
                        <th className="text-left p-3">Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companies.map(company => (
                        <tr key={company._id} className="border-t hover:bg-gray-50">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {company.name}
                              {company.type === 'PARENT' && (
                                <Crown className="w-3 h-3 text-yellow-600" />
                              )}
                            </div>
                          </td>
                          <td className="p-3">{company.jobCount || 0}</td>
                          <td className="p-3">{Math.floor(company.jobCount * 15) || 0}</td>
                          <td className="p-3">{Math.floor(company.jobCount * 2) || 0}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full" 
                                  style={{ width: `${Math.floor(Math.random() * 30) + 20}%` }}
                                />
                              </div>
                              <span>{Math.floor(Math.random() * 30) + 20}%</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge className={
                              Math.random() > 0.5 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }>
                              {Math.random() > 0.5 ? 'Excellent' : 'Good'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* REPORTS TAB */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Cross-Company Reports</CardTitle>
              <CardDescription>
                Generate and download reports across all companies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ReportCard
                  title="Monthly Performance Report"
                  description="Overall performance across all companies"
                  icon={<BarChart3 />}
                  format="PDF"
                  size="2.4 MB"
                />
                <ReportCard
                  title="Hiring Analytics"
                  description="Candidate and hiring metrics"
                  icon={<Users />}
                  format="Excel"
                  size="1.8 MB"
                />
                <ReportCard
                  title="Financial Summary"
                  description="Revenue and expenses report"
                  icon={<DollarSign />}
                  format="PDF"
                  size="3.1 MB"
                />
                <ReportCard
                  title="Team Performance"
                  description="Team member productivity"
                  icon={<TrendingUp />}
                  format="CSV"
                  size="1.2 MB"
                />
                <ReportCard
                  title="Company Comparison"
                  description="Side-by-side company metrics"
                  icon={<PieChart />}
                  format="PDF"
                  size="2.7 MB"
                />
                <ReportCard
                  title="Quarterly Review"
                  description="Q1 2024 performance review"
                  icon={<Calendar />}
                  format="PDF"
                  size="4.2 MB"
                />
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Generate Custom Report</h4>
                    <p className="text-sm text-gray-600">
                      Create a custom report with selected companies and metrics
                    </p>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper Components
function StatCard({ title, value, icon, description, trend, trendLabel, color }: any) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    teal: 'bg-teal-100 text-teal-600',
    pink: 'bg-pink-100 text-pink-600',
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
            <div className="flex items-center gap-1 mt-2">
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

function CompanyTree({ tree }: { tree: any[] }) {
  const renderTree = (nodes: any[], level = 0) => {
    return nodes.map(node => (
      <div key={node._id} className="mb-2">
        <div 
          className={`flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer ${
            level > 0 ? 'ml-4' : ''
          }`}
        >
          {node.children && node.children.length > 0 ? (
            <ChevronRight className="w-3 h-3 text-gray-400" />
          ) : (
            <div className="w-3 h-3" />
          )}
          {node.logo ? (
            <img src={node.logo} alt={node.name} className="w-6 h-6 rounded" />
          ) : (
            <Building2 className="w-4 h-4 text-gray-400" />
          )}
          <span className="font-medium">{node.name}</span>
          {node.type === 'PARENT' && (
            <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">
              Parent
            </Badge>
          )}
        </div>
        {node.children && node.children.length > 0 && (
          <div className="ml-4 border-l-2 border-gray-200 pl-2">
            {renderTree(node.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };
  
  return (
    <div className="max-h-80 overflow-y-auto">
      {tree.length > 0 ? renderTree(tree) : (
        <p className="text-gray-500 text-center py-4">No companies found</p>
      )}
    </div>
  );
}

function MetricCard({ title, value, trend }: any) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <div className="flex items-end justify-between">
          <p className="text-2xl font-bold">{value}</p>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span className="text-xs text-green-600 font-medium">{trend}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ReportCard({ title, description, icon, format, size }: any) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            {icon}
          </div>
          <Badge variant="outline">{format}</Badge>
        </div>
        <h4 className="font-semibold mb-1">{title}</h4>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{size}</span>
          <Button variant="outline" size="sm">
            <Download className="w-3 h-3 mr-1" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}