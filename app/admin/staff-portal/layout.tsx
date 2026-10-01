'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import StaffTopNav from '@/components/staff/StaffTopNav';

export default function StaffPortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { loading, isAuthenticated, isStaff, isAdmin } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace('/admin/login');
        return;
      }
      // Admins should use the full admin panel
      if (isAdmin) {
        router.replace('/admin/dashboard');
      }
    }
  }, [loading, isAuthenticated, isStaff, isAdmin, router]);

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

  if (!isAuthenticated || isAdmin) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <StaffTopNav />
      <main className="flex-1">{children}</main>
    </div>
  );
}
