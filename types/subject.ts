export interface Subject {
  id: string;
  name: string;
  slug: string;
  color?: string;
  iconName?: string;
  description?: string;
  noteCount?: number;
}

export const DEFAULT_SUBJECTS: string[] = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Robotics',
  'English Literature',
  'History',
  'Geography',
  'Design & Technology',
];
