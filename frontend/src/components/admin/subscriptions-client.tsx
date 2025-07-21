
"use client";

import { useState } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Edit, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mockSubscriptionPlans, SubscriptionPlan } from "@/lib/data/subscriptions";
import { logAdminAction } from "@/lib/data/audit-logs";
import { Separator } from "../ui/separator";
import { mockUserProfile, mockAdminRoles } from "@/lib/data/user";

interface SubscriptionsClientProps {
  initialPlans: SubscriptionPlan[];
}

const planLimitsSchema = z.object({
  aiJobApply: z.preprocess((val) => Number(String(val).trim()), z.number().min(-1)),
  aiCvGenerator: z.preprocess((val) => Number(String(val).trim()), z.number().min(-1)),
  aiCoverLetterGenerator: z.preprocess((val) => Number(String(val).trim()), z.number().min(-1)),
  autoApplyAgents: z.preprocess((val) => Number(String(val).trim()), z.number().min(-1)),
  autoApplyDailyLimit: z.preprocess((val) => Number(String(val).trim()), z.number().min(-1)),
  applicationLimit: z.preprocess((val) => Number(String(val).trim()), z.number().min(-1)),
});

const planFormSchema = z.object({
  id: z.string(),
  name: z.enum(["Basic", "Plus", "Pro", "Platinum", "Enterprise Plus", "Enterprise Pro", "Enterprise Platinum"]),
  basePriceMonthly: z.preprocess((val) => Number(String(val).trim()), z.number().min(0)),
  quarterlyDiscountPercent: z.preprocess((val) => Number(String(val).trim()), z.number().min(0).max(100)),
  halfYearlyDiscountPercent: z.preprocess((val) => Number(String(val).trim()), z.number().min(0).max(100)),
  enterpriseDiscountPercent: z.preprocess((val) => (val === "" || val === null || val === undefined ? undefined : Number(String(val).trim())), z.number().min(0).max(100).optional()),
  displayFeatures: z.string().optional(),
  isPopular: z.boolean(),
  limits: planLimitsSchema,
});


type PlanFormValues = z.infer<typeof planFormSchema>;

export function SubscriptionsClient({ initialPlans }: SubscriptionsClientProps) {
  const { toast } = useToast();
  
  const [plans, setPlans] = useState(initialPlans);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  const loggedInAdmin = mockUserProfile;
  const loggedInAdminRole = mockAdminRoles.find(r => r.id === loggedInAdmin.adminRoleId);
  const canUpdatePlans = loggedInAdminRole?.permissions.billing_update_plans ?? false;

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
  });
  
  const openEditDialog = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    form.reset({
      id: plan.id,
      name: plan.name,
      basePriceMonthly: plan.basePriceMonthly,
      quarterlyDiscountPercent: plan.quarterlyDiscountPercent,
      halfYearlyDiscountPercent: plan.halfYearlyDiscountPercent,
      enterpriseDiscountPercent: plan.enterpriseDiscountPercent,
      displayFeatures: (plan.displayFeatures || []).join('\n'),
      isPopular: plan.isPopular || false,
      limits: {
        aiJobApply: plan.limits?.aiJobApply ?? 0,
        aiCvGenerator: plan.limits?.aiCvGenerator ?? 0,
        aiCoverLetterGenerator: plan.limits?.aiCoverLetterGenerator ?? 0,
        autoApplyAgents: plan.limits?.autoApplyAgents ?? 0,
        autoApplyDailyLimit: plan.limits?.autoApplyDailyLimit ?? 0,
        applicationLimit: plan.limits?.applicationLimit ?? 0,
      }
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (values: PlanFormValues) => {
    const planIndex = plans.findIndex(p => p.id === editingPlan?.id);
    if (planIndex > -1) {
        const updatedPlan: SubscriptionPlan = {
            ...plans[planIndex],
            basePriceMonthly: values.basePriceMonthly,
            quarterlyDiscountPercent: values.quarterlyDiscountPercent,
            halfYearlyDiscountPercent: values.halfYearlyDiscountPercent,
            enterpriseDiscountPercent: values.enterpriseDiscountPercent,
            displayFeatures: (values.displayFeatures || '').split('\n').map(f => f.trim()).filter(Boolean),
            isPopular: values.isPopular,
            limits: values.limits,
        };
        
        logAdminAction(
            "SYSTEM_CONFIG_CHANGE",
            values.id,
            `Updated subscription plan '${values.name}'.`
        );
        
        mockSubscriptionPlans[planIndex] = updatedPlan;
        setPlans([...mockSubscriptionPlans]);
        toast({ title: "Plan Updated", description: `${values.name} plan has been successfully updated.` });
    }
    setIsDialogOpen(false);
  };

  const individualPlans = plans.filter(p => !p.id.startsWith('enterprise'));
  const enterprisePlans = plans.filter(p => p.id.startsWith('enterprise'));
  
  const renderLimit = (label: string, limit: number | undefined) => {
    if (limit === undefined) return <li>{label}: 0</li>;
    const value = limit === -1 ? "Unlimited" : limit;
    return <li>{label}: {value}</li>;
  }

  const renderPlanCard = (plan: SubscriptionPlan) => (
    <Card key={plan.id} className="flex flex-col">
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription className="text-3xl font-bold text-primary">
          ${plan.basePriceMonthly}
          <span className="text-sm font-normal text-muted-foreground">/mo base</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="space-y-1">
          <h4 className="font-semibold text-sm">Feature Limits (-1 for unlimited):</h4>
          <ul className="list-disc pl-5 text-sm text-muted-foreground">
            {renderLimit("AI Applications/mo", plan.limits?.aiJobApply)}
            {renderLimit("AI CVs/mo", plan.limits?.aiCvGenerator)}
            {renderLimit("AI Cover Letters/mo", plan.limits?.aiCoverLetterGenerator)}
            {renderLimit("Auto-Apply Agents", plan.limits?.autoApplyAgents)}
            {renderLimit("Auto-Apply Daily Limit", plan.limits?.autoApplyDailyLimit)}
            {renderLimit("Total Applications/mo", plan.limits?.applicationLimit)}
          </ul>
        </div>
      </CardContent>
      <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => openEditDialog(plan)} disabled={!canUpdatePlans}>
              <Edit className="mr-2 h-4 w-4" /> Edit Plan
          </Button>
      </CardFooter>
    </Card>
  );

  return (
    <>
      <Tabs defaultValue="individual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="individual">Individual Plans (B2C)</TabsTrigger>
          <TabsTrigger value="enterprise">Enterprise Plans (B2B2C)</TabsTrigger>
        </TabsList>
        <TabsContent value="individual" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {individualPlans.map(renderPlanCard)}
            </div>
        </TabsContent>
        <TabsContent value="enterprise" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enterprisePlans.map(renderPlanCard)}
            </div>
        </TabsContent>
      </Tabs>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {editingPlan?.name} Plan</DialogTitle>
            <DialogDescription>Note: Plan name cannot be changed. Use -1 for unlimited.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
              <fieldset disabled={!canUpdatePlans}>
                <FormField control={form.control} name="basePriceMonthly" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Monthly Price ($)</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ''} /></FormControl>
                    <FormDescription>For enterprise plans, this can be 0 if price is derived from an individual plan.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="quarterlyDiscountPercent" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quarterly Discount (%)</FormLabel>
                        <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="halfYearlyDiscountPercent" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Half-Yearly Discount (%)</FormLabel>
                        <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                </div>
                
                {editingPlan?.id.startsWith('enterprise') && (
                  <FormField
                    control={form.control}
                    name="enterpriseDiscountPercent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enterprise Discount (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 33"
                            {...field}
                            value={field.value === undefined ? '' : field.value}
                            onChange={(e) => {
                              const value = e.target.value
                              field.onChange(value === '' ? undefined : Number(value))
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Discount relative to the corresponding individual plan.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                  
                <FormField control={form.control} name="isPopular" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Most Popular</FormLabel><FormDescription>Highlight this plan on the public pricing page.</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                  
                
                {!editingPlan?.id.startsWith('enterprise') && (
                  <>
                    <Separator />
                    <h4 className="font-semibold text-lg pt-2">Feature Limits</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="limits.aiJobApply" render={({ field }) => (<FormItem><FormLabel>AI Applications</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="limits.applicationLimit" render={({ field }) => (<FormItem><FormLabel>Total Applications</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="limits.aiCvGenerator" render={({ field }) => (<FormItem><FormLabel>AI CVs</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="limits.aiCoverLetterGenerator" render={({ field }) => (<FormItem><FormLabel>AI Cover Letters</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="limits.autoApplyAgents" render={({ field }) => (<FormItem><FormLabel>Auto-Apply Agents</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="limits.autoApplyDailyLimit" render={({ field }) => (<FormItem><FormLabel>Auto-Apply Daily Limit</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                  </>
                )}

                {editingPlan?.id.startsWith('enterprise') && (
                  <>
                    <Separator />
                    <div className="pt-2">
                      <h4 className="font-semibold text-lg">Feature Limits</h4>
                      <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md mt-2">
                        Feature limits for enterprise plans are inherited from the corresponding individual plan (e.g., Enterprise Pro inherits from Pro) and cannot be edited here.
                      </p>
                    </div>
                  </>
                )}


                  <FormField control={form.control} name="displayFeatures" render={({ field }) => (<FormItem><FormLabel>Display Features</FormLabel><FormControl><Textarea {...field} className="min-h-[150px]" /></FormControl><FormDescription>Enter one feature per line. These are shown on the pricing page.</FormDescription><FormMessage /></FormItem>)} />
                </fieldset>
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={!canUpdatePlans}>Save Changes</Button>
                </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
