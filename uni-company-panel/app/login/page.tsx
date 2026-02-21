'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuthStore } from '@/store/auth.store';
import Image from 'next/image';

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
      await login(formData);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image/Branding */}
      {/* <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>

        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div> */}

      {/* Left Side - Image/Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* The Background Image */}
        <Image
          src="/loginBg.jpg"
          alt="Background"
          fill
          priority
          className="object-cover"
        />
        {/* decorative elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
        {/* Dark Overlay to make text readable */}
        <div className="absolute inset-0 bg-blue-900/40"></div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <span className="text-2xl font-bold">ZobsAI</span>
          </div>

          {/* Center Content */}
          <div className="space-y-6">
            <h1 className="text-5xl font-bold leading-tight">
              Welcome to Your
              <br />
              <span className="text-blue-200">Admin Portal</span>
            </h1>
            <p className="text-lg text-blue-100 max-w-md">
              Manage your university and company operations with powerful tools
              and insights.
            </p>
          </div>

          {/* Bottom Quote */}
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-1 h-16 bg-blue-300 rounded-full"></div>
              <blockquote className="text-blue-100">
                <p className="text-lg italic mb-2">
                  "Streamlining education management has never been easier. This
                  platform transformed how we operate."
                </p>
                <footer className="text-sm text-blue-200">
                  — Sarah Johnson, University Administrator
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="space-y-1 text-center">
              <div className="flex items-center justify-center mb-4 ">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={50}
                  height={50}
                  className=""
                />
              </div>
              <div className="text-2xl font-bold tracking-tight text-slate-900">
                University & Company Panel
              </div>
              <div className="text-slate-500">
                Enter your root credentials to access the system.
              </div>
            </div>
            {/* <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <span className="text-2xl  font-bold text-gray-900">
                {' '}
                University & Company Login
              </span>
            </div> */}
          </div>

          {/* Header */}
          <div className="hidden lg:block space-y-2">
            <h2 className=" text-3xl font-bold text-gray-900">Sign in</h2>
            <p className="text-gray-600">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Error Alert */}
            {(authError || validationError) && (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Error</AlertTitle>
                <AlertDescription className="text-red-700">
                  {authError || validationError}
                </AlertDescription>
              </Alert>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@company.com"
                disabled={loading}
                className="h-11 bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-900 placeholder:text-gray-400"
                value={formData.email}
                onChange={handleChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-blue-600 hover:text-blue-700 p-0 h-auto"
                >
                  Forgot password?
                </Button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  disabled={loading}
                  className="h-11 bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-900 pr-10"
                  value={formData.password}
                  onChange={handleChange}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer "
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            {/* <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                Remember me for 30 days
              </label>
            </div> */}

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-all hover:shadow-md cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Button
              variant="link"
              className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium"
            >
              Contact support
            </Button>
          </div>

          {/* Security Notice */}
          <div className="pt-6 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              🔒 Your connection is secure and encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
