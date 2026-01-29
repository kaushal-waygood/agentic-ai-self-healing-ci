'use client';

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      // 1. POSITIONING: Top-center or Bottom-right usually looks best for professional apps
      position="top-center"
      // 2. EXPAND: Allows seeing full content if the error message is long
      expand={true}
      // 3. RICH COLORS: Set to 'true' if you want full background colors (Green bg for success)
      //    Set to 'false' (default) for the Clean/Pro white/dark look.
      richColors={true}
      toastOptions={{
        classNames: {
          // Base Toast Style
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg font-sans',

          // Content Styles
          description: 'group-[.toast]:text-muted-foreground text-sm',
          title:
            'group-[.toast]:font-semibold group-[.toast]:text-foreground text-base',

          // Button Styles
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:font-medium hover:group-[.toast]:bg-primary/90',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:font-medium hover:group-[.toast]:bg-muted/90',
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-5 text-green-500" />,
        info: <InfoIcon className="size-5 text-blue-500" />,
        warning: <TriangleAlertIcon className="size-5 text-yellow-500" />,
        error: <OctagonXIcon className="size-5 text-red-500" />,
        loading: (
          <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
        ),
      }}
      {...props}
    />
  );
};

export { Toaster };
