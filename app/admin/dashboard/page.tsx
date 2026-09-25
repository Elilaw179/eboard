import React from 'react';
import { getAllNotesForAdmin } from '@/services/notes';
import AdminHeader from '@/components/admin/AdminHeader';
import DashboardClient from './DashboardClient';

export const revalidate = 0; // Dynamic for real-time dashboard accuracy

export default async function AdminDashboardPage() {
  const notes = await getAllNotesForAdmin();

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
      <DashboardClient initialNotes={notes} />
    </div>
  );
}
