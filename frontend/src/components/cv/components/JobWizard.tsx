import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Briefcase,
  ChevronsRight,
  FileSignature,
  Loader2,
  User,
} from 'lucide-react';
import React from 'react';

const JobWizard = ({
  isLoading,
  pastedJobDescription,
  setPastedJobDescription,
  enteredJobTitle,
  handleSetJobContext,
  setEnteredJobTitle,
}: any) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          Step 1: Provide Job Context
        </CardTitle>
        <CardDescription>
          Tell the AI about the job. This is crucial for tailoring your CV.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="paste" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="paste">
              <FileSignature className="mr-2 h-4 w-4" />
              Paste
            </TabsTrigger>
            <TabsTrigger value="select">
              <Briefcase className="mr-2 h-4 w-4" />
              Select
            </TabsTrigger>
            <TabsTrigger value="title">
              <User className="mr-2 h-4 w-4" />
              Title
            </TabsTrigger>
          </TabsList>
          <TabsContent value="paste" className="pt-4 space-y-4">
            <Textarea
              placeholder="Paste the full job description here..."
              className="min-h-[200px]"
              value={pastedJobDescription}
              onChange={(e) => setPastedJobDescription(e.target.value)}
            />
            <Button
              className="w-full"
              onClick={() => handleSetJobContext('paste')}
              disabled={!pastedJobDescription || isLoading}
            >
              {isLoading ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                <ChevronsRight className="mr-2" />
              )}
              Use Description
            </Button>
          </TabsContent>
          {/*   */}
          <TabsContent value="title" className="pt-4 space-y-4">
            <Input
              placeholder="e.g., Senior Software Engineer"
              value={enteredJobTitle}
              onChange={(e) => setEnteredJobTitle(e.target.value)}
            />
            <Button
              className="w-full"
              onClick={() => handleSetJobContext('title')}
              disabled={!enteredJobTitle || isLoading}
            >
              {isLoading ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                <ChevronsRight className="mr-2" />
              )}
              Use Title
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default JobWizard;
