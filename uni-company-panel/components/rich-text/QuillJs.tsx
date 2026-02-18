// components/rich-text/QuillJs.tsx
'use client';

import React, { useRef, useEffect } from 'react';
import Editor from './Editor';

interface QuillJsProps {
  content?: string;
  onContentChange: (content: string) => void;
}

const QuillJs = ({ content = '', onContentChange }: QuillJsProps) => {
  const quillRef = useRef<any>(null);

  // Only handle text changes, don't keep re-writing content to editor
  useEffect(() => {
    if (!quillRef.current) return;

    const handler = () => {
      const html = quillRef.current?.root.innerHTML || '';
      onContentChange(html);
    };

    quillRef.current.on('text-change', handler);

    return () => {
      quillRef.current?.off('text-change', handler);
    };
  }, [onContentChange]);

  return (
    <div className="h-64">
      {/* initialValue is used once inside Editor on mount */}
      <Editor ref={quillRef} initialValue={content} />
    </div>
  );
};

export default QuillJs;
