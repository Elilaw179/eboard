'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  FilePlus,
  BookMarked,
  LogOut,
  Presentation,
  ExternalLink,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAdminUI } from './AdminUIContext';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const { sidebarOpen, closeSidebar } = useAdminUI();

  const handleLogout = async () => {
    await logout();
    closeSidebar();
    router.push('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Notes', href: '/admin/notes', icon: FileText },
    { name: 'Create Note', href: '/admin/notes/new', icon: FilePlus },
    { name: 'Subjects', href: '/admin/subjects', icon: BookMarked },
    { name: 'Hero Settings', href: '/admin/hero', icon: ImageIcon },
  ];

  // Common sidebar navigation content
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <Link
          href="/admin/dashboard"
          onClick={closeSidebar}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white p-1 border border-slate-700 shadow-md flex items-center justify-center flex-shrink-0">
            <img
              src="/logo.png"
              alt="Lawtronic Technologies"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="font-extrabold text-base text-white block leading-tight">
              Lawtronic <span className="text-blue-400">Admin</span>
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block mt-0.5">
              Teacher Portal
            </span>
          </div>
        </Link>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={closeSidebar}
          className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          aria-label="Close navigation menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={closeSidebar}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-6 mt-6 border-t border-slate-800">
          <Link
            href="/"
            target="_blank"
            onClick={closeSidebar}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
          >
            <span className="flex items-center gap-2">
              <Presentation className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <span>View Student Portal</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="overflow-hidden pr-2">
            <p className="text-xs font-semibold text-white truncate">
              {user?.displayName || 'Teacher'}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {user?.email || 'admin@eboard.edu'}
            </p>
          </div>
          {user?.isDemo && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
              Demo
            </span>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:text-white hover:bg-red-600/90 transition duration-200"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── DESKTOP SIDEBAR (Static on screens lg and up) ─────────── */}
      <aside className="hidden lg:flex w-64 bg-slate-900 text-slate-300 flex-col flex-shrink-0 h-screen sticky top-0 border-r border-slate-800 z-20">
        {sidebarContent}
      </aside>

      {/* ── MOBILE DRAWER (Slide-in on mobile / tablet) ─────────── */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop overlay */}
        <div
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
          onClick={closeSidebar}
        />

        {/* Sliding drawer */}
        <div
          className={`absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-slate-900 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out border-r border-slate-800 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </div>
      </div>
    </>
  );
}
