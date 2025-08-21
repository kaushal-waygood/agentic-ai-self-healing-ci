import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { ArrowLeft, Bot, ChevronsRight, Loader2, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import apiInstance from '@/services/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface PilotAgent {
  agentId: string;
  agentName: string;
  jobTitle?: string;
  createdAt?: string;
  autopilotLimit?: number;
  applicationsToday?: number;
}

interface IntroWizardProps {
  startNewAgentWizard: () => void;
  setView: (view: string) => void;
}

const IntroWizard: React.FC<IntroWizardProps> = ({
  startNewAgentWizard,
  setView,
}) => {
  const [autoPilot, setAutoPilot] = useState<PilotAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agentToDelete, setAgentToDelete] = useState<PilotAgent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchAutoPilot = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiInstance.get('/pilotagent/get');

        if (response.data?.success && response.data.data?.autoPilot) {
          setAutoPilot(response.data.data.autoPilot);
        } else {
          setError('Failed to load pilot agents');
        }
      } catch (err) {
        console.error('Error fetching pilot agents:', err);
        setError('Error loading pilot agents. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAutoPilot();
  }, []);

  const handleDelete = async () => {
    if (!agentToDelete) return;

    try {
      setIsDeleting(true);
      // Call your API to delete the agent
      await apiInstance.delete(`/pilotagent/delete/${agentToDelete.agentId}`);

      // Update the local state to remove the deleted agent
      setAutoPilot(
        autoPilot.filter((agent) => agent.agentId !== agentToDelete.agentId),
      );
      setAgentToDelete(null);
    } catch (err) {
      console.error('Error deleting agent:', err);
      setError('Failed to delete agent. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">
            Your AI Job Agents
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Configure your personal job agents to automate applications
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading your agents...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3 text-center">
              <Bot className="h-8 w-8 text-destructive" />
              <p className="text-destructive font-medium">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          ) : autoPilot.length > 0 ? (
            <div className="grid gap-4">
              {autoPilot.map((pilot) => (
                <div
                  key={pilot.agentId}
                  className="p-5 border rounded-lg hover:border-primary transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-primary">
                            {pilot.agentName}
                          </h3>
                          {pilot.jobTitle && (
                            <p className="text-sm text-muted-foreground">
                              {pilot.jobTitle}
                            </p>
                          )}
                        </div>
                        {pilot.autopilotLimit !== undefined && (
                          <div className="text-xs text-right">
                            <p className="text-muted-foreground">
                              {pilot.applicationsToday || 0}/
                              {pilot.autopilotLimit} today
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                              <div
                                className="bg-primary h-1.5 rounded-full"
                                style={{
                                  width: `${Math.min(
                                    ((pilot.applicationsToday || 0) /
                                      pilot.autopilotLimit) *
                                      100,
                                    100,
                                  )}%`,
                                }}
                              ></div>
                            </div>

                            <Button
                              variant="destructive"
                              size="sm"
                              className="mt-2"
                              onClick={() => setAgentToDelete(pilot)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        {pilot.autopilotLimit !== undefined && (
                          <p className="text-xs text-muted-foreground">
                            Daily limit: {pilot.autopilotLimit}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
              <Bot className="h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-medium">No agents configured</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                You don't have any job agents yet. Create your first agent to
                start automating job applications.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-6">
          <Button
            variant="outline"
            onClick={() => setView('dashboard')}
            disabled={loading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={startNewAgentWizard}
            disabled={loading}
            className="min-w-[150px]"
          >
            {autoPilot.length > 0 ? 'Add New Agent' : 'Create First Agent'}
            <ChevronsRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!agentToDelete}
        onOpenChange={(open) => !open && setAgentToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Agent</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the agent "
              {agentToDelete?.agentName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAgentToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default IntroWizard;
