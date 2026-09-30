import React from 'react';
import Link from 'next/link';
import { Plus, Loader2 } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
    loading?: boolean;
    disabled?: boolean;
  };
}

export default function AdminHeader({ title, subtitle, action }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">{title}</h1>
        {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed">{subtitle}</p>}
      </div>

      {action && (
        <div className="flex-shrink-0 w-full sm:w-auto">
          {action.href ? (
            <Link
              href={action.href}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-blue-600/20 transition active:scale-95"
            >
              {action.icon || <Plus className="w-4 h-4" />}
              <span>{action.label}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={action.onClick}
              disabled={action.disabled || action.loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-blue-600/20 transition active:scale-95"
            >
              {action.loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                action.icon || <Plus className="w-4 h-4" />
              )}
              <span>{action.label}</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}
