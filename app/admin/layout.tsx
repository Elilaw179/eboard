'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminMobileTopBar from '@/components/admin/AdminMobileTopBar';
import { AdminUIProvider } from '@/components/admin/AdminUIContext';

// Pages only accessible to admins (not staff)
const ADMIN_ONLY_PATHS = ['/admin/staff', '/admin/hero'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { loading, isAuthenticated, isAdmin, isStaff } = useAuth();

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!loading && !isAuthenticated && !isLoginPage) {
      router.replace('/admin/login');
      return;
    }

    // If staff user tries to access admin-only pages, redirect them
    if (!loading && isStaff && ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p))) {
      router.replace('/admin/notes');
    }
  }, [loading, isAuthenticated, isAdmin, isStaff, isLoginPage, pathname, router]);

  // If on login page, display clean full page
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and not yet redirected, render nothing to avoid flash
  if (!isAuthenticated) {
    return null;
  }

  return (
    <AdminUIProvider>
      <div className="flex min-h-screen bg-slate-50">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden overflow-y-auto">
          {/* Mobile Top Header (only on screens < lg) */}
          <AdminMobileTopBar />

          {/* Main Page Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </AdminUIProvider>
  );
}
