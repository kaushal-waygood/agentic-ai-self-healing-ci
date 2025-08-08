import { mockUserProfile } from '@/lib/data/user';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Bot,
  Edit,
  Loader2,
  PlayCircle,
  PlusCircle,
  Trash2,
} from 'lucide-react';
import { Button } from '../ui/button';
import { AlertDialog } from '@radix-ui/react-alert-dialog';
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';

const RenderDashboard = ({
  startNewAgentWizard,
  startEditAgentWizard,
  deleteAgent,
  handleActivationToggle,
  handleTriggerAgent,
  isLoading,
}: any) => (
  <div className="space-y-6">
    <div className="space-y-4">
      {(mockUserProfile.autoApplyAgents || []).map((agent) => (
        <Card key={agent.id} className="shadow-md">
          <CardHeader>
            <CardTitle className="flex justify-between items-start">
              <span className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-primary" /> {agent.name}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => startEditAgentWizard(agent)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the agent "{agent.name}".
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteAgent(agent.id)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Delete Agent
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardTitle>
            <CardDescription>
              Targeting: "{agent.jobFilters.query}"
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Agent Status</Label>
                <p className="text-sm text-muted-foreground">
                  Last run:{' '}
                  {agent.lastRun
                    ? new Date(agent.lastRun).toLocaleString()
                    : 'Never'}
                </p>
              </div>
              <Switch
                checked={agent.isActive}
                onCheckedChange={(checked) =>
                  handleActivationToggle(agent, checked)
                }
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => handleTriggerAgent(agent)}
              disabled={isLoading || !agent.isActive}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <PlayCircle className="mr-2 h-4 w-4" />
              )}
              Run Agent Now
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
    <Button
      onClick={startNewAgentWizard}
      variant="outline"
      className="w-full"
      size="lg"
    >
      <PlusCircle className="mr-2 h-5 w-5" /> Create Another AI Auto Apply Agent
    </Button>
  </div>
);

export default RenderDashboard;
