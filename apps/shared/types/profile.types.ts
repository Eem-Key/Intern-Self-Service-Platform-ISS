import type { 
    CompanyDepartment, 
    JobPosition, 
    OfficeLocation, 
    ProfileUpdateType, 
    ReportStatus, 
    UserGender, 
    UserRole 
} from './enums.types';
import type { InternInfo } from './intern.types'

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

export type ProfileInsert = Omit<Profile, 'id' | 'created_at' | 'updated_at'>;

export type ProfileUpdate = Partial<ProfileInsert>;

export type UserProfile = Omit<
  Profile, 
  // 'id' |
  // 'first_name' |
  'middle_name' |
  // 'last_name' |
  'suffix' |

  // 'role' |
  // 'position' |
  'department' |
  'office' |

  'birth_date' |
  'gender' |
  // 'avatar_url' |

  'contact_number' |
  'address' |
  // 'email' |
  'created_at' |
  'updated_at' |
  // 'requires_password_change' |

  'intern_info'
>


export type ProfileUpdateRequest = {
  record_id: string; 
  update_type: ProfileUpdateType;
  requested_data: Record<string, any>; 
  reason?: string | null; 
}

export type ProfileUpdateRequestForm = Omit<ProfileUpdateRequest, 'record_id' >

// export type AdminReviewProfileUpdateRequest = Pick<
//   ProfileUpdateRequest, 
//   'status' | 'admin_id' | 'reviewed_at' | 'admin_feedback'
// > & {
//   id: string;
// };