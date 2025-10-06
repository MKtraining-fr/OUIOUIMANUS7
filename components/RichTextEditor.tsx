import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Bold, Italic, Palette, Strikethrough, X } from 'lucide-react';
import { RichTextValue } from '../types';
import { sanitizeRichTextValue } from '../utils/richText';

interface RichTextEditorProps {
  id: string;
  value?: RichTextValue | null;
  fallback: string;
  onChange: (value: RichTextValue | null) => void;
  className?: string;
  placeholder?: string;
}

const formatButtonClassName =
  'inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-brand-primary/50 hover:text-brand-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:opacity-50';

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  id,
  value,
  fallback,
  onChange,
  className,
  placeholder,
}) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [isEmpty, setIsEmpty] = useState(() => {
    const initial = value?.plainText ?? fallback;
    return initial.trim().length === 0;
  });

  const updateEmptyState = () => {
    const editor = editorRef.current;
    if (!editor) {
      setIsEmpty(true);
      return;
    }
    const textContent = editor.textContent ?? '';
    setIsEmpty(textContent.trim().length === 0);
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }
    if (value && typeof value.html === 'string') {
      if (editor.innerHTML !== value.html) {
        editor.innerHTML = value.html;
      }
    } else {
      editor.innerHTML = fallback;
    }
    updateEmptyState();
  }, [value, fallback]);

  const handleInput = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    updateEmptyState();

    const html = editor.innerHTML;
    const plainText = editor.textContent ?? '';

    onChange({
      html,
      plainText,
    });
  }, [onChange]);

  const handleBlur = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    const html = editor.innerHTML;
    const plainText = editor.textContent ?? '';

    onChange(
      sanitizeRichTextValue({
        html,
        plainText,
      }),
    );
  }, [onChange]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' && event.shiftKey) {
        event.preventDefault();
        document.execCommand('insertLineBreak');
      }
    },
    [],
  );

  const handlePaste = useCallback((event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    const text = event.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  const handleBold = useCallback(() => {
    document.execCommand('bold', false);
  }, []);

  const handleItalic = useCallback(() => {
    document.execCommand('italic', false);
  }, []);

  const handleStrikethrough = useCallback(() => {
    document.execCommand('strikeThrough', false);
  }, []);

  const handleColorChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const color = event.target.value;
    document.execCommand('foreColor', false, color);
  }, []);

  const handleRemoveFormatting = useCallback(() => {
    document.execCommand('removeFormat', false);
  }, []);

  return (
    <div className={className}>
      <div className="mb-2 flex flex-wrap gap-2">
        <button
          type="button"
          className={formatButtonClassName}
          onClick={handleBold}
          aria-label="Gras"
        >
          <Bold className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          className={formatButtonClassName}
          onClick={handleItalic}
          aria-label="Italique"
        >
          <Italic className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          className={formatButtonClassName}
          onClick={handleStrikethrough}
          aria-label="Barrer"
        >
          <Strikethrough className="h-4 w-4" aria-hidden="true" />
        </button>
        <label className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Palette className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Choisir une couleur</span>
          <input
            type="color"
            className="h-8 w-8 cursor-pointer rounded-full border border-slate-200"
            onChange={handleColorChange}
            aria-label="Sélectionner une couleur de texte"
          />
        </label>
        <button
          type="button"
          className={formatButtonClassName}
          onClick={handleRemoveFormatting}
          aria-label="Supprimer la mise en forme"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div className="relative">
        {placeholder && isEmpty && (
          <div className="pointer-events-none absolute left-4 top-3 text-sm text-slate-400">{placeholder}</div>
        )}
        <div
          id={id}
          ref={editorRef}
          className="ui-textarea w-full min-h-[120px] whitespace-pre-wrap break-words px-4 py-3"
          contentEditable
          role="textbox"
          aria-multiline="true"
          suppressContentEditableWarning
          onInput={handleInput}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
        />
      </div>
    </div>
  );
};

export default RichTextEditor;
