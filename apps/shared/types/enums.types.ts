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
export type InternshipStatus = 'active' | 'deactivated';

export type InternPosition = 	'quality_assurance' | 'frontend_developer' | 'backend_developer' | 'business_analyst';

// Admin
export type AdminPosition = 'project_manager' | 'human_resource';

//Record
export type RecordType = 
  | 'attendance' 
  | 'eod_report' 
  | 'leave_request' 
  | 'profile_update';

// Attendance Logs
export type WorkSetup = 'onsite' | 'wfh';

// EOD Report
export const REPORT_STATUS_VALUES = ['draft', 'pending', 'approved', 'denied'] as const;
export type ReportStatus = typeof REPORT_STATUS_VALUES[number];

// Profile update
export const PROFILE_UPDATE_TYPE_VALUES = ['avatar_update', 'information_update', 'password_update'] as const;
export type ProfileUpdateType = typeof PROFILE_UPDATE_TYPE_VALUES[number];

// Leave Request (remove personal)
export const LEAVE_REASON_VALUES = ['sick_medical', 'academic'] as const;
export type LeaveReason = typeof LEAVE_REASON_VALUES[number];

// Log
export type ActivityDescription = 
| 'Time In' 
| 'Time Out' 
| 'Submission of EOD Report' 
| 'Submission of Draft' 
| 'Academic Leave' 
| 'Medical Leave' 
| 'Profile Information' 
| 'Profile Picture';