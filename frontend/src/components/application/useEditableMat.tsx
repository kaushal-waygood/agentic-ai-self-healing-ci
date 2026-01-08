import { useRef, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import apiInstance from '@/services/api';

interface UseEditableProps {
  content: string;
  setContent: (val: string) => void;
  title: string;
  type: 'resume' | 'coverletter';
  template: any;
}

export const useEditableMaterial = ({
  content,
  setContent,
  title,
  type,
  template,
}: UseEditableProps) => {
  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'pdf' | 'docx' | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [localContent, setLocalContent] = useState(content);
  const [wordCount, setWordCount] = useState(0);
  const [isNamingDialogDisplayed, setIsNamingDialogDisplayed] = useState(false);
  const [cvNameInput, setCvNameInput] = useState('');

  const hasChanges = localContent !== content;

  // STRONGER PURGE: Removes all styles, head tags, and extra metadata
  const purgeInternalStyles = (html: string) => {
    if (!html) return '';
    return html
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<head[\s\S]*?<\/head>/gi, '')
      .replace(
        /<html>| <\/html> | <body> | <\/body> | <!DOCTYPE html> | <meta[\s\S]*?> | <title[\s\S]*?<\/title>/gi,
        '',
      )
      .trim();
  };

  useEffect(() => {
    if (!isEditing) {
      const clean = purgeInternalStyles(content);
      setLocalContent(clean);
      updateWordCount(clean);
    }
  }, [content, isEditing]);

  // Sync editor innerHTML
  useEffect(() => {
    if (editorRef.current) {
      const cleanHtml = purgeInternalStyles(localContent);
      if (editorRef.current.innerHTML !== cleanHtml) {
        editorRef.current.innerHTML = cleanHtml;
      }
    }
  }, [isEditing, template, localContent]);

  const updateWordCount = (html: string) => {
    const text = html.replace(/<[^>]*>/g, ' ').trim();
    setWordCount(text ? text.split(/\s+/).length : 0);
  };

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      updateWordCount(editorRef.current.innerHTML);
    }
  }, []);

  const toggleEdit = () => {
    if (isEditing) {
      const finalHtml = purgeInternalStyles(editorRef.current?.innerHTML || '');
      setLocalContent(finalHtml);
      setContent(finalHtml);
      toast({ title: 'Draft Updated' });
    }
    setIsEditing(!isEditing);
  };

  const exportFile = async (format: 'pdf' | 'docx') => {
    setLoadingType(format);
    try {
      const cleanBody = purgeInternalStyles(localContent);
      // Ensure template style is not double wrapped in <style> tags
      const rawStyle = template?.style?.replace(/<style>|<\/style>/g, '') || '';

      const fullHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>${rawStyle}</style>
          </head>
          <body>
            <div class="resume-isolation-container">${cleanBody}</div>
          </body>
        </html>`;

      const response = await apiInstance.post(
        `/students/${format}/generate-${format}`,
        { html: fullHtml, title },
        { responseType: 'blob' },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `zobsai_${title.replace(/\s+/g, '_')}.${format}`;
      link.click();
    } catch (e) {
      toast({ variant: 'destructive', title: 'Export Failed' });
    } finally {
      setLoadingType(null);
    }
  };

  const saveToDatabase = async () => {
    setIsLoading(true);
    try {
      const htmlToSave = purgeInternalStyles(
        isEditing ? editorRef.current?.innerHTML || '' : localContent,
      );
      const endpoint =
        type === 'coverletter'
          ? '/students/letter/save/html'
          : '/students/resume/save/html';

      await apiInstance.post(endpoint, {
        html: htmlToSave,
        title: cvNameInput.trim() || `${title} - Final`,
      });

      toast({ title: 'Saved Successfully' });
      setIsNamingDialogDisplayed(false);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Save Failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    editorRef,
    containerRef,
    state: {
      isEditing,
      isLoading,
      loadingType,
      isFullscreen,
      localContent,
      wordCount,
      hasChanges,
      isNamingDialogDisplayed,
      cvNameInput,
    },
    actions: {
      toggleEdit,
      handleInput,
      exportFile,
      setIsNamingDialogDisplayed,
      setCvNameInput,
      saveToDatabase,
      execCommand: (cmd: string, value?: string) => {
        document.execCommand(cmd, false, value);
        editorRef.current?.focus();
        handleInput();
      },
      applyFontSize: (size: string) => {
        document.execCommand('fontSize', false, '7');
        const fonts = editorRef.current?.getElementsByTagName('font');
        if (fonts) {
          Array.from(fonts).forEach((f) => {
            if (f.size === '7') {
              f.removeAttribute('size');
              f.style.fontSize = `${size}px`;
            }
          });
        }
        handleInput();
      },
      toggleFullscreen: () => {
        if (!document.fullscreenElement)
          containerRef.current?.requestFullscreen();
        else document.exitFullscreen();
        setIsFullscreen(!isFullscreen);
      },
    },
  };
};
