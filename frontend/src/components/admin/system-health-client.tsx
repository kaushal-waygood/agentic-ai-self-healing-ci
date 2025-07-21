
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type ServiceStatus = "operational" | "degraded" | "outage";

interface SystemStatus {
  serviceName: string;
  status: ServiceStatus;
  details: string;
  lastChecked: string;
}

const servicesToCheck = [
  { id: 'db', name: "Primary Database" },
  { id: 'jsearch', name: "JSearch Job API" },
  { id: 'genkit', name: "Genkit AI Flows (Gemini)" },
  { id: 'auth', name: "Authentication Service" },
  { id: 'admin', name: "Admin Panel" },
];

function StatusIndicator({ status }: { status: ServiceStatus }) {
  const statusConfig = {
    operational: {
      icon: CheckCircle,
      color: "text-green-500",
      text: "Operational",
    },
    degraded: {
      icon: AlertTriangle,
      color: "text-yellow-500",
      text: "Degraded Performance",
    },
    outage: {
      icon: XCircle,
      color: "text-red-500",
      text: "Service Outage",
    },
  };

  const { icon: Icon, color, text } = statusConfig[status];

  return (
    <div className={cn("flex items-center gap-2 font-semibold", color)}>
      <Icon className="h-5 w-5" />
      <span>{text}</span>
    </div>
  );
}

function StatusCardSkeleton() {
    return (
        <Card className="shadow-sm">
            <CardHeader>
                <Skeleton className="h-6 w-3/4"/>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full"/>
                    <Skeleton className="h-5 w-1/3"/>
                </div>
                <Skeleton className="h-4 w-full mt-2"/>
            </CardContent>
            <CardFooter>
                <Skeleton className="h-3 w-1/2"/>
            </CardFooter>
        </Card>
    )
}

export function SystemHealthClient() {
  const [statuses, setStatuses] = useState<SystemStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const checkStatuses = useCallback(async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network latency

    const newStatuses = servicesToCheck.map(service => {
        // Simulate a small chance of a non-operational status for demonstration
        const roll = Math.random();
        let status: ServiceStatus = 'operational';
        let details = 'All systems running smoothly.';

        if (roll > 0.95) { // 5% chance of outage
            status = 'outage';
            details = 'Service is unresponsive. Investigating immediately.';
        } else if (roll > 0.85) { // 10% chance of degraded performance
            status = 'degraded';
            details = 'Experiencing high latency. Performance may be slow.';
        }

        return {
            serviceName: service.name,
            status,
            details,
            lastChecked: new Date().toISOString(),
        }
    });

    setStatuses(newStatuses);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkStatuses();
  }, [checkStatuses]);


  return (
    <div className="space-y-6">
      <div className="flex justify-end">
          <Button onClick={checkStatuses} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <RefreshCw className="mr-2 h-4 w-4"/>}
              Re-check Statuses
          </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
            servicesToCheck.map(service => <StatusCardSkeleton key={service.id} />)
        ) : (
            statuses.map((service) => (
            <Card key={service.serviceName} className="shadow-sm">
                <CardHeader>
                <CardTitle className="text-lg">{service.serviceName}</CardTitle>
                </CardHeader>
                <CardContent>
                <StatusIndicator status={service.status} />
                <p className="text-sm text-muted-foreground mt-2">{service.details}</p>
                </CardContent>
                <CardFooter>
                <p className="text-xs text-muted-foreground/80">Last checked: {new Date(service.lastChecked).toLocaleString()}</p>
                </CardFooter>
            </Card>
            ))
        )}
      </div>
    </div>
  );
}
