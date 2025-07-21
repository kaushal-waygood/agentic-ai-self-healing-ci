
import { redirect } from 'next/navigation';

// This page has been deprecated and consolidated into the /search-jobs page
// to create a unified job discovery experience.
// We are redirecting all traffic from here to the new canonical page.
export default function DeprecatedJobListingsPage() {
  redirect('/search-jobs');
}
