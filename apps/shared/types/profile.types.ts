import type { 
    CompanyDepartment, 
    JobPosition, 
    OfficeLocation, 
    ProfileUpdateType, 
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

  birth_date: string;
  gender: UserGender;
  avatar_url?: string | null;

  contact_number: string;
  address: string;
  email: string;
  created_at: string;
  updated_at: string;
  requires_password_change: boolean;
}

export type ProfileIntern = Profile & {
    intern_info: InternInfo;
}

export type ProfileInsert = Omit<ProfileIntern, 'id' | 'created_at' | 'updated_at'>;

export type ProfileUpdate = Partial<ProfileInsert>;

export type UserProfile = Omit<
  ProfileIntern, 
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

export type ProfileUpdateRequestUpdate = Omit<ProfileUpdateRequest, 'record_id' | 'update_type'>