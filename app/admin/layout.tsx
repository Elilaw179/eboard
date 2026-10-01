'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminMobileTopBar from '@/components/admin/AdminMobileTopBar';
import { AdminUIProvider } from '@/components/admin/AdminUIContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { loading, isAuthenticated, isAdmin, isStaff } = useAuth();

  const isLoginPage = pathname === '/admin/login';
  // Staff portal has its own layout — let it pass through without interference
  const isStaffPortal = pathname?.startsWith('/admin/staff-portal');

  useEffect(() => {
    // If not logged in, send to login (except when already on login)
    if (!loading && !isAuthenticated && !isLoginPage) {
      router.replace('/admin/login');
      return;
    }

    // If a staff member lands on any admin page (other than login or staff-portal),
    // redirect them to their own staff portal immediately
    if (!loading && isStaff && !isLoginPage && !isStaffPortal) {
      router.replace('/staff/dashboard');
    }
  }, [loading, isAuthenticated, isAdmin, isStaff, isLoginPage, isStaffPortal, pathname, router]);

  // Login page: clean, no chrome
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Staff portal: render children as-is — StaffPortalLayout handles its own shell
  if (isStaffPortal) {
    return <>{children}</>;
  }

  // Show spinner while auth resolves
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <div className="w-12 h-12 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  // Not authenticated yet (redirect pending) — render nothing to avoid flash
  if (!isAuthenticated) {
    return null;
  }

  // Full admin panel shell
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
