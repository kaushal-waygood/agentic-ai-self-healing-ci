'use client';

import dynamic from 'next/dynamic';
import { forwardRef, useMemo } from 'react';
import { Quill } from 'react-quill-new';
import ImageResize from 'quill-image-resize-module-react';
import { ImageDrop } from 'quill-image-drop-module';

// Styles
import 'react-quill-new/dist/quill.snow.css';
import { cn } from "@/lib/utils";

// Register Quill Modules
Quill.register('modules/imageResize', ImageResize);
Quill.register('modules/imageDrop', ImageDrop);

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => (
    <div className="h-[240px] w-full animate-pulse rounded-md border border-input bg-muted" />
  ),
});

interface EditorProps {
  value?: string;
  onChange?: (value: string) => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export const Editor = forwardRef<any, EditorProps>(
  ({ value, onChange, error, helperText, disabled, placeholder, className, ...other }, ref) => {
    
    const modules = useMemo(() => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: [] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        [{ color: [] }, { background: [] }],
        ['link', 'image', 'video'],
        ['clean'],
      ],
      imageResize: {
        modules: ['Resize', 'DisplaySize', 'Toolbar'],
      },
      imageDrop: true,
    }), []);

    const formats = [
      'header', 'font', 'size', 'bold', 'italic', 'underline', 'strike',
      'blockquote', 'code-block', 'script', 'list', 'bullet', 'indent',
      'direction', 'align', 'color', 'background', 'link', 'image', 'video', 'formula',
    ];

    return (
      <div className={cn("flex flex-col gap-1.5", className)}>
        <div
          className={cn(
            "relative flex flex-col overflow-hidden rounded-md border border-input bg-background transition-colors focus-within:ring-1 focus-within:ring-ring",
            error && "border-destructive ring-destructive",
            disabled && "cursor-not-allowed opacity-50 shadow-none"
          )}
        >
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
            onChange={onChange || (() => {})}
            readOnly={disabled}
            placeholder={placeholder}
            modules={modules}
            formats={formats}
            {...other}
          />
        </div>

        {helperText && (
          <p className={cn("text-xs transition-all", error ? "text-destructive" : "text-muted-foreground")}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Editor.displayName = 'Editor';