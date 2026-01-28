import React, { FC } from 'react';
import {
  Copy,
  Edit3,
  Download,
  Loader2,
  Save,
  Eye,
  Maximize2,
  Minimize2,
  FileText,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Input } from '../ui/input';
import EditorToolbar from './EditorToolbar';
import { useEditableMaterial } from './useEditableMat';

interface EditableMaterialProps {
  template: any;
  content: string;
  setContent: (value: string) => void;
  title: string;
  isHtml?: boolean;
  className?: string;
  type?: 'resume' | 'coverletter';
}

const EditableMaterial: FC<EditableMaterialProps> = ({
  content,
  setContent,
  title,
  template,
  type = 'resume',
  className = '',
}) => {
  const { editorRef, containerRef, state, actions } = useEditableMaterial({
    content,
    setContent,
    title,
    type,
    template,
  });

  const handleCopy = async () => {
    const text = editorRef.current?.innerText || '';
    await navigator.clipboard.writeText(text);
    toast({ title: 'Copied plain text' });
  };

  return (
    <div
      ref={containerRef}
      className={`bg-gray-100 flex flex-col transition-all border ${
        state.isFullscreen ? 'fixed inset-0 z-50' : 'relative rounded-xl '
      } ${className}`}
    >
      {/* Header Toolbar */}
      <header className="flex flex-wrap items-center justify-between border-b p-3 bg-white rounded-t-xl sticky top-0 z-20">
        <div className="flex items-center gap-3">
          {state.isEditing ? (
            <Edit3 className="w-5 text-blue-500" />
          ) : (
            <Eye className="w-5 text-gray-500" />
          )}
          <h3 className="font-bold text-gray-700">{title}</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {state.isEditing && (
            <div className="hidden xl:block border-r pr-2 mr-2">
              <EditorToolbar
                onFontFamily={(f) => actions.execCommand('fontName', f)}
                onFontSize={actions.applyFontSize}
                onTextColor={(c) => actions.execCommand('foreColor', c)}
                onHighlight={(c) => actions.execCommand('hiliteColor', c)}
                onBold={() => actions.execCommand('bold')}
                onItalic={() => actions.execCommand('italic')}
                onUnderline={() => actions.execCommand('underline')}
                onAlignLeft={() => actions.execCommand('justifyLeft')}
                onAlignCenter={() => actions.execCommand('justifyCenter')}
                onAlignRight={() => actions.execCommand('justifyRight')}
                onAlignJustify={() => actions.execCommand('justifyFull')}
                onBulletList={() => actions.execCommand('insertUnorderedList')}
                onNumberList={() => actions.execCommand('insertOrderedList')}
                onClear={() => actions.execCommand('removeFormat')}
              />
            </div>
          )}

          <button
            onClick={() => actions.setIsNamingDialogDisplayed(true)}
            disabled={!state.hasChanges || state.isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              state.hasChanges
                ? 'bg-indigo-600 text-white '
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            <Save size={16} /> Final Save
          </button>

          <button
            onClick={actions.toggleFullscreen}
            className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"
          >
            {state.isFullscreen ? (
              <Minimize2 size={20} />
            ) : (
              <Maximize2 size={20} />
            )}
          </button>
        </div>
      </header>

      <div className="flex items-center gap-2 justify-end p-2">
        <button
          onClick={actions.toggleImages}
          className={`p-2 rounded-lg transition-colors flex items-center gap-2 my-1 ${
            state.showImages
              ? 'text-white bg-blue-600'
              : 'text-gray-400 hover:bg-gray-100'
          }`}
          title={state.showImages ? 'Hide Images' : 'Show Images'}
        >
          {/* Using Lucide Eye icon or Image icon */}
          <Eye
            size={20}
            className={state.showImages ? 'opacity-100' : 'opacity-40'}
          />{' '}
          Show Profile Image
        </button>
      </div>

      {/* Editor Main Canvas */}
      <main className="flex-grow overflow-y-auto p-4 md:p-10 bg-gray-200/40 custom-scrollbar">
        {template?.style && (
          <style dangerouslySetInnerHTML={{ __html: template.style }} />
        )}

        <div
          ref={editorRef}
          contentEditable={state.isEditing}
          onInput={actions.handleInput}
          suppressContentEditableWarning
          className={`mx-auto bg-white transition-all duration-300 ${
            state.isEditing ? 'ring-4 ring-blue-100' : ''
          } 
          ${!state.showImages ? 'hide-editor-images' : ''} 
          w-full max-w-[210mm] focus:outline-none p-[15mm] md:p-[20mm]`}
        />
      </main>

      {/* Footer */}
      <footer className="p-4 border-t bg-white flex flex-wrap items-center justify-between gap-4 rounded-b-xl">
        <div className="flex items-center gap-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          <span>{state.wordCount} Words</span>
          {/* {state.hasChanges && (
            <span className="text-amber-500 flex items-center gap-1">
              <AlertCircle size={14} /> Draft Updated
            </span>
          )} */}
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={actions.toggleEdit}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all active:scale-95 ${
              state.isEditing
                ? 'bg-green-600 text-white'
                : 'bg-gray-900 text-white hover:bg-black'
            }`}
          >
            {state.isEditing ? 'Confirm Edits' : 'Edit Document'}
          </button>

          <button
            onClick={handleCopy}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <Copy size={18} />
          </button>

          <div className="h-6 w-px bg-gray-200 mx-2" />

          <button
            onClick={() => actions.exportFile('pdf')}
            disabled={!!state.loadingType}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 disabled:opacity-50"
          >
            {state.loadingType === 'pdf' ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Download size={16} />
            )}{' '}
            PDF
          </button>

          <button
            onClick={() => actions.exportFile('docx')}
            disabled={!!state.loadingType}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 disabled:opacity-50"
          >
            {state.loadingType === 'docx' ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <FileText size={16} />
            )}{' '}
            DOCX
          </button>
        </div>
      </footer>

      {/* Save Dialog */}
      <AlertDialog
        open={state.isNamingDialogDisplayed}
        onOpenChange={actions.setIsNamingDialogDisplayed}
      >
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Permanent Save</AlertDialogTitle>
            <AlertDialogDescription>
              Save this version to your profile. Edits will be final for this
              name.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            placeholder="e.g., Google Resume v1"
            value={state.cvNameInput}
            onChange={(e) => actions.setCvNameInput(e.target.value)}
            className="my-2"
          />
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={actions.saveToDatabase}
              className="bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              Confirm Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditableMaterial;
