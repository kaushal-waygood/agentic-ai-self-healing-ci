import { PageHeader } from '@/components/common/page-header';
import { AiAssistantClient } from '@/components/support/ai-assistant-client';
import { MessageSquare } from 'lucide-react';

export default function AiAssistantPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="AI Assistant"
        description="Ask questions about CareerPilot, get help with features, or seek job application advice."
        icon={MessageSquare}
      />
      <div className="flex-grow flex items-center justify-center">
        <AiAssistantClient />
      </div>
    </div>
  );
}
