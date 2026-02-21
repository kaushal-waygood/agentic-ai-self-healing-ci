'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, SearchX, LifeBuoy } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full filter blur-3xl opacity-40 animate-pulse hidden sm:block"></div>
      <div
        className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full filter blur-3xl opacity-50 animate-pulse hidden sm:block"
        style={{ animationDelay: '2s' }}
      ></div>

      <Card className="relative z-10 w-full max-w-lg bg-white/80 backdrop-blur-xl border-0 shadow-2xl shadow-indigo-500/10 rounded-3xl text-center overflow-hidden">
        <CardContent className="p-12">
          <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-lg">
            <SearchX className="h-12 w-12 text-white" />
          </div>

          <h1 className="text-7xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-gray-800 mt-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 mt-4 max-w-sm mx-auto leading-relaxed">
            Oops! The page you're looking for seems to have taken a wrong turn.
            It might have been moved, deleted, or never existed.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto h-12 px-8 text-base font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              <Link href="/dashboard" prefetch={false}>
                <Home className="mr-2 h-5 w-5" />
                Go Back Home
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="w-full sm:w-auto h-12 px-8 text-base rounded-xl"
            >
              <Link href="/contact-support" prefetch={false}>
                <LifeBuoy className="mr-2 h-5 w-5" />
                Contact Support
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFoundPage;
