import { useRef, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import apiInstance from '@/services/api';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/rootReducer';

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

  const [showImages, setShowImages] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'pdf' | 'docx' | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [localContent, setLocalContent] = useState(content);
  const [wordCount, setWordCount] = useState(0);
  const [isNamingDialogDisplayed, setIsNamingDialogDisplayed] = useState(false);
  const [cvNameInput, setCvNameInput] = useState('');

  const { students } = useSelector((state: RootState) => state.student);
  // const hasChanges = localContent !== content;

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

  const lastSavedContentRef = useRef('');
  const isInternalContentUpdateRef = useRef(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      const clean = purgeInternalStyles(content);
      setLocalContent(clean);
      updateWordCount(clean);

      if (isInternalContentUpdateRef.current) {
        isInternalContentUpdateRef.current = false;
      } else {
        lastSavedContentRef.current = clean;
        setHasChanges(false);
      }
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

  const buildExportHtml = (cleanBody: string) => {
    const rawStyle = template?.style?.replace(/<style>|<\/style>/g, '') || '';
    const { fullName, jobRole } = students[0]?.student || {};
    const documentTitle =
      title || [fullName, jobRole].filter(Boolean).join(' | ') || 'Document';
    const baseStyle = `
      html, body {
        margin: 0;
        padding: 0;
        background: #ffffff;
      }
      body {
        color: #0f172a;
        font-family: "Plus Jakarta Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        -webkit-font-smoothing: antialiased;
        text-rendering: optimizeLegibility;
      }
      .resume-isolation-container {
        color: #0f172a;
      }
    `;
    const coverLetterStyle =
      type === 'coverletter'
        ? `
      .resume-isolation-container {
        font-family: "Plus Jakarta Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        font-size: 16px;
        line-height: 1.55;
      }
      .resume-isolation-container p {
        margin: 0 0 1.25rem;
      }
      .resume-isolation-container p:last-child {
        margin-bottom: 0;
      }
    `
        : '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${documentTitle}</title>
          <style>${baseStyle}</style>
          ${rawStyle ? `<style>${rawStyle}</style>` : ''}
          ${coverLetterStyle ? `<style>${coverLetterStyle}</style>` : ''}
        </head>
        <body>
          <div class="resume-isolation-container">${cleanBody}</div>
        </body>
      </html>`;
  };

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      updateWordCount(editorRef.current.innerHTML);
    }
  }, []);

  const handleEditorKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault();
      if (editorRef.current) {
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  }, []);

  const toggleEdit = () => {
    if (isEditing) {
      const finalHtml = purgeInternalStyles(editorRef.current?.innerHTML || '');
      const isContentPropChanging = finalHtml !== content;

      if (isContentPropChanging) {
        isInternalContentUpdateRef.current = true;
      }

      setLocalContent(finalHtml);
      setContent(finalHtml);
      setHasChanges(finalHtml !== lastSavedContentRef.current);
      toast({ title: 'Draft Updated' });
    }
    setIsEditing(!isEditing);
  };

  const exportFile = async (format: 'pdf' | 'docx') => {
    setLoadingType(format);
    try {
      const cleanBody = purgeInternalStyles(localContent);
      const fullHtml = buildExportHtml(cleanBody);

      const response = await apiInstance.post(
        `/students/${format}/generate-${format}`,
        {
          html: fullHtml,
          title,
          isShowImage: showImages,
          documentType: type === 'coverletter' ? 'coverletter' : 'resume',
        },
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
        template: template?.id,
      });

      lastSavedContentRef.current = htmlToSave;
      setHasChanges(false);
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
      showImages,
    },
    actions: {
      toggleImages: () => setShowImages((prev) => !prev),
      toggleEdit,
      handleInput,
      handleEditorKeyDown,
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
