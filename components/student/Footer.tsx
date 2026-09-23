import React from 'react';
import Link from 'next/link';
import { Presentation, ShieldCheck, Heart } from 'lucide-react';

export default function StudentFooter() {
  return (
    <footer className="no-print bg-white border-t border-slate-200 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-slate-700">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Presentation className="w-4 h-4" />
            </div>
            <span className="font-semibold text-slate-800 text-sm">ClassBoard</span>
            <span className="text-slate-400 text-xs">— Modern Digital Classroom Notes</span>
          </div>

          <p className="text-xs text-slate-500 text-center sm:text-left">
            Your classroom notes, always within reach. Open, project, read, and copy with ease.
          </p>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>© {new Date().getFullYear()} EBoard</span>
            <span>•</span>
            <Link
              href="/admin/login"
              className="hover:text-slate-600 transition-colors flex items-center gap-1 text-slate-400 hover:underline"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Teacher Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
