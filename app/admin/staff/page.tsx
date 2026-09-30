import { Metadata } from 'next';
import StaffManagementClient from '@/components/admin/StaffManagementClient';

export const metadata: Metadata = {
  title: 'Staff Accounts — Lawtronic E-Board Admin',
  description: 'Manage teacher staff accounts and login credentials',
};

export default function StaffManagementPage() {
  return <StaffManagementClient />;
}
