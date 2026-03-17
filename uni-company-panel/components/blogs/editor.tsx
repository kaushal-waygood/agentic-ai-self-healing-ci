'use client';

import dynamic from 'next/dynamic';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils'; // Standard Shadcn utility
import { Label } from '@/components/ui/label';

// --- Quill Dynamic Setup ---
if (typeof window !== 'undefined') {
  const { Quill: QuillBase } = require('react-quill-new');
  const ImageResize = require('quill-image-resize-module-react').default;
  const { ImageDrop } = require('quill-image-drop-module');

  QuillBase.register('modules/imageResize', ImageResize);
  QuillBase.register('modules/imageDrop', ImageDrop);

  const Parchment = QuillBase.import('parchment');
  if (!Parchment.Attributor) {
    Parchment.Attributor =
      Parchment.AttributorClass || Parchment.StyleAttributor;
  }
}

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => (
    <div className="h-[240px] w-full rounded-md border border-input bg-muted/50 animate-pulse" />
  ),
});

import 'react-quill-new/dist/quill.snow.css';

// --- Types ---
interface EditorProps {
  value?: string;
  onChange?: (content: string) => void;
  error?: boolean;
  helperText?: string;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

export const Editor = forwardRef<any, EditorProps>(
  (
    {
      value,
      onChange,
      error,
      helperText,
      placeholder = 'Write something...',
      className,
      editable = true,
      ...other
    },
    ref,
  ) => {
    const modules = {
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: [] }],
        [{ size: ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ script: 'sub' }, { script: 'super' }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ direction: 'rtl' }],
        [{ align: [] }],
        [{ color: [] }, { background: [] }],
        ['link', 'image', 'video', 'formula'],
        ['clean'],
      ],
      imageResize: {
        modules: ['Resize', 'DisplaySize', 'Toolbar'],
      },
      imageDrop: true,
    };

    const formats = [
      'header',
      'font',
      'size',
      'bold',
      'italic',
      'underline',
      'strike',
      'blockquote',
      'code-block',
      'script',
      'list',
      'bullet',
      'indent',
      'direction',
      'align',
      'color',
      'background',
      'link',
      'image',
      'video',
      'formula',
    ];

    return (
      <div className={cn('flex flex-col gap-1.5 w-full', className)}>
        <div
          className={cn(
            'relative flex flex-col overflow-hidden rounded-md border border-input bg-background transition-colors focus-within:ring-1 focus-within:ring-ring',
            error && 'border-destructive ring-destructive',
            !editable && 'opacity-50 pointer-events-none cursor-not-allowed',
          )}
        >
          {/* Custom Styles for Quill inside Shadcn container */}
          <style jsx global>{`
            .ql-toolbar.ql-snow {
              border: none !important;
              border-bottom: 1px solid hsl(var(--border)) !important;
              background-color: hsl(var(--background));
              position: sticky;
              top: 0;
              z-index: 10;
            }
            .ql-container.ql-snow {
              border: none !important;
              font-family: inherit !important;
              font-size: 0.875rem !important;
            }
            .ql-editor {
              min-height: 240px;
              max-height: 640px;
              overflow-y: auto;

              /* These are the critical lines for long nonsense strings */
              word-break: break-all !important;
              overflow-wrap: break-word !important;
              white-space: pre-wrap !important;
            }

            /* Force the root of the editor to stay within the bounds of its parent */
            .quill {
              width: 100% !important;
              max-width: 100% !important;
              table-layout: fixed !important;
            }
            .ql-editor.ql-blank::before {
              color: hsl(var(--muted-foreground));
              font-style: normal;
            }
          `}</style>

          <ReactQuill
            ref={ref}
            theme="snow"
            value={value}
            onChange={onChange}
            readOnly={!editable}
            placeholder={placeholder}
            modules={modules}
            formats={formats}
            {...other}
          />
        </div>

        {helperText && (
          <p
            className={cn(
              'text-[0.8rem] font-medium px-2',
              error ? 'text-destructive' : 'text-muted-foreground',
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Editor.displayName = 'Editor';
