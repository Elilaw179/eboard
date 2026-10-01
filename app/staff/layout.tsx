'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import StaffTopNav from '@/components/staff/StaffTopNav';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { loading, isAuthenticated, isAdmin } = useAuth();

  const isLoginPage = pathname === '/staff/login';

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated && !isLoginPage) {
        router.replace('/staff/login');
        return;
      }
      // Administrators have their own admin panel
      if (isAdmin && !isLoginPage) {
        router.replace('/admin/dashboard');
      }
    }
  }, [loading, isAuthenticated, isAdmin, isLoginPage, router]);

  // Clean login page layout without staff chrome
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading spinner while verifying auth
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <div className="w-12 h-12 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium">Verifying teacher credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <StaffTopNav />
      <main className="flex-1">{children}</main>
    </div>
  );
}
