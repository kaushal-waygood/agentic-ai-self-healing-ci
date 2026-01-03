import React from 'react';

interface EditorToolbarProps {
  onFontFamily: (font: string) => void;
  onFontSize: (size: number) => void;
  onTextColor: (color: string) => void;
  onHighlight: (color: string) => void;

  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;

  onAlignLeft: () => void;
  onAlignCenter: () => void;
  onAlignRight: () => void;
  onAlignJustify: () => void;

  onBulletList: () => void;
  onNumberList: () => void;

  onClear: () => void;
}

const FONT_SIZES = [10, 11, 12, 13, 14, 16, 18];
const FONT_FAMILIES = [
  'Times New Roman',
  'Arial',
  'Calibri',
  'Georgia',
  'Helvetica',
];

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onFontFamily,
  onFontSize,
  onTextColor,
  onHighlight,

  onBold,
  onItalic,
  onUnderline,

  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onAlignJustify,

  onBulletList,
  onNumberList,

  onClear,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-1 border border-gray-300 rounded-lg p-1 bg-gray-50">
      {/* Font Family */}
      <select
        onChange={(e) => onFontFamily(e.target.value)}
        className="border px-2 py-1 text-sm rounded"
      >
        {FONT_FAMILIES.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>

      {/* Font Size */}
      <select
        onChange={(e) => onFontSize(Number(e.target.value))}
        className="border px-2 py-1 text-sm rounded"
      >
        {FONT_SIZES.map((s) => (
          <option key={s} value={s}>
            {s}px
          </option>
        ))}
      </select>

      {/* Colors */}
      <input
        type="color"
        title="Text Color"
        onChange={(e) => onTextColor(e.target.value)}
      />
      <input
        type="color"
        title="Highlight"
        onChange={(e) => onHighlight(e.target.value)}
      />

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Inline formatting */}
      <button onClick={onBold} className="px-2 font-bold">
        B
      </button>
      <button onClick={onItalic} className="px-2 italic">
        I
      </button>
      <button onClick={onUnderline} className="px-2 underline">
        U
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Alignment */}
      <button onClick={onAlignLeft} className="px-2">
        L
      </button>
      <button onClick={onAlignCenter} className="px-2">
        C
      </button>
      <button onClick={onAlignRight} className="px-2">
        R
      </button>
      <button onClick={onAlignJustify} className="px-2">
        J
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Lists */}
      <button onClick={onBulletList} className="px-2">
        •
      </button>
      <button onClick={onNumberList} className="px-2">
        1.
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Clear */}
      <button onClick={onClear} className="px-2 text-red-600">
        Clear
      </button>
    </div>
  );
};

export default EditorToolbar;
