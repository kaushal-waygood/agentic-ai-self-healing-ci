// components/rich-text/Editor.tsx
'use client';

import React, { forwardRef, useEffect } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

interface EditorProps {
  initialValue?: string;
}

const Editor = forwardRef<Quill, EditorProps>(({ initialValue }, ref) => {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const quillRef = React.useRef<Quill | null>(null);

  React.useImperativeHandle(ref, () => quillRef.current as Quill);

  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
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
    }
  }, [initialValue]);

  return <div ref={editorRef} />;
});

Editor.displayName = 'Editor';

export default Editor;
