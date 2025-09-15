'use client';

import { PageHeader } from '@/components/common/page-header';
import { OrganizationClient } from '@/components/organization/organization-client';
import { Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProfileRequest } from '@/redux/reducers/authReducer';
import type { Organization } from '@/lib/data/user';

export default function OrganizationPage() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(getProfileRequest());
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [dispatch]);

  useEffect(() => {
    if (user?.organization) {
      const orgData: Organization = {
        id: user.organization.name,
        name: user.organization.name || 'Your Organization', // Add fallback
        planId: user.organization.planId || 'basic', // Add fallback
        allowStudentUpgrades: user.organization.allowStudentUpgrades || false,
        seats: user.organization.seats || 10,
        status: user.organization.status || 'active',
        betaFeaturesEnabled: user.organization.betaFeaturesEnabled || false,
        apiKey: user.organization.apiKey,
      };
      setOrganization(orgData);
    }
  }, [user]);

  if (loading) {
    return (
      <PageHeader
        title="Loading Organization..."
        description="Please wait while we fetch your organization's details."
        icon={Users}
      />
    );
  }

  if (!organization) {
    return (
      <PageHeader
        title="Organization Not Found"
        description="You are not associated with any organization or don't have permission to view this page."
        icon={Users}
      />
    );
  }

  return (
    <>
      <PageHeader
        title={organization.name}
        description="Manage your organization's members, job postings, and settings."
        icon={Users}
      />
      <OrganizationClient
        organization={organization}
        initialMembers={user?.members || []} // Adjust according to your API response
        initialJobs={user?.jobs || []} // Adjust according to your API response
      />
    </>
  );
}
