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
    <header className="bg-white border-b border-slate-200 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-blue-600/20 transition"
          >
            {action.icon || <Plus className="w-4 h-4" />}
            <span>{action.label}</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={action.onClick}
            disabled={action.disabled || action.loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-sm shadow-blue-600/20 transition"
          >
            {action.loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              action.icon || <Plus className="w-4 h-4" />
            )}
            <span>{action.label}</span>
          </button>
        )
      )}
    </header>
  );
}
