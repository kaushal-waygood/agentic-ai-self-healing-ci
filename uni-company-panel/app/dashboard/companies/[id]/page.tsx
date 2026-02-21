'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMultiCompanyStore } from '@/store/multi-company.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Building2,
  Users,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Edit,
  Calendar,
  Globe,
  FileText,
  BarChart3,
  Shield,
} from 'lucide-react';
import Link from 'next/link';

export default function CompanyDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { companies } = useMultiCompanyStore();
  
  const company = companies.find(c => c._id === id);
  
  if (!company) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold">Company not found</h1>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} className="mr-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
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
            <h1 className="text-3xl font-bold">{company.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <Badge className="bg-blue-100 text-blue-800">{company.industry}</Badge>
              <Badge className={company.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {company.status}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/companies/${id}/dashboard`)}
          >
            Dashboard
          </Button>
          <Button
            onClick={() => router.push(`/dashboard/companies/${id}/edit`)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Company
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<Briefcase />}
              title="Active Jobs"
              value={company.jobCount || 0}
              description="Currently posted"
              color="blue"
            />
            <StatCard
              icon={<Users />}
              title="Team Members"
              value={company.memberCount || 0}
              description="Active users"
              color="green"
            />
            <StatCard
              icon={<Calendar />}
              title="Created"
              value={new Date(company.createdAt).toLocaleDateString()}
              description="Date joined"
              color="purple"
            />
            <StatCard
              icon={<Shield />}
              title="Status"
              value={company.status}
              description="Company status"
              color="orange"
            />
          </div>
          
          {/* Company Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow icon={<Mail />} label="Contact Email" value={company.contactEmail} />
                <InfoRow icon={<Phone />} label="Contact Phone" value={company.contactPhone || 'Not set'} />
                <InfoRow icon={<Globe />} label="Industry" value={company.industry} />
                <InfoRow icon={<MapPin />} label="Location" value={
                  [company.address.city, company.address.state, company.address.country]
                    .filter(Boolean)
                    .join(', ') || 'Not specified'
                } />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                {company.description ? (
                  <p className="text-gray-700 whitespace-pre-line">{company.description}</p>
                ) : (
                  <p className="text-gray-500 italic">No description provided</p>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Link href={`/dashboard/companies/${id}/dashboard`}>
                  <Card className="hover:shadow-md cursor-pointer">
                    <CardContent className="pt-6 text-center">
                      <div className="p-3 bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                        <BarChart3 className="w-6 h-6 text-blue-600" />
                      </div>
                      <p className="font-medium">Dashboard</p>
                    </CardContent>
                  </Card>
                </Link>
                
                <Link href="/dashboard/post-job">
                  <Card className="hover:shadow-md cursor-pointer">
                    <CardContent className="pt-6 text-center">
                      <div className="p-3 bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                        <Briefcase className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="font-medium">Post Job</p>
                    </CardContent>
                  </Card>
                </Link>
                
                <Link href="/dashboard/team">
                  <Card className="hover:shadow-md cursor-pointer">
                    <CardContent className="pt-6 text-center">
                      <div className="p-3 bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <p className="font-medium">Manage Team</p>
                    </CardContent>
                  </Card>
                </Link>
                
                <Link href="/dashboard/candidates">
                  <Card className="hover:shadow-md cursor-pointer">
                    <CardContent className="pt-6 text-center">
                      <div className="p-3 bg-orange-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                        <FileText className="w-6 h-6 text-orange-600" />
                      </div>
                      <p className="font-medium">Candidates</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Team management for {company.name}</p>
              <Button className="mt-4" onClick={() => router.push('/dashboard/team')}>
                <Users className="w-4 h-4 mr-2" />
                Go to Team Management
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Job postings for {company.name}</p>
              <Button className="mt-4" onClick={() => router.push('/dashboard/jobs')}>
                <Briefcase className="w-4 h-4 mr-2" />
                View All Jobs
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ icon, title, value, description, color }: any) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
            {icon}
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-xs text-gray-400">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({ icon, label, value }: any) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-gray-400 mt-1">{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}