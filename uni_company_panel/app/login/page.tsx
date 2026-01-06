'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import Next.js router
import { Eye, EyeOff, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuthStore } from '@/store/auth.store'; // Ensure path matches your file structure

const SuperAdminLogin = () => {
  const router = useRouter();

  const { login, loading, error: authError, isLogin } = useAuthStore();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (isLogin) {
      router.push('/dashboard');
    }
  }, [isLogin, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationError) setValidationError('');
  };

  const validateForm = () => {
    if (!formData.email.trim() || !formData.password) {
      setValidationError('Please fill in all fields.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setValidationError('Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (validateForm()) {
      // 3. Trigger the Zustand login action
      await login(formData);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-100 blur-[100px] opacity-60" />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-100 blur-[100px] opacity-60" />
      </div>

      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-slate-200 z-10 shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 border border-blue-100">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            Super Admin
          </CardTitle>
          <CardDescription className="text-slate-500">
            Enter your root credentials to access the system.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 4. Display Logic: Show Store Error OR Local Validation Error */}
            {(authError || validationError) && (
              <Alert
                variant="destructive"
                className="bg-red-50 border-red-200 text-red-600"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {authError || validationError}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@company.com"
                disabled={loading} // Disable while store is loading
                className="bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 text-slate-900 placeholder:text-slate-400"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  disabled={loading}
                  className="bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 text-slate-900 pr-10"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Access Dashboard'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button
            variant="link"
            className="text-xs text-slate-500 hover:text-blue-600"
          >
            Forgot super admin key?
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SuperAdminLogin;
