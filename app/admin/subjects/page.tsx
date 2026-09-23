import React from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { getAllNotesForAdmin } from '@/services/notes';
import SubjectsClient from '@/components/admin/SubjectsClient';

export const revalidate = 0;

export default async function SubjectsPage() {
  const notes = await getAllNotesForAdmin();

  return (
    <div className="flex-1 pb-16">
      <AdminHeader
        title="Subjects Directory"
        subtitle="Manage academic subjects and curriculum disciplines available for classroom notes."
      />
      <SubjectsClient initialNotes={notes} />
    </div>
  );
}
