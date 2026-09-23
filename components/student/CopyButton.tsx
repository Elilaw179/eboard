'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  content: string;
  title: string;
  className?: string;
}

export default function CopyButton({ content, title, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // Find the document element if in browser
      const docElement = document.getElementById('board-note-content');
      if (docElement) {
        // Copy formatted text using clipboard API
        const plainText = docElement.innerText || docElement.textContent || '';
        const fullCopy = `${title}\n\n${plainText}`;
        await navigator.clipboard.writeText(fullCopy);
      } else {
        await navigator.clipboard.writeText(`${title}\n\n${content}`);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
        copied
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm'
      } ${className}`}
      title="Copy note text to clipboard (or select text manually and press Ctrl+C)"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>Copied Note!</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 text-slate-500" />
          <span>Copy Note</span>
        </>
      )}
    </button>
  );
}
