'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MockApplication } from '@/lib/data/applications';
import { SavedCv, SavedCoverLetter, mockUserProfile } from '@/lib/data/user';
import { EditableMaterial } from '@/components/application/editable-material';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import { mockApplications } from '@/lib/data/applications';

interface EditApplicationClientProps {
  application: MockApplication;
  cv?: SavedCv;
  coverLetter?: SavedCoverLetter;
}

export function EditApplicationClient({
  application,
  cv,
  coverLetter,
}: EditApplicationClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [cvContent, setCvContent] = useState(cv?.htmlContent || '');
  const [clContent, setClContent] = useState(coverLetter?.htmlContent || '');
  const [emailContent, setEmailContent] = useState(
    application.emailDraft || '',
  );

  const handleSaveChanges = () => {
    setIsLoading(true);

    setTimeout(() => {
      // Update CV if it exists
      if (cv) {
        const cvIndex = mockUserProfile.savedCvs.findIndex(
          (c) => c.id === cv.id,
        );
        if (cvIndex > -1) {
          mockUserProfile.savedCvs[cvIndex].htmlContent = cvContent;
        }
      }

      // Update Cover Letter if it exists
      if (coverLetter) {
        const clIndex = mockUserProfile.savedCoverLetters.findIndex(
          (cl) => cl.id === coverLetter.id,
        );
        if (clIndex > -1) {
          mockUserProfile.savedCoverLetters[clIndex].htmlContent = clContent;
        }
      }

      // Update Application email draft
      const appIndex = mockApplications.findIndex(
        (a) => a.id === application.id,
      );
      if (appIndex > -1) {
        mockApplications[appIndex].emailDraft = emailContent;
      }

      setIsLoading(false);
      toast({
        title: 'Changes Saved!',
        description: 'Your application documents have been updated.',
      });
      router.push('/applications');
    }, 1000); // Simulate network delay
  };

  return (
    <div className="space-y-8">
      {cv ? (
        <Card>
          <CardHeader>
            <CardTitle>Tailored CV</CardTitle>
          </CardHeader>
          <CardContent>
            <EditableMaterial
              editorId={`cv-editor-${cv.id}`}
              title="CV"
              content={cvContent}
              setContent={setCvContent}
              isHtml
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>CV</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No CV was saved with this application.
            </p>
          </CardContent>
        </Card>
      )}

      {coverLetter ? (
        <Card>
          <CardHeader>
            <CardTitle>Cover Letter</CardTitle>
          </CardHeader>
          <CardContent>
            <EditableMaterial
              editorId={`cl-editor-${coverLetter.id}`}
              title="Cover Letter"
              content={clContent}
              setContent={setClContent}
              isHtml
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Cover Letter</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No Cover Letter was saved with this application.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Email Draft</CardTitle>
        </CardHeader>
        <CardContent>
          <EditableMaterial
            editorId={`email-editor-${application.id}`}
            title="Email Draft"
            content={emailContent}
            setContent={setEmailContent}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveChanges} disabled={isLoading} size="lg">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
