import type { CompanyDepartment, JobPosition, OfficeLocation, ProfileUpdateType, ReportStatus, UserGender, UserRole } from './enums.types';

export type ProfileInsert = Omit<Profile, 'id' | 'created_at' | 'updated_at'>;

export type ProfileUpdate = Partial<ProfileInsert>;

export type InternInfo = {
  university: string;
  year_level: number;
  program: string;
  required_hours: number;
  start_date: string;
};

export type Profile = {
    id: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    suffix: string | null;

    role: UserRole;
    position: JobPosition;
    department: CompanyDepartment;
    office: OfficeLocation;

    birth_date: string | null;
    gender: UserGender | null;
    avatar_url?: string | null;

    contact_number: string | null;
    address: string | null;
    email: string;
    created_at: string;
    updated_at: string;
    requires_password_change: boolean;

    intern_info?: InternInfo | null;
}

export type ProfileUpdateRequestInsert = Omit<
  ProfileUpdateRequest, 
  'id' | 
  'submitted_at' | 
  'admin_id' |
  'reviewed_at' |
  'admin_feedback'
>

export type ProfileUpdateRequestForm = Omit<ProfileUpdateRequestInsert, 'intern_id' | 'status'>

export type ProfileUpdateRequest = {
  id: string; 
  intern_id: string;
  submitted_at: string;
  update_type: ProfileUpdateType;
  requested_data: Record<string, any>; 
  reason?: string | null; 
  
  status: ReportStatus | 'pending';
  admin_id: string | null;
  reviewed_at: string | null;
  admin_feedback: string | null;
}

export type AdminReviewProfileUpdateRequest = Pick<
  ProfileUpdateRequest, 
  'status' | 'admin_id' | 'reviewed_at' | 'admin_feedback'
> & {
  id: string;
};