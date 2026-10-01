import { ClassGrade } from './class';

export interface ClassPassword {
  classSlug: string;
  className: string;
  password: string;
  enabled: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

export interface SetClassPasswordInput {
  classSlug: string;
  className: string;
  password: string;
  enabled?: boolean;
}
