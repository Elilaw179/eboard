import { Timestamp } from 'firebase/firestore';
import { ClassGrade } from './class';

export type NoteStatus = 'draft' | 'published';

export interface Note {
  id: string;
  title: string;
  subject: string;
  className: ClassGrade;
  classSlug: string;
  content: string; // Rich HTML formatted note
  plainTextPreview: string; // Plain text snippet for preview & search
  status: NoteStatus;
  createdAt: Timestamp | Date | any;
  updatedAt: Timestamp | Date | any;
  createdBy?: string;
  authorName?: string;
  viewCount?: number;
  tags?: string[];
}

export interface NoteFormData {
  title: string;
  subject: string;
  className: ClassGrade;
  content: string;
  status: NoteStatus;
}
