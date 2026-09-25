import React from 'react';
import { getAllNotesForAdmin } from '@/services/notes';
import AdminHeader from '@/components/admin/AdminHeader';
import NotesTableClient from './NotesTableClient';

export const revalidate = 0;

export default async function AdminNotesPage() {
  const notes = await getAllNotesForAdmin();

  return (
    <div className="flex-1 pb-12">
      <AdminHeader
        title="Classroom Notes"
        subtitle="Manage and organize all lessons, draft notes, and live whiteboard content."
        action={{
          label: 'Create Note',
          href: '/admin/notes/new',
        }}
      />
      <NotesTableClient initialNotes={notes} />
    </div>
  );
}
