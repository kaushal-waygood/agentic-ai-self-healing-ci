'use client';

import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronsRight, Archive, ArrowLeft } from 'lucide-react';

interface ResultViewProps {
  onInitiateSave: () => void;
  onStartOver: () => void;
}

export function ResultView({ onInitiateSave, onStartOver }: ResultViewProps) {
  return (
    <Card className="flex flex-col items-center justify-center text-center p-12 min-h-[400px]">
      <ChevronsRight className="h-16 w-16 text-primary mb-4" />
      <CardHeader>
        <CardTitle className="text-2xl font-headline font-semibold">
          Letter Generated!
        </CardTitle>
      </CardHeader>
      <p className="text-muted-foreground mt-2 max-w-xs">
        Your new cover letter is ready. Look right to review and edit your
        letter.
      </p>
      <CardFooter className="mt-4 flex flex-col sm:flex-row gap-2">
        <Button variant="ghost" onClick={onStartOver}>
          <ArrowLeft className="mr-2" />
          Start Over
        </Button>
        <Button variant="secondary" size="sm" onClick={onInitiateSave}>
          <Archive className="mr-2 h-4 w-4" /> Save Final Version
        </Button>
      </CardFooter>
    </Card>
  );
}
