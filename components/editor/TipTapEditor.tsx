'use client';

import React, { useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Undo,
  Redo,
  Table as TableIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  Highlighter,
  Palette,
  Plus,
  Trash2,
} from 'lucide-react';
import { uploadNoteImage } from '@/lib/firebase/storage';
import BoardThemeToggle from '@/components/student/BoardThemeToggle';

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function TipTapEditor({
  content,
  onChange,
  placeholder = 'Write or paste your classroom notes here (supports copying directly from Microsoft Word)...',
}: TipTapEditorProps) {
  const [boardTheme, setBoardTheme] = useState<'white' | 'black'>('white');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved board theme
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('eboard-theme') as 'white' | 'black' | null;
      if (saved === 'white' || saved === 'black') {
        setBoardTheme(saved);
      }
    } catch {}
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline font-medium',
        },
      }),
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class:
          'tiptap-content focus:outline-none min-h-[500px] p-6 sm:p-10 font-sans leading-relaxed',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return (
      <div className="min-h-[500px] bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 text-sm">
        Loading Microsoft Word-compatible note editor...
      </div>
    );
  }

  // Handle Image File Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const url = await uploadNoteImage(file);
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
    } catch (err: any) {
      alert(err.message || 'Failed to upload image.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle Link Insertion
  const handleSetLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter Link URL:', previousUrl || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const colors = ['#0f172a', '#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed', '#475569'];
  const highlightColors = ['#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#fed7aa'];
  const cmd = () => editor.chain().focus() as any;

  return (
    <div className="bg-slate-100 rounded-2xl border border-slate-300/80 shadow-sm overflow-hidden flex flex-col">
      {/* Hidden File Input for Image Uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* ========================================================= */}
      {/* WORD-STYLE FORMATTING TOOLBAR                             */}
      {/* ========================================================= */}
      <div className="bg-white border-b border-slate-200 px-3 py-2 flex flex-wrap items-center gap-1 text-slate-700 select-none sticky top-16 z-20">
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 pr-1 border-r border-slate-200">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 transition"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 transition"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-0.5 px-1 border-r border-slate-200">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`px-2 py-1 rounded text-xs font-bold transition ${
              editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'
            }`}
            title="Heading 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-2 py-1 rounded text-xs font-bold transition ${
              editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'
            }`}
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-2 py-1 rounded text-xs font-bold transition ${
              editor.isActive('heading', { level: 3 }) ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'
            }`}
            title="Heading 3"
          >
            H3
          </button>
        </div>

        {/* Text Styling: Bold, Italic, Underline, Strikethrough */}
        <div className="flex items-center gap-0.5 px-1 border-r border-slate-200">
          <button
            type="button"
            onClick={() => cmd().toggleBold().run()}
            className={`p-1.5 rounded transition ${
              editor.isActive('bold') ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded transition ${
              editor.isActive('italic') ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded transition ${
              editor.isActive('underline') ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'
            }`}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded transition ${
              editor.isActive('strike') ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
        </div>

        {/* Text Alignment */}
        <div className="flex items-center gap-0.5 px-1 border-r border-slate-200">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-1.5 rounded transition ${
              editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'
            }`}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-1.5 rounded transition ${
              editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'
            }`}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-1.5 rounded transition ${
              editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'
            }`}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`p-1.5 rounded transition ${
              editor.isActive({ textAlign: 'justify' }) ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'
            }`}
            title="Justify"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>

        {/* Lists & Quotes */}
        <div className="flex items-center gap-0.5 px-1 border-r border-slate-200">
          <button
            type="button"
            onClick={() => cmd().toggleBulletList().run()}
            className={`p-1.5 rounded transition ${
              editor.isActive('bulletList') ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => cmd().toggleOrderedList().run()}
            className={`p-1.5 rounded transition ${
              editor.isActive('orderedList') ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => cmd().toggleBlockquote().run()}
            className={`p-1.5 rounded transition ${
              editor.isActive('blockquote') ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'
            }`}
            title="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-1.5 rounded transition ${
              editor.isActive('codeBlock') ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'
            }`}
            title="Code Block"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-1.5 rounded hover:bg-slate-100 transition"
            title="Horizontal Divider"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Colors & Highlight */}
        <div className="flex items-center gap-1 px-1 border-r border-slate-200 relative">
          <button
            type="button"
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowHighlightPicker(false);
            }}
            className="p-1.5 rounded hover:bg-slate-100 flex items-center gap-1 text-xs"
            title="Text Color"
          >
            <Palette className="w-4 h-4" />
          </button>

          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white rounded-xl shadow-lg border border-slate-200 flex gap-1 z-30">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    editor.chain().focus().setColor(c).run();
                    setShowColorPicker(false);
                  }}
                  className="w-5 h-5 rounded-full border border-slate-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setShowHighlightPicker(!showHighlightPicker);
              setShowColorPicker(false);
            }}
            className="p-1.5 rounded hover:bg-slate-100 flex items-center gap-1 text-xs"
            title="Highlight Text"
          >
            <Highlighter className="w-4 h-4" />
          </button>

          {showHighlightPicker && (
            <div className="absolute top-full left-10 mt-1 p-2 bg-white rounded-xl shadow-lg border border-slate-200 flex gap-1 z-30">
              {highlightColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    editor.chain().focus().toggleHighlight({ color: c }).run();
                    setShowHighlightPicker(false);
                  }}
                  className="w-5 h-5 rounded border border-slate-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Media: Image & Link */}
        <div className="flex items-center gap-0.5 px-1 border-r border-slate-200">
          <button
            type="button"
            onClick={handleSetLink}
            className={`p-1.5 rounded transition ${
              editor.isActive('link') ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'
            }`}
            title="Add Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingImage}
            className="p-1.5 rounded hover:bg-slate-100 transition flex items-center gap-1 text-xs"
            title="Upload Image/Diagram"
          >
            <ImageIcon className="w-4 h-4" />
            <span className="hidden sm:inline text-[11px] font-semibold">
              {isUploadingImage ? 'Uploading...' : 'Image'}
            </span>
          </button>
        </div>

        {/* Tables */}
        <div className="relative flex items-center px-1">
          <button
            type="button"
            onClick={() => setShowTableMenu(!showTableMenu)}
            className={`p-1.5 rounded transition flex items-center gap-1 text-xs ${
              editor.isActive('table') ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'
            }`}
            title="Table Tools"
          >
            <TableIcon className="w-4 h-4" />
            <span className="hidden sm:inline text-[11px] font-semibold">Table</span>
          </button>

          {showTableMenu && (
            <div className="absolute top-full right-0 mt-1 p-2 bg-white rounded-xl shadow-xl border border-slate-200 w-48 z-30 text-xs space-y-1">
              {!editor.isActive('table') ? (
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                    setShowTableMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-blue-50 hover:text-blue-700 font-medium"
                >
                  Insert 3x3 Table
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().addRowAfter().run()}
                    className="w-full text-left px-2 py-1 rounded hover:bg-slate-100"
                  >
                    Add Row After
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().deleteRow().run()}
                    className="w-full text-left px-2 py-1 rounded hover:bg-red-50 text-red-600"
                  >
                    Delete Row
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().addColumnAfter().run()}
                    className="w-full text-left px-2 py-1 rounded hover:bg-slate-100"
                  >
                    Add Column After
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().deleteColumn().run()}
                    className="w-full text-left px-2 py-1 rounded hover:bg-red-50 text-red-600"
                  >
                    Delete Column
                  </button>
                  <div className="border-t border-slate-100 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        editor.chain().focus().deleteTable().run();
                        setShowTableMenu(false);
                      }}
                      className="w-full text-left px-2 py-1 rounded hover:bg-red-50 text-red-600 font-semibold"
                    >
                      Delete Whole Table
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Board Background Switcher (Whiteboard / Blackboard) */}
        <div className="ml-auto flex items-center pl-2">
          <BoardThemeToggle
            theme={boardTheme}
            onChange={(theme) => {
              setBoardTheme(theme);
              try {
                localStorage.setItem('eboard-theme', theme);
              } catch {}
            }}
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* WORD-LIKE / BOARD DOCUMENT SHEET CANVAS                   */}
      {/* ========================================================= */}
      <div className={`p-4 sm:p-8 overflow-y-auto flex justify-center transition-colors duration-300 ${
        boardTheme === 'black' ? 'bg-slate-950' : 'bg-slate-200/60'
      }`}>
        <div className={`w-full max-w-4xl rounded-xl transition-all duration-300 ${
          boardTheme === 'black'
            ? 'bg-[#0f172a] text-slate-100 border border-slate-800 shadow-2xl blackboard-theme'
            : 'bg-white text-slate-900 border border-slate-200/90 shadow-document'
        }`}>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
