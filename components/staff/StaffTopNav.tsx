'use client';

import React, { useState } from 'react';
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
  Menu,
  X,
  UserCircle2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { name: 'Dashboard', href: '/staff/dashboard', icon: LayoutDashboard },
  { name: 'My Notes', href: '/staff/notes', icon: FileText },
  { name: 'Upload Note', href: '/staff/notes/new', icon: FilePlus },
  { name: 'Subjects', href: '/staff/subjects', icon: BookMarked },
];

export default function StaffTopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/staff/login');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-slate-900 border-b border-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/staff/dashboard" className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-white p-0.5 shadow-md flex items-center justify-center border border-slate-700">
              <img src="/logo.png" alt="Lawtronic Technologies" className="w-full h-full object-contain" />
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-sm text-white leading-tight block">
                Lawtronic <span className="text-blue-400">Staff</span>
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block -mt-0.5">
                Teacher Portal
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/staff/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View Student Portal */}
            <Link
              href="/"
              target="_blank"
              title="View Student Portal"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <Presentation className="w-4 h-4 text-blue-400" />
              <ExternalLink className="w-3 h-3" />
            </Link>

            {/* User chip (desktop) */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700">
              <UserCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <div className="text-right">
                <p className="text-xs font-semibold text-white leading-tight truncate max-w-[120px]">
                  {user?.displayName || user?.email?.split('@')[0] || 'Staff'}
                </p>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Staff
                </span>
              </div>
            </div>

            {/* Logout (desktop) */}
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-white hover:bg-red-600/90 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 top-16">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Menu panel */}
          <div className="absolute top-0 inset-x-0 bg-slate-900 border-b border-slate-800 shadow-2xl px-4 py-4 space-y-1">
            {/* User Info */}
            <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-slate-800/60 rounded-xl border border-slate-700/50">
              <UserCircle2 className="w-8 h-8 text-blue-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">
                  {user?.displayName || user?.email?.split('@')[0] || 'Staff'}
                </p>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Staff Member
                </span>
              </div>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/staff/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <div className="pt-2 mt-2 border-t border-slate-800 space-y-1">
              <Link
                href="/"
                target="_blank"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <Presentation className="w-4 h-4 text-blue-400" />
                <span>View Student Portal</span>
                <ExternalLink className="w-3 h-3 ml-auto" />
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:text-white hover:bg-red-600/90 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
