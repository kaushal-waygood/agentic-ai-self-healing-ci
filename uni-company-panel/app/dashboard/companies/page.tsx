'use client';

import React, { useEffect, useState } from 'react';
import { useMultiCompanyStore } from '@/store/multi-company.store';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  MoreVertical,
  Users,
  Briefcase,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import AddCompanyModal from '@/components/dashboard/AddCompanyModal';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

export default function CompaniesPage() {
  const router = useRouter();
  const { companies, getCompanies, deleteCompany, loading } =
    useMultiCompanyStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    getCompanies();
  }, []);

  const handleDelete = async (companyId: string) => {
    if (confirm('Are you sure you want to delete this company?')) {
      await deleteCompany(companyId);
    }
  };

  const handleViewDetails = (companyId: string) => {
    router.push(`/dashboard/companies/${companyId}`);
  };

  if (loading && companies.length === 0) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-600">
            Manage all your companies from one dashboard
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Company
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Companies
                </p>
                <p className="text-2xl font-bold">{companies.length}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Jobs</p>
                <p className="text-2xl font-bold">
                  {companies.reduce(
                    (sum, comp) => sum + (comp.jobCount || 0),
                    0,
                  )}
                </p>
              </div>
              <Briefcase className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Team Members
                </p>
                <p className="text-2xl font-bold">
                  {companies.reduce(
                    (sum, comp) => sum + (comp.memberCount || 0),
                    0,
                  )}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Latest Added
                </p>
                <p className="text-sm font-semibold">
                  {companies[0]
                    ? new Date(companies[0].createdAt).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <Card key={company._id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  {company.logo ? (
                    <Image
                      src={company.logo}
                      alt={company.name}
                      className="w-12 h-12 rounded-lg object-cover"
                      width={48}
                      height={48}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                    <CardDescription>{company.industry}</CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/dashboard/companies/${company._id}`)
                      }
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(company._id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Jobs Posted</span>
                  <Badge variant="outline">{company.jobCount || 0}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Team Size</span>
                  <Badge variant="secondary">{company.memberCount || 0}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <Badge
                    className={
                      company.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }
                  >
                    {company.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  router.push(`/dashboard/companies/${company._id}/dashboard`)
                }
              >
                Manage Company
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        ))}

        {/* Add New Company Card */}
        <Card className="border-dashed border-2 hover:border-blue-500 cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center h-full min-h-[250px]">
            <div
              onClick={() => setIsAddModalOpen(true)}
              className="flex flex-col items-center gap-4 text-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Add New Company</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Create a new sub-company under your organization
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AddCompanyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
