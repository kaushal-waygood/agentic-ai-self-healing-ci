import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { ArrowLeft, Bot, ChevronsRight } from 'lucide-react';
import { Button } from '../ui/button';
import { mockUserProfile } from '@/lib/data/user';

const IntroWizard = ({ startNewAgentWizard, setView }: any) => {
  return (
    <Card className="text-center">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">
          Setup a New AI Agent
        </CardTitle>
        <CardDescription>
          This wizard will configure your personal job agent to find and prepare
          applications for you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Bot className="h-16 w-16 mx-auto text-primary" />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setView('dashboard')}
          disabled={(mockUserProfile.autoApplyAgents || []).length === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <Button type="button" onClick={startNewAgentWizard} size="lg">
          Get Started <ChevronsRight className="ml-2 h-5 w-5" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default IntroWizard;
