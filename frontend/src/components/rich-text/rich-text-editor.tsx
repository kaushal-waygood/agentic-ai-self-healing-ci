'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React, { useEffect } from 'react';
import { Toolbar } from './toolbar';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const RichTextEditor = ({
  value,
  onChange,
  placeholder,
}: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert prose-sm focus:outline-none min-h-[200px] p-2',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return <div className="min-h-[200px] rounded-md border bg-background" />;
  }

  return (
    <div className="rounded-md border bg-background focus-within:ring-2 focus-within:ring-ring">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} placeholder={placeholder} />
    </div>
  );
};
