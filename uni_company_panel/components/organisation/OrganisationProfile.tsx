'use client';

import React, { useEffect, useState } from 'react';

type OrganizationProfile = {
  name: string;
  type: 'COMPANY' | 'UNIVERSITY';
  profile: {
    industry?: string;
    size?: string;
    website?: string;
    description?: string;
    address?: string;
    logo?: string;
  };
  contactInfo: {
    name?: string;
    email?: string;
    phone?: string;
  };
};

const OrganizationProfilePage = () => {
  const [org, setOrg] = useState<OrganizationProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8080/api/organizations/me', {
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error('Failed to load organization');
        }

        const data = await res.json();
        setOrg(data.data || data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, []);

  if (loading) return <div>Loading organization profile…</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!org) return <div>No organization found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">{org.name}</h1>
        <p className="text-sm text-gray-500">{org.type}</p>
      </div>

      {/* Profile Section */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Organization Profile</h2>

        <div>
          <strong>Industry:</strong> {org.profile?.industry || '—'}
        </div>

        <div>
          <strong>Size:</strong> {org.profile?.size || '—'}
        </div>

        <div>
          <strong>Website:</strong>{' '}
          {org.profile?.website ? (
            <a
              href={org.profile.website}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline"
            >
              {org.profile.website}
            </a>
          ) : (
            '—'
          )}
        </div>

        <div>
          <strong>Description:</strong>
          <p className="text-sm text-gray-700">
            {org.profile?.description || '—'}
          </p>
        </div>

        <div>
          <strong>Address:</strong> {org.profile?.address || '—'}
        </div>
      </section>

      {/* Contact Info */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Contact Information</h2>

        <div>
          <strong>Name:</strong> {org.contactInfo?.name || '—'}
        </div>

        <div>
          <strong>Email:</strong> {org.contactInfo?.email || '—'}
        </div>

        <div>
          <strong>Phone:</strong> {org.contactInfo?.phone || '—'}
        </div>
      </section>
    </div>
  );
};

export default OrganizationProfilePage;
