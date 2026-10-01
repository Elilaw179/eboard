import React from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import NotesTableClient from '@/app/admin/notes/NotesTableClient';

export const metadata = {
  title: 'My Notes — Staff Portal',
  description: 'View and manage your classroom notes.',
};

export default function StaffNotesPage() {
  return (
    <div className="flex-1 pb-12">
      <AdminHeader
        title="Classroom Notes"
        subtitle="Manage and organize your notes, drafts, and published lessons."
        action={{
          label: 'Upload Note',
          href: '/admin/staff-portal/notes/new',
        }}
      />
      <NotesTableClient initialNotes={[]} basePath="/admin/staff-portal/notes" />
    </div>
  );
}
