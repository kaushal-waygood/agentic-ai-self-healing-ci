'use client';

import { PageHeader } from '@/components/common/page-header';
import { OrganizationClient } from '@/components/organization/organization-client';
import { Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProfileRequest } from '@/redux/reducers/authReducer';
import type { Organization } from '@/lib/data/user';
import { RootState } from '@/redux/rootReducer';
import Image from 'next/image';

export default function OrganizationPage() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector(
    (state: RootState) => state.auth,
  );

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
    if (user) {
      // Check if the user has a nested organization object OR if the user is the HR account itself
      // Based on your JSON, the user object contains the profile data directly.

      const orgData: Organization = {
        // Use the user's ID and Name since the JSON structure is flat
        id: user.organization?.id || user.id || user._id,
        name: user.organization?.name || user.fullName || 'Your Organization',

        // Default values since these are missing from the provided JSON
        planId: user.organization?.planId || 'basic',
        allowStudentUpgrades: user.organization?.allowStudentUpgrades || false,
        seats: user.organization?.seats || 10,
        status: user.organization?.status || 'active',
        betaFeaturesEnabled: user.organization?.betaFeaturesEnabled || false,
        apiKey: user.organization?.apiKey || '',
      };

      setOrganization(orgData);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center flex-col justify-center min-h-screen">
        <div>
          <Image
            src="/logo.png"
            alt="zobsai logo"
            width={100}
            height={100}
            className="w-10 h-10 animate-bounce"
          />
        </div>
        <div className="text-lg">LOADING...</div>
      </div>
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
      <OrganizationClient
        organization={organization}
        initialMembers={user?.members || []} // Adjust according to your API response
        initialJobs={user?.jobs || []} // Adjust according to your API response
      />
    </>
  );
}
