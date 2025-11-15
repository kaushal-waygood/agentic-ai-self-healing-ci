import { AiAssistantClient } from '@/components/support/ai-assistant-client';

import { aiAssistantMetadata } from '@/metadata/metadata';

export const metadata = {
  title: aiAssistantMetadata.title,
  description: aiAssistantMetadata.description,
  keywords: aiAssistantMetadata.keywords,
};
export default function AiAssistantPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow flex items-center justify-center">
        <AiAssistantClient />
      </div>
    </div>
  );
}
