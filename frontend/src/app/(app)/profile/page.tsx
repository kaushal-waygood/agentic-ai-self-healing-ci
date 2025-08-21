import { PageHeader } from '@/components/common/page-header';
import { ProfileForm } from '@/components/profile/profile-form';
import { UserCircle } from 'lucide-react';

export default function ProfilePage() {
  return (
    <>
      <PageHeader
        title="My Profile"
        description="Manage your personal information, job preferences, and application materials."
        icon={UserCircle}
      />
      <div className="max-w-full mx-auto">
        <ProfileForm />
      </div>
    </>
  );
}
