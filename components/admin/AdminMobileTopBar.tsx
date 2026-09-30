'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, Plus, Presentation } from 'lucide-react';
import { useAdminUI } from './AdminUIContext';

export default function AdminMobileTopBar() {
  const { toggleSidebar } = useAdminUI();

  return (
    <header className="lg:hidden sticky top-0 z-30 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-md">
      {/* Left: Hamburger & Brand */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="p-2 -ml-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Open admin navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-white p-0.5 shadow-sm flex items-center justify-center flex-shrink-0">
            <img
              src="/logo.png"
              alt="Lawtronic Technologies"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="font-extrabold text-sm text-white block leading-tight">
              Lawtronic <span className="text-blue-400">Admin</span>
            </span>
            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block -mt-0.5">
              Teacher Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Right: Quick Action Buttons */}
      <div className="flex items-center gap-2">
        <Link
          href="/"
          target="_blank"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition text-xs"
          title="View Student Portal"
        >
          <Presentation className="w-4 h-4 text-blue-400" />
        </Link>
        <Link
          href="/admin/notes/new"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Note</span>
        </Link>
      </div>
    </header>
  );
}
