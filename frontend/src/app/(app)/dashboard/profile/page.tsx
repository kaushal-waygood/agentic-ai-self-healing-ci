import { ProfileForm } from '@/components/profile/profile-form';
import { profileMetadata } from '@/metadata/metadata';

export const metadata = {
  title: profileMetadata.title,
  description: profileMetadata.description,
  keywords: profileMetadata.keywords,
};

export default function ProfilePage() {
  return (
    <>
      <div className="max-w-full mx-auto">
        <ProfileForm />
      </div>
    </>
  );
}
