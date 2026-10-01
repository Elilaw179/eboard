import React from 'react';
import ClassPasswordsClient from '@/components/admin/ClassPasswordsClient';

export const metadata = {
  title: 'Class Access Passwords — Lawtronic E-Board Admin',
  description: 'Manage access passwords for classroom notes by grade',
};

export default function ClassPasswordsPage() {
  return <ClassPasswordsClient />;
}
