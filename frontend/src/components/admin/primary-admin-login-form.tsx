
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation"; 

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, LogIn } from "lucide-react";
import { mockUserProfile, mockUsers } from "@/lib/data/user"; 

const loginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

const PRIMARY_ADMIN_EMAIL = "iamgde@gmail.com";
const PRIMARY_ADMIN_PASSWORD = "Admin@123";

export function PrimaryAdminLoginForm() {
  const { toast } = useToast();
  const router = useRouter(); 
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    form.control.disabled = true; 
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = mockUsers.find(u => 
        u.email.toLowerCase() === data.email.toLowerCase() &&
        u.role === 'PrimaryAdmin'
    );

    if (user && data.email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase() && data.password === PRIMARY_ADMIN_PASSWORD) {
      Object.assign(mockUserProfile, user);
      
      toast({
        title: "Primary Admin Login Successful",
        description: "Redirecting to the admin dashboard...",
      });
      router.push('/primary-admin/dashboard');
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid credentials for Primary Admin.",
      });
      form.reset({ email: data.email, password: "" }); 
    }
    form.control.disabled = false; 
  }

  return (
    <Card className="w-full max-w-md shadow-xl border-primary">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center items-center mb-4">
            <ShieldCheck className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="text-2xl font-headline">Primary Admin Login</CardTitle>
        <CardDescription>
          Enter your credentials to access the main admin panel.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="iamgde@gmail.com" {...field} disabled={form.formState.isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} disabled={form.formState.isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Logging in..." : <> <LogIn className="mr-2 h-4 w-4" /> Login as Admin </>}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm">
        <p>Looking for the standard login?&nbsp;
        <Link href="/login" className="font-medium text-primary hover:underline">
            Go here
        </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
