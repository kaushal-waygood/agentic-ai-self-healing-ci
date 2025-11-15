import { Pricing } from '@/components/home/Pricing';
import { subscriptionsMetadata } from '@/metadata/metadata';

export const metadata = {
  title: subscriptionsMetadata.title,
  description: subscriptionsMetadata.description,
  keywords: subscriptionsMetadata.keywords,
};

export default function SubscriptionsPage() {
  return (
    <>
      <Pricing />
    </>
  );
}
