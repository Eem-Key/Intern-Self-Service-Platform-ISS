export type UserRole = 'intern' | 'admin' | string;
export type UserGender = 'male' | 'female' | 'non-binary' | 'prefer_not_to_say';
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
export type ReportStatus = 'draft' | 'pending' | 'approved' | 'denied';

// Profile update
export type ProfileUpdateType = 'avatar_update' | 'profile_information_update';

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