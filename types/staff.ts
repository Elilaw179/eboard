export interface StaffMember {
  id: string;
  uid: string;
  name: string;
  email: string;
  subject?: string;
  role: 'staff';
  active: boolean;
  createdAt: any;
  createdBy?: string;
}

export interface CreateStaffInput {
  name: string;
  email: string;
  password: string;
  subject?: string;
}
