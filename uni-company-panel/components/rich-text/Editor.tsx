// components/rich-text/Editor.tsx
'use client';

import React, { forwardRef, useEffect } from 'react';
import 'quill/dist/quill.snow.css';

interface EditorProps {
  initialValue?: string;
}

const Editor = forwardRef<any, EditorProps>(({ initialValue }, ref) => {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const quillRef = React.useRef<any>(null);

  React.useImperativeHandle(ref, () => quillRef.current);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;
    if (editorRef.current && !quillRef.current) {
      // Dynamic import of Quill to avoid SSR issues
      import('quill').then((QuillModule) => {
        const Quill = QuillModule.default;
        quillRef.current = new Quill(editorRef.current!, {
          theme: 'snow',
          modules: {
            toolbar: [
              [{ header: [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ list: 'ordered' }, { list: 'bullet' }],
              ['link'],
              ['clean'],
            ],
          },
          placeholder: 'Write your job description here...',
        });

        if (initialValue) {
          quillRef.current.root.innerHTML = initialValue;
        }
      });
    }
  }, [initialValue]);

  return <div ref={editorRef} />;
});

Editor.displayName = 'Editor';

export default Editor;
