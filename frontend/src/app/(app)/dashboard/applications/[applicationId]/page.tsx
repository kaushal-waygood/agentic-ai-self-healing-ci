
import { redirect } from 'next/navigation';

export default function EditApplicationRedirectPage({
  params,
}: {
  params: { applicationId: string };
}) {
  const applicationId = params.applicationId;

  if (applicationId) {
    // Redirect to the new application wizard in "edit/resume" mode
    redirect(`/apply?applicationId=${applicationId}`);
  } else {
    // If somehow an ID is missing, send them back to the list
    redirect('/applications');
  }
}
