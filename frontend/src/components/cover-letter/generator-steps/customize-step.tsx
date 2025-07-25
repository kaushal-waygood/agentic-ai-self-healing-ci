
"use client"; 

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Wand2, ArrowLeft } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { CustomizationValues } from "../cover-letter-client";

interface CustomizeStepProps {
  form: UseFormReturn<CustomizationValues>;
  onGenerate: (data: CustomizationValues) => void;
  isLoading: boolean;
  onBack: () => void;
}

export function CustomizeStep({ form, onGenerate, isLoading, onBack }: CustomizeStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Step 3: Customize</CardTitle>
        <CardDescription>Adjust tone, style, and add a personal touch.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onGenerate)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tone</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Formal">Formal</SelectItem>
                        <SelectItem value="Enthusiastic">Enthusiastic</SelectItem>
                        <SelectItem value="Reserved">Reserved</SelectItem>
                        <SelectItem value="Casual">Casual</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="style"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Style</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Concise">Concise</SelectItem>
                        <SelectItem value="Detailed">Detailed</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="personalStory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal Story (Optional)</FormLabel>
                  <FormControl><Textarea placeholder="Mention a specific achievement..." {...field} /></FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" size="lg" className="w-full !mt-6" disabled={isLoading}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Wand2 className="mr-2 h-4 w-4" /> Generate Letter</>}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
      </CardFooter>
    </Card>
  );
}
