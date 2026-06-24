import type { 
    InternshipStatus,
    InternPosition,
    CompanyDepartment
} from './enums.types';

export type Intern = {
    id: string;
    university: string;
    year_level: number;
    program: string;
    required_hours: number;
    start_date: string;
    status: InternshipStatus
    is_deleted: boolean;
    intern_position: InternPosition;
};

export type InternInfo = Omit<
    Intern, 
    'id' |
    // 'university' |
    // 'year_level' |
    // 'program' |
    // 'required_hours' |
    // 'start_date' |
    'status' |
    'is_deleted' |
    'intern_position'
>;

export type InternListInfo = Omit<
    Intern, 
    // 'id' |
    // 'university' |
    'year_level' |
    // 'program' |
    'required_hours' |
    'start_date' |
    // 'status' |
    'is_deleted' 
    // 'intern_position'
> & {
    name: string;
    department: CompanyDepartment;
    avatar_url: string;
};

export type InternInsert = Omit<
    Intern, 
    'id' |
    // 'university' |
    // 'year_level' |
    // 'program' |
    // 'required_hours' |
    // 'start_date' |
    'status' |
    'is_deleted' 
    // 'intern_position'
>

export type ProgramProgress = {
    required_hours: number;
    rendered_hours: number;
    hours_left: number;
    wfh_hours: number;
    onsite_hours: number;
};

export type ProgramProgressHours = {
    required_hours: number;
    rendered_hours: number;
    remaining_hours: number;
}

export type ProgramProgressResponse = {
    message: string;
    data: ProgramProgress;
};