import React from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import DashboardClient from './DashboardClient';

export default function AdminDashboardPage() {
  return (
    <div className="flex-1 pb-12">
      <AdminHeader
        title="Dashboard Overview"
        subtitle="Summary of classroom notes, publication statuses, and year group distribution."
        action={{
          label: 'Create New Note',
          href: '/admin/notes/new',
        }}
      />
      <DashboardClient initialNotes={[]} />
    </div>
  );
}
