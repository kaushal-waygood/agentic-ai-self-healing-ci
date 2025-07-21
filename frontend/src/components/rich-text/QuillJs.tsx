// components/rich-text/QuillJs.tsx
'use client';

import React, { useRef, useEffect } from 'react';
import Editor from './Editor';
import Quill from 'quill';

interface QuillJsProps {
  content?: string;
  onContentChange: (content: string) => void;
}

const QuillJs = ({ content = '', onContentChange }: QuillJsProps) => {
  const quillRef = useRef<Quill | null>(null);

  useEffect(() => {
    if (quillRef.current) {
      // Set up text change handler
      const handler = () => {
        const html = quillRef.current?.root.innerHTML || '';
        onContentChange(html);
      };

      quillRef.current.on('text-change', handler);

      // Set initial content
      if (content) {
        quillRef.current.root.innerHTML = content;
      }

      return () => {
        quillRef.current?.off('text-change', handler);
      };
    }
  }, [onContentChange, content]);

  return (
    <div className="h-64">
      <Editor ref={quillRef} initialValue={content} />
    </div>
  );
};

export default QuillJs;
