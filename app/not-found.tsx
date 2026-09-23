import Link from 'next/link';
import { BookOpen, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <div className="w-16 h-16 mx-auto bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-5">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Lesson Not Found</h1>
        <p className="text-slate-600 mb-6 text-sm">
          The classroom note or page you are looking for might have been moved or is no longer available.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition shadow-sm"
          >
            <Home className="w-4 h-4" />
            Back to ClassBoard
          </Link>
          <Link
            href="/classes"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-200 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Select Class
          </Link>
        </div>
      </div>
    </div>
  );
}
