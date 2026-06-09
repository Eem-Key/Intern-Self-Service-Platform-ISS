export type UserRole = 'intern' | 'admin' | string;

export const USER_GENDER_VALUES = ['male', 'female', 'non-binary', 'prefer_not_to_say'] as const;
export type UserGender = typeof USER_GENDER_VALUES[number];

export type OfficeLocation = 'binondo' | 'makati';
export type JobPosition = 
  | 'Quality Assurance' 
  | 'Front-end Developer' 
  | 'Back-end Developer' 
  | 'Business Analyst' 
  | 'Project Manager' 
  | 'Human Resource';
export type CompanyDepartment = 'SDS' | 'ISS';

// Intern
export type InternshipStatus = 'active' | 'completed' | 'extended' | 'terminated';

// Admin
export type AdminAccess = 'project_manager' | 'human_resource';

// EOD Report
export const REPORT_STATUS_VALUES = ['draft', 'pending', 'approved', 'denied'] as const;
export type ReportStatus = typeof REPORT_STATUS_VALUES[number];

// Profile update
export const PROFILE_UPDATE_TYPE_VALUES = ['avatar_update', 'information_update', 'password_update'] as const;
export type ProfileUpdateType = typeof PROFILE_UPDATE_TYPE_VALUES[number];

// Leave Request
export type LeaveReason = 'sick_medical' | 'personal' | 'academic';

// Attendance Logs
export type WorkSetupType = 'onsite' | 'wfh';

// Logs
export type LogType = 
  | 'attendance' 
  | 'eod_report' 
  | 'leave_request' 
  | 'profile_update';